import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import nodemailer from "nodemailer";
import { createNodemailerProvider, NodemailerProvider } from "../../nodemailer/index.js";
import type { EmailPayload } from "../../core/types.js";

vi.mock("nodemailer", () => {
  const mockSend = vi.fn();
  const mockCreateTransport = vi.fn().mockImplementation(() => ({
    sendMail: mockSend
  }));

  return {
    default: {
      createTransport: mockCreateTransport
    }
  };
});

describe("NodemailerProvider", () => {
  const smtpConfig = `{"host":"smtp.test.com","port":587,"secure":false}`;

  const getMockSend = () => {
    const transporter = nodemailer.createTransport({});
    return transporter.sendMail as any;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets id to nodemailer", () => {
    const provider = new NodemailerProvider(smtpConfig);

    expect(provider.id).toBe("nodemailer");
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "smtp.test.com",
      port: 587,
      secure: false
    });
  });

  it("sends mapped email payload", async () => {
    const provider = new NodemailerProvider(smtpConfig);
    const mockSend = getMockSend();
    mockSend.mockResolvedValue({ messageId: "msg_123" });

    const payload: EmailPayload = {
      from: "from@test.com",
      to: ["to1@test.com", "to2@test.com"],
      replyTo: "reply@test.com",
      subject: "Test",
      text: "Hello"
    };

    await expect(provider.send(payload)).resolves.toBeUndefined();

    expect(mockSend).toHaveBeenCalledWith({
      from: "from@test.com",
      to: "to1@test.com,to2@test.com",
      replyTo: "reply@test.com",
      subject: "Test",
      text: "Hello"
    });
  });

  it("throws on invalid smtp config json", () => {
    expect(() => new NodemailerProvider("{bad json")).toThrow();
  })
})

describe("createNodemailerProvider", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  it("returns null and warns when SMTP_CONFIG is missing", () => {
    delete process.env["SMTP_CONFIG"];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(createNodemailerProvider()).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith("SMTP_CONFIG missing for nodemailer");
    warnSpy.mockRestore();
  });

  it("returns null and logs an error when SMTP_CONFIG is invalid JSON", () => {
    process.env["SMTP_CONFIG"] = "{not valid json";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(createNodemailerProvider()).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith("Failed to initialize Nodemailer provider:", expect.any(Error));
    errorSpy.mockRestore();
  });

  it("returns a NodemailerProvider instance when SMTP_CONFIG is valid", () => {
    process.env["SMTP_CONFIG"] = JSON.stringify({ host: "smtp.test.com", port: 587, auth: { user: "u", pass: "p" } });
    const provider = createNodemailerProvider();
    expect(provider).toBeInstanceOf(NodemailerProvider);
  });
});
