"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Bot,
  RefreshCw,
  Radio,
  SlidersHorizontal,
  Shield,
  Activity,
  Check,
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
  aiSentiment: string | null;
  aiSummary: string | null;
  exchange: string | null;
}

export default function MarketsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"change" | "price" | "name">("change");
  const [sortAsc, setSortAsc] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [savedSymbols, setSavedSymbols] = useState<Record<string, boolean>>({});
  const [streaming, setStreaming] = useState(false);

  const fetchMarkets = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = (await res.json()) as { success?: boolean; assets: Asset[]; streaming?: boolean };
      if (data.success) {
        setAssets(data.assets);
        setStreaming(Boolean(data.streaming));
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client fetch on mount + poll
    void fetchMarkets();
    const interval = setInterval(() => {
      if (autoRefresh) {
        void fetchMarkets();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleAddToWatchlist = async (symbol: string) => {
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      setSavedSymbols((prev) => ({ ...prev, [symbol]: true }));
      setTimeout(() => {
        setSavedSymbols((prev) => ({ ...prev, [symbol]: false }));
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { id: "all", label: "All Assets" },
    { id: "equities", label: "Global Equities" },
    { id: "tech-ai", label: "Tech & AI Leaders" },
    { id: "macro-commodities", label: "Macro & Commodities" },
    { id: "crypto", label: "Digital Assets" },
    { id: "forex", label: "Forex & Currencies" },
    { id: "bonds", label: "Sovereign Yields" },
  ];

  const filteredAssets = assets
    .filter((asset) => {
      const matchesCategory = filterCategory === "all" || asset.category === filterCategory;
      const matchesSearch =
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "change") {
        comparison = Number(b.changePercent) - Number(a.changePercent);
      } else if (sortBy === "price") {
        comparison = Number(b.price) - Number(a.price);
      } else if (sortBy === "name") {
        comparison = a.symbol.localeCompare(b.symbol);
      }
      return sortAsc ? -comparison : comparison;
    });

  return (
    <div className="dashboard-canvas min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-badge text-[9px]">
                <span className="live-dot" /> {streaming ? "LATEST PRICES" : "DELAYED 15 MIN"}
              </span>
              <span className="text-[10px] font-mono-data text-[#7D8594]">
                LAST REFRESH: {lastRefreshed || "SYNCING"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Global Markets Terminal
            </h1>
            <p className="text-xs text-[#7D8594] mt-0.5">
              Real cross-asset quotes with source labels. Free access is delayed 15 minutes; an active pass shows the latest prices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`fin-btn-ghost text-xs ${autoRefresh ? "border-[#2ECC71]/40 text-[#2ECC71]" : ""}`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{autoRefresh ? "Auto-refresh 30s" : "Refresh Paused"}</span>
            </button>
            <button onClick={fetchMarkets} className="fin-btn-ghost text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Macro Gauge Banner */}
        {(() => {
          const bySymbol = (s: string) => assets.find((a) => a.symbol === s);
          const y10 = bySymbol("US10Y");
          const y2 = bySymbol("US02Y");
          const spreadBps = y10 && y2 ? (Number(y10.price) - Number(y2.price)) * 100 : null;
          const up = assets.filter((a) => Number(a.changePercent) > 0).length;
          const down = assets.filter((a) => Number(a.changePercent) < 0).length;
          const avg = assets.length ? assets.reduce((s, a) => s + (Number(a.changePercent) || 0), 0) / assets.length : 0;
          const btc = bySymbol("BTC");
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-black/40 border border-white/8 font-mono-data text-xs">
              <div className="border-r border-white/5 pr-3">
                <p className="text-[10px] text-[#7D8594] uppercase">Advancers / Decliners</p>
                <p className="text-base font-bold text-white mt-0.5">
                  <span className="text-[#2ECC71]">{up}</span> / <span className="text-[#FF6B6B]">{down}</span>
                </p>
                <p className="text-[10px] text-[#7D8594]">Across {assets.length} tracked assets</p>
              </div>
              <div className="border-r border-white/5 pr-3">
                <p className="text-[10px] text-[#7D8594] uppercase">US 10-Yr Treasury</p>
                <p className="text-base font-bold text-white mt-0.5">
                  {y10 ? `${Number(y10.price).toFixed(2)}% (${Number(y10.change) >= 0 ? "+" : ""}${Number(y10.change).toFixed(2)})` : "—"}
                </p>
                <p className="text-[10px] text-[#7D8594]">US Treasury, daily</p>
              </div>
              <div className="border-r border-white/5 pr-3">
                <p className="text-[10px] text-[#7D8594] uppercase">US 10Y - 2Y Curve Spread</p>
                <p className={`text-base font-bold mt-0.5 ${spreadBps !== null && spreadBps < 0 ? "text-[#FF6B6B]" : "text-[#2ECC71]"}`}>
                  {spreadBps !== null ? `${spreadBps >= 0 ? "+" : ""}${spreadBps.toFixed(1)} bps` : "—"}
                </p>
                <p className="text-[10px] text-[#7D8594]">
                  {spreadBps === null ? "Awaiting data" : spreadBps < 0 ? "Inverted curve" : "Normal curve"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#7D8594] uppercase">Avg 1D Move</p>
                <p className={`text-base font-bold mt-0.5 ${avg >= 0 ? "text-[#2ECC71]" : "text-[#FF6B6B]"}`}>
                  {avg >= 0 ? "+" : ""}
                  {avg.toFixed(2)}%
                </p>
                <p className="text-[10px] text-[#7D8594]">{btc ? `BTC ${Number(btc.changePercent) >= 0 ? "+" : ""}${btc.changePercent}% (24h)` : "Equal-weighted"}</p>
              </div>
            </div>
          );
        })()}
        <p className="text-[10px] text-[#7D8594] -mt-3">
          Sources: Finnhub (stocks and ETF proxies for indices and commodities), CoinGecko (crypto), ECB reference rates (FX, daily),
          US Treasury (yields, daily). Indices and commodities are shown through ETF proxies, so their levels are ETF prices, not index points.
        </p>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#090D14] border border-white/8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === cat.id
                    ? "bg-[#C76A16] text-white shadow-md border border-[#FF9A3C]/40"
                    : "text-[#B6BDC8] hover:bg-white/5 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box & sort */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#7D8594]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search symbol or name..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/50 border border-white/10 text-xs text-[#B6BDC8] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C76A16] font-mono-data"
            >
              <option value="change">Sort: 24h Move</option>
              <option value="price">Sort: Price</option>
              <option value="name">Sort: Ticker</option>
            </select>
          </div>
        </div>

        {/* Assets Terminal Table */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-data text-xs">
              <thead className="bg-black/60 border-b border-white/10 text-[10px] text-[#7D8594] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Symbol / Name</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">24h Change</th>
                  <th className="py-3 px-3 hidden md:table-cell">24h High / Low</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Volume</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Market Cap</th>
                  <th className="py-3 px-3 hidden xl:table-cell">Forward P/E</th>
                  <th className="py-3 px-3">AI Sentiment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#7D8594]">
                      Loading real-time institutional feeds...
                    </td>
                  </tr>
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#7D8594]">
                      No assets found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const isPositive = Number(asset.changePercent) >= 0;
                    return (
                      <tr
                        key={asset.symbol}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="py-3 px-4 font-sans">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-white font-mono-data font-bold text-xs group-hover:border-[#C76A16]/50">
                              {asset.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white font-mono-data">
                                  {asset.symbol}
                                </span>
                                <span className="text-[10px] text-[#7D8594] font-mono-data">
                                  {asset.exchange || "Global"}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#7D8594] line-clamp-1">
                                {asset.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-bold text-white">
                          ${Number(asset.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-0.5 font-bold ${
                              isPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            )}
                            {isPositive ? "+" : ""}
                            {asset.changePercent}%
                          </span>
                        </td>

                        <td className="py-3 px-3 hidden md:table-cell text-[#7D8594]">
                          <span className="text-white">${asset.high24h || "-"}</span> /{" "}
                          <span>${asset.low24h || "-"}</span>
                        </td>

                        <td className="py-3 px-3 hidden lg:table-cell text-white">
                          {asset.volume || "—"}
                        </td>

                        <td className="py-3 px-3 hidden sm:table-cell text-white">
                          {asset.marketCap || "—"}
                        </td>

                        <td className="py-3 px-3 hidden xl:table-cell text-white">
                          {asset.peRatio ? `${asset.peRatio}x` : "—"}
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#FF9A3C] bg-[#C76A16]/10 border border-[#C76A16]/30">
                            <span className="live-dot" />
                            {asset.aiSentiment || "Neutral"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleAddToWatchlist(asset.symbol)}
                              className="p-1.5 rounded-lg bg-white/[0.04] text-[#7D8594] hover:text-white hover:bg-white/10 transition-colors"
                              title="Add to Watchlist"
                            >
                              {savedSymbols[asset.symbol] ? (
                                <Check className="w-3.5 h-3.5 text-[#2ECC71]" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
