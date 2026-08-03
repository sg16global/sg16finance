import AdSlot from '../components/AdSlot';
import InsightsPanel from '../components/home/InsightsPanel';
import ShieldCards from '../components/home/ShieldCards';
import WorldMap from '../components/home/WorldMap';

export default function Home() {
  return (
    <div className="dashboard-canvas page-flow mx-auto max-w-[1440px] px-2 pt-1 pb-6 sm:px-3 lg:px-5 lg:pb-8">
      {/* Mobile: map first, then ads + cards stack. Desktop: 3-column grid */}
      <div className="flex flex-col items-stretch gap-3 sm:gap-4 lg:grid lg:items-start lg:grid-cols-[minmax(0,280px)_1fr_minmax(0,280px)] xl:grid-cols-[minmax(0,300px)_1fr_minmax(0,300px)] xl:gap-4">
        <div className="order-1 min-w-0 lg:order-2 lg:col-span-1">
          <WorldMap />
        </div>

        <AdSlot placement="home-mid" format="horizontal" className="order-2 lg:order-none lg:col-span-3 lg:hidden" />

        <ShieldCards side="left" className="order-3 lg:order-1" />
        <ShieldCards side="right" className="order-4 lg:order-3" />
      </div>

      <AdSlot placement="home-bottom" format="horizontal" className="mt-4" />
      <InsightsPanel />
    </div>
  );
}
