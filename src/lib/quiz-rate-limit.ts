import { createHmac } from "node:crypto";

type RateLimitScope = "ip" | "email";

type RateLimitRpcClient = {
  rpc(
    functionName: "check_quiz_submission_rate_limit",
    params: { p_ip_key: string; p_email_key: string }
  ): PromiseLike<{ data: unknown; error: unknown }>;
};

type RateLimitIdentifiers = {
  ip: string;
  email: string;
};

export function hashRateLimitIdentifier(
  scope: RateLimitScope,
  identifier: string
): string {
  const secret = process.env.QUIZ_RATE_LIMIT_SECRET;
  if (!secret) throw new Error("QUIZ_RATE_LIMIT_SECRET is required");

  return createHmac("sha256", secret)
    .update(`${scope}:${identifier}`)
    .digest("hex");
}

export async function checkQuizSubmissionRateLimit(
  admin: RateLimitRpcClient,
  identifiers: RateLimitIdentifiers
): Promise<boolean> {
  try {
    const ipKey = hashRateLimitIdentifier("ip", identifiers.ip);
    const emailKey = hashRateLimitIdentifier("email", identifiers.email);
    const { data, error } = await admin.rpc("check_quiz_submission_rate_limit", {
      p_ip_key: ipKey,
      p_email_key: emailKey,
    });

    return !error && data === true;
  } catch {
    return false;
  }
}
