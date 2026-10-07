import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { PLANS, isPlanKey, normalizeEmail, productIdFor } from "@/lib/passes";

export const dynamic = "force-dynamic";

/** POST { plan, email } -> { checkoutUrl } (Dodo Payments hosted checkout). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { plan?: unknown; email?: unknown } | null;
  const email = normalizeEmail(body?.email);
  if (!isPlanKey(body?.plan) || !email) {
    return NextResponse.json({ success: false, error: "Valid plan and email are required" }, { status: 400 });
  }
  const plan = PLANS[body.plan];

  const apiKey = await getEnv("DODO_API_KEY");
  if (!apiKey) {
    console.error("DODO_API_KEY is not configured");
    return NextResponse.json({ success: false, error: "Payments are not configured" }, { status: 500 });
  }

  const mode = (await getEnv("DODO_ENV")) === "live" ? "live" : "test";
  const origin = new URL(request.url).origin;

  try {
    const res = await fetch(`https://${mode}.dodopayments.com/checkouts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        product_cart: [{ product_id: productIdFor(plan), quantity: 1 }],
        customer: { email },
        return_url: `${origin}/premium?paid=${plan.key}`,
        metadata: { plan: plan.key, email },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { checkout_url?: string };
    if (!res.ok || !data.checkout_url) {
      console.error("Dodo checkout error:", res.status, JSON.stringify(data));
      return NextResponse.json({ success: false, error: "Could not start checkout" }, { status: 502 });
    }
    return NextResponse.json({ success: true, checkoutUrl: data.checkout_url });
  } catch (error) {
    console.error("Dodo checkout request failed:", error);
    return NextResponse.json({ success: false, error: "Could not start checkout" }, { status: 502 });
  }
}
