export interface User {
  name: string;
  email: string;
  avatar?: string;
}
interface AuthSession { accessToken: string; user: User }

const STORAGE_KEY = "studypilot_auth";
const SESSION_KEY = "studypilot_supabase_session";

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export function setCurrentUser(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export const signOut = clearSession;

function supabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase Auth ist noch nicht konfiguriert.");
  return { url: url.replace(/\/$/, ""), key };
}

export function getAccessToken(): string | null {
  try { return (JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as AuthSession | null)?.accessToken ?? null; }
  catch { return null; }
}

async function authRequest(path: string, body: object): Promise<{ access_token?: string; user?: { email?: string; user_metadata?: { name?: string } }; msg?: string; error_description?: string }> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1/${path}`, { method: "POST", headers: { apikey: key, "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.msg ?? data.error_description ?? "Anmeldung fehlgeschlagen.");
  return data;
}

function saveSession(data: Awaited<ReturnType<typeof authRequest>>, fallbackName: string): User | null {
  if (!data.access_token || !data.user?.email) return null;
  const user = { name: data.user.user_metadata?.name ?? fallbackName, email: data.user.email };
  setCurrentUser(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: data.access_token, user }));
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const user = saveSession(await authRequest("token?grant_type=password", { email, password }), "Student");
  if (!user) throw new Error("Supabase hat keine gültige Sitzung zurückgegeben.");
  return user;
}

export async function signUp(name: string, email: string, password: string): Promise<User | null> {
  return saveSession(await authRequest("signup", { email, password, data: { name } }), name);
}
