import { getDb } from "@/db";
import { earningsReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Shield,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface EarningsDetailPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function EarningsDetailPage({ params }: EarningsDetailPageProps) {
  const { symbol } = await params;
  const decoded = decodeURIComponent(symbol).toUpperCase();
  const db = await getDb();

  const reports = await db
    .select()
    .from(earningsReports)
    .where(eq(earningsReports.symbol, decoded))
    .limit(1);

  if (!reports || reports.length === 0) {
    notFound();
  }

  const report = reports[0];
  const isBeat = report.beatStatus === "Beat";

  return (
    <div className="dashboard-canvas min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
        {/* Back Link */}
        <Link
          href="/earnings"
          className="inline-flex items-center gap-1.5 text-xs text-[#7D8594] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Earnings Hub</span>
        </Link>

        {/* Header Shield */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="live-badge text-[9px] mb-2">
                  <span className="live-dot" /> VERIFIED 10-Q FILING
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {report.symbol} — {report.companyName}
                </h1>
                <p className="text-xs text-[#7D8594] font-mono-data mt-0.5">
                  Sector: {report.sector} · Fiscal Period: {report.fiscalPeriod} (Reported {report.reportDate})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono-data border ${
                    isBeat
                      ? "bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/30"
                      : "bg-[#FF5B5B]/15 text-[#FF5B5B] border-[#FF5B5B]/30"
                  }`}
                >
                  {isBeat ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{report.beatStatus.toUpperCase()} {report.surprisePercent ? `(+${report.surprisePercent}%)` : ""}</span>
                </span>

                <Link
                  href={`/ai-copilot?q=Analyze%20${report.symbol}%20earnings%20impact`}
                  className="fin-btn-primary text-xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Sentinel AI Assessment</span>
                </Link>
              </div>
            </div>

            {/* Metrics Comparison Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-black/40 border border-white/5 font-mono-data text-xs">
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">Reported EPS</p>
                <p className="text-lg font-bold text-white mt-0.5">${report.epsActual}</p>
                <p className="text-[10px] text-[#7D8594]">Street Est: ${report.epsEstimate}</p>
              </div>

              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">Reported Revenue</p>
                <p className="text-lg font-bold text-white mt-0.5">{report.revenueActual}</p>
                <p className="text-[10px] text-[#7D8594]">Street Est: {report.revenueEstimate}</p>
              </div>

              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">Surprise Delta</p>
                <p className={`text-lg font-bold mt-0.5 ${isBeat ? "text-[#2ECC71]" : "text-[#FF5B5B]"}`}>
                  {report.surprisePercent ? `+${report.surprisePercent}%` : "In-line"}
                </p>
                <p className="text-[10px] text-[#7D8594]">Above Whisper Band</p>
              </div>

              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">Guidance Stance</p>
                <p className="text-lg font-bold text-[#FF9A3C] mt-0.5">{report.guidanceSentiment}</p>
                <p className="text-[10px] text-[#7D8594]">Next Quarter Outlook</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: The Plain-English Breakdown */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C76A16]/20 text-[#FF9A3C]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                What Happened in Plain English
              </h2>
            </div>
            <p className="text-sm text-[#B6BDC8] leading-relaxed">
              {report.plainEnglishSummary}
            </p>
          </div>
        </div>

        {/* Section 2: Why the Market Reacted */}
        <div className="p-6 rounded-2xl bg-[#090D14] border border-white/8 space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#FF9A3C]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Why Wall Street & The Market Reacted This Way
            </h3>
          </div>
          <p className="text-xs text-[#B6BDC8] leading-relaxed">
            {report.marketReactionReason}
          </p>
        </div>

        {/* Section 3: Key Catalysts to Watch */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF9A3C]" />
              <span>Forward Catalysts Under Institutional Surveillance</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(report.catalysts || []).map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C76A16]/20 text-[#FF9A3C] text-[10px] font-mono-data font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-[#B6BDC8] leading-relaxed">{cat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Key Executive Takeaways */}
        <div className="p-6 rounded-2xl bg-black/40 border border-white/8 space-y-3">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Key Financial Call Takeaways
          </h3>
          <ul className="space-y-2 text-xs text-[#B6BDC8]">
            {(report.keyTakeaways || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9A3C] mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
