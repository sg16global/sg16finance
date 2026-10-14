import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { earningsReports } from "@/db/schema";
import { getEnv } from "@/lib/env";
import { loadMarketAssets } from "@/lib/market";

export const DAILY_QUESTION_LIMIT = 30;
const DEFAULT_MODEL = "claude-sonnet-5-5";
const FALLBACK_MODEL = "claude-haiku-4-5-20251001";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are SG16 Sentinel, the market-research assistant of SG16 Finance (operated by Saif Tech Global LLC).

RULES
- Educational information only. You do not give personalised investment, legal or tax advice, and you never tell the user to buy or sell.
- Every price, change, range, market cap, P/E or yield you state MUST come from <market_data> below. Never invent or estimate numbers. If something is not in the data (other tickers, news, options, order books, intraday history, forecasts you cannot support), say plainly that you do not have it.
- Say when the data was last updated. Remember that indices and commodities are shown through ETF proxies (their prices are ETF prices, not index points) and that FX and Treasury yields are daily reference values, not live ticks.
- The earnings table is historical reference data with its own dates; do not present it as current.
- Do not claim certifications, regulatory status, latency figures or data sources other than the ones named in the data.
- Be concise and plain-spoken. Use short paragraphs and "-" bullets. Do NOT use markdown symbols such as #, ** or backticks; the chat window shows plain text.
- Do not output confidence percentages or fake precision.
- End substantive answers with one short line: "Educational information, not investment advice."`;

function fmt(n: string | null | undefined, suffix = ""): string {
  return n === null || n === undefined || n === "" ? "n/a" : `${n}${suffix}`;
}

async function buildContext(): Promise<{ text: string; asOf: string }> {
  const assets = await loadMarketAssets(true);
  const db = await getDb();
  const earnings = await db.select().from(earningsReports);

  const asOf = assets
    .map((a) => a.asOf)
    .filter((v): v is string => Boolean(v))
    .sort()
    .pop() ?? new Date().toISOString();

  const lines = assets.map(
    (a) =>
      `${a.symbol} | ${a.name} | price ${a.price} | 1D change ${fmt(a.changePercent, "%")} | range ${fmt(a.low24h)}-${fmt(a.high24h)} | mcap ${fmt(a.marketCap)} | P/E ${fmt(a.peRatio)} | div yield ${fmt(a.dividendYield, "%")} | source ${a.source ?? "n/a"} | updated ${a.asOf ?? "n/a"}`,
  );

  const earningsLines = earnings
    .slice(0, 12)
    .map(
      (e) =>
        `${e.symbol} | ${e.fiscalPeriod} | reported ${e.reportDate} | EPS actual ${fmt(e.epsActual)} vs est ${e.epsEstimate} | revenue ${fmt(e.revenueActual)} vs est ${e.revenueEstimate} | ${e.beatStatus}`,
    );

  const text = `<current_time_utc>${new Date().toISOString()}</current_time_utc>
