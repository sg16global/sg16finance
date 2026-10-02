"use client";

import { useState } from "react";
import {
  Crown,
  Check,
  Zap,
  Shield,
  Bot,
  Terminal,
  Key,
  Copy,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function PremiumPage() {
  const [selectedTier, setSelectedTier] = useState<string>("vip");
  const [apiKey, setApiKey] = useState<string>("sg16_live_98ab710ef2a94481c002e1");
  const [copiedKey, setCopiedKey] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState<string | null>(null);

  const tiers = [
    {
      id: "free",
      name: "Standard Research",
      price: "$0",
      period: "forever",
      description: "Basic institutional market telemetry with delayed quotes and core earnings summaries.",
      features: [
        "15-minute delayed equity & index quotes",
        "Top 10 Mega-Cap earnings breakdowns",
        "Limited to 5 watchlist assets",
        "Standard web access",
      ],
      buttonLabel: "Current Free Tier",
      highlighted: false,
    },
    {
      id: "vip",
      name: "VIP Institutional Pro",
      price: "$49",
      period: "per month",
      description: "Sub-second live streaming feeds, 24/7 AI Sentinel copilot, and full earnings plain-English drilldowns.",
      features: [
        "Real-time sub-second price streaming",
        "Unlimited 24/7 AI Sentinel intelligence queries",
        "Full plain-English earnings breakdowns (10-Q & 8-K)",
        "Unlimited PostgreSQL persistent watchlist items",
        "Breaking macro push alerts & whisper numbers",
        "REST API Access (10,000 req/minute)",
      ],
      buttonLabel: "Activate VIP Pro",
      highlighted: true,
    },
    {
      id: "institutional",
      name: "Sovereign & Multi-Seat",
      price: "$249",
      period: "per month / seat",
      description: "Direct FIX protocol cross-connects, custom risk parity beta covariance, and dedicated quantitative desk support.",
      features: [
        "Sub-2ms FIX protocol WebSocket feed",
        "Custom portfolio covariance & risk models",
        "Full historical tick data Parquet export",
        "Dedicated Saif Tech Global quantitative liaison",
        "Custom webhook triggers on SEC EDGAR filings",
        "SOC-2 Type II audit compliance telemetry",
      ],
      buttonLabel: "Provision Sovereign Seat",
      highlighted: false,
    },
  ];

  const handleGenerateKey = () => {
    const chars = "0123456789abcdef";
    let randomHex = "";
    for (let i = 0; i < 22; i++) {
      randomHex += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(`sg16_live_${randomHex}`);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleActivate = (tierName: string) => {
    setActivatedSuccess(
      `Your account has been granted ${tierName} credentials. Instant access has been provisioned across all SG16 Finance terminal endpoints.`
    );
  };

  return (
    <div className="dashboard-canvas min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C76A16]/40 bg-[#C76A16]/15 px-3 py-1 text-xs font-mono-data text-[#FF9A3C]">
            <Crown className="w-3.5 h-3.5 text-[#FF9A3C]" />
            <span>EXCLUSIVE MEMBERSHIP & SOVEREIGN ACCESS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Institutional Intelligence Tiers
          </h1>
          <p className="text-sm text-[#B6BDC8] leading-relaxed">
            Choose the tier tailored for institutional asset managers, private equity allocators, family offices, and active global investors.
          </p>
        </div>

        {/* Activation Modal / Alert */}
        {activatedSuccess && (
          <div className="p-4 rounded-xl bg-[#2ECC71]/15 border border-[#2ECC71]/40 text-xs text-[#2ECC71] flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="font-semibold text-white">{activatedSuccess}</p>
            </div>
            <button
              onClick={() => setActivatedSuccess(null)}
              className="text-white hover:underline text-xs shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`glass-shield overflow-hidden flex flex-col justify-between ${
                tier.highlighted ? "border-[#C76A16]/60 shadow-[0_0_35px_rgba(199,106,22,0.25)]" : ""
              }`}
            >
              {tier.highlighted && <div className="shield-accent-bar" />}
              <div className="glass-shield-inner p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">{tier.name}</h3>
                  {tier.highlighted && (
                    <span className="rounded bg-[#C76A16] px-2 py-0.5 text-[10px] font-mono-data font-bold text-white uppercase">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="font-mono-data">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[#7D8594] ml-2">/ {tier.period}</span>
                </div>

                <p className="text-xs text-[#B6BDC8] leading-relaxed">{tier.description}</p>

                <div className="pt-4 border-t border-white/5 space-y-2.5">
                  <p className="text-[10px] font-mono-data uppercase tracking-wider text-[#FF9A3C] font-bold">
                    Included Intelligence:
                  </p>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#B6BDC8]">
                      <Check className="w-3.5 h-3.5 text-[#2ECC71] mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleActivate(tier.name)}
                  className={`w-full py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white shadow-lg hover:shadow-[0_0_25px_rgba(199,106,22,0.5)]"
                      : "bg-white/[0.05] text-[#B6BDC8] hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {tier.buttonLabel}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section: Sub-5ms API Access Keys for Institutional Clients */}
        <div id="api" className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C76A16]/20 text-[#FF9A3C]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Institutional Low-Latency API Gateway
                  </h3>
                  <p className="text-xs text-[#7D8594]">
                    Direct REST & WebSocket programmatic feeds for automated algorithmic systems
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateKey}
                className="fin-btn-ghost text-xs"
              >
                <span>Rotate Secret Key</span>
              </button>
            </div>

            {/* Key display box */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono-data text-xs">
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase mb-1">Active Production API Key</p>
                <span className="text-white font-bold select-all">{apiKey}</span>
              </div>
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-[#2ECC71]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? "Copied" : "Copy Key"}</span>
              </button>
            </div>

            {/* Quick Curl Snippet */}
            <div className="p-4 rounded-xl bg-[#030508] border border-white/5 font-mono-data text-xs text-[#B6BDC8] space-y-2">
              <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">Sample Shell Invocation:</p>
              <pre className="overflow-x-auto text-[#FF9A3C] p-2 bg-black/40 rounded">
                {`curl -X GET "https://sg16finance.com/api/dashboard" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Accept: application/json"`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
