import { Link } from 'react-router-dom';

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function IconBot() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 8V5M8 5h8M9 14h.01M15 14h.01M8 18h8" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#07090C]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2.5 lg:gap-5 lg:px-6">
        <Link to="/" className="flex shrink-0 items-center">
          <img
            src="/logo.svg"
            alt="SG16 Finance — Global Intelligence"
            className="h-9 w-auto object-contain object-left sm:h-10 md:h-11"
            width={220}
            height={44}
          />
        </Link>

        <div className="relative mx-auto hidden max-w-xl flex-1 md:block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7D8594]">
            <IconSearch />
          </span>
          <input
            type="search"
            placeholder="Search markets, assets, or companies..."
            className="w-full rounded-full border border-white/[0.08] bg-[#0D1118] py-2 pl-11 pr-4 text-sm text-[#B6BDC8] placeholder:text-[#7D8594] outline-none transition duration-200 focus:border-[#C76A16]/40 focus:ring-1 focus:ring-[#C76A16]/20"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            title="AI Assistant"
            className="rounded-lg p-2 text-[#7D8594] transition duration-200 hover:bg-[#131922] hover:text-[#C76A16]"
          >
            <IconBot />
          </button>
          <button
            type="button"
            title="Theme"
            className="hidden rounded-lg p-2 text-[#7D8594] transition duration-200 hover:bg-[#131922] hover:text-white sm:block"
          >
            <IconMoon />
          </button>
          <button
            type="button"
            title="Notifications"
            className="relative hidden rounded-lg p-2 text-[#7D8594] transition duration-200 hover:bg-[#131922] hover:text-white sm:block"
          >
            <IconBell />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#C76A16]" />
          </button>
          <Link
            to="/premium"
            className="hidden rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-[#B6BDC8] transition duration-200 hover:border-[#C76A16]/30 hover:text-white sm:inline-block"
          >
            Login
          </Link>
          <button
            type="button"
            title="Settings"
            className="hidden rounded-lg p-2 text-[#7D8594] transition duration-200 hover:bg-[#131922] hover:text-white lg:block"
          >
            <IconSettings />
          </button>
          <Link
            to="/premium"
            className="rounded-lg bg-[#C76A16] px-4 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-[#D97B22] accent-glow hover-lift"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
