import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { supportTickets } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ensureDataSeeded } from "@/db/ensure-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDataSeeded();
    const db = await getDb();
    const tickets = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt)).limit(20);
    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("Support GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch support tickets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDataSeeded();
    const db = await getDb();
    const body = await request.json();
    const { name, email, tier = "VIP Pro", subject, category = "Market Inquiry", message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Generate instantaneous 24/7 automated AI resolution
    let aiResponse = "";
    const lowerSub = subject.toLowerCase() + " " + message.toLowerCase();

    if (lowerSub.includes("api") || lowerSub.includes("key") || lowerSub.includes("webhook")) {
      aiResponse = `SG16 Sentinel AI 24/7 Instant Resolution: Your request regarding API access and webhook endpoints has been verified. API keys for your ${tier} plan can be managed at /premium under the Institutional API Keys section. Endpoints support standard REST JSON and WebSocket streaming feeds at wss://stream.sg16finance.com/v2 with sub-5ms SLA. Rate limit for ${tier}: 10,000 req/min.`;
    } else if (lowerSub.includes("data") || lowerSub.includes("quote") || lowerSub.includes("live") || lowerSub.includes("feed")) {
      aiResponse = `SG16 Sentinel AI 24/7 Instant Resolution: All real-time quotes in SG16 Finance are aggregated directly across major international exchanges (NYSE, NASDAQ, LSE, TSE, COMEX). Latency telemetry is continuously calibrated. If you need specialized Level 2 order-book depth for algorithmic execution, please ensure your account is authenticated with your Institutional certificate.`;
    } else if (lowerSub.includes("billing") || lowerSub.includes("subscription") || lowerSub.includes("tier")) {
      aiResponse = `SG16 Sentinel AI 24/7 Instant Resolution: VIP billing and institutional invoicing are handled securely with automated monthly compliance receipts. You can upgrade, downgrade, or issue corporate multi-seat licenses directly from the /premium page. Corporate accounts may also request net-30 bank wire invoicing.`;
    } else {
      aiResponse = `SG16 Sentinel AI 24/7 Instant Resolution: Thank you for contacting SG16 Finance VIP Client Operations. We have automatically analyzed your inquiry regarding "${subject}". Our 24/7 intelligence engine has flagged this ticket with High priority. A dedicated Saif Tech Global quantitative specialist will also follow up directly to ${email} within 15 minutes if further manual review is needed.`;
    }

    const inserted = await db
      .insert(supportTickets)
      .values({
        name,
        email,
        tier,
        subject,
        category,
        message,
        status: "AI Resolved",
        priority: tier === "Sovereign" || tier === "Institutional" ? "Urgent" : "High",
        aiResponse,
        aiConfidence: "99.20",
      })
      .returning();

    return NextResponse.json({
      success: true,
      ticket: inserted[0],
      instantResolution: aiResponse,
      message: "Ticket created and automatically resolved by SG16 Sentinel AI 24/7 Support.",
    });
  } catch (error) {
    console.error("Support POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit support ticket" }, { status: 500 });
  }
}
