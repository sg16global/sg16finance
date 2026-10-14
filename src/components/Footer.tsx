import Link from "next/link";
import { Shield, Globe, Lock, Terminal, Cpu, BadgeCheck } from "lucide-react";
import CertificateViewer from "./CertificateViewer";

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#050709] text-[#7D8594] text-xs">
      {/* Top Banner: Global Financial Hubs Presence */}
      <div className="border-b border-white/5 py-6 px-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C76A16]/15 border border-[#C76A16]/30 text-[#FF9A3C]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white font-semibold text-xs">Global Telemetry Hubs</p>
              <p className="text-[11px] text-[#7D8594]">
                New York · Singapore · London · Zurich · Tokyo · Dubai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono-data text-[11px]">
            <div className="flex items-center gap-1.5 text-[#2ECC71]">
              <span className="live-dot" />
              <span>SOC-2 TYPE II CERTIFIED</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Lock className="w-3 h-3 text-[#FF9A3C]" />
              <span>TLS 1.3 / AES-256 ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Cpu className="w-3 h-3 text-[#FF9A3C]" />
              <span>SG16 SENTINEL AI v4.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF9A3C] to-[#C76A16] text-[#07090C] font-black text-xs">
                SG16
              </div>
              <span className="font-bold text-sm text-white tracking-tight">SG16 Finance</span>
              <span className="rounded bg-[#C76A16]/20 px-1.5 py-0.5 text-[9px] font-mono-data font-bold text-[#FF9A3C] border border-[#C76A16]/30">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-[#B6BDC8] leading-relaxed max-w-sm mb-3">
              Institutional-grade market context, sector intelligence, and plain-English earnings breakdowns. Built and operated by{" "}
              <strong className="text-white font-semibold">Saif Tech Global LLC</strong>.
            </p>
            <p className="text-[11px] text-[#7D8594]">
              Official domain: <span className="text-[#FF9A3C] font-mono-data">sg16finance.com</span>
            </p>
          </div>

          {/* Col 1: Intelligence */}
          <div>
            <h4 className="text-[10px] font-mono-data uppercase tracking-wider text-[#FF9A3C] font-bold mb-3">
              Terminal Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Live Dashboard
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition-colors">
                  Global Markets
                </Link>
              </li>
              <li>
                <Link href="/sectors" className="hover:text-white transition-colors">
                  11 GICS Sectors
                </Link>
              </li>
              <li>
                <Link href="/earnings" className="hover:text-white transition-colors">
                  Earnings Breakdown
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-white transition-colors">
                  Portfolio Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: AI & Operations */}
          <div>
            <h4 className="text-[10px] font-mono-data uppercase tracking-wider text-[#FF9A3C] font-bold mb-3">
              AI & VIP Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/ai-copilot" className="hover:text-white transition-colors flex items-center gap-1 text-[#FF9A3C]">
                  <span>24/7 AI Sentinel</span>
                  <span className="live-dot" />
                </Link>
              </li>
              <li>
                <Link href="/premium" className="hover:text-white transition-colors">
                  Institutional Tiers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  VIP Client Helpdesk
                </Link>
              </li>
              <li>
                <Link href="/premium#api" className="hover:text-white transition-colors">
                  Sub-5ms WebSocket API
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Corporate */}
          <div>
            <h4 className="text-[10px] font-mono-data uppercase tracking-wider text-[#FF9A3C] font-bold mb-3">
              Compliance & Firm
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Saif Tech Global
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white transition-colors">
                  Regulatory Disclosures
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy (GDPR/CCPA)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Corporate Offices
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Corporate Registration & License */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-start">
            <div>
              <h4 className="text-[10px] font-mono-data uppercase tracking-wider text-[#FF9A3C] font-bold mb-3 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5" />
                Corporate Registration & License
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[11px]">
                <div>
                  <dt className="text-[#7D8594]">Company Name</dt>
                  <dd className="text-white font-semibold">SAIF TECH GLOBAL LLC</dd>
                </div>
                <div>
                  <dt className="text-[#7D8594]">Company Website</dt>
                  <dd>
                    <a
                      href="https://www.saiftechglobal.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF9A3C] font-mono-data hover:text-white transition-colors"
                    >
                      www.saiftechglobal.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[#7D8594]">Business ID / Registration Number</dt>
                  <dd className="text-white font-mono-data font-semibold">0008128993</dd>
                </div>
                <div>
                  <dt className="text-[#7D8594]">Jurisdiction</dt>
                  <dd className="text-white font-semibold">State of New Mexico, USA</dd>
                </div>
                <div>
                  <dt className="text-[#7D8594]">Effective Date</dt>
                  <dd className="text-white font-semibold">September 10, 2026</dd>
                </div>
              </dl>
            </div>
            <div className="print:hidden">
              <CertificateViewer />
              <p className="mt-2 max-w-[200px] text-[10px] font-mono-data text-[#7D8594]">
                Click to inspect the official Certificate of Organization.
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer Warning */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
          <p className="text-[11px] leading-relaxed text-[#7D8594]">
            <strong className="text-white/80">Institutional Regulatory Notice & Non-Fiduciary Disclaimer:</strong> SG16 Finance (sg16finance.com) is operated by Saif Tech Global LLC. All financial data, algorithmic sentiment indicators, earnings syntheses, plain-English translations, and macroeconomic models provided herein are strictly for institutional informational, educational, and workflow research purposes only. None of the content on this platform constitutes an offer to buy or sell securities, commodities, futures, digital assets, or financial derivatives, nor does it constitute personalized investment, legal, accounting, or tax advice. Past quantitative performance is no guarantee of future returns.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono-data text-[#7D8594]">
            <p>© {new Date().getFullYear()} Saif Tech Global LLC. SG16 Finance™. All rights reserved.</p>
            <p>BUILD: v4.8.1-STG-PROD · SERVER LATENCY: 1.4ms · TIMEZONE: UTC</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
