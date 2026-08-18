import { createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const password = process.env.IPF_CMS_PASSWORD ?? "ipfuae";
const secret = process.env.IPF_CMS_SECRET ?? "ipf-uae-cms-local";

function tokenFor(ok: boolean) {
  if (!ok) return "";
  return createHmac("sha256", secret).update("session").digest("hex");
}

const expectedToken = tokenFor(true);

function readBody(req: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, payload: unknown, contentType = "application/json") {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.end(typeof payload === "string" ? payload : JSON.stringify(payload));
}

function authorized(req: IncomingMessage) {
  const header = req.headers.authorization ?? "";
  return header === `Bearer ${expectedToken}`;
}

export function cmsApiPlugin(root: string): Plugin {
  const contentFile = path.join(root, "data/cms/content.json");
  const uploadDir = path.join(root, "public/uploads");

  return {
    name: "ipf-cms-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/cms")) {
          next();
          return;
        }

        try {
          await mkdir(path.dirname(contentFile), { recursive: true });
          await mkdir(uploadDir, { recursive: true });

          if (req.method === "POST" && req.url === "/api/cms/login") {
            const body = JSON.parse((await readBody(req)).toString("utf8") || "{}") as { password?: string };
            if (body.password !== password) {
              send(res, 401, { error: "Invalid password" });
              return;
            }
            send(res, 200, { token: expectedToken });
            return;
          }

          if (req.method === "GET" && req.url === "/api/cms/content") {
            try {
              const raw = await readFile(contentFile, "utf8");
              send(res, 200, JSON.parse(raw));
            } catch {
              send(res, 404, { error: "No CMS file yet" });
            }
            return;
          }

          if (req.method === "PUT" && req.url === "/api/cms/content") {
            if (!authorized(req)) {
              send(res, 401, { error: "Sign in required" });
              return;
            }
            const body = (await readBody(req)).toString("utf8");
            JSON.parse(body);
            await writeFile(contentFile, body);
            send(res, 200, { ok: true });
            return;
          }

          if (req.method === "POST" && req.url === "/api/cms/upload") {
            if (!authorized(req)) {
              send(res, 401, { error: "Sign in required" });
              return;
            }
            const type = String(req.headers["x-file-type"] ?? "image/jpeg");
            const name = String(req.headers["x-file-name"] ?? `upload-${randomUUID()}`);
            const ext = path.extname(name) || (type.includes("png") ? ".png" : ".jpg");
            const safe = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
            const filePath = path.join(uploadDir, safe);
            await writeFile(filePath, await readBody(req));
            send(res, 200, { src: `/uploads/${safe}` });
            return;
          }

          send(res, 404, { error: "Unknown CMS route" });
        } catch (error) {
          send(res, 500, { error: error instanceof Error ? error.message : "CMS error" });
        }
      });
    },
  };
}
