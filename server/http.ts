export type AppCookie = {
  name: string;
  value: string;
  maxAge?: number;
  clear?: boolean;
};

export type AppRequest = {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
  cookies: Record<string, string>;
};

export type AppResponse = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  cookies?: AppCookie[];
  raw?: Buffer;
};

export const PERSON_COOKIE = "ipf_session";
export const CMS_COOKIE = "ipf_cms";
const SESSION_DAYS = 30;

export function header(req: AppRequest, name: string) {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function parseCookies(cookieHeader: string) {
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (!name) continue;
    out[name] = decodeURIComponent(rest.join("="));
  }
  return out;
}

export function json(status: number, body: unknown, cookies?: AppCookie[]): AppResponse {
  return { status, body, cookies };
}

export function cookieHeader(cookie: AppCookie) {
  const secure = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
  if (cookie.clear) {
    return `${cookie.name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
  }
  const maxAge = cookie.maxAge ?? SESSION_DAYS * 24 * 60 * 60;
  return `${cookie.name}=${cookie.value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

export async function readJson<T>(req: AppRequest): Promise<T> {
  const text = req.body.toString("utf8").trim();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}
