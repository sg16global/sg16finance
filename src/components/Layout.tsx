import { Outlet, useLocation } from 'react-router-dom';
import { TICKER_ROW_1, TICKER_ROW_2 } from '../data/ticker';
import CookieBanner from './CookieBanner';
import DisclaimerBar from './DisclaimerBar';
import Footer from './Footer';
import Header from './Header';
import LiveTicker from './home/LiveTicker';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-[#07090C]">
      <DisclaimerBar />
      {isHome && <LiveTicker row1={TICKER_ROW_1} row2={TICKER_ROW_2} />}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
