import { describe, it, expect } from "vitest";
import { evaluateCors } from "../../src/cors.js";
import type { ContactRequest } from "../../src/contact.js";

const makeReq = (origin?: string, method = "POST"): ContactRequest => ({
  method,
  headers: { origin },
  body: undefined,
});

describe("evaluateCors", () => {
  it("should always set X-Content-Type-Options", () => {
    const result = evaluateCors(makeReq(), []);
    expect(result.headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("should set CORS headers when origin is allowed", () => {
    const result = evaluateCors(makeReq("https://example.com"), ["https://example.com"]);
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("https://example.com");
    expect(result.headers["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
    expect(result.headers["Access-Control-Allow-Headers"]).toBe("Content-Type");
    expect(result.outcome).toBe("ok");
  });

  it("should not set CORS headers when origin is undefined", () => {
    const result = evaluateCors(makeReq(undefined), ["https://example.com"]);
    expect(result.headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("should return 'forbidden' when origin is not allowed", () => {
    const result = evaluateCors(makeReq("https://other.com"), ["https://example.com"]);
    expect(result.outcome).toBe("forbidden");
    expect(result.headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("should return 'preflight' with 204 on OPTIONS from allowed origin", () => {
    const result = evaluateCors(makeReq("https://example.com", "OPTIONS"), ["https://example.com"]);
    expect(result.outcome).toBe("preflight");
    expect(result.status).toBe(204);
  });

  it("should return 'preflight' with 403 on OPTIONS from disallowed origin", () => {
    const result = evaluateCors(makeReq("https://other.com", "OPTIONS"), ["https://example.com"]);
    expect(result.outcome).toBe("preflight");
    expect(result.status).toBe(403);
    expect(result.headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("should return 'forbidden' when allowedOrigins is empty", () => {
    expect(evaluateCors(makeReq("https://example.com"), []).outcome).toBe("forbidden");
  });
});
