"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, PieChart, FileText, ArrowRight } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAiQuery?: (query: string) => void;
}

export default function SearchModal({ isOpen, onClose, onSelectAiQuery }: SearchModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const catalog = [
    { type: "Asset", title: "NVDA — NVIDIA Corporation", subtitle: "Tech & AI · $138.25 (+3.12%)", href: "/markets?symbol=NVDA", query: "Analyze NVDA" },
    { type: "Asset", title: "SPX — S&P 500 Index", subtitle: "Equities · 5,910.45 (+0.62%)", href: "/markets?symbol=SPX", query: "Analyze SPX" },
    { type: "Asset", title: "BTC — Bitcoin", subtitle: "Digital Assets · $94,820 (+2.85%)", href: "/markets?symbol=BTC", query: "Analyze BTC" },
    { type: "Asset", title: "GOLD — Spot Gold", subtitle: "Macro & Commodities · $2,685.40 (+0.48%)", href: "/markets?symbol=GOLD", query: "Analyze Gold" },
    { type: "Asset", title: "AAPL — Apple Inc.", subtitle: "Tech & AI · $232.80 (+1.05%)", href: "/markets?symbol=AAPL", query: "Analyze Apple" },
    { type: "Asset", title: "TSLA — Tesla Inc.", subtitle: "Tech & AI · $318.90 (+4.80%)", href: "/markets?symbol=TSLA", query: "Analyze Tesla" },
    { type: "Sector", title: "Information Technology", subtitle: "31.85% Weight · 1Y +38.20%", href: "/sectors/technology", query: "Analyze Technology Sector" },
    { type: "Sector", title: "Financials", subtitle: "13.40% Weight · 1Y +26.40%", href: "/sectors/financials", query: "Analyze Financials Sector" },
    { type: "Sector", title: "Energy", subtitle: "3.60% Weight · 1Y +4.80%", href: "/sectors/energy", query: "Analyze Energy Sector" },
    { type: "Earnings", title: "NVIDIA Q3 FY2025 Breakdown", subtitle: "Data Center $30.8B (+112%) · Plain English", href: "/earnings/NVDA", query: "Break down NVDA Q3 earnings" },
    { type: "Earnings", title: "Amazon Q3 2024 Breakdown", subtitle: "Operating Income $17.4B (+56%) · Plain English", href: "/earnings/AMZN", query: "Break down Amazon Q3 earnings" },
    { type: "Earnings", title: "Tesla Q3 2024 Breakdown", subtitle: "Auto Gross Margin 17.1% · Plain English", href: "/earnings/TSLA", query: "Break down Tesla Q3 earnings" },
  ];

  const filtered = catalog.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/12 bg-[#0A0E15] shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8 bg-[#0D121B]">
          <Search className="w-5 h-5 text-[#FF9A3C]" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbols (NVDA, SPX, BTC), sectors, earnings..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#7D8594] focus:outline-none font-sans"
          />
          <button onClick={onClose} className="p-1 text-[#7D8594] hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7D8594]">
              No results found for &ldquo;{searchTerm}&rdquo;. Try asking SG16 Sentinel AI directly.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
                onClick={() => {
                  onClose();
                  router.push(item.href);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/8 text-[#FF9A3C] group-hover:border-[#C76A16]/40 transition-colors">
                    {item.type === "Asset" && <TrendingUp className="w-4 h-4" />}
                    {item.type === "Sector" && <PieChart className="w-4 h-4" />}
                    {item.type === "Earnings" && <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white group-hover:text-[#FF9A3C] transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] font-mono-data text-[#7D8594]">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      onSelectAiQuery && onSelectAiQuery(item.query);
                    }}
                    className="px-2 py-1 rounded bg-[#C76A16]/20 text-[10px] font-mono-data text-[#FF9A3C] border border-[#C76A16]/30 hover:bg-[#C76A16]/35 transition-all"
                  >
                    AI Intel
                  </button>
                  <ArrowRight className="w-4 h-4 text-[#7D8594] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex items-center justify-between text-[10px] font-mono-data text-[#7D8594]">
          <span>USE ↑ ↓ TO NAVIGATE · ESC TO CLOSE</span>
          <span className="text-[#C76A16]">SG16 SPOTLIGHT INDEX</span>
        </div>
      </div>
    </div>
  );
}
