import { NextResponse } from "next/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { accessPasses, passUsage } from "@/db/schema";
import { PLANS, ensurePassTables, normalizeEmail, type PlanKey } from "@/lib/passes";

export const dynamic = "force-dynamic";

const today = () => new Date().toISOString().slice(0, 10); // UTC day

async function getStatus(email: string) {
  const db = await getDb();
  await ensurePassTables(db);

  const active = await db
    .select()
    .from(accessPasses)
    .where(and(eq(accessPasses.email, email), gt(accessPasses.expiresAt, new Date())));
  if (!active.length) return { hasAccess: false as const };

  const usedRow = await db
    .select()
    .from(passUsage)
    .where(and(eq(passUsage.email, email), eq(passUsage.day, today())))
    .limit(1);
  const usedSeconds = usedRow[0]?.seconds ?? 0;

  // Passes without a daily cap (VIP, Sovereign, 1-Week) always grant access.
  const unlimited = active.find((p) => !PLANS[p.plan as PlanKey]?.dailyLimitSeconds);
  const best = active
    .map((p) => ({ pass: p, limit: PLANS[p.plan as PlanKey]?.dailyLimitSeconds }))
    .sort((a, b) => (b.limit ?? Infinity) - (a.limit ?? Infinity))[0];
  const limit = unlimited ? null : (best.limit ?? null);

  return {
    hasAccess: limit === null || usedSeconds < limit,
    plan: (unlimited ?? best.pass).plan,
    expiresAt: (unlimited ?? best.pass).expiresAt.toISOString(),
    dailyLimitSeconds: limit,
    usedSeconds,
    remainingSeconds: limit === null ? null : Math.max(0, limit - usedSeconds),
  };
}

/** GET /api/access?email=... -> current access status */
export async function GET(request: Request) {
  const email = normalizeEmail(new URL(request.url).searchParams.get("email"));
  if (!email) return NextResponse.json({ success: false, error: "Valid email required" }, { status: 400 });
  try {
    return NextResponse.json({ success: true, ...(await getStatus(email)) });
  } catch (error) {
    console.error("Access status error:", error);
    return NextResponse.json({ success: false, error: "Failed to check access" }, { status: 500 });
  }
}

/** POST { email, seconds } -> records usage (client heartbeat, max 120s per call) */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; seconds?: unknown } | null;
  const email = normalizeEmail(body?.email);
  const seconds = Math.min(120, Math.max(0, Math.floor(Number(body?.seconds) || 0)));
  if (!email) return NextResponse.json({ success: false, error: "Valid email required" }, { status: 400 });
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
    return NextResponse.json({ success: true, ...(await getStatus(email)) });
  } catch (error) {
    console.error("Access usage error:", error);
    return NextResponse.json({ success: false, error: "Failed to record usage" }, { status: 500 });
  }
}
