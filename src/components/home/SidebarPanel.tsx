import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CALENDAR_EVENTS } from '../../data/dashboard';
import MiniChart from './MiniChart';

const CANDLE = [44, 46, 45, 48, 47, 50, 49, 52, 51, 53, 52, 55, 54, 56];
const SENTIMENT = [52, 55, 58, 60, 62, 64, 63, 65, 62, 64, 63, 62, 61, 62];

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-card p-3.5 transition duration-200 hover-lift md:p-4 ${className}`}>{children}</div>
  );
}

function MetricPill({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'orange' | 'muted' }) {
  const colors = {
    green: 'text-[#2ECC71] bg-[#2ECC71]/10',
    orange: 'text-[#C76A16] bg-[#C76A16]/10',
    muted: 'text-[#B6BDC8] bg-white/[0.04]',
  };
  return (
    <div className={`rounded-lg px-2.5 py-1.5 ${colors[accent ?? 'muted']}`}>
      <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="font-mono-data mt-0.5 text-xs font-medium">{value}</div>
    </div>
  );
}

export default function SidebarPanel() {
  return (
    <div className="flex flex-col gap-2.5">
      {/* AI Market Intelligence */}
      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C76A16]">AI market intelligence</p>
        <h3 className="mt-1 text-sm font-bold text-white">SG16 Insight Network</h3>
        <p className="mt-2 text-[11px] leading-relaxed text-[#7D8594]">
          <span className="font-medium text-[#B6BDC8]">Daily summary:</span> US tech leads global equities higher.
          European banks steady ahead of BoE. Asia mixed on China policy signals. Energy flat near Brent $82.
        </p>
      </Card>

      {/* Live Chart */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#7D8594]">Live chart</p>
            <p className="text-sm font-semibold text-white">NASDAQ · S&P 500</p>
          </div>
          <span className="font-mono-data text-xs text-[#2ECC71]">+0.36%</span>
        </div>
        <div className="mt-2 h-[72px]">
          <MiniChart data={CANDLE} variant="candle" height={72} />
        </div>
      </Card>

      {/* Global Market Sentiment */}
      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C76A16]">Global market sentiment</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <MetricPill label="Bias" value="Bullish 62%" accent="green" />
          <MetricPill label="Fear & Greed" value="58 Neutral" accent="orange" />
          <MetricPill label="AI confidence" value="74%" accent="orange" />
        </div>
        <div className="mt-2 h-10">
          <MiniChart data={SENTIMENT} height={40} />
        </div>
      </Card>

      {/* Banking & Payments */}
      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C76A16]">Banking & payments</p>
        <p className="mt-2 text-[11px] leading-relaxed text-[#7D8594]">
          Cross-border payment flows, institutional banking updates, and FinTech infrastructure — UK and Asia focus for
          global investors.
        </p>
        <Link to="/sectors/financials" className="mt-2 inline-block text-[11px] text-[#C76A16] hover:text-[#D97B22]">
          Financials overview →
        </Link>
      </Card>

      {/* Economic Calendar */}
      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C76A16]">Economic calendar</p>
        <ul className="mt-2 space-y-1.5">
          {CALENDAR_EVENTS.map((ev) => (
            <li key={ev.event} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-[#7D8594]">{ev.event}</span>
              <span className="shrink-0 font-mono-data text-[#B6BDC8]">{ev.date}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* AI Tools */}
      <Card className="!py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7D8594]">Our AI tools & resources</p>
        <p className="mt-1.5 text-[11px] text-[#7D8594]">
          Sector analysis · Earnings breakdowns · Risk context · Portfolio intelligence (coming soon)
        </p>
      </Card>
    </div>
  );
}
