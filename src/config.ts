import { createNodemailerProvider } from "./providers/nodemailer.js";
import { createResendProvider     } from "./providers/resend.js";
import type { EmailProvider       } from "./types.js";

export interface Config {
  provider: EmailProvider | null;
  fromEmail: string | undefined;
  toEmails: string[];
  allowedOrigins: string[];
}

const fromEmail = process.env["FROM_EMAIL"];
const toEmailsRaw = process.env["TO_EMAIL"] ?? "";
const toEmails = toEmailsRaw.split(",").map(o => o.trim()).filter(Boolean);
const allowedOriginsRaw = process.env["ALLOWED_ORIGINS"] ?? "";
const allowedOrigins = allowedOriginsRaw.split(",").map(o => o.trim()).filter(Boolean);

function createProvider(): EmailProvider | null {
  const providerName = process.env["EMAIL_PROVIDER"]?.toLowerCase();
  if (providerName === "resend") return createResendProvider();
  if (providerName === "nodemailer") return createNodemailerProvider();
  console.warn(providerName ? `Unknown EMAIL_PROVIDER: "${providerName}"` : "EMAIL_PROVIDER is not set");
  return null;
}

export const config: Config = {
  provider: createProvider(),
  fromEmail,
  toEmails,
  allowedOrigins
}

