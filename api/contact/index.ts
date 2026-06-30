import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit } from "@vercel/firewall";
import { evaluateCors } from "../../src/cors.js";
import { handleContact } from "../../src/handler.js";
import { getEmailConfig } from "../../src/email.js";
import { config } from "../../src/config.js";

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  const cors = evaluateCors(
    { method: req.method ?? "", headers: req.headers as Record<string, string | undefined>, body: req.body },
    config.allowedOrigins
  );

  for (const [key, value] of Object.entries(cors.headers)) res.setHeader(key, value);

  if (cors.outcome === "preflight") {
    res.status(cors.status!).end();
    return;
  }
  if (cors.outcome === "forbidden") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { rateLimited } = await checkRateLimit("contact-form-limit");
  if (rateLimited) {
    res.status(429).json({ error: "Too many requests. Please try again later" });
    return;
  }

  const result = await handleContact(
    { method: req.method ?? "", headers: req.headers as Record<string, string | undefined>, body: req.body },
    { emailConfig: getEmailConfig(config) }
  );

  res.status(result.status);
  if (result.body !== null) res.json(result.body);
  else res.end();
};
