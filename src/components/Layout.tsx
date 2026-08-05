import { Outlet, useLocation } from 'react-router-dom';
import { useDashboardData } from '../context/DashboardContext';
import CookieBanner from './CookieBanner';
import DisclaimerBar from './DisclaimerBar';
import Footer from './Footer';
import Header from './Header';
import LiveTicker from './home/LiveTicker';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const { data } = useDashboardData();

  const row1 = isHome && data.ticker.row1.length ? data.ticker.row1 : [];
  const row2 = isHome && data.ticker.row2.length ? data.ticker.row2 : [];

  return (
    <div className="app-shell flex min-h-[100dvh] flex-col bg-[#07090C]">
      <DisclaimerBar />
      {isHome && (row1.length > 0 || row2.length > 0) && <LiveTicker row1={row1} row2={row2} />}
      <Header />
      <main className="main-content flex-1 pb-4">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
