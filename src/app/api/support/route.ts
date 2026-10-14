import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { supportTickets } from "@/db/schema";
import { getEnv } from "@/lib/env";
import { normalizeEmail } from "@/lib/passes";
import { supportFirstReply } from "@/lib/support-ai";
import { eq } from "drizzle-orm";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

// NOTE: there is intentionally no GET handler. Tickets contain customers' names, emails and private
// messages, so they must never be listable from a public endpoint.

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Emails the ticket to the operator when SUPPORT_NOTIFY_EMAIL (and RESEND_API_KEY) are configured. */
async function notifyOperator(ticket: { id: number; name: string; email: string; subject: string; category: string; message: string }) {
  const to = await getEnv("SUPPORT_NOTIFY_EMAIL");
  const apiKey = await getEnv("RESEND_API_KEY");
  if (!to || !apiKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: (await getEnv("AUTH_FROM_EMAIL")) ?? "SG16 Finance <login@sg16finance.com>",
        to: [to],
        reply_to: ticket.email,
        subject: `[SG16 support #${ticket.id}] ${ticket.subject}`,
        text: `From: ${ticket.name} <${ticket.email}>\nCategory: ${ticket.category}\n\n${ticket.message}`,
      }),
    });
  } catch (error) {
    console.error("Support notification failed:", error);
  }
}

/** POST a support request. It is stored and emailed to the team; nothing is auto-"resolved". */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  if (!(await rateLimit("RL_AUTH", `support:${clientIp(request)}`))) return jsonError("Too many requests. Try again in a minute.", 429);

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const name = clip(body?.name, 120);
    const email = normalizeEmail(body?.email);
    const subject = clip(body?.subject, 200);
    const message = clip(body?.message, 4000);
    const tier = clip(body?.tier, 40) || "VIP Pro";
    const category = clip(body?.category, 60) || "Market Inquiry";

    if (!name || !email || !subject || !message) {
      return jsonError("Name, a valid email, subject, and message are required", 400);
    }

    const db = await getDb();
    const inserted = await db
      .insert(supportTickets)
      .values({
        name,
        email,
        tier,
        subject,
        category,
        message,
        status: "Received",
        priority: tier === "Sovereign" || tier === "Institutional" ? "Urgent" : "Normal",
        aiResponse: null,
        aiConfidence: null,
      })
      .returning();
    const ticket = inserted[0];

    await notifyOperator({ id: ticket.id, name, email, subject, category, message });

    // AI first response (Cloudflare Workers AI). It is labelled as automated and never marks the ticket "resolved".
    const ack = `Your request was received and logged as ticket #${ticket.id}. The Saif Tech Global team will reply to ${email}.`;
    const ai = await supportFirstReply({ id: ticket.id, category, subject, message });
    const reply = ai ? `Automated first response: ${ai}

${ack}` : `Thank you. ${ack}`;
    if (ai) await db.update(supportTickets).set({ aiResponse: ai }).where(eq(supportTickets.id, ticket.id));

    return NextResponse.json(
      { success: true, ticketId: ticket.id, aiAssisted: Boolean(ai), instantResolution: reply, message: reply },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Support POST error:", error);
    return jsonError("Failed to submit support ticket", 500);
  }
}
