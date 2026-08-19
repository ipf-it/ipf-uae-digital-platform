import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { dispatch } from "../server/nodeAdapter.ts";

export function cmsApiPlugin(): Plugin {
  return {
    name: "ipf-cms-api",
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (!req.url?.startsWith("/api/")) {
          next();
          return;
        }
        try {
          await dispatch(req, res);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Server error" }));
        }
      });
    },
  };
}
