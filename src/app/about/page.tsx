import Link from "next/link";
import { Shield, Globe2, Cpu, CheckCircle2, TrendingUp, Building2, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  const hubs = [
    { city: "Singapore", role: "Asia-Pacific Quantitative & Telemetry Engineering", address: "Marina Bay Financial Centre, Tower 2, Singapore 018981" },
    { city: "New York", role: "Global Macro, Capital Markets & Equities Surveillance", address: "One World Trade Center, Suite 8500, New York, NY 10007" },
    { city: "London", role: "European Fixed Income & FX Cross-Currency Desks", address: "100 Bishopsgate, Level 19, London EC2N 4AG" },
    { city: "Zurich", role: "Sovereign Risk Parity & Algorithmic Preservations", address: "Gotthardstrasse 26, 8002 Zürich, Switzerland" },
    { city: "Dubai", role: "Middle East Energy, Logistics & Commodities Telemetry", address: "DIFC Gate Precinct Building 4, Dubai, UAE" },
  ];

  return (
    <div className="dashboard-canvas min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C76A16]/40 bg-[#C76A16]/15 px-3 py-1 text-xs font-mono-data text-[#FF9A3C]">
            <Shield className="w-3.5 h-3.5 text-[#FF9A3C]" />
            <span>SAIF TECH GLOBAL LLC · CORPORATE CHARTER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            About SG16 Finance
          </h1>
          <p className="text-base text-[#B6BDC8] leading-relaxed">
            SG16 Finance was engineered to eliminate information asymmetry in international markets. 
            Operated by <strong className="text-white">Saif Tech Global LLC</strong>, we combine sovereign-grade cross-border telemetry, 
            instantaneous plain-English earnings translations, and our proprietary 24/7 AI Sentinel copilot.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-shield overflow-hidden">
            <div className="shield-accent-bar" />
            <div className="glass-shield-inner p-6 space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C76A16]/20 text-[#FF9A3C]">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                24/7 Automated AI Sentinel
              </h3>
              <p className="text-xs text-[#B6BDC8] leading-relaxed">
                Modern markets never sleep. From Tokyo to Frankfurt to New York, our deep learning neural clusters continuously parse live SEC filings, central bank statements, and options order-flow anomalies 24 hours a day.
              </p>
            </div>
          </div>

          <div className="glass-shield overflow-hidden">
            <div className="shield-accent-bar" />
            <div className="glass-shield-inner p-6 space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C76A16]/20 text-[#FF9A3C]">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Plain-English Demystification
              </h3>
              <p className="text-xs text-[#B6BDC8] leading-relaxed">
                Wall Street obfuscates fundamental performance behind 150-page 10-Q reports and non-GAAP acronyms. SG16 Finance translates corporate balance sheets into clear, actionable, plain-English executive dossiers.
              </p>
            </div>
          </div>
        </div>

        {/* Global Operations Hubs */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FF9A3C]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Saif Tech Global LLC — International Presence
              </h3>
            </div>
            <p className="text-xs text-[#7D8594]">
              Our network coordinates low-latency algorithmic telemetry directly adjacent to global exchange matching engines.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hubs.map((hub, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF9A3C]" />
                    <span className="text-sm font-bold text-white">{hub.city}</span>
                  </div>
                  <p className="text-xs text-[#FF9A3C] font-mono-data">{hub.role}</p>
                  <p className="text-[11px] text-[#7D8594]">{hub.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Corporate Legal Notice */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs text-[#7D8594] font-mono-data">
          <p className="text-white font-bold">OPERATOR STATEMENT:</p>
          <p>
            SG16 Finance is a brand and software infrastructure asset wholly owned and operated by Saif Tech Global LLC. All algorithmic signals, indicators, and datasets are provided solely for institutional workflow optimization, educational research, and financial literacy.
          </p>
        </div>
      </div>
    </div>
  );
}
