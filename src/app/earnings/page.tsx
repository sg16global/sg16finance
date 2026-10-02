import { getDb } from "@/db";
import { earningsReports } from "@/db/schema";
import { ensureDataSeeded } from "@/db/ensure-data";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Bot,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  await ensureDataSeeded();
  const db = await getDb();
  const allReports = await db.select().from(earningsReports);

  const beatCount = allReports.filter((r) => r.beatStatus === "Beat").length;
  const beatRate = ((beatCount / allReports.length) * 100).toFixed(1);

  return (
    <div className="dashboard-canvas min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-badge text-[9px]">
                <span className="live-dot" /> PLAIN-ENGLISH TRANSLATIONS
              </span>
              <span className="text-[10px] font-mono-data text-[#7D8594]">
                SEC 10-Q / 8-K FILINGS PARSED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Earnings Intelligence
            </h1>
            <p className="text-xs text-[#7D8594] mt-0.5">
              Demystifying complex Wall Street quarterly reports into transparent, plain-English market context
            </p>
          </div>

          <Link href="/ai-copilot?q=Summarize%20all%20recent%20earnings%20beats" className="fin-btn-primary">
            <Bot className="w-4 h-4" />
            <span>AI Earnings Synthesizer</span>
          </Link>
        </div>

        {/* Scorecard Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-black/40 border border-white/8 font-mono-data text-xs">
          <div>
            <p className="text-[10px] text-[#7D8594] uppercase">Tracked Reports</p>
            <p className="text-xl font-bold text-white mt-0.5">{allReports.length} Mega-Caps</p>
            <p className="text-[10px] text-[#7D8594]">Q3/Q4 Reporting Cycle</p>
          </div>
          <div>
            <p className="text-[10px] text-[#7D8594] uppercase">Earnings Beat Rate</p>
            <p className="text-xl font-bold text-[#2ECC71] mt-0.5">{beatRate}% Beat</p>
            <p className="text-[10px] text-[#7D8594]">{beatCount} of {allReports.length} Companies</p>
          </div>
          <div>
            <p className="text-[10px] text-[#7D8594] uppercase">Avg Revenue Surprise</p>
            <p className="text-xl font-bold text-[#FF9A3C] mt-0.5">+4.8% Above</p>
            <p className="text-[10px] text-[#7D8594]">Consensus Estimates</p>
          </div>
          <div>
            <p className="text-[10px] text-[#7D8594] uppercase">Guidance Sentiment</p>
            <p className="text-xl font-bold text-white mt-0.5">75% Bullish</p>
            <p className="text-[10px] text-[#7D8594]">CapEx Spending Raised</p>
          </div>
        </div>

        {/* Earnings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allReports.map((report) => {
            const isBeat = report.beatStatus === "Beat";
            return (
              <div
                key={report.symbol}
                className="glass-shield overflow-hidden flex flex-col justify-between"
              >
                <div className="shield-accent-bar" />
                <div className="glass-shield-inner p-5 sm:p-6 space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">{report.symbol}</span>
                        <span className="text-xs text-[#7D8594] font-medium font-sans">
                          {report.companyName}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono-data text-[#7D8594]">
                        {report.sector} · {report.fiscalPeriod} ({report.reportDate})
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold font-mono-data border ${
                        isBeat
                          ? "bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/30"
                          : "bg-[#FF5B5B]/15 text-[#FF5B5B] border-[#FF5B5B]/30"
                      }`}
                    >
                      {isBeat ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{report.beatStatus.toUpperCase()} {report.surprisePercent ? `(${report.surprisePercent}%)` : ""}</span>
                    </span>
                  </div>

                  {/* Financials pill grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-black/40 border border-white/5 font-mono-data text-xs">
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">EPS Actual</p>
                      <p className="font-bold text-white">${report.epsActual}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">EPS Est.</p>
                      <p className="font-bold text-[#7D8594]">${report.epsEstimate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">Revenue</p>
                      <p className="font-bold text-white">{report.revenueActual}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">Guidance</p>
                      <p className="font-bold text-[#FF9A3C]">{report.guidanceSentiment}</p>
                    </div>
                  </div>

                  {/* Plain-English summary */}
                  <div>
                    <h4 className="text-xs font-bold text-[#FF9A3C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>The Plain-English Breakdown</span>
                    </h4>
                    <p className="text-xs text-[#B6BDC8] leading-relaxed">
                      {report.plainEnglishSummary}
                    </p>
                  </div>

                  {/* Why the market reacted */}
                  <div className="p-3 rounded-lg bg-[#07090C] border border-white/5">
                    <h5 className="text-[10px] font-bold text-[#7D8594] uppercase tracking-wider mb-1">
                      Why Wall Street Reacted This Way
                    </h5>
                    <p className="text-xs text-[#7D8594] leading-relaxed">
                      {report.marketReactionReason}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/earnings/${report.symbol}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white border border-white/10 transition-colors"
                  >
                    <span>Detailed {report.symbol} Drilldown & Catalysts</span>
                    <ChevronRight className="w-4 h-4 text-[#FF9A3C]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
