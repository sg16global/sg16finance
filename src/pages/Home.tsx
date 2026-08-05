import { useRef, useState } from 'react';
import AssetCategoryCards from '../components/home/AssetCategoryCards';
import CategoryWorkspace from '../components/home/CategoryWorkspace';
import InsightsPanel from '../components/home/InsightsPanel';
import { SectionLabel } from '../components/home/ui';
import type { AssetCategory } from '../data/assetCategories';
import { useDashboardData } from '../context/DashboardContext';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('crypto');
  const { data, loading } = useDashboardData();
  const detailRef = useRef<HTMLDivElement>(null);

  function handleSelect(category: AssetCategory) {
    setSelectedCategory(category);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  return (
    <div className="dashboard-canvas page-flow mx-auto max-w-[1440px] px-[max(0.5rem,env(safe-area-inset-left))] pt-1 pb-6 sm:px-3 lg:px-5 lg:pb-8">
      <section aria-label="Market categories">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 pt-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <SectionLabel>Market categories</SectionLabel>
            <h2 className="mt-1.5 text-sm font-bold tracking-tight text-white sm:text-base md:text-lg">
              Select a market to explore
            </h2>
            <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-[#7D8594] sm:text-xs md:text-sm">
              Click any card below — live prices, charts, and metrics update instantly in the detail panel.
            </p>
          </div>
          <p className="hidden shrink-0 text-[10px] uppercase tracking-[0.14em] text-[#7D8594] sm:block">
            Tap a card · View details ↓
          </p>
        </div>

        <AssetCategoryCards
          selected={selectedCategory}
          onSelect={handleSelect}
          live={data.categories}
          loading={loading}
        />
      </section>

      <div ref={detailRef} className="market-detail-bridge mt-1 scroll-mt-[calc(4.5rem+env(safe-area-inset-top))] sm:scroll-mt-24">
        <div className="market-detail-bridge-line" aria-hidden />
        <p className="market-detail-bridge-label">
          <span className="fin-section-accent inline-block align-middle" aria-hidden />
          Live detail view
        </p>
      </div>

      <CategoryWorkspace
        key={selectedCategory}
        category={selectedCategory}
        live={data.categories[selectedCategory]}
        news={data.news[selectedCategory] ?? []}
        source={data.source}
        updatedAt={data.updatedAt}
        loading={loading}
      />

      <InsightsPanel />
    </div>
  );
}
