import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { accessPasses, passUsage } from "@/db/schema";
import { PLANS, ensurePassTables, type PlanKey } from "@/lib/passes";
import { getSessionEmail } from "@/lib/security";

const today = () => new Date().toISOString().slice(0, 10); // UTC day

export interface AccessStatus {
  hasAccess: boolean;
  plan?: string;
  expiresAt?: string;
  dailyLimitSeconds?: number | null;
  usedSeconds?: number;
  remainingSeconds?: number | null;
}

/** Pass status for a verified email. */
export async function getAccessStatus(email: string): Promise<AccessStatus> {
  const db = await getDb();
  await ensurePassTables(db);

  const active = await db
    .select()
    .from(accessPasses)
    .where(and(eq(accessPasses.email, email), gt(accessPasses.expiresAt, new Date())));
  if (!active.length) return { hasAccess: false };

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

export type Gate =
  | { ok: true; email: string; status: AccessStatus }
  | { ok: false; reason: "auth_required" | "subscription_required"; email?: string };

/** Server-side gate: requires a valid session cookie AND an active pass. */
export async function requireActivePass(request: Request): Promise<Gate> {
  const email = await getSessionEmail(request);
  if (!email) return { ok: false, reason: "auth_required" };
  const status = await getAccessStatus(email);
  if (!status.hasAccess) return { ok: false, reason: "subscription_required", email };
  return { ok: true, email, status };
}
