import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { accessPasses, passUsage } from "@/db/schema";
import { ensurePassTables } from "@/lib/passes";
import { getAccessStatus, requireActivePass } from "@/lib/access";
import { SESSION_COOKIE, createSessionToken } from "@/lib/security";

// Isolated in-memory SQLite for every run (no Cloudflare binding in the test env).
process.env.LOCAL_DATABASE_URL = ":memory:";

const DAY = 24 * 3_600_000;

let db: Awaited<ReturnType<typeof getDb>>;

function requestWithCookie(cookie: string): Request {
  return new Request("https://sg16finance.com/api/test", { headers: { cookie } });
}

async function signIn(email: string): Promise<Request> {
  process.env.SESSION_SECRET = "test-session-secret-0123456789abcdef0123456789";
  const token = await createSessionToken(email);
  return requestWithCookie(`${SESSION_COOKIE}=${token}`);
}

async function grantPass(email: string, plan: string, durationMs: number) {
  const now = Date.now();
  await db.insert(accessPasses).values({
    email,
    plan,
    sourceId: "test",
    startsAt: new Date(now),
    expiresAt: new Date(now + durationMs),
  });
}

beforeAll(async () => {
  process.env.SESSION_SECRET = "test-session-secret-0123456789abcdef0123456789";
  db = await getDb();
  await ensurePassTables(db);
});

beforeEach(async () => {
  await db.run(sql`DELETE FROM access_passes`);
  await db.run(sql`DELETE FROM pass_usage`);
});

describe("getAccessStatus", () => {
  it("reports no access without a pass", async () => {
    expect((await getAccessStatus("none@example.com")).hasAccess).toBe(false);
  });

  it("grants access for an active unlimited pass", async () => {
    await grantPass("vip@example.com", "vip", 31 * DAY);
    const status = await getAccessStatus("vip@example.com");
    expect(status.hasAccess).toBe(true);
    expect(status.plan).toBe("vip");
  });

  it("denies an expired pass", async () => {
    const now = Date.now();
    await db.insert(accessPasses).values({
      email: "expired@example.com",
      plan: "week",
      sourceId: "test",
      startsAt: new Date(now - 10 * DAY),
      expiresAt: new Date(now - DAY),
    });
    expect((await getAccessStatus("expired@example.com")).hasAccess).toBe(false);
  });

  it("enforces the daily seconds cap on day passes", async () => {
    await grantPass("day@example.com", "day5", DAY);
    const today = new Date().toISOString().slice(0, 10);
    await db.insert(passUsage).values({ email: "day@example.com", day: today, seconds: 4 * 3600 });

    const under = await getAccessStatus("day@example.com");
    expect(under.hasAccess).toBe(true);
    expect(under.remainingSeconds).toBe(3600);

    await db.update(passUsage).set({ seconds: 5 * 3600 }).where(eq(passUsage.email, "day@example.com"));
    expect((await getAccessStatus("day@example.com")).hasAccess).toBe(false);
  });
});

describe("requireActivePass", () => {
  it("requires a session cookie", async () => {
    const gate = await requireActivePass(requestWithCookie(""));
    expect(gate.ok).toBe(false);
    expect(gate.ok === false && gate.reason).toBe("auth_required");
  });

  it("requires an active pass with a session", async () => {
    const gate = await requireActivePass(await signIn("nopass@example.com"));
    expect(gate.ok).toBe(false);
    expect(gate.ok === false && gate.reason).toBe("subscription_required");
  });

  it("passes with session and active pass", async () => {
    await grantPass("ok@example.com", "week", 7 * DAY);
    const gate = await requireActivePass(await signIn("ok@example.com"));
    expect(gate.ok).toBe(true);
    expect(gate.ok === true && gate.email).toBe("ok@example.com");
  });
});
