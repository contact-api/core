import type { ContactRequest, ContactResult } from "./contact.js";
import type { EmailConfig } from "./email.js";
import { isValidBody } from "./validation.js";
import { sendEmail } from "./email.js";

export interface HandleContactDeps {
  emailConfig: EmailConfig | null;
}

export async function handleContact(
  req: ContactRequest,
  deps: HandleContactDeps
): Promise<ContactResult> {
  if (req.method !== "POST") {
    return { status: 405, body: { error: "Method not allowed" } };
  }

  if (!req.headers["content-type"]?.startsWith("application/json")) {
    return { status: 415, body: { error: "Unsupported Media Type" } };
  }

  const body = req.body as Record<string, unknown> | undefined;
  const faxNumber = typeof body?.["fax_number"] === "string" ? (body["fax_number"] as string).trim() : "";
  if (faxNumber) {
    console.warn("Honeypot triggered");
    return { status: 200, body: { success: true, message: "Message sent successfully" } };
  }

  if (!deps.emailConfig) {
    return { status: 503, body: { error: "Service temporarily unavailable" } };
  }

  if (!isValidBody(req.body)) {
    return { status: 400, body: { error: "Invalid or missing fields" } };
  }

  try {
    await sendEmail(deps.emailConfig, req.body);
    return { status: 200, body: { success: true, message: "Message sent successfully" } };
  } catch (error) {
    console.error("Email error:", error);
    return { status: 500, body: { error: "Message delivery failed. Please try again later" } };
  }
}
