import { getAccessToken } from "./auth";

export type Plan = "free" | "student" | "pro";

export interface BillingState {
  plan: Plan;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  amount: number;
  currency: string;
  entitlements: {
    maxCourses: number | null;
    monthlyAiGenerations: number | null;
    priorityAi: boolean;
    examSimulation: boolean;
    export: boolean;
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${getAccessToken() ?? ""}`, ...init?.headers },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Die Abrechnung konnte nicht geladen werden.");
  return data;
}

export async function getBillingState(): Promise<BillingState> {
  return request("/billing/subscription");
}

export async function startCheckout(plan: Exclude<Plan, "free">): Promise<void> {
  const { url } = await request<{ url: string }>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
  window.location.assign(url);
}

export async function openBillingPortal(): Promise<void> {
  const { url } = await request<{ url: string }>("/billing/portal", { method: "POST" });
  window.location.assign(url);
}

export function changePlan(plan: Exclude<Plan, "free">): Promise<BillingState> {
  return request("/billing/change-plan", { method: "POST", body: JSON.stringify({ plan }) });
}

export function cancelSubscription(): Promise<BillingState> {
  return request("/billing/cancel", { method: "POST" });
}