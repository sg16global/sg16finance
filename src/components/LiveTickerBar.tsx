"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Radio } from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

interface LiveTickerBarProps {
  onSelectTicker?: (symbol: string) => void;
}

export default function LiveTickerBar({ onSelectTicker }: LiveTickerBarProps) {
  const [track1, setTrack1] = useState<TickerItem[]>([
    { symbol: "SPX", name: "S&P 500", price: "5,910.45", change: "+36.40", changePercent: "+0.62%", isPositive: true },
    { symbol: "NDX", name: "Nasdaq 100", price: "20,845.20", change: "+182.10", changePercent: "+0.88%", isPositive: true },
    { symbol: "DJI", name: "Dow Jones", price: "43,870.15", change: "+154.30", changePercent: "+0.35%", isPositive: true },
    { symbol: "NVDA", name: "NVIDIA", price: "138.25", change: "+4.18", changePercent: "+3.12%", isPositive: true },
    { symbol: "AAPL", name: "Apple", price: "232.80", change: "+2.42", changePercent: "+1.05%", isPositive: true },
    { symbol: "MSFT", name: "Microsoft", price: "428.50", change: "+5.90", changePercent: "+1.40%", isPositive: true },
    { symbol: "GOOGL", name: "Alphabet", price: "178.60", change: "+2.12", changePercent: "+1.20%", isPositive: true },
    { symbol: "TSLA", name: "Tesla", price: "318.90", change: "+14.60", changePercent: "+4.80%", isPositive: true },
    { symbol: "N225", name: "Nikkei 225", price: "39,280.00", change: "+445.00", changePercent: "+1.15%", isPositive: true },
    { symbol: "DAX", name: "DAX 40", price: "19,450.30", change: "+106.20", changePercent: "+0.55%", isPositive: true },
    { symbol: "HSI", name: "Hang Seng", price: "20,620.10", change: "-51.80", changePercent: "-0.25%", isPositive: false },
  ]);

  const [track2, setTrack2] = useState<TickerItem[]>([
    { symbol: "BTC", name: "Bitcoin", price: "$94,820", change: "+$2,625", changePercent: "+2.85%", isPositive: true },
    { symbol: "ETH", name: "Ethereum", price: "$3,420.50", change: "+$102.80", changePercent: "+3.10%", isPositive: true },
    { symbol: "SOL", name: "Solana", price: "$218.40", change: "+$9.70", changePercent: "+4.65%", isPositive: true },
    { symbol: "GOLD", name: "Spot Gold", price: "$2,685.40", change: "+$12.80", changePercent: "+0.48%", isPositive: true },
    { symbol: "BRENT", name: "Brent Crude", price: "$74.20", change: "-$0.48", changePercent: "-0.65%", isPositive: false },
    { symbol: "COPPER", name: "Copper", price: "$4.22", change: "+$0.05", changePercent: "+1.15%", isPositive: true },
    { symbol: "NATGAS", name: "Nat Gas", price: "$2.88", change: "+$0.06", changePercent: "+2.10%", isPositive: true },
    { symbol: "EUR/USD", name: "Euro", price: "1.0520", change: "-0.0016", changePercent: "-0.15%", isPositive: false },
    { symbol: "USD/JPY", name: "Yen", price: "153.85", change: "+0.46", changePercent: "+0.30%", isPositive: true },
    { symbol: "US10Y", name: "10Y Yield", price: "4.382%", change: "-0.024", changePercent: "-0.54%", isPositive: false },
  ]);

  // Subtle real-time jitter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTrack1((prev) =>
        prev.map((item) => {
          if (Math.random() > 0.4) return item;
          const cleanPrice = parseFloat(item.price.replace(/[$,]/g, ""));
          const delta = (Math.random() * 0.1 - 0.05) * 0.01 * cleanPrice;
          const newPrice = Math.max(0.01, cleanPrice + delta);
          return {
            ...item,
            price: newPrice.toLocaleString("en-US", {
              minimumFractionDigits: newPrice > 500 ? 0 : 2,
              maximumFractionDigits: 2,
            }),
          };
        })
      );
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative border-b border-white/8 bg-[#090D13] overflow-hidden select-none">
      {/* Track 1: Equities & Indices */}
      <div className="flex border-b border-white/[0.04] py-1.5 overflow-hidden">
        <div className="ticker-scroll flex items-center">
          {[...track1, ...track1].map((item, idx) => (
            <button
              key={`${item.symbol}-${idx}`}
              onClick={() => onSelectTicker && onSelectTicker(item.symbol)}
              className="group mx-2 flex items-center gap-2 rounded-md px-2.5 py-0.5 text-xs font-mono-data hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <span className="font-semibold text-white group-hover:text-[#FF9A3C] transition-colors">
                {item.symbol}
              </span>
              <span className="text-[#7D8594] text-[11px] hidden sm:inline">{item.name}</span>
              <span className="text-white/90">{item.price}</span>
              <span
                className={`flex items-center text-[10px] font-bold ${
                  item.isPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"
                }`}
              >
                {item.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                )}
                {item.changePercent}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Track 2: Macro, Commodities, Crypto & Rates */}
      <div className="flex py-1.5 overflow-hidden bg-black/20">
        <div className="ticker-scroll-reverse flex items-center">
          {[...track2, ...track2].map((item, idx) => (
            <button
              key={`${item.symbol}-${idx}`}
              onClick={() => onSelectTicker && onSelectTicker(item.symbol)}
              className="group mx-2 flex items-center gap-2 rounded-md px-2.5 py-0.5 text-xs font-mono-data hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <span className="font-semibold text-[#FF9A3C] group-hover:text-white transition-colors">
                {item.symbol}
              </span>
              <span className="text-[#7D8594] text-[11px] hidden sm:inline">{item.name}</span>
              <span className="text-white/90">{item.price}</span>
              <span
                className={`flex items-center text-[10px] font-bold ${
                  item.isPositive ? "text-[#2ECC71]" : "text-[#FF5B5B]"
                }`}
              >
                {item.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                )}
                {item.changePercent}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
