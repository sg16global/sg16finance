"use client";

import { useState } from "react";
import {
  TrendingUp,
  Cpu,
  Flame,
  Coins,
  Globe2,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Bookmark,
  Check,
  Maximize2,
  BarChart3,
} from "lucide-react";

interface Asset {
  id: number;
  symbol: string;
  name: string;
  category: string;
  price: string;
  change: string;
  changePercent: string;
  high24h: string | null;
  low24h: string | null;
  volume: string | null;
  marketCap: string | null;
  peRatio: string | null;
  dividendYield: string | null;
  sparkline: number[] | null;
  aiSentiment: string | null;
  aiSummary: string | null;
  exchange: string | null;
}

interface AssetWorkspaceProps {
  assets: Asset[];
  onTriggerAiModal?: (query: string) => void;
  onAddToWatchlist?: (symbol: string) => void;
}

export default function AssetWorkspace({
  assets,
  onTriggerAiModal,
  onAddToWatchlist,
}: AssetWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<string>("equities");
  const [activeSymbol, setActiveSymbol] = useState<string>("SPX");
  const [timeframe, setTimeframe] = useState<string>("1M");
  const [addedSymbols, setAddedSymbols] = useState<Record<string, boolean>>({});

  const categories = [
    { id: "equities", name: "Global Equities", subtitle: "Major sovereign benchmarks", icon: TrendingUp },
    { id: "tech-ai", name: "Tech & AI Leaders", subtitle: "Accelerated computing & cloud", icon: Cpu },
    { id: "macro-commodities", name: "Macro & Commodities", subtitle: "Gold, crude oil, gas, metals", icon: Flame },
    { id: "crypto", name: "Crypto & Digital", subtitle: "Spot BTC, ETH, Solana", icon: Coins },
    { id: "forex", name: "Forex & Currencies", subtitle: "EUR, JPY, GBP interbank", icon: Globe2 },
    { id: "bonds", name: "Yields & Sovereign Debt", subtitle: "US 10Y, 2Y benchmark curves", icon: Landmark },
  ];

  // Assets in currently active category
  const categoryAssets = assets.filter((a) => a.category === activeCategory);
  // Current active asset (fallback if not in category)
  const currentAsset =
    categoryAssets.find((a) => a.symbol === activeSymbol) ||
    categoryAssets[0] ||
    assets[0];

  const isPositive = Number(currentAsset?.changePercent || 0) >= 0;

  // Chart generation based on sparkline data
  const baseSpark = currentAsset?.sparkline && currentAsset.sparkline.length > 0
    ? currentAsset.sparkline
    : [100, 102, 101, 104, 103, 106, 108];

  const minVal = Math.min(...baseSpark);
  const maxVal = Math.max(...baseSpark);
  const range = maxVal - minVal || 1;

  // SVG points for chart line
  const points = baseSpark
    .map((val, index) => {
      const x = (index / (baseSpark.length - 1)) * 100;
      const y = 90 - ((val - minVal) / range) * 75;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `0,95 ${points} 100,95`;

  const handleWatchlistClick = async (symbol: string) => {
    if (onAddToWatchlist) {
      onAddToWatchlist(symbol);
    } else {
      try {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    setAddedSymbols((prev) => ({ ...prev, [symbol]: true }));
    setTimeout(() => {
      setAddedSymbols((prev) => ({ ...prev, [symbol]: false }));
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const firstInCat = assets.find((a) => a.category === cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (firstInCat) setActiveSymbol(firstInCat.symbol);
              }}
              className={`asset-category-card text-left ${isActive ? "asset-category-card--active" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isActive ? "bg-[#C76A16] text-white" : "bg-white/[0.05] text-[#7D8594]"
                  } transition-colors`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {firstInCat && (
                  <span
                    className={`text-[10px] font-mono-data font-bold ${
                      Number(firstInCat.changePercent) >= 0 ? "text-[#2ECC71]" : "text-[#FF5B5B]"
                    }`}
                  >
                    {Number(firstInCat.changePercent) >= 0 ? "+" : ""}
                    {firstInCat.changePercent}%
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
                {cat.name}
              </h4>
              <p className="text-[10px] text-[#7D8594] line-clamp-1 mt-0.5">
                {cat.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Chart & Order Data Panel */}
      {currentAsset && (
        <div className="glass-shield overflow-hidden category-workspace">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-4 sm:p-6">
            {/* Header / Active Asset Selector */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/8">
              <div className="flex flex-wrap items-center gap-3">
                {/* Asset Pills in Category */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/8 overflow-x-auto max-w-full">
                  {categoryAssets.map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => setActiveSymbol(asset.symbol)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono-data font-semibold transition-all cursor-pointer ${
                        asset.symbol === currentAsset.symbol
                          ? "bg-[#C76A16] text-white shadow-md border border-[#FF9A3C]/40"
                          : "text-[#B6BDC8] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {asset.symbol}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:block text-xs text-[#7D8594]">
                  {currentAsset.name} · {currentAsset.exchange || "Global Aggregated"}
                </div>
              </div>

              {/* Timeframe Selector & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg bg-black/40 border border-white/8 p-0.5 text-xs font-mono-data">
                  {["1D", "1W", "1M", "1Y", "5Y"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        timeframe === tf
                          ? "bg-white/10 text-[#FF9A3C] font-bold"
                          : "text-[#7D8594] hover:text-white"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleWatchlistClick(currentAsset.symbol)}
                  className="fin-btn-ghost text-xs"
                  title="Add to Watchlist"
                >
                  {addedSymbols[currentAsset.symbol] ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2ECC71]" />
                      <span className="text-[#2ECC71]">Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Watchlist</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    onTriggerAiModal &&
                    onTriggerAiModal(`Analyze ${currentAsset.symbol} - ${currentAsset.name}`)
                  }
                  className="fin-btn-primary text-xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Intel</span>
                </button>
              </div>
            </div>

            {/* Price Banner & Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 py-4 border-b border-white/5 font-mono-data">
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">Spot Price</p>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  ${Number(currentAsset.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center text-xs font-bold ${isPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"}`}>
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{isPositive ? "+" : ""}{currentAsset.change} ({isPositive ? "+" : ""}{currentAsset.changePercent}%)</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">24h High / Low</p>
                <p className="text-xs font-semibold text-white mt-1">
                  ${currentAsset.high24h || (Number(currentAsset.price) * 1.02).toFixed(2)}
                </p>
                <p className="text-xs text-[#7D8594]">
                  ${currentAsset.low24h || (Number(currentAsset.price) * 0.98).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">Volume (24h)</p>
                <p className="text-xs font-semibold text-white mt-1">{currentAsset.volume || "$12.4B"}</p>
                <p className="text-[10px] text-[#7D8594]">Institutional Blocks</p>
              </div>

              <div>
                <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">Market Cap</p>
                <p className="text-xs font-semibold text-white mt-1">{currentAsset.marketCap || "Sovereign Tier"}</p>
                <p className="text-[10px] text-[#7D8594]">Fully Diluted</p>
              </div>

              <div>
                <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">Forward P/E</p>
                <p className="text-xs font-semibold text-white mt-1">{currentAsset.peRatio ? `${currentAsset.peRatio}x` : "N/A"}</p>
                <p className="text-[10px] text-[#7D8594]">GAAP Normalized</p>
              </div>

              <div>
                <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">AI Sentiment</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="live-dot" />
                  <span className="text-xs font-bold text-[#FF9A3C]">{currentAsset.aiSentiment || "Bullish"}</span>
                </div>
                <p className="text-[10px] text-[#2ECC71]">Conviction: 98.4%</p>
              </div>
            </div>

            {/* Interactive SVG Chart Visualizer */}
            <div className="relative pt-4 pb-2">
              <div className="w-full h-44 sm:h-56 relative">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id={`grad-${currentAsset.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isPositive ? "#2ECC71" : "#FF5B5B"} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={isPositive ? "#2ECC71" : "#FF5B5B"} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" strokeWidth="0.5" />

                  {/* Area fill */}
                  <polygon points={fillPoints} fill={`url(#grad-${currentAsset.symbol})`} />

                  {/* Chart line */}
                  <polyline
                    fill="none"
                    stroke={isPositive ? "#2ECC71" : "#FF5B5B"}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                </svg>
              </div>

              {/* AI Real-time Plain-English Takeaway */}
              <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-white/8 flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C76A16]/20 text-[#FF9A3C] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#B6BDC8] leading-relaxed">
                  <span className="font-bold text-white font-mono-data mr-1">SG16 SENTINEL VERDICT:</span>
                  {currentAsset.aiSummary ||
                    "Asset is trading with steady institutional order accumulation. Risk-adjusted metrics indicate positive asymmetry for multi-week hold horizons."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
