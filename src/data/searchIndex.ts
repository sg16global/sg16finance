import { EARNINGS } from './earnings';
import { MARKETS } from './markets';
import { SECTORS } from './sectors';

export type SearchEntry = {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  group: 'Sector' | 'Earnings' | 'Market' | 'Page';
  terms: string;
};

const PAGES: SearchEntry[] = [
  { id: 'home', label: 'Dashboard', href: '/', group: 'Page', terms: 'home dashboard map intelligence' },
  { id: 'markets', label: 'Global markets', href: '/markets', group: 'Page', terms: 'markets indices stocks global' },
  { id: 'sectors', label: 'All sectors', href: '/sectors', group: 'Page', terms: 'sectors industry overview' },
  { id: 'earnings', label: 'Earnings reports', href: '/earnings', group: 'Page', terms: 'earnings results quarterly' },
  { id: 'premium', label: 'Premium', href: '/premium', group: 'Page', terms: 'premium subscription waitlist' },
  { id: 'about', label: 'About SG16 Finance', href: '/about', group: 'Page', terms: 'about company saif tech' },
];

export const SEARCH_INDEX: SearchEntry[] = [
  ...PAGES,
  ...SECTORS.map((s) => ({
    id: `sector-${s.slug}`,
    label: s.name,
    sublabel: s.tagline,
    href: `/sectors/${s.slug}`,
    group: 'Sector' as const,
    terms: [s.name, s.slug, s.tagline, s.summary, ...s.keyPlayers, ...s.drivers].join(' ').toLowerCase(),
  })),
  ...EARNINGS.map((e) => ({
    id: `earn-${e.symbol}`,
    label: e.symbol,
    sublabel: e.company,
    href: `/earnings/${e.symbol}`,
    group: 'Earnings' as const,
    terms: [e.symbol, e.company, e.headline, e.quarter].join(' ').toLowerCase(),
  })),
  ...MARKETS.map((m) => ({
    id: `mkt-${m.id}`,
    label: m.name,
    sublabel: m.region,
    href: '/markets',
    group: 'Market' as const,
    terms: [m.name, m.id, m.region, 'index indices'].join(' ').toLowerCase(),
  })),
];

export function searchEntries(query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.filter(
    (e) =>
      e.label.toLowerCase().includes(q) ||
      e.sublabel?.toLowerCase().includes(q) ||
      e.terms.includes(q) ||
      q.split(/\s+/).every((w) => e.terms.includes(w)),
  ).slice(0, limit);
}
