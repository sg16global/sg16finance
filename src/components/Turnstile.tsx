"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileApi {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;
let siteKeyPromise: Promise<string | null> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(el);
  });
  return scriptPromise;
}

function loadSiteKey(): Promise<string | null> {
  siteKeyPromise ??= fetch("/api/auth/config", { cache: "no-store" })
    .then((r) => r.json() as Promise<{ turnstileSiteKey?: string | null }>)
    .then((d) => d.turnstileSiteKey ?? null)
    .catch(() => {
      siteKeyPromise = null;
      return null;
    });
  return siteKeyPromise;
}

/**
 * Cloudflare Turnstile bot check. Calls onToken(token) when solved and onToken(null) when it
 * expires or fails. Change `resetKey` to request a fresh challenge (tokens are single-use).
 */
export default function Turnstile({
  onToken,
  resetKey = 0,
}: {
  onToken: (token: string | null) => void;
  resetKey?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [siteKey] = await Promise.all([loadSiteKey(), loadScript()]);
        if (cancelled || !hostRef.current || !window.turnstile) return;
        if (!siteKey) {
          setUnavailable(true);
          return;
        }
        widgetRef.current = window.turnstile.render(hostRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      } catch {
        if (!cancelled) setUnavailable(true);
      }
    })();
    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey > 0 && widgetRef.current && window.turnstile) {
      onTokenRef.current(null);
      window.turnstile.reset(widgetRef.current);
    }
  }, [resetKey]);

  return (
    <div>
      <div ref={hostRef} />
      {unavailable && (
        <p className="text-[11px] text-[#FF6B6B]">Security check could not load. Refresh the page and try again.</p>
      )}
    </div>
  );
}
