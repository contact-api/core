import nodemailer from "nodemailer";
import type { EmailProvider, EmailPayload } from "../core/types.js";

export class NodemailerProvider implements EmailProvider {
  readonly id = "nodemailer";
  private transporter: nodemailer.Transporter;

  constructor(smtpJson: string) {
    const config = JSON.parse(smtpJson);
    this.transporter = nodemailer.createTransport(config);
  }

  async send(payload: EmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: payload.from,
      to: payload.to.join(","),
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text
    });
  }
}

export function createNodemailerProvider(): EmailProvider | null {
  const smtpConfig = process.env["SMTP_CONFIG"];
  if (!smtpConfig) {
    console.warn("SMTP_CONFIG missing for nodemailer");
    return null;
  }
  try { return new NodemailerProvider(smtpConfig); }
  catch (e) {
    console.error("Failed to initialize Nodemailer provider:", e);
    return null;
  }
}
