#!/usr/bin/env node
/**
 * SG16 Finance — Cloudflare zone & Workers Builds repair tool (free-plan aware).
 * Usage: node tools/cf-fix.mjs <command> [--apply]     (token from $CF_TOKEN or /tmp/.cf_token)
 *
 * Commands:
 *   verify   token + zone/account resolution
 *   report   read-only dump of zone security posture
 *   zone     apply: edge HSTS/nosniff, security-headers transform rule, bot fight mode off
 *
 * Measured realities of this zone (2026-10-30):
 *  - zone plan = Free → no Super Bot Fight Mode; Bot Fight Mode cannot be skipped by skip rules;
 *    `PATCH /zones/:id/bot_management` returns 405 for token auth → dashboard toggle fallback.
 *  - firewall-phase rulesets (custom/managed/ratelimit entrypoints) return 403 for this token/plan.
 *  - transform-phase rules reject a rule-level `name` field (400 "unknown field name").
 * Dry-run by default; pass --apply to write. The token is never logged.
 */
import { readFileSync, existsSync } from "node:fs";
const TOKEN = String(process.env.CF_TOKEN || (existsSync("/tmp/.cf_token") ? readFileSync("/tmp/.cf_token", "utf8").trim() : ""));
const API = "https://api.cloudflare.com/client/v4";
const APPLY = process.argv.includes("--apply");
const CMD = process.argv[2] || "verify";
const MARK = "qwen-ops-2026-10-30";

const HEADERS = {
  "x-content-type-options": { operation: "set", value: "nosniff" },
  "x-frame-options": { operation: "set", value: "DENY" },
  "referrer-policy": { operation: "set", value: "strict-origin-when-cross-origin" },
  "permissions-policy": { operation: "set", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  "x-permitted-cross-domain-policies": { operation: "set", value: "none" },
};

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    method: opts.method || "GET",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let j; try { j = JSON.parse(text); } catch { j = { raw: text.slice(0, 200) }; }
  if (!res.ok) {
    const msg = (j.errors || []).map((e) => e.message).join("; ") || text.slice(0, 200);
    const err = new Error(`${opts.method || "GET"} ${path} -> ${res.status}: ${msg}`);
    err.status = res.status; throw err;
  }
  return j.result !== undefined ? j.result : j;
}
const log = (...a) => console.log(...a);
const plan = async (z) => (await api(`/zones/${z}`)).plan?.name;

async function ids() {
  const zone = (await api("/zones?name=sg16finance.com&per_page=5"))[0];
  if (!zone) throw new Error("zone sg16finance.com not visible to this token");
  const accounts = await api("/accounts?per_page=10");
  return { zoneId: zone.id, accountId: accounts[0]?.id };
}

async function report({ zoneId, accountId }) {
  log("zone plan:", await plan(zoneId));
  const sl = await api(`/zones/${zoneId}/settings/security_level`);
  log("security_level:", sl.value);
  const sh = await api(`/zones/${zoneId}/settings/security_header`);
  log("security_header(HSTS):", JSON.stringify(sh.value?.strict_transport_security));
  try {
    const bm = await api(`/zones/${zoneId}/bot_management`);
    log("bot_management:", JSON.stringify({ fight_mode: bm.fight_mode, crawler: bm.crawler_protection, ai_training: bm.ai_training }));
  } catch (e) { log("bot_management: n/a:", e.message); }
  try {
    const tr = await api(`/zones/${zoneId}/rulesets/phases/http_response_headers_transform/entrypoint`);
    for (const r of tr.rules || []) log("transform rule:", JSON.stringify(r.action_parameters?.headers || {}).slice(0, 220));
  } catch (e) { log("transform rules: none (", e.message, ")"); }
  try {
    const cus = await api(`/zones/${zoneId}/rulesets/phases/http_request_firewall_custom/entrypoint`);
    log("custom rules:", (cus.rules || []).length);
  } catch (e) { log("custom rules: not accessible (", e.status, e.message, ")"); }
  try {
    const tg = await api(`/accounts/${accountId}/builds/workers/sg16finance/triggers`);
    log("builds triggers:", Array.isArray(tg) ? tg.length : JSON.stringify(tg).slice(0, 120));
  } catch (e) { log("builds triggers: n/a (", e.message, ")"); }
}

