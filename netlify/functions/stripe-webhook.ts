import type { Handler } from "@netlify/functions";
import { json, planFromSubscription, stripeRequest, verifyWebhook, type StripeObject } from "./_stripe";
import { supabaseAdmin } from "./_supabase";

const SUPPORTED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Methode nicht erlaubt." });
  const signature = event.headers["stripe-signature"];
  const payload = event.isBase64Encoded
    ? Buffer.from(event.body ?? "", "base64").toString("utf8")
    : event.body ?? "";
  if (!signature || !verifyWebhook(payload, signature)) {
    return json(400, { error: "Ungültige Stripe-Signatur." });
  }

  let stripeEvent: { id?: string; type?: string; data?: { object?: StripeObject } };
  try {
    stripeEvent = JSON.parse(payload) as typeof stripeEvent;
  } catch {
    return json(400, { error: "Ungültiger JSON-Body." });
  }
  if (!stripeEvent.id || !stripeEvent.type) return json(400, { error: "Ungültiges Stripe-Ereignis." });

  if (!SUPPORTED_EVENTS.has(stripeEvent.type)) return json(200, { received: true, handled: false });

  const existing = await supabaseAdmin<Array<{ event_id: string }>>(
    `stripe_webhook_events?event_id=eq.${encodeURIComponent(stripeEvent.id)}&select=event_id`,
  );
  if (existing.length > 0) return json(200, { received: true, handled: true, duplicate: true });

  let object = stripeEvent.data?.object;
  if (!object) return json(400, { error: "Stripe-Ereignis enthält kein Objekt." });
  if (stripeEvent.type === "checkout.session.completed") {
    const subscriptionId = typeof object.subscription === "string" ? object.subscription : null;
    if (!subscriptionId) return json(200, { received: true, handled: true });
    object = await stripeRequest<StripeObject>(`/subscriptions/${subscriptionId}`);
  }

  const customerId = typeof object.customer === "string" ? object.customer : null;
  if (!customerId) return json(400, { error: "Stripe-Ereignis enthält keinen Kunden." });
  const customer = await stripeRequest<StripeObject>(`/customers/${customerId}`);
  const metadata = object.metadata as Record<string, string> | undefined;
  const customerMetadata = customer.metadata as Record<string, string> | undefined;
  const userId = metadata?.studypilot_user_id ?? customerMetadata?.studypilot_user_id;
  if (!userId) return json(400, { error: "Stripe-Kunde ist keinem StudyPilot-Nutzer zugeordnet." });

  const deleted = stripeEvent.type === "customer.subscription.deleted";
  const firstItem = (object.items as { data?: Array<{ price?: { id?: string } }> } | undefined)?.data?.[0];
  const currentPeriodEnd = typeof object.current_period_end === "number"
    ? new Date(object.current_period_end * 1000).toISOString()
    : null;
  await supabaseAdmin("billing_subscriptions?on_conflict=user_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates",
    body: {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: deleted ? null : object.id,
      plan: deleted ? "free" : planFromSubscription(object),
      status: deleted ? "canceled" : String(object.status ?? "inactive"),
      cancel_at_period_end: deleted ? false : Boolean(object.cancel_at_period_end),
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
      price_id: firstItem?.price?.id,
    },
  });
  await supabaseAdmin("stripe_webhook_events", {
    method: "POST",
    body: { event_id: stripeEvent.id, event_type: stripeEvent.type },
  });

  return json(200, { received: true, handled: true });
};