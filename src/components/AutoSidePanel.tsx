"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Crown,
  FileText,
  Headphones,
  Bot,
  PieChart,
  TrendingUp,
  X,
} from "lucide-react";

const AUTO_HIDE_MS = 4000;
const HOVER_LEAVE_MS = 500;

const links = [
  { href: "/", label: "Terminal", icon: Activity },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/sectors", label: "Sectors", icon: PieChart },
  { href: "/earnings", label: "Earnings", icon: FileText },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/ai-copilot", label: "24/7 AI Sentinel", icon: Bot },
  { href: "/premium", label: "VIP Portal", icon: Crown },
  { href: "/contact", label: "VIP Services", icon: Headphones },
];

export default function AutoSidePanel() {
  const router = useRouter();
  const pathname = usePathname();
  // Panel is open only for the page it was opened on, so navigating auto-hides it
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = useCallback((v: boolean) => setOpenPath(v ? pathname : null), [pathname]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const scheduleClose = useCallback(
    (ms: number) => {
      clearTimer();
      timer.current = setTimeout(() => setOpen(false), ms);
    },
    [clearTimer, setOpen]
  );

  const openPanel = useCallback(() => {
    setOpen(true);
    scheduleClose(AUTO_HIDE_MS);
  }, [scheduleClose, setOpen]);

  // Close with Escape, clean up on unmount
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimer();
    };
  }, [clearTimer, setOpen]);

  return (
    <>
      {/* Edge hotspot + handle: hover (desktop) or tap (mobile) opens the panel */}
      <div
        className="fixed left-0 top-1/2 z-50 -translate-y-1/2"
        onMouseEnter={openPanel}
      >
        <button
          onClick={openPanel}
          aria-label="Open navigation panel"
          className={`flex h-16 w-5 items-center justify-center rounded-r-lg border border-l-0 border-[#C76A16]/40 bg-[#C76A16]/20 text-[#FF9A3C] backdrop-blur-md transition-opacity cursor-pointer hover:bg-[#C76A16]/35 ${
            open ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Sliding panel */}
      <aside
        aria-hidden={!open}
        onMouseEnter={clearTimer}
        onMouseLeave={() => scheduleClose(HOVER_LEAVE_MS)}
        onTouchStart={() => scheduleClose(AUTO_HIDE_MS)}
        className={`fixed left-0 top-1/2 z-50 w-60 max-w-[80vw] -translate-y-1/2 rounded-r-2xl border border-l-0 border-white/10 bg-[#07090C]/95 p-3 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[10px] font-mono-data font-bold uppercase tracking-wider text-[#FF9A3C]">
            Quick Navigation
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation panel"
            className="rounded p-1 text-[#7D8594] hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Back / Forward */}
        <div className="mb-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] py-2 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#FF9A3C]" />
            Back
          </button>
          <button
            onClick={() => window.history.forward()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] py-2 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            Forward
            <ArrowRight className="h-3.5 w-3.5 text-[#FF9A3C]" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "border border-[#C76A16]/40 bg-[#C76A16]/20 text-[#FF9A3C]"
                    : "text-[#B6BDC8] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-[#C76A16]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
