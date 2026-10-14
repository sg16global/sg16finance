import { getEnv } from "@/lib/env";

/**
 * First-response assistant for support tickets, running on Cloudflare Workers AI (same account, no extra key).
 * It only restates facts that are true about the site; anything else is left to the human team.
 */

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const SYSTEM_PROMPT = `You are the automated first-response assistant for SG16 Finance support (operated by Saif Tech Global LLC). Write a short, polite first reply (max 90 words, plain text, no markdown, no greeting line beyond one short sentence).

TRUE FACTS YOU MAY USE
- SG16 Finance shows market data: US stocks and ETFs via Finnhub, crypto via Coinbase, FX from ECB daily reference rates, US Treasury yields daily. Indices and commodities are shown through ETF proxies, so their levels are ETF prices.
- Free visitors see prices 15 minutes delayed. An active pass shows the latest stored prices (refreshed about once a minute).
- Passes, plans and their current prices are listed on the Premium page. Payment is handled by Dodo Payments, the merchant of record, who also handles receipts, refunds and returns.
- A pass is linked to the email used at checkout. To use it, sign in on sg16finance.com (without www) with that same email: a 6-digit code is emailed to it. After paying, activation normally takes under a minute; refreshing the Premium page after signing in shows the pass.
- AI Sentinel is for signed-in pass holders (30 questions per day) and gives educational information, not investment advice.
- The team reads every ticket and replies to the email address given in the ticket.

RULES
- Never invent features, prices, dates, refunds or timelines. Never promise a resolution time.
- If the question is not answered by the facts above, say the team will answer by email.
- Never give investment advice.
- Mention the ticket number once.
- If the user says they paid but have no access, or sees "need a pass", you MUST include this tip: sign in on sg16finance.com (without www) using the exact same email used at checkout, then refresh the Premium page.
- Be practical: lead with the useful tip, then say the team will follow up by email.`;

type AiBinding = { run(model: string, input: unknown): Promise<unknown> };

/** Returns the AI's first reply, or null when AI is unavailable (the caller then sends a plain acknowledgement). */
export async function supportFirstReply(ticket: {
  id: number;
  category: string;
  subject: string;
  message: string;
}): Promise<string | null> {
  let ai: AiBinding | undefined;
  try {
    const { env } = await import("cloudflare:workers");
    ai = (env as unknown as { AI?: AiBinding }).AI;
  } catch {
    return null;
  }
  if (!ai) return null;

  const model = (await getEnv("AI_WORKERS_MODEL")) ?? MODEL;
  try {
    const out = (await ai.run(model, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Ticket #${ticket.id}. Category: ${ticket.category}. Subject: ${ticket.subject}. Message: ${ticket.message.slice(0, 1500)}`,
        },
      ],
      max_tokens: 220,
    })) as { response?: string; choices?: Array<{ message?: { content?: string } }> };
    const text = (out.response ?? out.choices?.[0]?.message?.content ?? "").trim();
    return text || null;
  } catch (error) {
    console.error("Support AI failed:", error);
    return null;
  }
}
