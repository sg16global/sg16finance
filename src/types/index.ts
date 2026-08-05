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

export type LiveMetric = {
  label: string;
  value: number;
  changePct: number;
};

export type LiveCategoryData = {
  card: {
    statLabel: string;
    changePct: number;
    sparkline: number[];
  };
  workspace: {
    primaryValue: number;
    primaryLabel: string;
    secondaryValue: number;
    secondaryLabel: string;
    secondaryIsPct?: boolean;
    chartData: number[];
    metrics: LiveMetric[];
  };
};

export type LiveInsightSector = { name: string; changePct: number };
export type LiveInsightMover = { symbol: string; name: string; changePct: number };

export type NewsItem = {
  title: string;
  url: string;
  publishedAt: string;
};

export type DashboardPayload = {
  source: 'live' | 'partial' | 'offline';
  updatedAt: string;
  categories: Record<'crypto' | 'forex' | 'stocks' | 'commodities', LiveCategoryData | null>;
  ticker: { row1: TickerItem[]; row2: TickerItem[] };
  insights: {
    sectors: LiveInsightSector[];
    movers: LiveInsightMover[];
  };
  news: Record<'crypto' | 'forex' | 'stocks' | 'commodities', NewsItem[]>;
  headlines: NewsItem[];
};
