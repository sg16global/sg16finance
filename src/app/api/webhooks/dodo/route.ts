import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { accessPasses, dodoEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getEnv } from "@/lib/env";
import {
  PLANS,
  SUBSCRIPTION_FALLBACK_MS,
  ensurePassTables,
  isPlanKey,
  normalizeEmail,
  planFromProductId,
  type Plan,
} from "@/lib/passes";

export const dynamic = "force-dynamic";

const MAX_SKEW_SECONDS = 5 * 60;

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Standard Webhooks signature check: HMAC-SHA256 over `${id}.${timestamp}.${body}`. */
async function verifySignature(secret: string, id: string, timestamp: string, signatureHeader: string, body: string) {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > MAX_SKEW_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    b64ToBytes(secret.replace(/^whsec_/, "")) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

  return signatureHeader
    .split(" ")
    .map((s) => s.split(","))
    .some(([version, value]) => version === "v1" && !!value && safeEqual(value, expected));
}

type Obj = Record<string, unknown>;
const asObj = (v: unknown): Obj => (v && typeof v === "object" ? (v as Obj) : {});

function resolvePlan(data: Obj): Plan | undefined {
  const meta = asObj(data.metadata);
  if (isPlanKey(meta.plan)) return PLANS[meta.plan];
  const cart = Array.isArray(data.product_cart) ? asObj(data.product_cart[0]) : {};
  return planFromProductId(data.product_id ?? cart.product_id);
}

function resolveEmail(data: Obj): string | null {
  return normalizeEmail(asObj(data.customer).email) ?? normalizeEmail(asObj(data.metadata).email);
}

/** POST https://sg16finance.com/api/webhooks/dodo */
export async function POST(request: Request) {
  const secret = await getEnv("DODO_WEBHOOK_SECRET");
  if (!secret) {
    console.error("DODO_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ success: false, error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const id = request.headers.get("webhook-id") ?? "";
  const timestamp = request.headers.get("webhook-timestamp") ?? "";
  const signature = request.headers.get("webhook-signature") ?? "";

  let valid = false;
  try {
    valid = !!id && (await verifySignature(secret, id, timestamp, signature, body));
  } catch {
    valid = false;
  }
  if (!valid) return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });

  let event: { type?: string; data?: unknown };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ success: true });
  }
  const type = String(event.type ?? "");
  const data = asObj(event.data);

  try {
    const db = await getDb();
    await ensurePassTables(db);

    // Idempotency: skip webhook ids we've already handled
    const seen = await db.select().from(dodoEvents).where(eq(dodoEvents.webhookId, id)).limit(1);
    if (seen.length) return NextResponse.json({ success: true, duplicate: true });

    const plan = resolvePlan(data);
    const email = resolveEmail(data);
    const now = Date.now();

    if (plan && email) {
      if (type === "payment.succeeded" && plan.kind === "one_time") {
        await db.insert(accessPasses).values({
          email,
          plan: plan.key,
          sourceId: String(data.payment_id ?? id),
          startsAt: new Date(now),
          expiresAt: new Date(now + (plan.durationMs ?? 0)),
        });
      } else if (
        plan.kind === "subscription" &&
        (type === "subscription.active" || type === "subscription.renewed")
      ) {
        const next = Date.parse(String(data.next_billing_date ?? ""));
        const expiresAt = new Date(Number.isFinite(next) && next > now ? next : now + SUBSCRIPTION_FALLBACK_MS);
        const existing = await db
          .select()
          .from(accessPasses)
          .where(and(eq(accessPasses.email, email), eq(accessPasses.plan, plan.key)))
          .limit(1);
        if (existing.length) {
          await db
            .update(accessPasses)
            .set({ status: "active", expiresAt, sourceId: String(data.subscription_id ?? existing[0].sourceId) })
            .where(eq(accessPasses.id, existing[0].id));
        } else {
          await db.insert(accessPasses).values({
            email,
            plan: plan.key,
            sourceId: String(data.subscription_id ?? id),
            startsAt: new Date(now),
            expiresAt,
          });
        }
      } else if (type === "subscription.cancelled" && plan.kind === "subscription") {
        // Access stays until the already-paid period ends
        await db
          .update(accessPasses)
          .set({ status: "cancelled" })
          .where(and(eq(accessPasses.email, email), eq(accessPasses.plan, plan.key)));
      }
    } else {
      console.warn("Dodo webhook: could not resolve plan/email for", type, id);
    }

    await db.insert(dodoEvents).values({ webhookId: id, type }).onConflictDoNothing();
  } catch (error) {
    console.error("Dodo webhook processing error:", error);
    // 500 so Dodo retries
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
