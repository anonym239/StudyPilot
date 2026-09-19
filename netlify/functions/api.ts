import type { Handler } from "@netlify/functions";
import serverless from "serverless-http";
import app from "../../artifacts/api-server/src/app";
import {
  cancelSubscription,
  changePlan,
  createCheckout,
  createPortal,
  getBillingState,
  json,
  type Plan,
} from "./_stripe";
import { authenticate } from "./_supabase";

const applicationHandler = serverless(app);

export const handler: Handler = async (event) => {
  const path = event.path.replace(/^\/.netlify\/functions\/api/, "");

  if (path.startsWith("/billing/")) {
    const user = await authenticate(event);
    if (!user) return json(401, { error: "Bitte melde dich erneut an." });
    try {
      if (event.httpMethod === "GET" && path === "/billing/subscription") {
        return json(200, await getBillingState(user));
      }
      if (event.httpMethod === "POST" && path === "/billing/checkout") {
        const body = JSON.parse(event.body ?? "{}") as { plan?: Plan };
        if (body.plan !== "student" && body.plan !== "pro") return json(400, { error: "Ungültiger Tarif." });
        return json(200, { url: await createCheckout(event, user, body.plan) });
      }
      if (event.httpMethod === "POST" && path === "/billing/portal") {
        return json(200, { url: await createPortal(event, user) });
      }
      if (event.httpMethod === "POST" && path === "/billing/change-plan") {
        const body = JSON.parse(event.body ?? "{}") as { plan?: Plan };
        if (body.plan !== "student" && body.plan !== "pro") return json(400, { error: "Ungültiger Tarif." });
        return json(200, await changePlan(user, body.plan));
      }
      if (event.httpMethod === "POST" && path === "/billing/cancel") {
        return json(200, await cancelSubscription(user));
      }
    } catch (error) {
      return json(400, { error: error instanceof Error ? error.message : "Abrechnung fehlgeschlagen." });
    }
  }

  const forwardedEvent = {
    ...event,
    path: `/api${path}`,
    rawUrl: event.rawUrl.replace(event.path, `/api${path}`),
  };
  return applicationHandler(forwardedEvent as never, {} as never) as ReturnType<Handler>;
};