import { Outlet, useLocation } from 'react-router-dom';
import CookieBanner from './CookieBanner';
import DisclaimerBar from './DisclaimerBar';
import Footer from './Footer';
import Header from './Header';
import LiveTicker from './home/LiveTicker';
import { useTickerRows } from '../hooks/useTicker';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const { row1, row2 } = useTickerRows();

  return (
    <div className="flex min-h-screen flex-col bg-[#07090C]">
      <DisclaimerBar />
      {isHome && <LiveTicker row1={row1} row2={row2} />}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
