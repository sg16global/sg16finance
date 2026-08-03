import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchEntries, type SearchEntry } from '../data/searchIndex';

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

export default function SearchBar({ className = '' }: { className?: string }) {
  const listId = useId();
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = searchEntries(query);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function pick(entry: SearchEntry) {
    setQuery('');
    setOpen(false);
    navigate(entry.href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && e.key === 'ArrowDown' && results.length) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7D8594]">
        <IconSearch />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="Search companies, sectors, symbols…"
        className="w-full rounded-full border border-white/[0.08] bg-[#0D1118] py-2 pl-11 pr-4 text-sm text-[#B6BDC8] placeholder:text-[#7D8594] outline-none transition duration-200 focus:border-[#C76A16]/40 focus:ring-1 focus:ring-[#C76A16]/20"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && query && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0D1118] py-1 shadow-2xl"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[#7D8594]">No matches — try AAPL, technology, or markets</li>
          ) : (
            results.map((r, i) => (
              <li key={r.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                    i === active ? 'bg-[#C76A16]/15 text-white' : 'text-[#B6BDC8] hover:bg-white/[0.04]'
                  }`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(r)}
                >
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#C76A16]">
                    {r.group}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-white">{r.label}</span>
                    {r.sublabel && <span className="ml-2 text-[#7D8594]">{r.sublabel}</span>}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
