import { Shield, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <div className="dashboard-canvas min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2ECC71]/40 bg-[#2ECC71]/15 px-3 py-1 text-xs font-mono-data text-[#2ECC71]">
            <Lock className="w-3.5 h-3.5" />
            <span>DATA CONFIDENTIALITY & PRIVACY CHARTER</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Privacy Policy & Telemetry Protection
          </h1>
          <p className="text-xs text-[#7D8594] font-mono-data">
            GDPR / CCPA Compliant · Saif Tech Global LLC
          </p>
        </div>

        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 sm:p-8 space-y-6 text-xs text-[#B6BDC8] leading-relaxed font-sans">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono-data">
                1. Zero-Brokerage Telemetry Sharing
              </h2>
              <p>
                Saif Tech Global LLC maintains a strict zero-telemetry commercialization policy. We never sell, monetize, or transmit your watchlist symbols, portfolio inquiries, or Sentinel AI chat prompts to third-party high-frequency trading firms, market makers, or advertising networks.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono-data">
                2. Information We Collect
              </h2>
              <p>
                When you use SG16 Finance, we collect only necessary operational technical metadata such as connection IP address (for sub-second latency routing to nearest edge CDN node), session tokens, and explicitly submitted support tickets or watchlist items stored securely in our PostgreSQL database.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono-data">
                3. Encryption & SOC-2 Alignment
              </h2>
              <p>
                All data in transit is encrypted using modern TLS 1.3 protocol with forward secrecy. PostgreSQL persistent databases are encrypted at rest with industry-standard AES-256 cipher blocks.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono-data">
                4. Data Subject Rights (GDPR & CCPA)
              </h2>
              <p>
                Institutional clients and European/California residents retain full legal rights to request access, rectification, or complete permanent deletion of their account records at any time by contacting{" "}
                <strong className="text-white">privacy@saiftechglobal.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
