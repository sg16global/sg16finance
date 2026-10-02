import { db } from "@/db";
import { sectors } from "@/db/schema";
import { ensureDataSeeded } from "@/db/ensure-data";
import Link from "next/link";
import {
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Cpu,
  Building2,
  Activity,
  ShoppingBag,
  Share2,
  Cog,
  ShieldAlert,
  Flame,
  Zap,
  Home,
  Boxes,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SectorsPage() {
  await ensureDataSeeded();
  const allSectors = await db.select().from(sectors);

  return (
    <div className="dashboard-canvas min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-badge text-[9px]">
                <span className="live-dot" /> 11 GICS SECTORS
              </span>
              <span className="text-[10px] font-mono-data text-[#7D8594]">
                S&P 500 CONSTITUENT REBALANCING
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sector Intelligence & Macro Allocation
            </h1>
            <p className="text-xs text-[#7D8594] mt-0.5">
              Comprehensive performance attribution, forward P/E ratios, and institutional ratings across all 11 sectors
            </p>
          </div>
        </div>

        {/* Sector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSectors.map((sector) => {
            const is1DPositive = Number(sector.change1D) >= 0;
            const is1MPositive = Number(sector.change1M) >= 0;
            const is1YPositive = Number(sector.change1Y) >= 0;

            return (
              <div
                key={sector.slug}
                className="glass-shield overflow-hidden flex flex-col justify-between"
              >
                <div className="shield-accent-bar" />
                <div className="glass-shield-inner p-5 space-y-4">
                  {/* Top line */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {sector.name}
                        </h3>
                      </div>
                      <p className="text-[11px] font-mono-data text-[#7D8594]">
                        GICS Weight: <span className="text-white font-semibold">{sector.marketWeightPercent}%</span>
                      </p>
                    </div>

                    <span
                      className={`text-xs font-mono-data font-bold px-2 py-0.5 rounded border border-white/10 ${
                        sector.aiRating === "Overweight"
                          ? "bg-[#2ECC71]/15 text-[#2ECC71]"
                          : sector.aiRating === "Equal Weight"
                          ? "bg-[#FF9A3C]/15 text-[#FF9A3C]"
                          : "bg-[#FF5B5B]/15 text-[#FF5B5B]"
                      }`}
                    >
                      {sector.aiRating}
                    </span>
                  </div>

                  <p className="text-xs text-[#B6BDC8] leading-relaxed line-clamp-2">
                    {sector.description}
                  </p>

                  {/* Performance Ribbon */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono-data text-xs text-center">
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">1 Day</p>
                      <p className={`font-bold ${is1DPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"}`}>
                        {is1DPositive ? "+" : ""}{sector.change1D}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">1 Month</p>
                      <p className={`font-bold ${is1MPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"}`}>
                        {is1MPositive ? "+" : ""}{sector.change1M}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7D8594] uppercase">1 Year</p>
                      <p className={`font-bold ${is1YPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"}`}>
                        {is1YPositive ? "+" : ""}{sector.change1Y}%
                      </p>
                    </div>
                  </div>

                  {/* Valuation & Top Component */}
                  <div className="flex items-center justify-between text-[11px] font-mono-data text-[#7D8594] pt-1">
                    <span>Forward P/E: <strong className="text-white">{sector.peRatio}x</strong></span>
                    <span>Div Yield: <strong className="text-white">{sector.dividendYield}%</strong></span>
                  </div>

                  {/* Top holdings preview */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono-data uppercase text-[#7D8594]">Key Constituents:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(sector.topHoldings || []).slice(0, 4).map((h) => (
                        <span
                          key={h.symbol}
                          className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 text-[10px] font-mono-data text-[#B6BDC8]"
                        >
                          <strong className="text-white">{h.symbol}</strong> ({h.weight})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/sectors/${sector.slug}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white border border-white/10 transition-colors"
                  >
                    <span>View Sector Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF9A3C]" />
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
