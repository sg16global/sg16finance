"use client";

import { useState, useEffect } from "react";
import { Globe, Clock, Radio, Activity } from "lucide-react";

interface Hub {
  id: string;
  name: string;
  city: string;
  country: string;
  x: number; // SVG % 0-100
  y: number; // SVG % 0-100
  utcOffset: number;
  openUtc: number; // hours
  closeUtc: number; // hours
  benchmark: string;
  benchmarkPrice: string;
  benchmarkChange: string;
  isPositive: boolean;
}

export default function GlobalHubsMap() {
  const [selectedHub, setSelectedHub] = useState<string>("nyc");
  const [nowUtc, setNowUtc] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowUtc(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hubs: Hub[] = [
    {
      id: "nyc",
      name: "New York Stock Exchange",
      city: "New York",
      country: "USA",
      x: 28,
      y: 35,
      utcOffset: -5,
      openUtc: 14.5, // 9:30 AM EST = 14:30 UTC
      closeUtc: 21.0, // 4:00 PM EST = 21:00 UTC
      benchmark: "S&P 500 (SPX)",
      benchmarkPrice: "5,910.45",
      benchmarkChange: "+0.62%",
      isPositive: true,
    },
    {
      id: "lon",
      name: "London Stock Exchange",
      city: "London",
      country: "UK",
      x: 48,
      y: 28,
      utcOffset: 0,
      openUtc: 8.0,
      closeUtc: 16.5,
      benchmark: "FTSE 100",
      benchmarkPrice: "8,425.60",
      benchmarkChange: "+0.41%",
      isPositive: true,
    },
    {
      id: "fra",
      name: "Deutsche Börse",
      city: "Frankfurt",
      country: "Germany",
      x: 52,
      y: 30,
      utcOffset: 1,
      openUtc: 8.0,
      closeUtc: 16.5,
      benchmark: "DAX 40",
      benchmarkPrice: "19,450.30",
      benchmarkChange: "+0.55%",
      isPositive: true,
    },
    {
      id: "zrh",
      name: "SIX Swiss Exchange",
      city: "Zurich",
      country: "Switzerland",
      x: 51,
      y: 34,
      utcOffset: 1,
      openUtc: 8.0,
      closeUtc: 16.5,
      benchmark: "SMI Index",
      benchmarkPrice: "12,180.20",
      benchmarkChange: "+0.38%",
      isPositive: true,
    },
    {
      id: "dxb",
      name: "Dubai Financial Market",
      city: "Dubai",
      country: "UAE",
      x: 64,
      y: 43,
      utcOffset: 4,
      openUtc: 6.0,
      closeUtc: 11.0,
      benchmark: "DFM General",
      benchmarkPrice: "4,740.10",
      benchmarkChange: "+0.45%",
      isPositive: true,
    },
    {
      id: "sin",
      name: "Singapore Exchange",
      city: "Singapore",
      country: "Singapore",
      x: 76,
      y: 56,
      utcOffset: 8,
      openUtc: 1.0,
      closeUtc: 9.0,
      benchmark: "STI Index",
      benchmarkPrice: "3,780.40",
      benchmarkChange: "+0.82%",
      isPositive: true,
    },
    {
      id: "hkg",
      name: "Hong Kong Exchanges",
      city: "Hong Kong",
      country: "China",
      x: 80,
      y: 44,
      utcOffset: 8,
      openUtc: 1.5,
      closeUtc: 8.0,
      benchmark: "Hang Seng",
      benchmarkPrice: "20,620.10",
      benchmarkChange: "-0.25%",
      isPositive: false,
    },
    {
      id: "tyo",
      name: "Tokyo Stock Exchange",
      city: "Tokyo",
      country: "Japan",
      x: 88,
      y: 38,
      utcOffset: 9,
      openUtc: 0.0,
      closeUtc: 6.0,
      benchmark: "Nikkei 225",
      benchmarkPrice: "39,280.00",
      benchmarkChange: "+1.15%",
      isPositive: true,
    },
  ];

  // Helper to determine status
  const getSessionStatus = (hub: Hub) => {
    const currentUtcHours = nowUtc.getUTCHours() + nowUtc.getUTCMinutes() / 60;
    const isTrading = currentUtcHours >= hub.openUtc && currentUtcHours <= hub.closeUtc;
    const isPreMarket = currentUtcHours >= hub.openUtc - 2 && currentUtcHours < hub.openUtc;
    if (isTrading) return { label: "SESSION OPEN", color: "text-[#2ECC71]", bg: "bg-[#2ECC71]/15" };
    if (isPreMarket) return { label: "PRE-MARKET", color: "text-[#FF9A3C]", bg: "bg-[#FF9A3C]/15" };
    return { label: "CLOSED / AFTER-HRS", color: "text-[#7D8594]", bg: "bg-white/5" };
  };

  const getLocalTime = (utcOffset: number) => {
    const local = new Date(nowUtc.getTime() + utcOffset * 3600 * 1000);
    return local.toUTCString().slice(17, 22) + " Local";
  };

  const activeHub = hubs.find((h) => h.id === selectedHub) || hubs[0];
  const activeStatus = getSessionStatus(activeHub);

  return (
    <div className="glass-shield overflow-hidden">
      <div className="shield-accent-bar" />
      <div className="glass-shield-inner p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C76A16]/15 border border-[#C76A16]/30 text-[#FF9A3C]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Global Financial Hubs & Cross-Border Telemetry
                </h3>
                <span className="live-badge text-[9px]">
                  <span className="live-dot" /> 8 HUBS ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#7D8594]">
                Low-latency routing between major institutional liquidity centers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono-data text-xs text-[#7D8594] bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <Clock className="w-3.5 h-3.5 text-[#FF9A3C]" />
            <span>UTC TIME: {nowUtc.toISOString().slice(11, 19)}</span>
          </div>
        </div>

        {/* Map / Schematic Grid */}
        <div className="relative w-full aspect-[2.1/1] min-h-[260px] sm:min-h-[320px] rounded-xl bg-[#030508] border border-white/8 overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />

          {/* SVG Connection Lines between hubs */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* NYC to London */}
            <line x1="28%" y1="35%" x2="48%" y2="28%" stroke="rgba(199,106,22,0.4)" strokeWidth="1.5" className="connection-line" />
            {/* London to Zurich/Frankfurt */}
            <line x1="48%" y1="28%" x2="52%" y2="30%" stroke="rgba(199,106,22,0.4)" strokeWidth="1.5" className="connection-line" />
            <line x1="52%" y1="30%" x2="64%" y2="43%" stroke="rgba(199,106,22,0.3)" strokeWidth="1.5" className="connection-line" />
            {/* Dubai to Singapore */}
            <line x1="64%" y1="43%" x2="76%" y2="56%" stroke="rgba(199,106,22,0.4)" strokeWidth="1.5" className="connection-line" />
            {/* Singapore to Hong Kong & Tokyo */}
            <line x1="76%" y1="56%" x2="80%" y2="44%" stroke="rgba(199,106,22,0.4)" strokeWidth="1.5" className="connection-line" />
            <line x1="80%" y1="44%" x2="88%" y2="38%" stroke="rgba(199,106,22,0.4)" strokeWidth="1.5" className="connection-line" />
            {/* Tokyo to NYC Transpacific */}
            <path d="M 88% 38% Q 98% 30% 100% 32%" stroke="rgba(199,106,22,0.25)" strokeWidth="1" strokeDasharray="4 4" fill="none" />
            <path d="M 0% 32% Q 14% 34% 28% 35%" stroke="rgba(199,106,22,0.25)" strokeWidth="1" strokeDasharray="4 4" fill="none" />
          </svg>

          {/* Interactive Hub Node Markers */}
          {hubs.map((hub) => {
            const isSelected = hub.id === selectedHub;
            const status = getSessionStatus(hub);
            return (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub.id)}
                style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                  isSelected ? "scale-110 z-20" : "hover:scale-105 z-10"
                }`}
              >
                {/* Hub Indicator Dot */}
                <div className="relative flex items-center justify-center">
                  {isSelected && (
                    <span className="absolute w-8 h-8 rounded-full bg-[#FF9A3C]/30 animate-ping" />
                  )}
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isSelected
                        ? "bg-[#FF9A3C] border-white shadow-[0_0_15px_#FF9A3C]"
                        : "bg-[#C76A16] border-black/80 group-hover:bg-[#FF9A3C]"
                    }`}
                  />
                </div>

                {/* City Label Badge */}
                <span
                  className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono-data font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#C76A16] text-white shadow-md border border-[#FF9A3C]/50"
                      : "bg-black/80 text-[#B6BDC8] border border-white/10 group-hover:border-white/30"
                  }`}
                >
                  {hub.city}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Hub Detail Bar */}
        <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C76A16]/20 text-[#FF9A3C] border border-[#C76A16]/40 font-mono-data font-bold">
              {activeHub.id.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{activeHub.name}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 ${activeStatus.bg} ${activeStatus.color}`}>
                  {activeStatus.label}
                </span>
              </div>
              <p className="text-xs text-[#7D8594] font-mono-data">
                {activeHub.city}, {activeHub.country} · {getLocalTime(activeHub.utcOffset)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono-data text-xs">
            <div>
              <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">Benchmark Index</p>
              <p className="font-semibold text-white">{activeHub.benchmark}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">Price / Level</p>
              <p className="font-semibold text-white">{activeHub.benchmarkPrice}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#7D8594] uppercase tracking-wider">Session Move</p>
              <p className={`font-bold ${activeHub.isPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"}`}>
                {activeHub.benchmarkChange}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
