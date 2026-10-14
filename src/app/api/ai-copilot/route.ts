import { NextResponse } from "next/server";
import { requireActivePass } from "@/lib/access";
import { DAILY_QUESTION_LIMIT, askCopilot, consumeQuestion, refundQuestion, sanitizeHistory } from "@/lib/copilot";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

/** POST { query, history? } -> a Claude answer grounded in the stored market data. Pass holders only. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Forbidden", 403);
  if (!(await rateLimit("RL_ACCESS", clientIp(request)))) return jsonError("Too many requests", 429);

  // Gate: a verified session AND an active pass.
  const gate = await requireActivePass(request);
  if (!gate.ok) {
    return jsonError(
      gate.reason === "auth_required" ? "Sign in to use AI Sentinel." : "An active pass is required to use AI Sentinel.",
      gate.reason === "auth_required" ? 401 : 403,
      { code: gate.reason },
    );
  }

  const body = (await request.json().catch(() => null)) as { query?: unknown; symbol?: unknown; history?: unknown } | null;
  const query = (typeof body?.query === "string" ? body.query : typeof body?.symbol === "string" ? body.symbol : "").trim().slice(0, 1000);
  if (!query) return jsonError("Ask a question first.", 400);

  const quota = await consumeQuestion(gate.email);
  if (!quota.allowed) {
    return jsonError(`Daily limit reached (${DAILY_QUESTION_LIMIT} questions). It resets at 00:00 UTC.`, 429, { code: "daily_limit" });
  }

  const result = await askCopilot(query, sanitizeHistory(body?.history));
  if (!result.ok) {
    await refundQuestion(gate.email); // a failed answer does not use up the daily allowance
    return jsonError(
      result.reason === "unavailable"
        ? "AI Sentinel is not configured yet. Please try again later."
        : "AI Sentinel could not answer right now. Please try again in a moment.",
      503,
      { code: result.reason },
    );
  }

  return NextResponse.json(
    {
      success: true,
      response: result.text,
      model: result.model,
      dataAsOf: result.asOf,
      questionsUsedToday: quota.used,
      questionsLimit: DAILY_QUESTION_LIMIT,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
