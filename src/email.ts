import type { EmailProvider, EmailPayload, EmailBody } from "./types.js";

export interface EmailConfig {
  provider: EmailProvider;
  from: string;
  to: string[];
}

export async function sendEmail(
  config: EmailConfig,
  body: EmailBody
): Promise<void> {
  const safeSubject = body.subject?.replace(/[\r\n]+/g, " ").trim() ?? "New message";
  const safeName = body.name?.replace(/[\r\n]+/g, " ").trim();
  const fromLine = safeName ? `${safeName} <${body.email}>` : body.email;

  const payload: EmailPayload = {
    from: config.from,
    to: config.to,
    replyTo: body.email,
    subject: `Contact form: ${safeSubject}`,
    text: `From: ${fromLine}\n\n${body.message.trim()}`
  }

  await config.provider.send(payload);
}
