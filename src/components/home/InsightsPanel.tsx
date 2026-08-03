import { Link } from 'react-router-dom';
import { SECTOR_PERF, TOP_MOVERS } from '../../data/dashboard';
import { DataCell, SectionLabel, ShieldCard } from './ui';

export default function InsightsPanel() {
  return (
    <ShieldCard className="mt-4">
      <SectionLabel>Institutional analysis</SectionLabel>
      <h2 className="mt-2 text-sm font-bold tracking-tight text-white md:text-base">AI-generated market insights</h2>
      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[#7D8594] md:text-sm">
        Global equities hold firm as mega-cap tech earnings beat expectations. Risk appetite stable — VIX subdued.
        Capital rotating toward AI infrastructure and quality financials. Educational context only.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DataCell title="Risk analysis">
          <p className="text-xs leading-relaxed text-[#B6BDC8]">
            Moderate risk-on. Geopolitical headline risk in Middle East. Credit spreads tight.
          </p>
        </DataCell>

        <DataCell title="Sector performance">
          <ul className="space-y-1.5">
            {SECTOR_PERF.map((s) => (
              <li key={s.name} className="flex justify-between text-[11px]">
                <span className="text-[#B6BDC8]">{s.name}</span>
                <span className={`font-mono-data tabular-nums ${s.up ? 'text-[#2ECC71]' : 'text-[#FF5B5B]'}`}>
                  {s.change}
                </span>
              </li>
            ))}
          </ul>
        </DataCell>

        <DataCell title="Top movers">
          <ul className="space-y-1.5">
            {TOP_MOVERS.map((m) => (
              <li key={m.symbol} className="flex justify-between gap-2 text-[11px]">
                <span className="truncate text-[#B6BDC8]">
                  <span className="font-mono-data text-[#C76A16]">{m.symbol}</span> {m.name}
                </span>
                <span className={`shrink-0 font-mono-data tabular-nums ${m.up ? 'text-[#2ECC71]' : 'text-[#FF5B5B]'}`}>
                  {m.change}
                </span>
              </li>
            ))}
          </ul>
        </DataCell>

        <DataCell title="ETF & capital flows">
          <ul className="space-y-1.5 text-[11px] text-[#B6BDC8]">
            <li className="flex justify-between">
              <span>US equity ETFs</span>
              <span className="font-mono-data tabular-nums text-[#2ECC71]">+$4.2B</span>
            </li>
            <li className="flex justify-between">
              <span>Emerging markets</span>
              <span className="font-mono-data tabular-nums text-[#FF5B5B]">-$0.8B</span>
            </li>
            <li className="flex justify-between">
              <span>Capital movement</span>
              <span className="font-mono-data tabular-nums text-[#C76A16]">US → Asia</span>
            </li>
          </ul>
        </DataCell>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <span className="font-mono-data text-[10px] tabular-nums text-[#7D8594]">SG16 Intelligence · Delayed data · Placeholder</span>
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
