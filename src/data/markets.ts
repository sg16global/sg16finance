import type { MarketIndex } from '../types';

export const MARKETS: MarketIndex[] = [
  { id: 'sp500', name: 'S&P 500', region: 'US', value: 5842.5, changePct: 0.42 },
  { id: 'nasdaq', name: 'NASDAQ 100', region: 'US', value: 21245.8, changePct: 0.68 },
  { id: 'ftse', name: 'FTSE 100', region: 'UK', value: 8421.3, changePct: -0.12 },
  { id: 'dax', name: 'DAX', region: 'EU', value: 18456.2, changePct: 0.21 },
  { id: 'nikkei', name: 'Nikkei 225', region: 'JP', value: 39872.4, changePct: 0.55 },
  { id: 'hsi', name: 'Hang Seng', region: 'HK', value: 17842.1, changePct: -0.34 },
];
