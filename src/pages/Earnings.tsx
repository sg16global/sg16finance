import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { ShieldCard } from '../components/home/ui';
import { EARNINGS } from '../data/earnings';

export default function Earnings() {
  return (
    <PageShell
      label="Earnings"
      title="Earnings breakdowns"
      description="Plain-English summaries of recent results — what beat, what missed, and why it mattered."
      wide
    >
      <div className="space-y-3">
        {EARNINGS.map((e) => (
          <Link key={e.symbol} to={`/earnings/${e.symbol}`} className="group block">
            <ShieldCard>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#C76A16]/15 px-2 py-0.5 font-mono text-sm font-semibold text-[#FF9A3C]">
                  {e.symbol}
                </span>
                <span className="font-medium text-white">{e.company}</span>
                <span className="text-sm text-[#7D8594]">· {e.quarter}</span>
              </div>
              <h2 className="mt-2 text-lg text-[#B6BDC8] transition group-hover:text-white">{e.headline}</h2>
              <p className="mt-1 text-sm text-[#7D8594]">{e.beatMiss}</p>
            </ShieldCard>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
