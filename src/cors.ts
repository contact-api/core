import type { ContactRequest } from "./contact.js";

export interface CorsResult {
  outcome: "preflight" | "forbidden" | "ok";
  headers: Record<string, string>;
  status?: number;
}

export function evaluateCors(req: ContactRequest, allowedOrigins: string[]): CorsResult {
  const headers: Record<string, string> = { "X-Content-Type-Options": "nosniff" };
  const origin = req.headers["origin"];
  const isAllowed = !!origin && allowedOrigins.includes(origin);

  if (!isAllowed) {
    if (req.method === "OPTIONS") return { outcome: "preflight", headers, status: 403 };
    return { outcome: "forbidden", headers };
  }

  headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type";

  if (req.method === "OPTIONS") return { outcome: "preflight", headers, status: 204 };
  return { outcome: "ok", headers };
}
