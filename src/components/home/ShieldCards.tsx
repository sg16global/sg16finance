import { Link } from 'react-router-dom';
import { CALENDAR_EVENTS } from '../../data/dashboard';
import MiniChart from './MiniChart';
import { DataTimestamp, LiveBadge, SectionLabel, ShieldCard } from './ui';

const CANDLE = [44, 46, 45, 48, 47, 50, 49, 52, 51, 53, 52, 55, 54, 56];
const SENTIMENT = [52, 55, 58, 60, 62, 64, 63, 65, 62, 64, 63, 62, 61, 62];

function MetricPill({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'orange' | 'muted' }) {
  const colors = {
    green: 'text-[#2ECC71] bg-[#2ECC71]/10 border-[#2ECC71]/15',
    orange: 'text-[#C76A16] bg-[#C76A16]/10 border-[#C76A16]/15',
    muted: 'text-[#B6BDC8] bg-white/[0.03] border-white/[0.06]',
  };
  return (
    <div className={`rounded-lg border px-2.5 py-1.5 ${colors[accent ?? 'muted']}`}>
      <div className="text-[9px] uppercase tracking-[0.12em] opacity-75">{label}</div>
      <div className="font-mono-data mt-0.5 text-xs font-medium tabular-nums">{value}</div>
    </div>
  );
}

type Props = { side: 'left' | 'right'; className?: string };

export default function ShieldCards({ side, className = '' }: Props) {
  if (side === 'left') {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <ShieldCard>
          <SectionLabel>AI market intelligence</SectionLabel>
          <h3 className="mt-2 text-sm font-bold tracking-tight text-white">SG16 Insight Network</h3>
          <p className="mt-2 text-[11px] leading-relaxed text-[#7D8594]">
            <span className="font-medium text-[#B6BDC8]">Daily summary · </span>
            US tech leads global equities. European banks steady ahead of BoE. Asia mixed on China signals.
          </p>
        </ShieldCard>

        <ShieldCard>
          <SectionLabel>Global market sentiment</SectionLabel>
          <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <MetricPill label="Bias" value="Bullish 62%" accent="green" />
            <MetricPill label="Fear & Greed" value="58 Neutral" accent="orange" />
            <MetricPill label="AI confidence" value="74%" accent="orange" />
          </div>
          <div className="mt-2.5 h-10 rounded-lg bg-black/25 p-1">
            <MiniChart data={SENTIMENT} height={32} />
          </div>
        </ShieldCard>

        <ShieldCard className="hidden lg:block">
          <SectionLabel>Our AI tools</SectionLabel>
          <ul className="mt-2 space-y-1 text-[11px] text-[#7D8594]">
            <li className="fin-list-item">Sector analysis</li>
            <li className="fin-list-item">Earnings breakdowns</li>
            <li className="fin-list-item">Risk context</li>
          </ul>
        </ShieldCard>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <ShieldCard>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <SectionLabel>Live chart</SectionLabel>
              <LiveBadge />
            </div>
            <p className="mt-2 text-sm font-semibold tracking-tight text-white">NASDAQ · S&P 500</p>
          </div>
          <span className="font-mono-data text-sm font-medium tabular-nums text-[#2ECC71]">+0.36%</span>
        </div>
        <div className="mt-2.5 h-[72px] rounded-lg bg-black/30 p-1">
          <MiniChart data={CANDLE} variant="candle" height={64} />
        </div>
        <div className="mt-2 flex justify-end">
          <DataTimestamp />
        </div>
      </ShieldCard>

      <ShieldCard>
        <SectionLabel>Banking & payments</SectionLabel>
        <p className="mt-2 text-[11px] leading-relaxed text-[#7D8594]">
          Cross-border payment flows and institutional banking — UK and Asia focus for global investors.
        </p>
        <Link to="/sectors/financials" className="fin-link mt-2.5 inline-block text-[11px]">
          Financials overview →
        </Link>
      </ShieldCard>

      <ShieldCard>
        <SectionLabel>Economic calendar</SectionLabel>
        <ul className="mt-2.5 divide-y divide-white/[0.05]">
          {CALENDAR_EVENTS.slice(0, 4).map((ev) => (
            <li key={ev.event} className="flex items-center justify-between gap-2 py-1.5 text-[11px] first:pt-0">
              <span className="text-[#B6BDC8]">{ev.event}</span>
              <span className="shrink-0 font-mono-data tabular-nums text-[#7D8594]">{ev.date}</span>
            </li>
          ))}
        </ul>
      </ShieldCard>
    </div>
  );
}
