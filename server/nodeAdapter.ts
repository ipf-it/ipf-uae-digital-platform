import type { IncomingMessage, ServerResponse } from "node:http";
import { handleRequest } from "./handleRequest.js";
import { cookieHeader, parseCookies, type AppRequest } from "./http.js";

export function readBody(req: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export async function toAppRequest(req: IncomingMessage): Promise<AppRequest> {
  const rawUrl = req.url ?? "/";
  const url = rawUrl.startsWith("http") ? new URL(rawUrl).pathname + new URL(rawUrl).search : rawUrl;
  return {
    method: req.method ?? "GET",
    url,
    headers: req.headers,
    body: await readBody(req),
    cookies: parseCookies(String(req.headers.cookie ?? "")),
  };
}

export function sendAppResponse(res: ServerResponse, result: Awaited<ReturnType<typeof handleRequest>>) {
  if (result.cookies?.length) {
    res.setHeader("Set-Cookie", result.cookies.map(cookieHeader));
  }
  for (const [name, value] of Object.entries(result.headers ?? {})) {
    res.setHeader(name, value);
  }
  res.statusCode = result.status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result.body));
}

export async function dispatch(req: IncomingMessage, res: ServerResponse) {
  sendAppResponse(res, await handleRequest(await toAppRequest(req)));
}
