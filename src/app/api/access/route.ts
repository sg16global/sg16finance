import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { passUsage } from "@/db/schema";
import { getAccessStatus } from "@/lib/access";
import { ensurePassTables } from "@/lib/passes";
import { clientIp, getSessionEmail, isSameOrigin, jsonError, rateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

const today = () => new Date().toISOString().slice(0, 10); // UTC day

/** GET /api/access -> pass status for the signed-in (cookie-verified) email only. */
export async function GET(request: Request) {
  if (!(await rateLimit("RL_ACCESS", clientIp(request)))) return jsonError("Too many requests", 429);
  try {
    const email = await getSessionEmail(request);
    if (!email) return NextResponse.json({ success: true, signedIn: false, hasAccess: false }, { headers: noStore });
    return NextResponse.json({ success: true, signedIn: true, email, ...(await getAccessStatus(email)) }, { headers: noStore });
  } catch (error) {
    console.error("Access status error:", error);
    return jsonError("Failed to check access", 500);
  }
}

/** POST { seconds } -> records usage for the signed-in email (client heartbeat, max 120s per call). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  if (!(await rateLimit("RL_ACCESS", clientIp(request)))) return jsonError("Too many requests", 429);
  const email = await getSessionEmail(request);
  if (!email) return jsonError("Sign in required", 401);

  const body = (await request.json().catch(() => null)) as { seconds?: unknown } | null;
  const seconds = Math.min(120, Math.max(0, Math.floor(Number(body?.seconds) || 0)));
  try {
    const db = await getDb();
    await ensurePassTables(db);
    if (seconds > 0) {
      await db
        .insert(passUsage)
        .values({ email, day: today(), seconds })
        .onConflictDoUpdate({
          target: [passUsage.email, passUsage.day],
          set: { seconds: sql`${passUsage.seconds} + ${seconds}` },
        });
    }
    return NextResponse.json({ success: true, signedIn: true, email, ...(await getAccessStatus(email)) }, { headers: noStore });
  } catch (error) {
    console.error("Access usage error:", error);
    return jsonError("Failed to record usage", 500);
  }
}
