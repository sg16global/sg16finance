import { getEnv } from "@/lib/env";

/**
 * Edge security helpers: encrypted session cookie (AES-256-GCM), Turnstile verification,
 * Workers rate limiting and same-origin checks. Everything uses WebCrypto (runs on Workers).
 */

export const SESSION_COOKIE = "__Host-sg16_session";
const SESSION_TTL_SECONDS = 30 * 24 * 3600;
const SESSION_AAD = new TextEncoder().encode("sg16-session-v1");

const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64u(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64u(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function getSessionSecret(): Promise<string> {
  const secret = await getEnv("SESSION_SECRET");
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET is missing or too short");
  return secret;
}

async function sessionKey(): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(await getSessionSecret()));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

interface SessionPayload {
  e: string; // email
  exp: number; // unix seconds
}

/** Encrypted + authenticated session token: v1.<iv>.<ciphertext+tag>. */
export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = { e: email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: SESSION_AAD },
    await sessionKey(),
    enc.encode(JSON.stringify(payload)),
  );
  return `v1.${toB64u(iv)}.${toB64u(new Uint8Array(ct))}`;
}

async function openSessionToken(token: string): Promise<string | null> {
  const [version, ivPart, ctPart] = token.split(".");
  if (version !== "v1" || !ivPart || !ctPart) return null;
  try {
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64u(ivPart) as BufferSource, additionalData: SESSION_AAD },
      await sessionKey(),
      fromB64u(ctPart) as BufferSource,
    );
    const payload = JSON.parse(dec.decode(pt)) as SessionPayload;
    if (!payload.e || typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload.e;
  } catch {
    return null; // tampered, wrong key or malformed
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0 && part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

/** Verified email for this request, or null when the visitor is not signed in. */
export async function getSessionEmail(request: Request): Promise<string | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  return openSessionToken(token);
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? "unknown";
}

/** CSRF defence for state-changing routes: a browser-sent Origin must match this host. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, server-to-server)
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

type LimiterName = "RL_ACCESS" | "RL_CHECKOUT" | "RL_AUTH";

/** Workers Rate Limiting binding. Returns false when the caller is over the limit. */
export async function rateLimit(name: LimiterName, key: string): Promise<boolean> {
  try {
    const { env } = await import("cloudflare:workers");
    const limiter = (env as unknown as Record<string, { limit(o: { key: string }): Promise<{ success: boolean }> } | undefined>)[name];
    if (!limiter) return true; // binding not present (local dev without it)
    return (await limiter.limit({ key })).success;
  } catch {
    return true;
  }
}

/** Server-side Cloudflare Turnstile check. Fails closed when the secret is not configured. */
export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = await getEnv("TURNSTILE_SECRET");
  if (!secret || typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const form = new FormData();
    form.set("secret", secret);
    form.set("response", token);
    if (ip !== "unknown") form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export function jsonError(error: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ success: false, error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}
