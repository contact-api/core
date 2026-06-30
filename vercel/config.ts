import type { EmailProvider       } from "../core/types.js";
import type { EmailConfig } from "../core/email.js";
import { createNodemailerProvider } from "../nodemailer/index.js";
import { createResendProvider     } from "../resend/index.js";

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

export function getEmailConfig(config: Config): EmailConfig | null {
  if (!config.provider || !config.fromEmail?.trim() || !config.toEmails?.length) return null;
  return { provider: config.provider, from: config.fromEmail, to: config.toEmails };
}
