import type { IncomingMessage, ServerResponse } from "node:http";
import { dispatch } from "../server/nodeAdapter.ts";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await dispatch(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Server error" }));
  }
}
