export type MarketIndex = {
  id: string;
  name: string;
  region: string;
  value: number;
  changePct: number;
};

export type TickerItem = {
  id: string;
  name: string;
  value: number;
  changePct: number;
  category: 'index' | 'commodity' | 'crypto' | 'fx';
};

export type MapHub = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  value: string;
  pulse?: boolean;
};

export type Sector = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  drivers: string[];
  keyPlayers: string[];
  risks: string[];
  outlook: string;
};

export type EarningsReport = {
  symbol: string;
  company: string;
  quarter: string;
  headline: string;
  revenue: string;
  eps: string;
  beatMiss: string;
  summary: string;
  takeaways: string[];
};
