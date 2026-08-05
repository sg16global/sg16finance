import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { DashboardProvider } from './context/DashboardContext';
import About from './pages/About';
import Contact from './pages/Contact';
import Disclaimer from './pages/Disclaimer';
import Earnings from './pages/Earnings';
import EarningsDetail from './pages/EarningsDetail';
import Home from './pages/Home';
import Markets from './pages/Markets';
import Premium from './pages/Premium';
import Privacy from './pages/Privacy';
import SectorDetail from './pages/SectorDetail';
import Sectors from './pages/Sectors';

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardProvider><Layout /></DashboardProvider>}>
        <Route index element={<Home />} />
        <Route path="markets" element={<Markets />} />
        <Route path="sectors" element={<Sectors />} />
        <Route path="sectors/:slug" element={<SectorDetail />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="earnings/:symbol" element={<EarningsDetail />} />
        <Route path="about" element={<About />} />
        <Route path="disclaimer" element={<Disclaimer />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="contact" element={<Contact />} />
        <Route path="premium" element={<Premium />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
