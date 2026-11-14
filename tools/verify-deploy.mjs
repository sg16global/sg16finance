#!/usr/bin/env node
/**
 * SG16 Finance — post-deploy verification (read-only, no credentials needed).
 *
 * Usage: npm run verify:deploy [https://sg16finance.com]
 *
 * Catches the exact November 2026 failure modes:
 *   - Worker down / D1 binding missing           -> /api/health
 *   - Cloudflare serving a build that isn't in git -> /api/version vs local HEAD
 *   - stale Nov-12 "/api/cron" build still live  -> /api/cron must be 404
 *   - market-data ingest dead                   -> dataAsOf / updatedAt age
 *   - synthetic "15 minutes ago" timestamps      -> lastTick newer than dataAsOf
 *   - auth/webhook config missing                -> /api/auth/config, /robots.txt
 */
import { execSync } from "node:child_process";

const BASE = (process.argv[2] || "https://sg16finance.com").replace(/\/+$/, "");
const STALE_AFTER_MS = 30 * 60_000;
let failures = 0;

const report = (level, name, detail) => {
  const tag = level === "PASS" ? "PASS" : level === "WARN" ? "WARN" : "FAIL";
  if (level === "FAIL") failures++;
  console.log(`${tag.padEnd(5)} ${name.padEnd(34)} ${detail}`);
};

async function get(path) {
  const res = await fetch(BASE + path, {
    headers: { "User-Agent": "sg16-verify/1.0" },
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, text, json };
}

function localSha() {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

console.log(`Verifying ${BASE} (local HEAD ${localSha()})\n`);

try {
  // 1. Liveness + D1
  const health = await get("/api/health");
  if (health.status === 200 && health.json?.ok === true) report("PASS", "health / D1 binding", "200 ok");
  else report("FAIL", "health / D1 binding", `${health.status} ${health.text.slice(0, 120)}`);

  // 2. Deployed build identity
  const version = await get("/api/version");
  if (version.json?.commit) {
    const deployed = version.json.commit;
    const local = localSha();
    if (deployed === "dev" || deployed === "unknown") report("WARN", "build identity", `unversioned build (${deployed})`);
    else if (deployed === local) report("PASS", "build identity", `matches git ${deployed}`);
    else report("WARN", "build identity", `deployed ${deployed} != git ${local} (deploy the latest commit)`);
  } else {
    report("WARN", "build identity", `no /api/version (${version.status}) — old build`);
  }

  // 3. The deleted Nov-12 cron route must be gone
  const cron = await get("/api/cron");
  if (cron.status === 405 || /Method Not Allowed/.test(cron.text)) {
    report("FAIL", "stale /api/cron build", "route still deployed — redeploy current git HEAD");
  } else {
    report("PASS", "stale /api/cron build", `gone (${cron.status})`);
  }

  // 4. Auth config
  const auth = await get("/api/auth/config");
  if (auth.json?.turnstileSiteKey) report("PASS", "Turnstile / sign-in config", auth.json.turnstileSiteKey);
  else report("FAIL", "Turnstile / sign-in config", `${auth.status} ${auth.text.slice(0, 120)}`);

  // 5. Market data freshness (dashboard)
  const dash = await get("/api/dashboard");
  const assets = dash.json?.assets ?? [];
  const times = assets.map((a) => Date.parse(a.updatedAt)).filter((t) => Number.isFinite(t));
  const newest = times.length ? Math.max(...times) : 0;
  const ageMin = newest ? Math.round((Date.now() - newest) / 60_000) : null;
  const staleFlag = dash.json?.stale;
  if (newest && Date.now() - newest < STALE_AFTER_MS) {
    report("PASS", "market-data ingest", `last write ${ageMin} min ago`);
  } else {
    report("FAIL", "market-data ingest", `last write ${ageMin ?? "unknown"} min ago — cron Worker is not writing D1`);
  }
  if (typeof staleFlag === "boolean") {
    report(staleFlag ? "FAIL" : "PASS", "API stale flag", `stale=${staleFlag}, dataAsOf=${dash.json?.dataAsOf ?? "n/a"}`);
  } else {
    report("WARN", "API stale flag", "missing — deployed build predates the honesty fix");
  }

  // 6. No synthetic "15 minutes ago" timestamps
  const quotes = await get("/api/quotes");
  const dataAsOf = Date.parse(quotes.json?.dataAsOf ?? "");
  const lastTicks = (quotes.json?.quotes ?? []).map((q) => Date.parse(q.lastTick)).filter(Number.isFinite);
  if (Number.isFinite(dataAsOf) && lastTicks.length) {
    const fake = lastTicks.filter((t) => t > dataAsOf + 5 * 60_000).length;
    report(fake ? "FAIL" : "PASS", "truthful quote timestamps", `${fake} quote(s) newer than the real data write`);
  } else {
    report("WARN", "truthful quote timestamps", "not enough data (old build)");
  }

  // 7. Edge/zone config
  const robots = await get("/robots.txt");
  if (robots.status === 200 && /GPTBot/.test(robots.text)) report("PASS", "static edge config", "Oct-29 assets present");
  else report("WARN", "static edge config", `robots.txt ${robots.status}`);
} catch (error) {
  report("FAIL", "request", error instanceof Error ? error.message : String(error));
}

console.log(`\n${failures ? `${failures} FAILURE(S) — do not consider the deploy healthy.` : "All critical checks passed."}`);
if (failures) process.exitCode = 1;
