import { describe, it, expect, vi, beforeEach } from "vitest";
import nodemailer from "nodemailer";
import { NodemailerProvider } from "../../../src/providers/nodemailer.js";
import type { EmailPayload } from "../../../src/types.js";


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