<market_data note="latest stored values; pass holders see the newest, refreshed about once a minute">
${lines.join("\n")}
</market_data>
<earnings_reference note="historical reports, not current">
${earningsLines.join("\n")}
</earnings_reference>`;
  return { text, asOf };
}

/** Daily per-account question counter. Returns false when the limit is already used up. */
export async function consumeQuestion(email: string): Promise<{ allowed: boolean; used: number }> {
  const db = await getDb();
  await db.run(sql`CREATE TABLE IF NOT EXISTS ai_usage (
    email TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (email, day))`);
  const day = new Date().toISOString().slice(0, 10);
  const row = await db.all<{ count: number }>(sql`SELECT count FROM ai_usage WHERE email = ${email} AND day = ${day}`);
  const used = row[0]?.count ?? 0;
  if (used >= DAILY_QUESTION_LIMIT) return { allowed: false, used };
  await db.run(sql`INSERT INTO ai_usage (email, day, count) VALUES (${email}, ${day}, 1)
    ON CONFLICT(email, day) DO UPDATE SET count = count + 1`);
  return { allowed: true, used: used + 1 };
}

async function callClaude(apiKey: string, model: string, system: string, messages: ChatTurn[]) {
  const base = (await getEnv("ANTHROPIC_BASE_URL")) ?? "https://api.anthropic.com";
  return fetch(`${base}/v1/messages`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 800, system, messages }),
  });
}

export type CopilotResult =
  | { ok: true; text: string; model: string; asOf: string }
  | { ok: false; reason: "unavailable" | "upstream" };

const BRAIN_TIMEOUT_MS = 45_000; // slow CPU model: after this the backup engine answers instead (browser request must stay under ~100 s)
const BRAIN_MAX_CHARS = 7_500; // the brain rejects messages over 8,000 characters

/**
 * SG16 Brain reads new text slowly (CPU model), so the prompt carries only the assets the question is about
 * (plus the biggest movers for general questions), never the whole table.
 */
async function buildCompactContext(query: string): Promise<{ text: string; asOf: string }> {
  const assets = await loadMarketAssets(true);
  const q = query.toLowerCase();
  const words = new Set(q.split(/[^a-z0-9.&]+/).filter((w) => w.length >= 2));

  const mentioned = assets.filter(
    (a) => words.has(a.symbol.toLowerCase()) || a.name.toLowerCase().split(/[^a-z0-9]+/).some((w) => w.length >= 4 && words.has(w)),
  );
  const movers = [...assets].sort((x, y) => Math.abs(Number(y.changePercent)) - Math.abs(Number(x.changePercent))).slice(0, 4);
  const picked = [...new Map([...mentioned, ...(mentioned.length >= 3 ? [] : movers)].map((a) => [a.symbol, a])).values()].slice(0, 8);

  const asOf = picked.map((a) => a.asOf).filter((v): v is string => Boolean(v)).sort().pop() ?? new Date().toISOString();
  const lines = picked.map(
    (a) =>
      `${a.symbol} (${a.name}): price ${a.price}, 1D ${fmt(a.changePercent, "%")}, range ${fmt(a.low24h)}-${fmt(a.high24h)}, P/E ${fmt(a.peRatio)}, market cap ${fmt(a.marketCap)}, source ${a.source ?? "n/a"}`,
  );
  return { text: lines.join("\n"), asOf };
}

async function askSg16Brain(query: string, history: ChatTurn[]): Promise<CopilotResult> {
  const key = await getEnv("SG16_BRAIN_KEY");
  if (!key) return { ok: false, reason: "unavailable" };
  const base = (await getEnv("SG16_BRAIN_URL")) ?? "https://mistralbrain.com";

  const { text: data, asOf } = await buildCompactContext(query);
  const message = `You are the SG16 Finance market assistant. Rules: use ONLY the DATA below for any number; if a number is not in the DATA say you do not have it; never invent prices; plain text, short; no buy or sell advice. Indices and commodities are ETF proxies; FX and yields are daily values. End with: Educational information, not investment advice.

DATA (as of ${asOf}):
${data}

QUESTION: ${query}`.slice(0, BRAIN_MAX_CHARS);

  try {
    const res = await fetch(`${base}/api/brain`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ message, mode: "assistant", history: history.slice(-2) }),
      signal: AbortSignal.timeout(BRAIN_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("SG16 Brain error:", res.status, (await res.text().catch(() => "")).slice(0, 200));
      return { ok: false, reason: "upstream" };
    }
    const out = (await res.json()) as { brain?: string; assistantMessage?: { content?: string } };
    const answer = out.assistantMessage?.content?.trim();
    // Only the language model (or the safety gate's own refusal) gives a data-grounded answer. The brain's
    // deterministic fallbacks are generic, so they are reported as a failure instead of passed off as analysis.
    if (!answer || !["ollama", "core-gate"].includes(out.brain ?? "")) {
      console.warn("SG16 Brain degraded answer, engine:", out.brain);
      return { ok: false, reason: "upstream" };
    }
    return { ok: true, text: answer, model: "sg16-brain", asOf };
  } catch (error) {
    console.error("SG16 Brain request failed:", error);
    return { ok: false, reason: "upstream" };
  }
}

async function askAnthropic(query: string, history: ChatTurn[]): Promise<CopilotResult> {
  const apiKey = await getEnv("ANTHROPIC_API_KEY");
  if (!apiKey) return { ok: false, reason: "unavailable" };

  const { text: context, asOf } = await buildContext();
  const system = `${SYSTEM_PROMPT}

