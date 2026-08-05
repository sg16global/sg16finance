import type { AssetCategory } from '../../data/assetCategories';
import { CATEGORY_CARDS } from '../../data/assetCategories';
import type { LiveCategoryData } from '../../types';
import { formatPct } from '../../lib/format';
import SparklineChart from './SparklineChart';
import CategoryIcon from './CategoryIcon';

type Props = {
  selected: AssetCategory;
  onSelect: (category: AssetCategory) => void;
  live: Record<AssetCategory, LiveCategoryData | null>;
  loading?: boolean;
};

export default function AssetCategoryCards({ selected, onSelect, live, loading }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {CATEGORY_CARDS.map((card) => {
        const isActive = selected === card.id;
        const liveCard = live[card.id];
        const positive = (liveCard?.card.changePct ?? 0) >= 0;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            aria-pressed={isActive}
            aria-label={`${card.title} — ${isActive ? 'showing details below' : 'click to view live details below'}`}
            className={`asset-category-card group text-left ${isActive ? 'asset-category-card--active' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <CategoryIcon kind={card.icon} />
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-white">{card.title}</h3>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7D8594]">{card.subtitle}</p>
                </div>
              </div>
              {isActive && (
                <span className="rounded-md bg-[#C76A16]/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#FF9A3C]">
                  Active
                </span>
              )}
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D8594]">
                {liveCard?.card.statLabel ?? card.statLabel}
              </p>
              {loading && !liveCard ? (
                <p className="mt-1 font-mono-data text-2xl font-bold tabular-nums text-[#7D8594]">—</p>
              ) : (
                <p
                  className={`mt-1 font-mono-data text-2xl font-bold tabular-nums tracking-tight ${
                    positive ? 'text-[#2ECC71]' : 'text-[#FF5B5B]'
                  }`}
                >
                  {liveCard ? formatPct(liveCard.card.changePct) : '—'}
                </p>
              )}
            </div>

            <div className="mt-3 h-16 overflow-hidden rounded-lg bg-[#0A0D12] px-1 py-0.5 ring-1 ring-white/[0.06]">
              {liveCard?.card.sparkline.length ? (
                <SparklineChart data={liveCard.card.sparkline} height={56} />
              ) : (
                <div className="flex h-full items-center justify-center text-[9px] text-[#7D8594]">
                  {loading ? 'Loading…' : 'No data'}
                </div>
              )}
            </div>

            <p
              className={`mt-2.5 text-[10px] font-medium tracking-wide transition-colors ${
                isActive ? 'text-[#FF9A3C]' : 'text-[#7D8594] group-hover:text-[#B6BDC8]'
              }`}
            >
              {isActive ? 'Showing details below ↓' : 'Click to view details →'}
            </p>
          </button>
        );
      })}
    </div>
  );
}
