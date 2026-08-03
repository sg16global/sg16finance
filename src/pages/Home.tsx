import InsightsPanel from '../components/home/InsightsPanel';
import ShieldCards from '../components/home/ShieldCards';
import WorldMap from '../components/home/WorldMap';

export default function Home() {
  return (
    <div className="dashboard-canvas mx-auto max-w-[1440px] px-2 pt-1 pb-4 sm:px-3 lg:px-5">
      <div className="home-shield-stack grid items-start gap-2 sm:gap-3 lg:grid-cols-[minmax(0,280px)_1fr_minmax(0,280px)] xl:grid-cols-[minmax(0,300px)_1fr_minmax(0,300px)] xl:gap-4">
        <ShieldCards side="left" className="order-2 lg:order-1" />
        <div className="order-1 min-w-0 lg:order-2">
          <WorldMap />
        </div>
        <ShieldCards side="right" className="order-3" />
      </div>
      <InsightsPanel />
    </div>
  );
}