${context}`;
  const messages: ChatTurn[] = [...history, { role: "user", content: query }];

  const model = (await getEnv("AI_MODEL")) ?? DEFAULT_MODEL;
  try {
    let res = await callClaude(apiKey, model, system, messages);
    if (res.status === 404 && model !== FALLBACK_MODEL) res = await callClaude(apiKey, FALLBACK_MODEL, system, messages);
    if (!res.ok) {
      console.error("Anthropic error:", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return { ok: false, reason: "upstream" };
    }
    const data = (await res.json()) as { model?: string; content?: Array<{ type: string; text?: string }> };
    const answer = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    if (!answer) return { ok: false, reason: "upstream" };
    return { ok: true, text: answer, model: data.model ?? model, asOf };
  } catch (error) {
    console.error("Anthropic request failed:", error);
    return { ok: false, reason: "upstream" };
  }
}

const WORKERS_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

type AiBinding = { run(model: string, input: unknown): Promise<unknown> };

/** Cloudflare Workers AI: runs on the account's own Workers plan, no extra API key. */
async function askWorkersAi(query: string, history: ChatTurn[]): Promise<CopilotResult> {
  let ai: AiBinding | undefined;
  try {
    const { env } = await import("cloudflare:workers");
    ai = (env as unknown as { AI?: AiBinding }).AI;
  } catch {
    // not running on Workers
  }
  if (!ai) return { ok: false, reason: "unavailable" };

  const { text: context, asOf } = await buildContext();
  const model = (await getEnv("AI_WORKERS_MODEL")) ?? WORKERS_AI_MODEL;
  try {
    const out = (await ai.run(model, {
      messages: [{ role: "system", content: `${SYSTEM_PROMPT}\n\n${context}` }, ...history, { role: "user", content: query }],
      max_tokens: 700,
    })) as { response?: string; choices?: Array<{ message?: { content?: string } }> };
    const answer = (out.response ?? out.choices?.[0]?.message?.content ?? "").trim();
    if (!answer) return { ok: false, reason: "upstream" };
    return { ok: true, text: answer, model, asOf };
  } catch (error) {
    console.error("Workers AI failed:", error);
    return { ok: false, reason: "upstream" };
  }
}

/**
 * Engine order. Default: Cloudflare Workers AI (fast, no extra key; Claude first if ANTHROPIC_API_KEY is set).
 * AI_PROVIDER = "sg16" | "anthropic" | "workers" puts that engine first. Cloudflare AI is always the final backup,
 * so a slow or failing engine never leaves the user without an answer.
 */
export async function askCopilot(query: string, history: ChatTurn[]): Promise<CopilotResult> {
  const choice = (await getEnv("AI_PROVIDER"))?.toLowerCase();
  const hasClaude = Boolean(await getEnv("ANTHROPIC_API_KEY"));
  const first = choice === "sg16" || choice === "anthropic" || choice === "workers" ? choice : hasClaude ? "anthropic" : "workers";

  const run: Record<string, () => Promise<CopilotResult>> = {
    sg16: () => askSg16Brain(query, history),
    anthropic: () => askAnthropic(query, history),
    workers: () => askWorkersAi(query, history),
  };
  const order = [...new Set([first, "workers"])];

  let result: CopilotResult = { ok: false, reason: "unavailable" };
  for (const name of order) {
    const attempt = await run[name]();
    if (attempt.ok) return attempt;
    // keep the most informative failure: "upstream" (it tried and failed) beats "unavailable" (not configured)
    if (result.ok === false && (result.reason === "unavailable" || attempt.reason === "upstream")) result = attempt;
  }
  return result;
}

/** Give back a question to the daily allowance when the AI could not answer. */
export async function refundQuestion(email: string): Promise<void> {
  const db = await getDb();
  const day = new Date().toISOString().slice(0, 10);
  await db.run(sql`UPDATE ai_usage SET count = MAX(count - 1, 0) WHERE email = ${email} AND day = ${day}`);
}

/** Keep only well-formed, bounded conversation turns from the client. */
export function sanitizeHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const turns: ChatTurn[] = [];
  for (const item of raw.slice(-6)) {
    const t = item as { role?: unknown; content?: unknown };
    if ((t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.trim()) {
      turns.push({ role: t.role, content: t.content.slice(0, 2000) });
    }
  }
  // The API requires the conversation to start with a user turn and alternate.
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns.filter((t, i) => i === 0 || t.role !== turns[i - 1].role);
}
