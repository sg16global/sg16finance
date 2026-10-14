import { normalizeEmail } from "@/lib/passes";
import { requestLoginCode } from "@/lib/otp";
import { clientIp, isSameOrigin, jsonError, rateLimit, verifyTurnstile } from "@/lib/security";

export const dynamic = "force-dynamic";

/** POST { email, turnstileToken } -> emails a 6-digit code. Never reveals whether the email is known. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  const ip = clientIp(request);
  if (!(await rateLimit("RL_AUTH", `req:${ip}`))) return jsonError("Too many attempts. Try again in a minute.", 429);

  const body = (await request.json().catch(() => null)) as { email?: unknown; turnstileToken?: unknown } | null;
  const email = normalizeEmail(body?.email);
  if (!email) return jsonError("Enter a valid email address.", 400);
  if (!(await verifyTurnstile(body?.turnstileToken, ip))) {
    return jsonError("Verification failed. Please retry the security check.", 400);
  }

  const result = await requestLoginCode(email);
  if (result === "failed") return jsonError("Could not send the code right now. Please try again shortly.", 502);
  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
