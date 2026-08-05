import type { AssetCategory } from '../../data/assetCategories';
import FinancialChart from './FinancialChart';
import { formatPrice, formatUsd } from '../../lib/format';

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
  return (
    <div className="workspace-chart rounded-xl bg-[#0A0D12] ring-1 ring-white/[0.08]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7D8594]">Price chart · 30 days</p>
        <p className="font-mono-data text-[10px] tabular-nums text-[#C76A16]">Daily close</p>
      </div>
      <div key={category} className="workspace-chart-body px-2 py-2 md:px-3 md:py-3">
        <FinancialChart data={data} height={220} formatValue={chartFormatter(category)} />
      </div>
    </div>
  );
}
