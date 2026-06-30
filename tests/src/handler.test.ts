import { vi, describe, it, expect, beforeEach } from "vitest";
import { handleContact } from "../../src/handler.js";
import { isValidBody } from "../../src/validation.js";
import { sendEmail } from "../../src/email.js";
import type { ContactRequest } from "../../src/contact.js";
import type { EmailConfig } from "../../src/email.js";

vi.mock("../../src/validation.js", () => ({ isValidBody: vi.fn() }));
vi.mock("../../src/email.js", () => ({ sendEmail: vi.fn() }));

const makeReq = (overrides: Partial<ContactRequest> = {}): ContactRequest => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: { subject: "Hello", email: "user@example.com", message: "Hello" },
  ...overrides,
});

const emailConfig: EmailConfig = { provider: {} as any, from: "from@test.com", to: ["to@test.com"] };

describe("handleContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isValidBody).mockReturnValue(true);
    vi.mocked(sendEmail).mockResolvedValue(undefined);
  });

  it("returns 405 when method is not POST", async () => {
    const result = await handleContact(makeReq({ method: "GET" }), { emailConfig });
    expect(result.status).toBe(405);
  });

  it("returns 415 when content-type is not application/json", async () => {
    const result = await handleContact(makeReq({ headers: { "content-type": "text/plain" } }), { emailConfig });
    expect(result.status).toBe(415);
  });

  it("returns fake success and skips sendEmail when honeypot triggered", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await handleContact(makeReq({ body: { fax_number: "12345" } }), { emailConfig });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 200, body: { success: true, message: "Message sent successfully" } });
    warnSpy.mockRestore();
  });

  it("returns 503 when emailConfig is null", async () => {
    const result = await handleContact(makeReq(), { emailConfig: null });
    expect(result.status).toBe(503);
  });

  it("returns 400 when body is invalid", async () => {
    vi.mocked(isValidBody).mockReturnValue(false);
    const result = await handleContact(makeReq(), { emailConfig });
    expect(result.status).toBe(400);
  });

  it("returns 200 and calls sendEmail on success", async () => {
    const result = await handleContact(makeReq(), { emailConfig });
    expect(sendEmail).toHaveBeenCalled();
    expect(result.status).toBe(200);
  });

  it("returns 500 when sendEmail throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(sendEmail).mockRejectedValue(new Error("fail"));
    const result = await handleContact(makeReq(), { emailConfig });
    expect(result.status).toBe(500);
    errorSpy.mockRestore();
  });
});