async function zoneFix(ids_) {
  const { zoneId } = ids_;
  // 1. edge HSTS + nosniff
  const sh = await api(`/zones/${zoneId}/settings/security_header`);
  const hsts = sh.value?.strict_transport_security || {};
  if (!hsts.enabled || hsts.max_age < 63072000 || !hsts.nosniff) {
    log("security_header -> HSTS 2y + includeSubDomains + nosniff", APPLY ? "" : "(dry-run)");
    if (APPLY) await api(`/zones/${zoneId}/settings/security_header`, { method: "PATCH", body: { value: { strict_transport_security: { enabled: true, max_age: 63072000, include_subdomains: true, preload: false, nosniff: true } } } });
  } else log("security_header already sane");

  // 2. security-headers transform rule (rule-level `name` rejected on this plan)
  let tr = null;
  try { tr = await api(`/zones/${zoneId}/rulesets/phases/http_response_headers_transform/entrypoint`); } catch { /* absent */ }
  const existing = (tr?.rules || [])[0];
  const same = existing && JSON.stringify(existing.action_parameters?.headers || {}) === JSON.stringify(HEADERS);
  if (!same) {
    log("transform rule -> 5 security headers on every response", APPLY ? "" : "(dry-run)");
    if (APPLY) await api(`/zones/${zoneId}/rulesets/phases/http_response_headers_transform/entrypoint`, {
      method: "PUT",
      body: { rules: [{ expression: "true", enabled: true, action: "rewrite", description: MARK, action_parameters: { headers: HEADERS } }] },
    });
  } else log("transform rule already in place");

  // 3. bot fight mode (free plan): PATCH usually 405 for tokens -> dashboard fallback
  try {
    const bm = await api(`/zones/${zoneId}/bot_management`);
    if (bm.fight_mode) {
      log("bot fight mode ON -> trying PATCH off", APPLY ? "" : "(dry-run)");
      if (APPLY) {
        try {
          const r = await api(`/zones/${zoneId}/bot_management`, { method: "PATCH", body: { fight_mode: false } });
          log("  fight_mode now:", r.fight_mode);
        } catch (e) {
          if (e.status === 405) log("  PATCH refused (405) on this plan: DASHBOARD CLICK REQUIRED -> Security > Bots > Bot Fight Mode = OFF");
          else throw e;
        }
      }
    } else log("bot fight mode already off");
  } catch (e) { log("bot_management unreadable:", e.message); }

  // 4. custom rules / skip rules: not accessible on Free plan with this token
  try {
    await api(`/zones/${zoneId}/rulesets/phases/http_request_firewall_custom/entrypoint`);
    log("custom rules accessible — inspect manually if needed");
  } catch (e) {
    log("custom/skip rules: not applicable on Free plan (", e.status, ") — webhook protection relies on HMAC + fight mode off");
  }
}

(async () => {
  if (!TOKEN) { console.error("CF_TOKEN missing"); process.exit(2); }
  const ids_ = await ids();
  log(`zone=sg16finance.com (${ids_.zoneId}) account=${ids_.accountId} apply=${APPLY}`);
  if (CMD === "verify") log("token ok:", (await api("/user/tokens/verify")).status);
  else if (CMD === "report") await report(ids_);
  else if (CMD === "zone") { await zoneFix(ids_); if (APPLY) { log("--- after ---"); await report(ids_); } }
  else { console.error("unknown command"); process.exit(2); }
  if (!APPLY && CMD === "zone") log("\nDRY RUN — re-run with --apply to write changes");
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
