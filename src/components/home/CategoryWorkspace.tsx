import type { AssetCategory } from '../../data/assetCategories';
import { CATEGORY_CARDS, CATEGORY_WORKSPACES } from '../../data/assetCategories';
import type { LiveCategoryData, NewsItem } from '../../types';
import { formatPct, formatPrice, formatUsd, timeAgo } from '../../lib/format';
import { buildLiveSummary } from '../../lib/liveSummary';
import NewsList from './NewsList';
import WorkspaceChart from './WorkspaceChart';
import { DataCell, LiveBadge, SectionLabel, ShieldCard } from './ui';

type Props = {
  category: AssetCategory;
  live: LiveCategoryData | null;
  news: NewsItem[];
  source: 'live' | 'partial' | 'offline';
  updatedAt: string;
  loading?: boolean;
};

function formatPrimary(value: number, category: AssetCategory, label: string): string {
  if (category === 'forex') return formatPrice(value);
  if (label.toLowerCase().includes('gold') || category === 'commodities') return formatUsd(value);
  if (value >= 1000) return formatPrice(value);
  return formatUsd(value);
}

function formatSecondary(
  value: number,
  category: AssetCategory,
  secondaryIsPct?: boolean,
  label?: string,
): string {
  if (secondaryIsPct) return formatPct(value);
  if (category === 'forex') return formatPrice(value);
  if (label?.toLowerCase().includes('crude') || label?.toLowerCase().includes('oil')) return formatUsd(value);
  if (value >= 100) return formatUsd(value);
  return formatPrice(value);
}

function formatMetricValue(value: number, category: AssetCategory, label: string): string {
  if (category === 'forex') return formatPrice(value);
  if (label.toLowerCase().includes('vix')) return formatPrice(value);
  if (category === 'stocks') return formatPrice(value);
  if (label.toLowerCase().includes('gold') || label.toLowerCase().includes('silver') || label.toLowerCase().includes('oil')) {
    return formatUsd(value);
  }
  if (value >= 1) return formatUsd(value);
  return formatPrice(value);
}

export default function CategoryWorkspace({ category, live, news, source, updatedAt, loading }: Props) {
  const staticWs = CATEGORY_WORKSPACES[category];
  const isLive = source === 'live' || source === 'partial';

  if (loading && !live) {
    return (
      <ShieldCard className="category-workspace mt-4">
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-[#7D8594]">Loading live market data…</p>
        </div>
      </ShieldCard>
    );
  }

  if (!live) {
    return (
      <ShieldCard className="category-workspace mt-4">
        <div className="flex h-48 flex-col items-center justify-center gap-2">
          <p className="text-sm text-[#FF5B5B]">Unable to load live data</p>
          <p className="text-xs text-[#7D8594]">Market feed temporarily unavailable. Retrying shortly.</p>
        </div>
      </ShieldCard>
    );
  }

  const ws = live.workspace;
  const liveSummary = buildLiveSummary(category, ws);
  const cardMeta = CATEGORY_CARDS.find((c) => c.id === category);

  return (
    <ShieldCard className="category-workspace mt-4">
      <div className="workspace-header space-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SectionLabel>{cardMeta?.subtitle.split('·')[0]?.trim() ?? 'Live market'}</SectionLabel>
            {isLive && <LiveBadge />}
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-white md:text-xl">{staticWs.headline}</h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#7D8594] md:text-sm">{liveSummary}</p>
        </div>

        <div className="workspace-prices grid grid-cols-2 gap-3 rounded-xl bg-black/30 p-3 ring-1 ring-white/[0.06] sm:gap-4 sm:p-4 md:max-w-lg">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D8594]">{ws.primaryLabel}</p>
            <p className="mt-1 truncate font-mono-data text-lg font-bold tabular-nums text-white sm:text-xl md:text-2xl">
              {formatPrimary(ws.primaryValue, category, ws.primaryLabel)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[#7D8594]">{ws.secondaryLabel}</p>
            <p className="mt-1 truncate font-mono-data text-lg font-bold tabular-nums text-[#FF9A3C] sm:text-xl md:text-2xl">
              {formatSecondary(ws.secondaryValue, category, ws.secondaryIsPct, ws.secondaryLabel)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <WorkspaceChart data={ws.chartData} category={category} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ws.metrics.map((metric) => {
          const positive = metric.changePct >= 0;
          const display = formatMetricValue(metric.value, category, metric.label);

          return (
            <DataCell key={metric.label} title={metric.label}>
              <p className="font-mono-data text-sm font-semibold tabular-nums text-white">{display}</p>
              <p className={`mt-1 font-mono-data text-xs tabular-nums ${positive ? 'text-[#2ECC71]' : 'text-[#FF5B5B]'}`}>
                {formatPct(metric.changePct)}
              </p>
            </DataCell>
          );
        })}
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C76A16]">Live market news</p>
          <span className="font-mono-data text-[9px] tabular-nums text-[#7D8594]">
            {isLive ? `Yahoo Finance · Updated ${timeAgo(updatedAt)}` : 'Offline'}
          </span>
        </div>
        <div className="mt-2.5">
          <NewsList items={news} emptyLabel="Loading headlines…" />
        </div>
      </div>
    </ShieldCard>
  );
}
