// @vitest-environment node

import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  checkQuizSubmissionRateLimit,
  hashRateLimitIdentifier,
} from "@/lib/quiz-rate-limit";

const SECRET = "test-only-rate-limit-secret";

afterEach(() => {
  delete process.env.QUIZ_RATE_LIMIT_SECRET;
});

describe("hashRateLimitIdentifier", () => {
  it("produz HMAC-SHA256 deterministico", () => {
    process.env.QUIZ_RATE_LIMIT_SECRET = SECRET;

    const expected = createHmac("sha256", SECRET)
      .update("ip:203.0.113.10")
      .digest("hex");

    expect(hashRateLimitIdentifier("ip", "203.0.113.10")).toBe(expected);
    expect(hashRateLimitIdentifier("ip", "203.0.113.10")).toBe(expected);
  });

  it("separa os escopos de IP e email", () => {
    process.env.QUIZ_RATE_LIMIT_SECRET = SECRET;

    expect(hashRateLimitIdentifier("ip", "same-value")).not.toBe(
      hashRateLimitIdentifier("email", "same-value")
    );
  });
});

describe("checkQuizSubmissionRateLimit", () => {
  it("envia somente hashes para a RPC, sem identificadores brutos", async () => {
    process.env.QUIZ_RATE_LIMIT_SECRET = SECRET;
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });

    const allowed = await checkQuizSubmissionRateLimit(
      { rpc },
      { ip: "203.0.113.10", email: "maria@example.com" }
    );

    expect(allowed).toBe(true);
    expect(rpc).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith("check_quiz_submission_rate_limit", {
      p_ip_key: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_email_key: expect.stringMatching(/^[a-f0-9]{64}$/),
    });

    const serializedCall = JSON.stringify(rpc.mock.calls[0]);
    expect(serializedCall).not.toContain("203.0.113.10");
    expect(serializedCall).not.toContain("maria@example.com");
  });

  it("falha fechado quando o segredo esta ausente", async () => {
    const rpc = vi.fn();

    await expect(
      checkQuizSubmissionRateLimit(
        { rpc },
        { ip: "203.0.113.10", email: "maria@example.com" }
      )
    ).resolves.toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("falha fechado quando a RPC retorna erro", async () => {
    process.env.QUIZ_RATE_LIMIT_SECRET = SECRET;
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: "P0001" } });

    await expect(
      checkQuizSubmissionRateLimit(
        { rpc },
        { ip: "203.0.113.10", email: "maria@example.com" }
      )
    ).resolves.toBe(false);
  });
});
