import { getDb } from "@/db";
import { sectors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PieChart,
  TrendingUp,
  Shield,
  Bot,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SectorDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SectorDetailPage({ params }: SectorDetailPageProps) {
  const { slug } = await params;
  const db = await getDb();
  const sectorList = await db.select().from(sectors).where(eq(sectors.slug, slug)).limit(1);

  if (!sectorList || sectorList.length === 0) {
    notFound();
  }

  const sector = sectorList[0];
  const is1DPositive = Number(sector.change1D) >= 0;

  return (
    <div className="dashboard-canvas min-h-screen py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
        {/* Back Link */}
        <Link
          href="/sectors"
          className="inline-flex items-center gap-1.5 text-xs text-[#7D8594] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All 11 GICS Sectors</span>
        </Link>

        {/* Header Dossier Card */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="live-badge text-[9px] mb-2">
                  <span className="live-dot" /> GICS BENCHMARK DOSSIER
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {sector.name}
                </h1>
                <p className="text-xs text-[#7D8594] font-mono-data mt-0.5">
                  Index Representation: {sector.marketWeightPercent}% of S&P 500 Market Cap
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono-data font-bold px-3 py-1 rounded-lg border border-white/10 ${
                    sector.aiRating === "Overweight"
                      ? "bg-[#2ECC71]/15 text-[#2ECC71]"
                      : sector.aiRating === "Equal Weight"
                      ? "bg-[#FF9A3C]/15 text-[#FF9A3C]"
                      : "bg-[#FF5B5B]/15 text-[#FF5B5B]"
                  }`}
                >
                  RATING: {sector.aiRating.toUpperCase()}
                </span>
                <Link
                  href={`/ai-copilot?q=Analyze%20${encodeURIComponent(sector.name)}%20Sector`}
                  className="fin-btn-primary text-xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Sentinel AI Assessment</span>
                </Link>
              </div>
            </div>

            <p className="text-sm text-[#B6BDC8] leading-relaxed">
              {sector.description}
            </p>

            {/* Performance Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-black/40 border border-white/5 font-mono-data text-xs">
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">1-Day Move</p>
                <p className={`text-base font-bold ${is1DPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"}`}>
                  {is1DPositive ? "+" : ""}{sector.change1D}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">1-Month Return</p>
                <p className="text-base font-bold text-white">+{sector.change1M}%</p>
              </div>
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">1-Year Return</p>
                <p className="text-base font-bold text-[#2ECC71]">+{sector.change1Y}%</p>
              </div>
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">Forward P/E</p>
                <p className="text-base font-bold text-white">{sector.peRatio}x</p>
              </div>
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">Dividend Yield</p>
                <p className="text-base font-bold text-white">{sector.dividendYield}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Outlook Synthesis */}
        <div className="p-5 rounded-2xl bg-[#0C111A] border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C76A16]/20 text-[#FF9A3C]">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Institutional AI Macro Outlook
            </h3>
          </div>
          <p className="text-xs text-[#B6BDC8] leading-relaxed">
            {sector.aiOutlook}
          </p>
        </div>

        {/* Macro Catalysts Under Surveillance */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF9A3C]" />
              <span>Core Macroeconomic Catalysts Under Active Surveillance</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(sector.macroCatalysts || []).map((cat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C76A16]/20 text-[#FF9A3C] text-[10px] font-mono-data font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-[#B6BDC8] leading-relaxed">{cat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Holdings Table */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Top Weighted Constituent Holdings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-data text-xs">
                <thead className="bg-black/50 border-b border-white/10 text-[10px] text-[#7D8594] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Company Name</th>
                    <th className="py-2.5 px-3">Index Weight</th>
                    <th className="py-2.5 px-3">Last Price</th>
                    <th className="py-2.5 px-3">Daily Move</th>
                    <th className="py-2.5 px-3 text-right">Intel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(sector.topHoldings || []).map((h) => (
                    <tr key={h.symbol} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{h.symbol}</td>
                      <td className="py-2.5 px-3 text-[#B6BDC8] font-sans">{h.name}</td>
                      <td className="py-2.5 px-3 text-white font-semibold">{h.weight}</td>
                      <td className="py-2.5 px-3 text-white">${h.price.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${h.change >= 0 ? "text-[#2ECC71]" : "text-[#FF5B5B]"}`}>
                          {h.change >= 0 ? "+" : ""}{h.change}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/earnings/${h.symbol}`}
                          className="text-[11px] text-[#FF9A3C] hover:underline"
                        >
                          Earnings Break
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
