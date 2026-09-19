import type { Request, Response, NextFunction } from "express";

export type User = { id: string; email?: string };
export function supabaseConfig() {
  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY sind erforderlich.");
  return { url, key };
}
export async function authenticateToken(token: string): Promise<User | null> {
  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase ist nicht vollständig konfiguriert.");
  const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const u = await r.json() as { id?: string; email?: string };
  return u.id ? { id: u.id, email: u.email } : null;
}
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: "Authentifizierung erforderlich." });
    const user = await authenticateToken(token);
    if (!user) return res.status(401).json({ error: "Ungültiges Zugriffstoken." });
    res.locals.user = user;
    res.locals.accessToken = token;
    return next();
  } catch (e) { return res.status(503).json({ error: e instanceof Error ? e.message : "Supabase nicht erreichbar." }); }
}
export async function db<T>(table: string, options: { method?: string; query?: string; body?: unknown; token?: string; select?: string; prefer?: string } = {}): Promise<T> {
  const { url, key } = supabaseConfig();
  const qs = options.query ? `?${options.query}` : "";
  const r = await fetch(`${url}/rest/v1/${table}${qs}`, {
    method: options.method ?? "GET",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", ...(options.select ? { Accept: "application/json" } : {}), ...(options.prefer ? { Prefer: options.prefer } : {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!r.ok) throw new Error(`Supabase-Anfrage fehlgeschlagen (${r.status}).`);
  const text = await r.text(); return (text ? JSON.parse(text) : undefined) as T;
}
export async function storage(path: string, method: string, body?: Uint8Array, contentType = "application/pdf") {
  const { url, key } = supabaseConfig();
  const r = await fetch(`${url}/storage/v1/object/course-documents/${path}`, { method, headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": contentType, "x-upsert": "false" }, body });
  if (!r.ok) throw new Error(`Datei konnte nicht gespeichert werden (${r.status}).`);
}