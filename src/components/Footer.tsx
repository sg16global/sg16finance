import { Link } from 'react-router-dom';

const NETWORK = [
  { href: 'https://saiftechglobal.com', label: 'Saif Tech Global' },
  { href: 'https://sg16engine.com', label: 'SG16 AI Engine' },
  { href: 'https://saifglobal16.info', label: 'Geopolitical Monitor' },
];

export default function Footer() {
  return (
    <footer className="safe-bottom mt-auto border-t border-white/[0.08] bg-[#0D1118]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-4 py-8 sm:gap-8 sm:py-10 md:grid-cols-4 lg:px-6">
        <div className="col-span-2 md:col-span-2">
          <div className="font-bold text-white">SG16 Finance</div>
          <p className="mt-2 max-w-md text-sm text-[#7D8594]">
            Institutional-grade market intelligence — sectors, earnings, and global context in plain English.
          </p>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7D8594]">Explore</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#B6BDC8]">
            <Link to="/markets" className="hover:text-[#C76A16]">
              Markets
            </Link>
            <Link to="/sectors" className="hover:text-[#C76A16]">
              Sectors
            </Link>
            <Link to="/earnings" className="hover:text-[#C76A16]">
              Earnings
            </Link>
            <Link to="/premium" className="hover:text-[#C76A16]">
              Premium
            </Link>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7D8594]">Legal</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#B6BDC8]">
            <Link to="/disclaimer" className="hover:text-[#C76A16]">
              Disclaimer
            </Link>
            <Link to="/privacy" className="hover:text-[#C76A16]">
              Privacy
            </Link>
            <Link to="/about" className="hover:text-[#C76A16]">
              About
            </Link>
            <Link to="/contact" className="hover:text-[#C76A16]">
              Contact
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7D8594]">
            <span>SG16 Network:</span>
            {NETWORK.map((n) => (
              <a key={n.href} href={n.href} className="text-[#B6BDC8] hover:text-[#C76A16]">
                {n.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-[#7D8594]">
            © {new Date().getFullYear()} Saif Tech Global Limited · UK Co. 16826361
          </p>
        </div>
      </div>
    </footer>
  );
}
