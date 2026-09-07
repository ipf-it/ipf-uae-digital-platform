import { handleRequest } from "../server/handleRequest.js";
import { cookieHeader, parseCookies } from "../server/http.js";

function appPath(url: URL) {
  const forwarded = url.searchParams.get("path");
  if (!forwarded) return url.pathname + url.search;
  url.searchParams.delete("path");
  const query = url.searchParams.toString();
  return `/api/${forwarded}${query ? `?${query}` : ""}`;
}

async function handler(request: Request) {
  try {
    const url = new URL(request.url);
    const headers = Object.fromEntries(request.headers.entries());
    const appRequest = {
      method: request.method,
      url: appPath(url),
      headers,
      body: request.method === "GET" || request.method === "HEAD"
        ? Buffer.alloc(0)
        : Buffer.from(await request.arrayBuffer()),
      cookies: parseCookies(request.headers.get("cookie") ?? ""),
    };
    const result = await handleRequest(appRequest);
    const responseHeaders = new Headers(result.headers);
    responseHeaders.set("Content-Type", "application/json");
    for (const cookie of result.cookies ?? []) responseHeaders.append("Set-Cookie", cookieHeader(cookie));
    return new Response(JSON.stringify(result.body), { status: result.status, headers: responseHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
