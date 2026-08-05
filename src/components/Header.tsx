import { Link } from 'react-router-dom';
import { useState } from 'react';
import SearchBar from './SearchBar';

function IconBot() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 8V5M8 5h8M9 14h.01M15 14h.01M8 18h8" />
    </svg>
  );
}

export default function Header() {
  const [logoFallback, setLogoFallback] = useState(false);

  return (
    <header className="site-header safe-top sticky top-0 z-50 border-b border-white/[0.08] bg-[#07090C]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5 lg:gap-5 lg:px-6">
        <Link to="/" className="flex shrink-0 items-center">
          <img
            src={logoFallback ? '/logo.svg' : '/logo.png'}
            alt="SG16 Finance — Global Intelligence"
            className="site-logo h-9 w-auto max-w-[min(42vw,180px)] object-contain object-left sm:h-10 md:h-11 md:max-w-[min(100vw-8rem,220px)]"
            width={220}
            height={48}
            onError={() => setLogoFallback(true)}
          />
        </Link>

        <SearchBar className="mx-auto hidden max-w-xl flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a
            href="https://sg16engine.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Open SG16 AI Engine"
            className="rounded-lg p-2 text-[#7D8594] transition duration-200 hover:bg-[#131922] hover:text-[#C76A16]"
          >
            <IconBot />
          </a>
          <Link
            to="/premium"
            className="hidden rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-[#B6BDC8] transition duration-200 hover:border-[#C76A16]/30 hover:text-white sm:inline-block"
          >
            Login
          </Link>
          <Link
            to="/premium"
            className="rounded-lg bg-[#C76A16] px-2.5 py-1.5 text-[11px] font-semibold text-white transition duration-200 hover:bg-[#D97B22] accent-glow hover-lift sm:px-4 sm:py-2 sm:text-xs"
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="site-header-search border-t border-white/[0.06] px-3 pb-2 sm:px-4 sm:pb-2.5 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
