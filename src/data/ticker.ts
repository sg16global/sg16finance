import type { TickerItem } from '../types';

/** Row 1 — crypto, commodities, FX, indices (scrolls left) */
export const TICKER_ROW_1: TickerItem[] = [
  { id: 'eth', name: 'Ethereum', value: 3714, changePct: -0.36, category: 'crypto' },
  { id: 'btc', name: 'Bitcoin', value: 67240, changePct: 1.12, category: 'crypto' },
  { id: 'brent', name: 'Brent Oil', value: 82.45, changePct: -0.75, category: 'commodity' },
  { id: 'gold', name: 'Gold', value: 2348.2, changePct: 0.15, category: 'commodity' },
  { id: 'dxy', name: 'USD Index', value: 104.28, changePct: 0.12, category: 'fx' },
  { id: 'nasdaq', name: 'NASDAQ 100', value: 21112.32, changePct: 0.36, category: 'index' },
];

/** Row 2 — major indices (scrolls right) */
export const TICKER_ROW_2: TickerItem[] = [
  { id: 'sp500', name: 'S&P 500', value: 5842.5, changePct: 0.42, category: 'index' },
  { id: 'dow', name: 'Dow Jones', value: 42856.3, changePct: 0.28, category: 'index' },
  { id: 'nikkei', name: 'Nikkei 225', value: 39872.4, changePct: 0.55, category: 'index' },
  { id: 'dax', name: 'DAX', value: 18456.2, changePct: 0.21, category: 'index' },
  { id: 'ftse', name: 'FTSE 100', value: 8421.3, changePct: -0.12, category: 'index' },
  { id: 'hsi', name: 'Hang Seng', value: 17842.1, changePct: -0.34, category: 'index' },
];

/** Combined — for /api fallback */
export const TICKER_ITEMS: TickerItem[] = [...TICKER_ROW_1, ...TICKER_ROW_2];
