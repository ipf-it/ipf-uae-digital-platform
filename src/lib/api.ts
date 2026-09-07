import { supabaseAuth } from "./supabase";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const session = supabaseAuth ? (await supabaseAuth.auth.getSession()).data.session : null;
  if (session?.access_token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${session.access_token}`);
  const binary = init?.body instanceof Blob || init?.body instanceof ArrayBuffer;
  if (init?.body && !binary && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Request failed");
  }
  return body;
}
