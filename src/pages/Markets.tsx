import { Link } from 'react-router-dom';
import { useMarkets } from '../hooks/useMarkets';
import PageShell from '../components/PageShell';
import { LiveBadge, ShieldCard } from '../components/home/ui';

export default function Markets() {
  const markets = useMarkets();

  return (
    <PageShell
      label="Markets"
      title="Global markets"
      description="Major indices across the US, Europe, and Asia. Live data when API keys are configured on Cloudflare; otherwise illustrative values."
      wide
    >
      <ShieldCard>
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7D8594]">Index snapshot</span>
          <LiveBadge />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-[#7D8594]">
                <th className="pb-3 pr-4 font-semibold">Index</th>
                <th className="pb-3 pr-4 font-semibold">Region</th>
                <th className="hidden pb-3 pr-4 font-semibold sm:table-cell">Last</th>
                <th className="pb-3 text-right font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => {
                const up = m.changePct >= 0;
                return (
                  <tr key={m.id} className="border-t border-white/[0.04] transition hover:bg-white/[0.02]">
                    <td className="py-3.5 pr-4 font-medium text-white">{m.name}</td>
                    <td className="py-3.5 pr-4 text-[#7D8594]">{m.region}</td>
                    <td className="hidden py-3.5 pr-4 font-mono tabular-nums text-[#B6BDC8] sm:table-cell">
                      {m.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3.5 text-right font-mono tabular-nums ${up ? 'text-[#2ECC71]' : 'text-[#FF5B5B]'}`}>
                      {up ? '+' : ''}
                      {m.changePct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ShieldCard>
      <p className="mt-6 text-xs text-[#7D8594]">
        Data is for educational purposes only. See our{' '}
        <Link to="/disclaimer" className="fin-link">
          disclaimer
        </Link>
        .
      </p>
    </PageShell>
  );
}
