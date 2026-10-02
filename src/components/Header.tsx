"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Cpu,
  PieChart,
  FileText,
  Bookmark,
  Bot,
  Crown,
  Search,
  Menu,
  X,
  Shield,
  Activity,
  Headphones,
} from "lucide-react";

interface HeaderProps {
  onOpenAiModal?: (initialQuery?: string) => void;
  onOpenSearchModal?: () => void;
}

export default function Header({ onOpenAiModal, onOpenSearchModal }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [latency, setLatency] = useState("1.4");

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency((1.2 + Math.random() * 0.5).toFixed(1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "/", label: "Terminal", icon: Activity },
    { href: "/markets", label: "Markets", icon: TrendingUp },
    { href: "/sectors", label: "Sectors", icon: PieChart },
    { href: "/earnings", label: "Earnings", icon: FileText },
    { href: "/watchlist", label: "Watchlist", icon: Bookmark },
    { href: "/ai-copilot", label: "24/7 AI Sentinel", icon: Bot, highlight: true },
    { href: "/premium", label: "VIP Portal", icon: Crown },
    { href: "/contact", label: "VIP Services", icon: Headphones },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#07090C]/90 backdrop-blur-xl">
      {/* Top micro-bar: Institutional status */}
      <div className="hidden border-b border-white/5 px-4 py-1.5 text-[11px] font-mono-data text-[#7D8594] md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#2ECC71]">
            <span className="live-dot" />
            <span className="font-semibold text-white/90">SG16 GLOBAL FEED: ACTIVE</span>
          </span>
          <span className="text-white/20">|</span>
          <span>LATENCY: {latency}ms</span>
          <span className="text-white/20">|</span>
          <span className="text-[#C76A16]">OPERATOR: SAIF TECH GLOBAL LLC</span>
          <span className="text-white/20">|</span>
          <span>NYSE / NASDAQ / LSE / TSE / COMEX</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[#C76A16]">
            <Shield className="w-3 h-3 text-[#FF9A3C]" /> 24/7 AUTOMATED AI SENTINEL ACTIVE
          </span>
          <Link href="/about" className="hover:text-white transition-colors">
            Intelligence Framework
          </Link>
          <Link href="/disclaimer" className="hover:text-white transition-colors">
            Compliance
          </Link>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9A3C] via-[#C76A16] to-[#7A3E08] p-[1px] shadow-[0_0_20px_rgba(199,106,22,0.4)]">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#07090C]">
              <span className="font-black text-sm tracking-wider text-white group-hover:text-[#FF9A3C] transition-colors">
                SG<span className="text-[#FF9A3C]">16</span>
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-[#FF9A3C] transition-colors">
                SG16 Finance
              </span>
              <span className="rounded bg-[#C76A16]/20 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-[#FF9A3C] border border-[#C76A16]/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-[#7D8594] uppercase font-mono-data">
              Global Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "text-[#FF9A3C] bg-white/[0.06] shadow-[0_0_12px_rgba(199,106,22,0.15)]"
                    : link.highlight
                    ? "text-white bg-[#C76A16]/15 hover:bg-[#C76A16]/25 border border-[#C76A16]/30"
                    : "text-[#B6BDC8] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FF9A3C]" : link.highlight ? "text-[#FF9A3C]" : "text-[#7D8594]"}`} />
                <span>{link.label}</span>
                {link.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => onOpenSearchModal && onOpenSearchModal()}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-[#7D8594] hover:border-white/20 hover:text-white transition-all cursor-pointer"
            title="Search tickers, sectors, earnings (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#B6BDC8]" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block rounded bg-black/40 px-1 py-0.5 text-[9px] font-mono-data text-[#7D8594] border border-white/5">
              ⌘K
            </kbd>
          </button>

          {/* Quick 24/7 AI Launch button */}
          <button
            onClick={() => onOpenAiModal && onOpenAiModal()}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#D97B22] to-[#C76A16] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_16px_rgba(199,106,22,0.35)] hover:shadow-[0_0_24px_rgba(199,106,22,0.5)] transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden p-2 text-[#B6BDC8] hover:text-white rounded-lg hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#07090C]/95 px-4 py-4 lg:hidden backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium ${
                    isActive
                      ? "bg-[#C76A16]/20 text-[#FF9A3C] border border-[#C76A16]/40"
                      : "bg-white/[0.03] text-[#B6BDC8] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#C76A16]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAiModal && onOpenAiModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D97B22] to-[#C76A16] text-white text-xs font-semibold"
            >
              <Bot className="w-4 h-4" />
              <span>Launch 24/7 AI Sentinel Engine</span>
            </button>
            <div className="flex items-center justify-between text-[10px] text-[#7D8594] px-1 font-mono-data">
              <span>LATENCY: {latency}ms</span>
              <span className="text-[#2ECC71]">SYSTEM 100% OPERATIONAL</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
