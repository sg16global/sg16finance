"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  Plus,
  Trash2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Target,
  FileSpreadsheet,
  AlertCircle,
  Check,
} from "lucide-react";
import Link from "next/link";

interface WatchlistItem {
  id: number;
  userId: string;
  symbol: string;
  name: string;
  priceAtAdd: string;
  currentPrice: string;
  changePercent: string;
  gainSinceAdd: string;
  targetPrice: string | null;
  notes: string | null;
  aiSentiment: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      if (data.success) {
        setItems(data.watchlist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client fetch on mount
    void fetchWatchlist();
  }, []);

  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: newSymbol.trim().toUpperCase(),
          targetPrice: newTarget ? parseFloat(newTarget) : null,
          notes: newNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
        setNewSymbol("");
        setNewTarget("");
        setNewNotes("");
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-canvas min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-badge text-[9px]">
                <span className="live-dot" /> POSTGRESQL PERSISTENT
              </span>
              <span className="text-[10px] font-mono-data text-[#7D8594]">
                USER SURVEILLANCE DESK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Watchlist & Target Tracking
            </h1>
            <p className="text-xs text-[#7D8594] mt-0.5">
              Live quotes, return since initial observation, target price triggers, and quantitative thesis notes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="fin-btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Track New Asset</span>
            </button>
          </div>
        </div>

        {/* Watchlist Table */}
        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-data text-xs">
              <thead className="bg-black/60 border-b border-white/10 text-[10px] text-[#7D8594] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Symbol / Name</th>
                  <th className="py-3 px-3">Current Spot</th>
                  <th className="py-3 px-3">24h Move</th>
                  <th className="py-3 px-3">Entry Benchmark</th>
                  <th className="py-3 px-3">Gain Since Added</th>
                  <th className="py-3 px-3">Target Price</th>
                  <th className="py-3 px-3">AI Sentiment</th>
                  <th className="py-3 px-4 hidden md:table-cell">Thesis Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#7D8594]">
                      Loading your tracked institutional assets...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#7D8594]">
                      No assets in watchlist yet. Click &ldquo;Track New Asset&rdquo; to add your first symbol.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isPositive24h = Number(item.changePercent) >= 0;
                    const isGainSinceAdd = Number(item.gainSinceAdd) >= 0;
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="py-3 px-4 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono-data text-sm">
                              {item.symbol}
                            </span>
                            <span className="text-xs text-[#7D8594] hidden sm:inline">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-bold text-white">
                          ${Number(item.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-0.5 font-bold ${
                              isPositive24h ? "text-[#2ECC71]" : "text-[#FF5B5B]"
                            }`}
                          >
                            {isPositive24h ? "+" : ""}
                            {item.changePercent}%
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[#7D8594]">
                          ${Number(item.priceAtAdd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-0.5 font-bold ${
                              isGainSinceAdd ? "text-[#2ECC71]" : "text-[#FF5B5B]"
                            }`}
                          >
                            {isGainSinceAdd ? "+" : ""}
                            {item.gainSinceAdd}%
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[#FF9A3C] font-semibold">
                          {item.targetPrice ? `$${Number(item.targetPrice).toLocaleString()}` : "—"}
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#FF9A3C] bg-[#C76A16]/10 border border-[#C76A16]/30">
                            {item.aiSentiment}
                          </span>
                        </td>

                        <td className="py-3 px-4 hidden md:table-cell text-[11px] text-[#7D8594] max-w-xs truncate font-sans">
                          {item.notes || "—"}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/ai-copilot?q=Analyze%20${item.symbol}`}
                              className="p-1.5 rounded-lg bg-white/[0.04] text-[#7D8594] hover:text-[#FF9A3C] hover:bg-white/10 transition-colors"
                              title="Ask Sentinel AI"
                            >
                              <Bot className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-1.5 rounded-lg bg-white/[0.04] text-[#7D8594] hover:text-[#FF5B5B] hover:bg-white/10 transition-colors cursor-pointer"
                              title="Remove from Watchlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#0A0E15] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/8">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#FF9A3C]" />
                  <span>Add Symbol to Watchlist</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-[#7D8594] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddSymbol} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block text-[11px] font-mono-data text-[#7D8594] uppercase mb-1">
                    Ticker Symbol (e.g. NVDA, SPX, BTC, GOLD, AAPL)
                  </label>
                  <input
                    type="text"
                    required
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    placeholder="Enter ticker..."
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16] font-mono-data uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-data text-[#7D8594] uppercase mb-1">
                    Target Price ($) [Optional]
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="e.g. 165.00"
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16] font-mono-data"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-data text-[#7D8594] uppercase mb-1">
                    Thesis Notes [Optional]
                  </label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Monitoring Blackwell production margin inflection..."
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3.5 py-2.5 text-white placeholder-[#7D8594] focus:outline-none focus:border-[#C76A16]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white font-semibold text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? "Saving to Database..." : "Add to Live Watchlist"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
