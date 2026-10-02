import { Shield, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DisclaimerPage() {
  return (
    <div className="dashboard-canvas min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FF5B5B]/40 bg-[#FF5B5B]/15 px-3 py-1 text-xs font-mono-data text-[#FF5B5B]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>REGULATORY DISCLOSURES & COMPLIANCE</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Institutional Disclaimer & Educational Notice
          </h1>
          <p className="text-xs text-[#7D8594] font-mono-data">
            Last Updated: January 2025 · Saif Tech Global LLC
          </p>
        </div>

        <div className="glass-shield overflow-hidden">
          <div className="shield-accent-bar" />
          <div className="glass-shield-inner p-6 sm:p-8 space-y-6 text-xs text-[#B6BDC8] leading-relaxed font-sans">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono-data">
                1. Educational Content Only — Not Investment Advice
              </h2>
              <p>
                SG16 Finance (sg16finance.com) is operated by Saif Tech Global LLC. All text, datasets, charts, earnings syntheses, plain-English translations, stochastic probabilities, sentiment scores, and AI-generated outputs displayed on this platform are provided solely for educational, informational, and professional workflow optimization purposes.
              </p>
              <p>
                Nothing on this platform constitutes or should be construed as an offering, solicitation, or recommendation to purchase, sell, or hold any security, commodity, currency, exchange-traded fund (ETF), option, derivative, or cryptocurrency. Saif Tech Global LLC is not a registered investment adviser (RIA), broker-dealer, or commodity trading advisor (CTA) under the U.S. Securities and Exchange Commission (SEC), Financial Industry Regulatory Authority (FINRA), or equivalent foreign regulatory authorities.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono-data">
                2. Risk of Capital Loss
              </h2>
              <p>
                Trading equities, options, sovereign bonds, commodities, and digital assets involves substantial risk of loss and is not suitable for all investors. Market prices are inherently volatile and can fluctuate dramatically within seconds based on macroeconomic releases, monetary policy announcements, and geopolitical events. You may lose some or all of your invested capital.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono-data">
                3. Automated AI Sentinel Outputs
              </h2>
              <p>
                The SG16 Sentinel AI assistant generates analyses using mathematical models and large-scale language parsing of public SEC filings. While Saif Tech Global LLC strives for institutional accuracy, AI responses may occasionally contain omissions or delays. Users must verify all critical financial data independently prior to executing any capital allocation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono-data">
                4. Third-Party Exchange Feeds
              </h2>
              <p>
                Market data is collected and normalized from major global exchanges including NYSE, NASDAQ, LSE, TSE, CME, and COMEX. Saif Tech Global LLC does not guarantee the continuous availability, error-free delivery, or uninterrupted transmission of third-party price feeds.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
