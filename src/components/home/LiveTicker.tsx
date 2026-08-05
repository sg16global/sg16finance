import type { TickerItem } from '../../types';

function TickerChip({ item }: { item: TickerItem }) {
  const up = item.changePct >= 0;
  const decimals = item.value < 200 ? 2 : item.value < 10000 ? 1 : 0;

  return (
    <span className="inline-flex shrink-0 items-center gap-2 border-r border-[#C76A16]/25 px-5 py-1 text-[11px]">
      <span className="font-medium text-[#B6BDC8]">{item.name}</span>
      <span className="font-mono-data text-white">
        {item.value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      </span>
      <span className={`font-mono-data ${up ? 'text-[#2ECC71]' : 'text-[#FF5B5B]'}`}>
        {up ? '+' : ''}
        {item.changePct.toFixed(2)}%
      </span>
    </span>
  );
}

function TickerRow({ items, reverse }: { items: TickerItem[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-white/[0.06]">
      <div className={`flex w-max whitespace-nowrap py-0.5 ${reverse ? 'ticker-scroll-reverse' : 'ticker-scroll'}`}>
        {doubled.map((item, i) => (
          <TickerChip key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

type Props = { row1: TickerItem[]; row2: TickerItem[] };

export default function LiveTicker({ row1, row2 }: Props) {
  return (
    <div className="live-ticker bg-[#0D1118]">
      <TickerRow items={row1} />
      <TickerRow items={row2} reverse />
    </div>
  );
}
