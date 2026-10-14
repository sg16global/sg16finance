"use client";

import { useState } from "react";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
import Turnstile from "@/components/Turnstile";
import { notifyAuthChanged, saveEmail } from "@/lib/useAccess";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data;
}

/** Email + 6-digit code sign-in. On success the server sets an encrypted httpOnly session cookie. */
export default function SignInPanel({
  defaultEmail = "",
  heading = "Sign in to your account",
}: {
  defaultEmail?: string;
  heading?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [token, setToken] = useState<string | null>(null);
  const [tokenReset, setTokenReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    if (!token) return setError("Please complete the security check first.");
    setBusy(true);
    try {
      await postJson("/api/auth/request", { email: email.trim(), turnstileToken: token });
      saveEmail(email);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setToken(null);
      setTokenReset((n) => n + 1); // Turnstile tokens are single-use
      setBusy(false);
    }
  };

  const verify = async () => {
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) return setError("Enter the 6-digit code from your email.");
    setBusy(true);
    try {
      await postJson("/api/auth/verify", { email: email.trim(), code: code.trim() });
      setCode("");
      notifyAuthChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-[#7D8594] focus:border-[#C76A16]/60 focus:outline-none";
  const buttonClass =
    "w-full py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#D97B22] to-[#C76A16] hover:shadow-[0_0_25px_rgba(199,106,22,0.5)] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2";

  return (
    <div id="signin" className="max-w-xl mx-auto rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
      <div className="flex items-center gap-2 text-white">
        {step === "email" ? <KeyRound className="w-4 h-4 text-[#FF9A3C]" /> : <MailCheck className="w-4 h-4 text-[#2ECC71]" />}
        <h3 className="text-sm font-bold tracking-tight">{heading}</h3>
      </div>

      {step === "email" ? (
        <>
          <p className="text-xs text-[#B6BDC8]">
            Enter the email you paid with. We will send a 6-digit code to verify it is really you.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
          />
          <Turnstile onToken={setToken} resetKey={tokenReset} />
          <button onClick={sendCode} disabled={busy} className={buttonClass}>
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Email me a sign-in code
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-[#B6BDC8]">
            We emailed a 6-digit code to <span className="text-white font-semibold">{email.trim()}</span>. It expires in
            10 minutes.
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className={`${inputClass} text-center font-mono-data text-lg tracking-[0.4em]`}
          />
          <button onClick={verify} disabled={busy} className={buttonClass}>
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Verify and sign in
          </button>
          <button
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="w-full text-[11px] text-[#7D8594] hover:text-white cursor-pointer"
          >
            Use a different email or resend the code
          </button>
        </>
      )}

      {error && <p className="text-xs text-[#FF6B6B]">{error}</p>}
    </div>
  );
}
