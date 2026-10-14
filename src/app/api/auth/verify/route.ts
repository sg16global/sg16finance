import { normalizeEmail } from "@/lib/passes";
import { verifyLoginCode } from "@/lib/otp";
import { clientIp, createSessionToken, isSameOrigin, jsonError, rateLimit, sessionCookieHeader } from "@/lib/security";

export const dynamic = "force-dynamic";

/** POST { email, code } -> sets the encrypted httpOnly session cookie on success. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  const ip = clientIp(request);
  if (!(await rateLimit("RL_AUTH", `verify:${ip}`))) return jsonError("Too many attempts. Try again in a minute.", 429);

  const body = (await request.json().catch(() => null)) as { email?: unknown; code?: unknown } | null;
  const email = normalizeEmail(body?.email);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!email || !/^\d{6}$/.test(code)) return jsonError("Enter the 6-digit code from your email.", 400);

  if (!(await verifyLoginCode(email, code))) return jsonError("Invalid or expired code.", 401);

  const res = Response.json({ success: true, email }, { headers: { "Cache-Control": "no-store" } });
  res.headers.append("Set-Cookie", sessionCookieHeader(await createSessionToken(email)));
  return res;
}
