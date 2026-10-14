import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { getEnv } from "@/lib/env";
import { ensurePassTables } from "@/lib/passes";
import { getSessionSecret, sha256Hex, timingSafeEqual } from "@/lib/security";

const CODE_TTL_MS = 10 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 5;

function randomCode(): string {
  // Rejection sampling so every 6-digit code is equally likely.
  const limit = 4_294_000_000 - (4_294_000_000 % 1_000_000);
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

async function hashCode(email: string, code: string): Promise<string> {
  return sha256Hex(`${email}:${code}:${await getSessionSecret()}`);
}

type SendResult = "sent" | "skipped" | "failed";

async function sendCodeEmail(email: string, code: string): Promise<SendResult> {
  const apiKey = await getEnv("RESEND_API_KEY");
  if (!apiKey) {
    // Local development only: print the code instead of emailing it.
    if ((await getEnv("AUTH_DEV_LOG_CODE")) === "1") {
      console.log(`[auth-dev] login code for ${email}: ${code}`);
      return "sent";
    }
    console.error("RESEND_API_KEY is not configured");
    return "failed";
  }
  const from = (await getEnv("AUTH_FROM_EMAIL")) ?? "SG16 Finance <login@sg16finance.com>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `Your SG16 Finance sign-in code: ${code}`,
        text: `Your SG16 Finance verification code is ${code}.\n\nIt expires in 10 minutes. If you did not request it, ignore this email: nobody can sign in without this code.\n\nSG16 Finance · Saif Tech Global LLC`,
        html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;background:#07090C;color:#fff;border-radius:12px"><p style="color:#FF9A3C;font-size:12px;letter-spacing:1px;margin:0 0 12px">SG16 FINANCE</p><p style="margin:0 0 16px">Your verification code:</p><p style="font-size:34px;letter-spacing:8px;font-weight:700;margin:0 0 16px">${code}</p><p style="color:#B6BDC8;font-size:12px;margin:0">Expires in 10 minutes. If you did not request this, ignore this email.</p></div>`,
      }),
    });
    if (!res.ok) {
      console.error("Resend error:", res.status, await res.text().catch(() => ""));
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("Resend request failed:", error);
    return "failed";
  }
}

/** Create + email a code. Returns "skipped" silently when the cooldown has not elapsed. */
export async function requestLoginCode(email: string): Promise<SendResult> {
  const db = await getDb();
  await ensurePassTables(db);
  const now = Date.now();

  const existing = await db.all<{ created_at: number }>(sql`SELECT created_at FROM login_codes WHERE email = ${email}`);
  if (existing[0] && now - existing[0].created_at < RESEND_COOLDOWN_MS) return "skipped";

  const code = randomCode();
  await db.run(sql`INSERT INTO login_codes (email, code_hash, expires_at, attempts, created_at)
    VALUES (${email}, ${await hashCode(email, code)}, ${now + CODE_TTL_MS}, 0, ${now})
    ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at,
      attempts = 0, created_at = excluded.created_at`);
  return sendCodeEmail(email, code);
}

/** Single-use verification with an attempt cap. */
export async function verifyLoginCode(email: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const db = await getDb();
  await ensurePassTables(db);

  const rows = await db.all<{ code_hash: string; expires_at: number; attempts: number }>(
    sql`SELECT code_hash, expires_at, attempts FROM login_codes WHERE email = ${email}`,
  );
  const row = rows[0];
  if (!row) return false;
  if (row.expires_at < Date.now() || row.attempts >= MAX_ATTEMPTS) {
    await db.run(sql`DELETE FROM login_codes WHERE email = ${email}`);
    return false;
  }
  if (!timingSafeEqual(row.code_hash, await hashCode(email, code))) {
    await db.run(sql`UPDATE login_codes SET attempts = attempts + 1 WHERE email = ${email}`);
    return false;
  }
  await db.run(sql`DELETE FROM login_codes WHERE email = ${email}`); // single use
  return true;
}
