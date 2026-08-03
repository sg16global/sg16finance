import type { MarketIndex } from '../types';

type Props = { items: MarketIndex[] };

function Chip({ m }: { m: MarketIndex }) {
  const up = m.changePct >= 0;
  return (
    <span className="inline-flex shrink-0 items-center gap-2 px-6 text-sm">
      <span className="font-medium text-slate-300">{m.name}</span>
      <span className="font-mono text-slate-400">{m.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
      <span className={`font-mono text-xs ${up ? 'text-emerald-400' : 'text-red-400'}`}>
        {up ? '+' : ''}
        {m.changePct.toFixed(2)}%
      </span>
    </span>
  );
}

export default function MarketTicker({ items }: Props) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-[#1e293b] bg-[#0a0e16] py-2">
      <div className="ticker-track flex w-max whitespace-nowrap">
        {doubled.map((m, i) => (
          <Chip key={`${m.id}-${i}`} m={m} />
        ))}
      </div>
    </div>
  );
}
