type IconKind = 'crypto' | 'forex' | 'stocks' | 'commodities';

export default function CategoryIcon({ kind }: { kind: IconKind }) {
  const common = 'h-9 w-9 shrink-0';

  if (kind === 'crypto') {
    return (
      <div className={`${common} flex items-center justify-center rounded-xl bg-[#C76A16]/15 ring-1 ring-[#C76A16]/25`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FF9A3C]" fill="currentColor" aria-hidden>
          <path d="M12 2L4 6.5v11L12 22l8-4.5v-11L12 2zm0 2.18l5.5 3.09v6.46L12 17.82l-5.5-3.09V7.27L12 4.18zM11 8v8h2V8h-2z" />
        </svg>
      </div>
    );
  }

  if (kind === 'forex') {
    return (
      <div className={`${common} flex items-center justify-center rounded-xl bg-[#C76A16]/15 ring-1 ring-[#C76A16]/25`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FF9A3C]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
      </div>
    );
  }

  if (kind === 'stocks') {
    return (
      <div className={`${common} flex items-center justify-center rounded-xl bg-[#C76A16]/15 ring-1 ring-[#C76A16]/25`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FF9A3C]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 18V8l4 3 4-6 4 4 4-2v11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${common} flex items-center justify-center rounded-xl bg-[#C76A16]/15 ring-1 ring-[#C76A16]/25`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FF9A3C]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 3l2.4 4.8L20 9l-3.5 3.4.8 4.9L12 15.8 6.7 17.3l.8-4.9L4 9l5.6-1.2L12 3z" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
