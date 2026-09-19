import type { HandlerEvent } from "@netlify/functions";

export interface AuthenticatedUser {
  id: string;
  email: string;
}

function config() {
  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) throw new Error("Supabase ist nicht vollständig konfiguriert.");
  return { url, anonKey, serviceKey };
}

export async function authenticate(event: HandlerEvent): Promise<AuthenticatedUser | null> {
  const token = event.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;
  const { url, anonKey } = config();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const user = await response.json() as { id?: string; email?: string };
  return user.id && user.email ? { id: user.id, email: user.email } : null;
}

export async function supabaseAdmin<T>(
  path: string,
  options: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<T> {
  const { url, serviceKey } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: serviceKey,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      ...(options.prefer ? { prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) throw new Error(`Supabase-Anfrage fehlgeschlagen (${response.status}).`);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}