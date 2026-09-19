import { createHmac, timingSafeEqual } from "node:crypto";
import type { HandlerEvent } from "@netlify/functions";
import { supabaseAdmin, type AuthenticatedUser } from "./_supabase";

export type Plan = "free" | "student" | "pro";

export type StripeObject = Record<string, unknown> & { id: string };

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} ist nicht konfiguriert.`);
  return value;
}

function stripePrice(plan: Exclude<Plan, "free">): string {
  return required(plan === "student" ? "STRIPE_PRICE_STUDENT" : "STRIPE_PRICE_PRO");
}

function appendForm(target: URLSearchParams, key: string, value: unknown): void {
  if (value == null) return;
  if (typeof value === "boolean") {
    target.append(key, value ? "true" : "false");
    return;
  }
  target.append(key, String(value));
}

export async function stripeRequest<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: Record<string, unknown> } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(options.body ?? {})) appendForm(body, key, value);

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      authorization: `Bearer ${required("STRIPE_SECRET_KEY")}`,
      ...(method === "POST"
        ? { "content-type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body: method === "POST" ? body : undefined,
  });
  const data = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(data.error?.message ?? `Stripe-Anfrage fehlgeschlagen (${response.status}).`);
  }
  return data;
}

export function json(statusCode: number, body: unknown, headers: Record<string, string> = {}) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
    body: JSON.stringify(body),
  };
}

function appOrigin(event: HandlerEvent): string {
  const configured = process.env.URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const host = event.headers["x-forwarded-host"] ?? event.headers.host;
  if (!host) throw new Error("Die öffentliche App-URL konnte nicht bestimmt werden.");
  const protocol = event.headers["x-forwarded-proto"] ?? "https";
  return `${protocol}://${host}`;
}

async function findOrCreateCustomer(user: AuthenticatedUser): Promise<StripeObject> {
  const matches = await stripeRequest<{ data: StripeObject[] }>(
    `/customers/search?query=${encodeURIComponent(`metadata['studypilot_user_id']:'${user.id}'`)}`,
  );
  if (matches.data[0]) return matches.data[0];
  const customer = await stripeRequest<StripeObject>("/customers", {
    method: "POST",
    body: { email: user.email, "metadata[studypilot_user_id]": user.id },
  });
  await supabaseAdmin("billing_subscriptions?on_conflict=user_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates",
    body: { user_id: user.id, stripe_customer_id: customer.id, plan: "free", status: "inactive" },
  });
  return customer;
}

async function activeSubscription(customerId: string): Promise<StripeObject | null> {
  const result = await stripeRequest<{ data: StripeObject[] }>(
    `/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=10`,
  );
  return result.data.find((subscription) => ACTIVE_STATUSES.has(String(subscription.status))) ?? null;
}

function subscriptionPlan(subscription: StripeObject | null): Plan {
  const priceId = (
    subscription?.items as { data?: Array<{ price?: { id?: string } }> } | undefined
  )?.data?.[0]?.price?.id;
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === process.env.STRIPE_PRICE_STUDENT) return "student";
  return "free";
}

function subscriptionView(subscription: StripeObject | null) {
  const plan = subscriptionPlan(subscription);
  const firstItem = (
    subscription?.items as { data?: Array<{ id?: string; price?: { unit_amount?: number; currency?: string } }> } | undefined
  )?.data?.[0];
  return {
    plan,
    status: subscription ? String(subscription.status) : "inactive",
    cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
    currentPeriodEnd:
      typeof subscription?.current_period_end === "number"
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    amount: firstItem?.price?.unit_amount ?? 0,
    currency: firstItem?.price?.currency ?? "eur",
    entitlements: {
      maxCourses: plan === "free" ? 2 : null,
      monthlyAiGenerations: plan === "free" ? 0 : plan === "student" ? 100 : null,
      priorityAi: plan === "pro",
      examSimulation: plan !== "free",
      export: plan === "pro",
    },
  };
}

