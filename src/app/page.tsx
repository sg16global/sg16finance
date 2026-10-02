import { db } from "@/db";
import { marketAssets, sectors, earningsReports, marketAlerts } from "@/db/schema";
import { ensureDataSeeded } from "@/db/ensure-data";
import Link from "next/link";
import AssetWorkspace from "@/components/AssetWorkspace";
import GlobalHubsMap from "@/components/GlobalHubsMap";
import {
  TrendingUp,
  Cpu,
  FileText,
  Shield,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Zap,
  Globe2,
  Clock,
  Sparkles,
  ChevronRight,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureDataSeeded();

  const [assetsList, sectorsList, earningsList, alertsList] = await Promise.all([
    db.select().from(marketAssets),
    db.select().from(sectors),
    db.select().from(earningsReports),
    db.select().from(marketAlerts),
  ]);

  const topGainers = [...assetsList]
    .sort((a, b) => Number(b.changePercent) - Number(a.changePercent))
    .slice(0, 4);

  const earningsBeats = earningsList.filter((e) => e.beatStatus === "Beat").slice(0, 3);

  return (
    <div className="dashboard-canvas min-h-screen pb-16">
      {/* Institutional Top KPI Stat Ribbon */}
      <div className="border-b border-white/8 bg-black/40 py-2.5 px-4 font-mono-data text-xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto text-[#B6BDC8]">
            <div className="flex items-center gap-2">
              <span className="text-[#7D8594] text-[11px] uppercase">Global Mkt Cap:</span>
              <span className="font-bold text-white">$118.4T</span>
              <span className="text-[#2ECC71] text-[11px] font-semibold">(+0.62%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7D8594] text-[11px] uppercase">24h Flow:</span>
              <span className="font-bold text-white">$342.8B</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7D8594] text-[11px] uppercase">AI Sentiment Radar:</span>
              <span className="font-bold text-[#FF9A3C]">74 / 100</span>
              <span className="text-[#2ECC71] text-[10px] font-bold">[BULLISH EXPANSION]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7D8594] text-[11px] uppercase">Fed Terminal Rate Exp:</span>
              <span className="font-bold text-white">3.40%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7D8594] text-[11px] uppercase">VIX Volatility:</span>
              <span className="font-bold text-[#2ECC71]">14.20</span>
              <span className="text-[#7D8594] text-[10px]">[-0.45]</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="live-badge">
              <span className="live-dot" /> LIVE STREAMING
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-10">
        {/* Hero Section */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-black/40 to-black/80 p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Subtle amber gradient halo */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C76A16]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C76A16]/40 bg-[#C76A16]/15 px-3 py-1 text-xs font-mono-data text-[#FF9A3C]">
              <Shield className="w-3.5 h-3.5 text-[#FF9A3C]" />
              <span>SAIF TECH GLOBAL LLC · INSTITUTIONAL RESEARCH FRAMEWORK</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              SG16 Finance — <span className="text-[#FF9A3C]">Global Intelligence</span>
            </h1>

            <p className="text-sm sm:text-base text-[#B6BDC8] leading-relaxed">
              Institutional-grade market context, sector research, and plain-English earnings breakdowns. 
              Equipped with a 24/7 automated AI Sentinel copilot, real-time cross-border order flow telemetry, 
              and GICS macroeconomic models. Educational content only.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/markets" className="fin-btn-primary">
                <TrendingUp className="w-4 h-4" />
                <span>Open Markets Terminal</span>
              </Link>
              <Link href="/ai-copilot" className="fin-btn-ghost">
                <Bot className="w-4 h-4 text-[#FF9A3C]" />
                <span>24/7 AI Sentinel Engine</span>
              </Link>
              <Link href="/earnings" className="fin-btn-ghost">
                <FileText className="w-4 h-4" />
                <span>Plain-English Earnings</span>
              </Link>
              <Link href="/premium" className="fin-btn-ghost">
                <span>VIP Institutional Tier</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1: Asset Categories & Live Interactive Workspace */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="fin-section-label">
              <span className="fin-section-accent" />
              <span>Asset Category Terminal & Live Order Flow</span>
            </div>
            <Link href="/markets" className="text-xs text-[#FF9A3C] hover:underline flex items-center gap-1 font-mono-data">
              <span>View All 25 Assets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <AssetWorkspace assets={assetsList} />
        </section>

        {/* Section 2: Global Financial Hubs & Cross-Border Session Status */}
        <section className="space-y-4">
          <div className="fin-section-label">
            <span className="fin-section-accent" />
            <span>Cross-Border Financial Centers & Telemetry Map</span>
          </div>

          <GlobalHubsMap />
        </section>

        {/* Section 3: Plain-English Earnings Breakdowns & Wall Street Realities */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="fin-section-label">
              <span className="fin-section-accent" />
              <span>Plain-English Earnings Breakdowns (Q3/Q4 Surveillance)</span>
            </div>
            <Link href="/earnings" className="text-xs text-[#FF9A3C] hover:underline flex items-center gap-1 font-mono-data">
              <span>Full Earnings Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {earningsBeats.map((report) => (
              <div
                key={report.symbol}
                className="glass-shield overflow-hidden flex flex-col justify-between"
              >
                <div className="shield-accent-bar" />
                <div className="glass-shield-inner p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-white">{report.symbol}</span>
                      <p className="text-xs text-[#7D8594]">{report.companyName}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#2ECC71]/15 px-2 py-0.5 text-[10px] font-bold text-[#2ECC71] border border-[#2ECC71]/30">
                      <CheckCircle2 className="w-3 h-3" />
                      BEAT ({report.surprisePercent ? `+${report.surprisePercent}%` : "BEAT"})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono-data text-xs">
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">Reported EPS</p>
                      <p className="font-bold text-white">${report.epsActual} <span className="text-[10px] text-[#7D8594]">(est. ${report.epsEstimate})</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">Revenue</p>
                      <p className="font-bold text-white">{report.revenueActual}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-bold text-[#FF9A3C] uppercase tracking-wider mb-1">
                      Plain-English Takeaway
                    </h5>
                    <p className="text-xs text-[#B6BDC8] leading-relaxed line-clamp-3">
                      {report.plainEnglishSummary}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold text-[#7D8594] uppercase tracking-wider mb-1">
                      Why the Market Reacted
                    </h5>
                    <p className="text-[11px] text-[#7D8594] line-clamp-2">
                      {report.marketReactionReason}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/earnings/${report.symbol}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white border border-white/10 transition-colors"
                  >
                    <span>Read Full Plain-English Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF9A3C]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: 11 GICS Sectors & Institutional Outperformance Radar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="fin-section-label">
              <span className="fin-section-accent" />
              <span>11 GICS Sectors Intelligence Radar</span>
            </div>
            <Link href="/sectors" className="text-xs text-[#FF9A3C] hover:underline flex items-center gap-1 font-mono-data">
              <span>Deep-Dive All 11 Sectors</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {sectorsList.slice(0, 8).map((sector) => (
              <Link
                key={sector.slug}
                href={`/sectors/${sector.slug}`}
                className="glass-card p-4 hover-lift flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-data text-[#7D8594]">
                      Weight: {sector.marketWeightPercent}%
                    </span>
                    <span
                      className={`text-xs font-mono-data font-bold ${
                        Number(sector.change1D) >= 0 ? "text-[#2ECC71]" : "text-[#FF5B5B]"
                      }`}
                    >
                      {Number(sector.change1D) >= 0 ? "+" : ""}
                      {sector.change1D}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-tight">{sector.name}</h4>
                  <p className="text-[11px] text-[#7D8594] line-clamp-2 mt-1">
                    {sector.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono-data">
                  <span className="text-[#FF9A3C] font-semibold">{sector.aiRating}</span>
                  <span className="text-[#7D8594]">1Y: +{sector.change1Y}%</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 5: Breaking Market Bulletins & System Alerts */}
        <section className="space-y-4">
          <div className="fin-section-label">
            <span className="fin-section-accent" />
            <span>Breaking Macro Bulletins & Institutional Wire</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertsList.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-[#0B0F16] border border-white/8 flex items-start gap-3 hover:border-white/15 transition-all"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5 ${
                    alert.severity === "urgent"
                      ? "bg-[#FF5B5B]/20 text-[#FF5B5B]"
                      : alert.severity === "high"
                      ? "bg-[#FF9A3C]/20 text-[#FF9A3C]"
                      : "bg-[#2ECC71]/20 text-[#2ECC71]"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{alert.title}</span>
                    <span className="text-[9px] font-mono-data uppercase px-1.5 py-0.5 rounded bg-white/5 text-[#7D8594]">
                      {alert.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#B6BDC8] leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] font-mono-data text-[#7D8594]">{alert.timestampStr}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
