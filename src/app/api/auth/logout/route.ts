import { clearSessionCookieHeader, isSameOrigin, jsonError } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  const res = Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  res.headers.append("Set-Cookie", clearSessionCookieHeader());
  return res;
}