export async function getBillingState(user: AuthenticatedUser) {
  const rows = await supabaseAdmin<Array<{
    plan: Plan;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: string | null;
  }>>(
    `billing_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&select=plan,status,cancel_at_period_end,current_period_end`,
  );
  if (!rows[0]) {
    await findOrCreateCustomer(user);
    return subscriptionView(null);
  }
  const row = rows[0];
  const plan = row.plan;
  return {
    plan,
    status: row.status,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    currentPeriodEnd: row.current_period_end,
    amount: plan === "student" ? 800 : plan === "pro" ? 1500 : 0,
    currency: "eur",
    entitlements: {
      maxCourses: plan === "free" ? 2 : null,
      monthlyAiGenerations: plan === "free" ? 0 : plan === "student" ? 100 : null,
      priorityAi: plan === "pro",
      examSimulation: plan !== "free",
      export: plan === "pro",
    },
  };
}

export async function createCheckout(event: HandlerEvent, user: AuthenticatedUser, plan: Exclude<Plan, "free">) {
  const customer = await findOrCreateCustomer(user);
  const existing = await activeSubscription(customer.id);
  if (existing) throw new Error("Es besteht bereits ein Abo. Ändere den Tarif in der Abo-Verwaltung.");
  const origin = appOrigin(event);
  const session = await stripeRequest<StripeObject & { url?: string }>("/checkout/sessions", {
    method: "POST",
    body: {
      mode: "subscription",
      customer: customer.id,
      "line_items[0][price]": stripePrice(plan),
      "line_items[0][quantity]": 1,
      success_url: `${origin}/app/subscription?checkout=success`,
      cancel_url: `${origin}/app/subscription?checkout=cancelled`,
      allow_promotion_codes: true,
      "subscription_data[metadata][studypilot_plan]": plan,
      "subscription_data[metadata][studypilot_user_id]": user.id,
    },
  });
  if (!session.url) throw new Error("Stripe hat keine Checkout-URL zurückgegeben.");
  return session.url;
}

export async function createPortal(event: HandlerEvent, user: AuthenticatedUser) {
  const customer = await findOrCreateCustomer(user);
  const origin = appOrigin(event);
  const session = await stripeRequest<StripeObject & { url?: string }>("/billing_portal/sessions", {
    method: "POST",
    body: { customer: customer.id, return_url: `${origin}/app/subscription` },
  });
  if (!session.url) throw new Error("Stripe hat keine Portal-URL zurückgegeben.");
  return session.url;
}

export async function changePlan(user: AuthenticatedUser, plan: Exclude<Plan, "free">) {
  const customer = await findOrCreateCustomer(user);
  const subscription = await activeSubscription(customer.id);
  if (!subscription) throw new Error("Kein aktives Abo gefunden.");
  const item = (
    subscription.items as { data?: Array<{ id?: string }> } | undefined
  )?.data?.[0];
  if (!item?.id) throw new Error("Das Stripe-Abo enthält keine Tarifposition.");
  const updated = await stripeRequest<StripeObject>(`/subscriptions/${subscription.id}`, {
    method: "POST",
    body: {
      "items[0][id]": item.id,
      "items[0][price]": stripePrice(plan),
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
      "metadata[studypilot_plan]": plan,
    },
  });
  return subscriptionView(updated);
}

export async function cancelSubscription(user: AuthenticatedUser) {
  const customer = await findOrCreateCustomer(user);
  const subscription = await activeSubscription(customer.id);
  if (!subscription) throw new Error("Kein aktives Abo gefunden.");
  const updated = await stripeRequest<StripeObject>(`/subscriptions/${subscription.id}`, {
    method: "POST",
    body: { cancel_at_period_end: true },
  });
  return subscriptionView(updated);
}

export function planFromSubscription(subscription: StripeObject): Plan {
  return subscriptionPlan(subscription);
}

export function verifyWebhook(payload: string, signatureHeader: string): boolean {
  const parts = signatureHeader.split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", required("STRIPE_WEBHOOK_SECRET"))
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  return signatures.some((signature) => {
    const left = Buffer.from(expected);
    const right = Buffer.from(signature);
    return left.length === right.length && timingSafeEqual(left, right);
  });
}