"use client";

import { useCallback, useEffect, useState } from "react";

const EMAIL_KEY = "sg16_email"; // only prefills forms; identity comes from the httpOnly session cookie
export const AUTH_EVENT = "sg16-auth";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REFRESH_MS = 5 * 60_000;
const PENDING_POLL_MS = 10_000;
const PENDING_POLL_MAX = 12; // ~2 minutes for the Dodo webhook to land

export const PLAN_LABELS: Record<string, string> = {
  vip: "VIP Institutional Pro",
  institutional: "Sovereign & Multi-Seat",
  day5: "5-Hour Day Pass",
  day12: "12-Hour Day Pass",
  week: "1-Week Full Pass",
};

export interface AccessState {
  /** True until the first status check finishes. */
  loading: boolean;
  /** True when a verified session cookie is present. */
  signedIn: boolean;
  email: string;
  hasAccess: boolean;
  plan?: string;
  expiresAt?: string;
  dailyLimitSeconds?: number | null;
  remainingSeconds?: number | null;
}

interface AccessResponse extends Partial<AccessState> {
  success?: boolean;
}

export function readSavedEmail(): string {
  try {
    return localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Remember an email in this browser purely to prefill forms. */
export function saveEmail(email: string) {
  try {
    localStorage.setItem(EMAIL_KEY, email.trim());
  } catch {}
}

/** Tell every mounted useAccess to re-check (after sign-in or sign-out). */
export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/** Dodo appends ?status=succeeded&email=... to the return URL: use it to prefill sign-in. */
export function emailFromReturnUrl(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email")?.trim() ?? "";
  return params.get("status") === "succeeded" && EMAIL_RE.test(email) ? email : "";
}

export function formatRemaining(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export async function signOut() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    notifyAuthChanged();
  }
}

/**
 * Pass status for the verified (cookie) session. Pass `expectPayment` right after checkout to
 * poll until the webhook has recorded the pass.
 */
export function useAccess(expectPayment = false): AccessState {
  const [state, setState] = useState<AccessState>({ loading: true, signedIn: false, email: "", hasAccess: false });

  const check = useCallback(async (): Promise<boolean> => {
    let next: AccessState = { loading: false, signedIn: false, email: "", hasAccess: false };
    try {
      const res = await fetch("/api/access", { cache: "no-store" });
      const data = (await res.json()) as AccessResponse;
      if (res.ok && data.success && data.signedIn) {
        next = {
          loading: false,
          signedIn: true,
          email: data.email ?? "",
          hasAccess: Boolean(data.hasAccess),
          plan: data.plan,
          expiresAt: data.expiresAt,
          dailyLimitSeconds: data.dailyLimitSeconds,
          remainingSeconds: data.remainingSeconds,
        };
      }
    } catch {
      // Network hiccup: show the free state and retry on the next cycle.
    }
    setState(next);
    return next.hasAccess;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const loop = async () => {
      const has = await check();
      if (cancelled) return;
      const waiting = expectPayment && !has && attempts++ < PENDING_POLL_MAX;
      timer = setTimeout(loop, waiting ? PENDING_POLL_MS : REFRESH_MS);
    };
    const recheck = () => {
      if (timer) clearTimeout(timer);
      attempts = 0;
      void loop();
    };

    void loop();
    window.addEventListener(AUTH_EVENT, recheck);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener(AUTH_EVENT, recheck);
    };
  }, [check, expectPayment]);

  return state;
}
