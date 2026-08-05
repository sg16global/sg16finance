import { Link } from 'react-router-dom';
import { useDashboardData } from '../../context/DashboardContext';
import { formatPct, timeAgo } from '../../lib/format';
import { DataCell, LiveBadge, SectionLabel, ShieldCard } from './ui';

export default function InsightsPanel() {
  const { data, loading } = useDashboardData();
  const { insights, source, updatedAt } = data;
  const isLive = source === 'live' || source === 'partial';

  return (
    <ShieldCard className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <SectionLabel>Institutional analysis</SectionLabel>
        {isLive && <LiveBadge />}
      </div>
      <h2 className="mt-2 text-sm font-bold tracking-tight text-white md:text-base">Live market insights</h2>
      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[#7D8594] md:text-sm">
        Real-time sector and equity performance from Yahoo Finance. Educational context only — not investment advice.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DataCell title="Risk analysis">
          <p className="text-xs leading-relaxed text-[#B6BDC8]">
            {loading
              ? 'Loading…'
              : isLive
                ? 'Live market data active. Monitor VIX and sector rotation for risk signals.'
                : 'Market feed offline. Check back shortly.'}
          </p>
        </DataCell>

        <DataCell title="Sector performance">
          {loading && !insights.sectors.length ? (
            <p className="text-xs text-[#7D8594]">Loading…</p>
          ) : (
            <ul className="space-y-1.5">
              {insights.sectors.map((s) => (
                <li key={s.name} className="flex justify-between text-[11px]">
                  <span className="text-[#B6BDC8]">{s.name}</span>
                  <span
                    className={`font-mono-data tabular-nums ${s.changePct >= 0 ? 'text-[#2ECC71]' : 'text-[#FF5B5B]'}`}
                  >
                    {formatPct(s.changePct)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DataCell>

        <DataCell title="Top movers">
          {loading && !insights.movers.length ? (
            <p className="text-xs text-[#7D8594]">Loading…</p>
          ) : (
            <ul className="space-y-1.5">
              {insights.movers.map((m) => (
                <li key={m.symbol} className="flex justify-between gap-2 text-[11px]">
                  <span className="truncate text-[#B6BDC8]">
                    <span className="font-mono-data text-[#C76A16]">{m.symbol}</span> {m.name}
                  </span>
                  <span
                    className={`shrink-0 font-mono-data tabular-nums ${m.changePct >= 0 ? 'text-[#2ECC71]' : 'text-[#FF5B5B]'}`}
                  >
                    {formatPct(m.changePct)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DataCell>

        <DataCell title="Data sources">
          <ul className="space-y-1.5 text-[11px] text-[#B6BDC8]">
            <li className="flex justify-between">
              <span>Crypto</span>
              <span className="font-mono-data text-[#C76A16]">Binance / Yahoo</span>
            </li>
            <li className="flex justify-between">
              <span>Stocks & Commodities</span>
              <span className="font-mono-data text-[#C76A16]">Yahoo</span>
            </li>
            <li className="flex justify-between">
              <span>Forex</span>
              <span className="font-mono-data text-[#C76A16]">Yahoo / ECB</span>
            </li>
          </ul>
        </DataCell>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <span className="font-mono-data text-[10px] tabular-nums text-[#7D8594]">
          SG16 Intelligence · {isLive ? `Live · Updated ${timeAgo(updatedAt)}` : 'Connecting…'}
        </span>
        <div className="flex flex-wrap gap-2">
          <Link to="/earnings" className="fin-btn-ghost">
            Earnings breakdowns
          </Link>
          <Link to="/sectors" className="fin-btn-primary">
            Explore sectors
          </Link>
        </div>
      </div>
    </ShieldCard>
  );
}
