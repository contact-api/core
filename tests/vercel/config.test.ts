import { vi, describe, it, expect } from "vitest";
import type { EmailProvider } from "../../core/types.js";
import { getEmailConfig } from "../../vercel/config.js";

const mockProvider: EmailProvider = {
  id: "mock",
  send: vi.fn()
};

describe("getEmailConfig", () => {
  const base = { provider: mockProvider, fromEmail: "from@test.com", toEmails: ["to@test.com"], allowedOrigins: [] };

  it("returns null if config missing or empty props", () => {
    expect(getEmailConfig({ ...base, provider: null })).toBeNull();
    expect(getEmailConfig({ ...base, fromEmail: "" })).toBeNull();
    expect(getEmailConfig({ ...base, toEmails: [] })).toBeNull();
  });

  it("returns EmailConfig when valid", () => {
    expect(getEmailConfig({ ...base })).toMatchObject({
      provider: mockProvider,
      from: "from@test.com",
      to: ["to@test.com"]
    });
  });
});
