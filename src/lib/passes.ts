import { sql } from "drizzle-orm";
import type { Sg16Database } from "@/db";

export type PlanKey = "vip" | "institutional" | "day5" | "day12" | "week";

export interface Plan {
  key: PlanKey;
  name: string;
  /** Dodo test-mode product id; override per plan with DODO_PRODUCT_<KEY> for live mode. */
  testProductId: string;
  kind: "subscription" | "one_time";
  /** Access length for one-time passes (ms). */
  durationMs?: number;
  /** Max usage seconds per UTC day (day passes only). */
  dailyLimitSeconds?: number;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const PLANS: Record<PlanKey, Plan> = {
  vip: {
    key: "vip",
    name: "VIP Institutional Pro",
    testProductId: "pdt_0NpE85ihbd6axmkz7YMMo",
    kind: "subscription",
  },
  institutional: {
    key: "institutional",
    name: "Sovereign & Multi-Seat",
    testProductId: "pdt_0NpE85hVXxb17r4jjCJbx",
    kind: "subscription",
  },
  day5: {
    key: "day5",
    name: "5-Hour Day Pass",
    testProductId: "pdt_0NpE85iZHqpvL8Ef3z54v",
    kind: "one_time",
    durationMs: DAY,
    dailyLimitSeconds: 5 * 3600,
  },
  day12: {
    key: "day12",
    name: "12-Hour Day Pass",
    testProductId: "pdt_0NpE85hqj0oDK5zqRPOuY",
    kind: "one_time",
    durationMs: DAY,
    dailyLimitSeconds: 12 * 3600,
  },
  week: {
    key: "week",
    name: "1-Week Full Pass",
    testProductId: "pdt_0NpE85idoq2v7q7dw2aGg",
    kind: "one_time",
    durationMs: 7 * DAY,
  },
};

export const SUBSCRIPTION_FALLBACK_MS = 31 * DAY;

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && value in PLANS;
}

export function productIdFor(plan: Plan): string {
  return process.env[`DODO_PRODUCT_${plan.key.toUpperCase()}`] ?? plan.testProductId;
}

export function planFromProductId(productId: unknown): Plan | undefined {
  if (typeof productId !== "string") return undefined;
  return Object.values(PLANS).find((p) => productIdFor(p) === productId);
}

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254 ? e : null;
}

let tablesReady = false;

/** Create the payment tables on first use (D1 or local SQLite). */
export async function ensurePassTables(db: Sg16Database) {
  if (tablesReady) return;
  await db.run(sql`CREATE TABLE IF NOT EXISTS access_passes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    source_id TEXT,
    starts_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_access_passes_email ON access_passes (email)`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS dodo_events (
    webhook_id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`);
  await db.run(sql`CREATE TABLE IF NOT EXISTS pass_usage (
    email TEXT NOT NULL,
    day TEXT NOT NULL,
    seconds INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (email, day)
  )`);
  tablesReady = true;
}
