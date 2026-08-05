import type { AssetCategory } from '../../data/assetCategories';
import FinancialChart from './FinancialChart';
import { formatPrice, formatUsd } from '../../lib/format';
import { useViewport } from '../../hooks/useViewport';

type Props = {
  data: number[];
  category: AssetCategory;
};

function chartFormatter(category: AssetCategory) {
  if (category === 'forex') {
    return (v: number) => formatPrice(v);
  }
  if (category === 'commodities') {
    return (v: number) => formatUsd(v);
  }
  if (category === 'crypto') {
    return (v: number) => (v >= 1000 ? formatUsd(v) : formatPrice(v));
  }
  return (v: number) => formatPrice(v);
}

export default function WorkspaceChart({ data, category }: Props) {
  const viewport = useViewport();
  const compact = viewport === 'mobile-portrait' || viewport === 'mobile-landscape';
  const chartHeight = viewport === 'mobile-landscape' ? 140 : compact ? 180 : 220;

  return (
    <div className="workspace-chart rounded-xl bg-[#0A0D12] ring-1 ring-white/[0.08]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 sm:px-4 sm:py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7D8594] sm:text-[10px] sm:tracking-[0.14em]">
          Price chart · 30 days
        </p>
        <p className="font-mono-data text-[9px] tabular-nums text-[#C76A16] sm:text-[10px]">Daily close</p>
      </div>
      <div
        key={category}
        className="workspace-chart-body px-1 py-1.5 sm:px-2 sm:py-2 md:px-3 md:py-3"
        style={{ minHeight: chartHeight }}
      >
        <FinancialChart
          data={data}
          height={chartHeight}
          formatValue={chartFormatter(category)}
          compact={compact}
        />
      </div>
    </div>
  );
}
