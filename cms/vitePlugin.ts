import { createHmac, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import {
  dataPath,
  ensureDirs,
  hashPassword,
  memberIdFromToken,
  memberToken,
  membershipNo,
  newId,
  publicMember,
  readPlatform,
  verifyPassword,
  writePlatform,
  type InquiryRecord,
} from "./store.ts";

const password = process.env.IPF_CMS_PASSWORD ?? "ipfuae";
const secret = process.env.IPF_CMS_SECRET ?? "ipf-uae-cms-local";
const expectedToken = createHmac("sha256", secret).update("session").digest("hex");

function readBody(req: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function adminAuth(req: IncomingMessage) {
  return (req.headers.authorization ?? "") === `Bearer ${expectedToken}`;
}

function bearer(req: IncomingMessage) {
  const header = req.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

export function cmsApiPlugin(root: string): Plugin {
  const files = dataPath(root);

  return {
    name: "ipf-cms-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          next();
          return;
        }

        const url = req.url.split("?")[0];

        try {
          await ensureDirs(root);

          if (req.method === "POST" && url === "/api/cms/login") {
            const body = JSON.parse((await readBody(req)).toString("utf8") || "{}") as { password?: string };
            if (body.password !== password) {
              send(res, 401, { error: "Invalid password" });
              return;
            }
            send(res, 200, { token: expectedToken });
            return;
          }

          if (req.method === "GET" && url === "/api/cms/content") {
            try {
              send(res, 200, JSON.parse(await readFile(files.content, "utf8")));
            } catch {
              send(res, 404, { error: "No CMS file yet" });
            }
            return;
          }

          if (req.method === "PUT" && url === "/api/cms/content") {
            if (!adminAuth(req)) {
              send(res, 401, { error: "Sign in required" });
              return;
            }
            const body = (await readBody(req)).toString("utf8");
            JSON.parse(body);
            await writeFile(files.content, body);
            send(res, 200, { ok: true });
            return;
          }

          if (req.method === "POST" && url === "/api/cms/upload") {
            if (!adminAuth(req)) {
              send(res, 401, { error: "Sign in required" });
              return;
            }
            const type = String(req.headers["x-file-type"] ?? "image/jpeg");
            const name = String(req.headers["x-file-name"] ?? `upload-${randomUUID()}`);
            const ext = path.extname(name) || (type.includes("png") ? ".png" : ".jpg");
            const safe = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
            await writeFile(path.join(files.uploads, safe), await readBody(req));
            send(res, 200, { src: `/uploads/${safe}` });
            return;
          }

          if (req.method === "GET" && url === "/api/cms/inbox") {
            if (!adminAuth(req)) {
              send(res, 401, { error: "Sign in required" });
              return;
            }
            const platform = await readPlatform(root);
            send(res, 200, {
              inquiries: platform.inquiries,
              rsvps: platform.rsvps,
              donations: platform.donations,
              members: platform.members.map(publicMember),
            });
            return;
          }

          if (req.method === "POST" && url === "/api/inquiries") {
            const body = JSON.parse((await readBody(req)).toString("utf8") || "{}") as Partial<InquiryRecord> & {
              extra?: Record<string, string>;
            };
            if (!body.name || !body.email) {
              send(res, 400, { error: "Name and email are required" });
              return;
            }
            const platform = await readPlatform(root);
            const record: InquiryRecord = {
              id: newId("inq"),
              createdAt: new Date().toISOString(),
              intent: String(body.intent ?? "contact"),
              name: String(body.name),
              email: String(body.email),
              phone: body.phone,
              emirate: body.emirate,
              message: body.message,
              extra: body.extra,
            };
            platform.inquiries.unshift(record);
            await writePlatform(root, platform);
            send(res, 200, { ok: true, id: record.id });
            return;
          }

          if (req.method === "POST" && url === "/api/members/register") {
            const body = JSON.parse((await readBody(req)).toString("utf8") || "{}") as {
              name?: string;
              email?: string;
              phone?: string;
              emirate?: string;
              password?: string;
            };
            if (!body.name || !body.email || !body.password || body.password.length < 8) {
              send(res, 400, { error: "Name, email and a password of at least 8 characters are required" });
              return;
            }
            const platform = await readPlatform(root);
            const email = body.email.trim().toLowerCase();
            if (platform.members.some((member) => member.email === email)) {
              send(res, 409, { error: "An account with this email already exists" });
              return;
            }
            const member = {
              id: newId("mem"),
              membershipNo: membershipNo(),
              name: body.name.trim(),
              email,
              phone: String(body.phone ?? ""),
              emirate: String(body.emirate ?? ""),
              chapter: String(body.emirate ?? ""),
              passwordHash: hashPassword(body.password),
              createdAt: new Date().toISOString(),
              volunteerHours: [],
            };
            platform.members.push(member);
            await writePlatform(root, platform);
            send(res, 200, { token: memberToken(secret, member.id), member: publicMember(member) });
            return;
          }

          if (req.method === "POST" && url === "/api/members/login") {
            const body = JSON.parse((await readBody(req)).toString("utf8") || "{}") as { email?: string; password?: string };
            const platform = await readPlatform(root);
            const member = platform.members.find((item) => item.email === body.email?.trim().toLowerCase());
            if (!member || !body.password || !verifyPassword(body.password, member.passwordHash)) {
              send(res, 401, { error: "Email or password is incorrect" });
              return;
            }
            send(res, 200, { token: memberToken(secret, member.id), member: publicMember(member) });
            return;
          }

          if (req.method === "GET" && url === "/api/members/me") {
            const platform = await readPlatform(root);
            const id = memberIdFromToken(secret, bearer(req), platform.members);
            const member = platform.members.find((item) => item.id === id);
            if (!member) {
              send(res, 401, { error: "Sign in required" });
              return;
            }
            send(res, 200, { member: publicMember(member) });
            return;
          }

          if (req.method === "POST" && url === "/api/members/hours") {
            const platform = await readPlatform(root);
            const id = memberIdFromToken(secret, bearer(req), platform.members);
            const member = platform.members.find((item) => item.id === id);
            if (!member) {
              send(res, 401, { error: "Sign in required" });
              return;
            }
            const body = JSON.parse((await readBody(req)).toString("utf8") || "{}") as {
              date?: string;
              hours?: number;
              activity?: string;
            };
            if (!body.activity || !body.hours) {
              send(res, 400, { error: "Activity and hours are required" });
              return;
            }
            member.volunteerHours.unshift({
              id: newId("hrs"),
              date: body.date || new Date().toISOString().slice(0, 10),
              hours: Number(body.hours),
              activity: body.activity,
            });
            await writePlatform(root, platform);
            send(res, 200, { member: publicMember(member) });
            return;
          }

          if (req.method === "POST" && url === "/api/rsvp") {
            const body = JSON.parse((await readBody(req)).toString("utf8") || "{}") as {
              eventId?: string;
              eventTitle?: string;
              name?: string;
              email?: string;
              phone?: string;
            };
            if (!body.eventId || !body.name || !body.email) {
              send(res, 400, { error: "Event, name and email are required" });
              return;
            }
            const platform = await readPlatform(root);
            const record = {
              id: newId("rsvp"),
              createdAt: new Date().toISOString(),
              eventId: body.eventId,
              eventTitle: String(body.eventTitle ?? body.eventId),
              name: body.name,
              email: body.email,
              phone: body.phone,
            };
            platform.rsvps.unshift(record);
            await writePlatform(root, platform);
            send(res, 200, { ok: true, id: record.id });
            return;
          }

          if (req.method === "POST" && url === "/api/donations") {
            const body = JSON.parse((await readBody(req)).toString("utf8") || "{}") as {
              name?: string;
              email?: string;
              amountAed?: number;
              note?: string;
            };
            if (!body.name || !body.email || !body.amountAed || body.amountAed <= 0) {
              send(res, 400, { error: "Name, email and a valid amount are required" });
              return;
            }
            const platform = await readPlatform(root);
            const record = {
              id: newId("don"),
              createdAt: new Date().toISOString(),
              name: body.name,
              email: body.email,
              amountAed: Number(body.amountAed),
              note: body.note,
              status: "pledge" as const,
            };
            platform.donations.unshift(record);
            await writePlatform(root, platform);
            send(res, 200, { ok: true, id: record.id });
            return;
          }

          send(res, 404, { error: "Unknown API route" });
        } catch (error) {
          send(res, 500, { error: error instanceof Error ? error.message : "Server error" });
        }
      });
    },
  };
}
