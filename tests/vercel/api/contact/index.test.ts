import { vi, describe, it, expect, beforeEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

vi.mock("@vercel/firewall", () => ({ checkRateLimit: vi.fn() }));
vi.mock("../../../../core/cors.js", () => ({ evaluateCors: vi.fn() }));
vi.mock("../../../../core/handler.js", () => ({ handleContact: vi.fn() }));
vi.mock("../../../../vercel/config.js", () => ({
  getEmailConfig: vi.fn(),
  config: { allowedOrigins: ["https://example.com"] }
}));

import { checkRateLimit } from "@vercel/firewall";
import { evaluateCors } from "../../../../core/cors.js";
import { handleContact } from "../../../../core/handler.js";
import handler from "../../../../vercel/api/contact/index.js";
import { getEmailConfig } from "../../../../vercel/config.js";

const makeReq = (overrides: Partial<VercelRequest> = {}): VercelRequest => ({
  headers: { origin: "https://example.com", "content-type": "application/json" },
  method: "POST",
  body: { subject: "Hello", email: "user@example.com", message: "Hello" },
  ...overrides,
} as unknown as VercelRequest);

const makeRes = (): VercelResponse => ({
  setHeader: vi.fn(),
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  end: vi.fn().mockReturnThis(),
} as unknown as VercelResponse);

describe("contact handler (index.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(evaluateCors).mockReturnValue({ outcome: "ok", headers: {} });
    vi.mocked(checkRateLimit).mockResolvedValue({ rateLimited: false } as any);
    vi.mocked(getEmailConfig).mockReturnValue({ provider: {} as any, from: "from@test.com", to: ["to@test.com"] });
    vi.mocked(handleContact).mockResolvedValue({ status: 200, body: { success: true, message: "Message sent successfully" } });
  });

  it("applies cors headers and returns early on 'preflight'", async () => {
    vi.mocked(evaluateCors).mockReturnValue({ outcome: "preflight", headers: { "X-Foo": "bar" }, status: 204 });
    const res = makeRes();
    await handler(makeReq({ method: "OPTIONS" }), res);
    expect(res.setHeader).toHaveBeenCalledWith("X-Foo", "bar");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(handleContact).not.toHaveBeenCalled();
  });

  it("returns 403 on 'forbidden'", async () => {
    vi.mocked(evaluateCors).mockReturnValue({ outcome: "forbidden", headers: {} });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    expect(handleContact).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ rateLimited: true } as any);
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(handleContact).not.toHaveBeenCalled();
  });

  it("delegates to handleContact and writes its result", async () => {
    vi.mocked(handleContact).mockResolvedValue({ status: 400, body: { error: "Invalid or missing fields" } });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(handleContact).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or missing fields" });
  });

  it("calls res.end() when handleContact returns null body", async () => {
    vi.mocked(handleContact).mockResolvedValue({ status: 204, body: null });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.end).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
