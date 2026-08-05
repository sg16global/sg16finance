export type AssetCategory = 'crypto' | 'forex' | 'stocks' | 'commodities';

export type CategoryCard = {
  id: AssetCategory;
  title: string;
  subtitle: string;
  statLabel: string;
  statValue: string;
  changePct: number;
  sparkline: number[];
  icon: 'crypto' | 'forex' | 'stocks' | 'commodities';
};

export type WorkspaceMetric = {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
};

export type CategoryWorkspaceData = {
  headline: string;
  subheadline: string;
  primaryStat: string;
  primaryLabel: string;
  secondaryStat: string;
  secondaryLabel: string;
  chartData: number[];
  metrics: WorkspaceMetric[];
  highlights: string[];
};

export const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'crypto',
    title: 'Cryptocurrency',
    subtitle: 'Digital assets · 24/7',
    statLabel: 'Market cap 24h',
    statValue: '+2.84%',
    changePct: 2.84,
    sparkline: [42, 44, 43, 46, 48, 47, 50, 52, 51, 54, 56, 55, 58, 60],
    icon: 'crypto',
  },
  {
    id: 'forex',
    title: 'Forex',
    subtitle: 'Major pairs · FX',
    statLabel: 'DXY index',
    statValue: '+0.12%',
    changePct: 0.12,
    sparkline: [58, 57, 59, 58, 60, 59, 61, 60, 62, 61, 63, 62, 64, 63],
    icon: 'forex',
  },
  {
    id: 'stocks',
    title: 'Global Stocks',
    subtitle: 'Equities · Indices',
    statLabel: 'S&P 500 YTD',
    statValue: '+8.42%',
    changePct: 8.42,
    sparkline: [38, 40, 39, 42, 44, 43, 46, 48, 50, 49, 52, 54, 53, 56],
    icon: 'stocks',
  },
  {
    id: 'commodities',
    title: 'Commodities',
    subtitle: 'Metals · Energy',
    statLabel: 'Gold spot',
    statValue: '+0.15%',
    changePct: 0.15,
    sparkline: [50, 49, 51, 50, 52, 51, 53, 52, 54, 53, 55, 54, 56, 55],
    icon: 'commodities',
  },
];

export const CATEGORY_WORKSPACES: Record<AssetCategory, CategoryWorkspaceData> = {
  crypto: {
    headline: 'Cryptocurrency Markets',
    subheadline: 'Bitcoin leads risk-on rotation · Altcoin breadth improving',
    primaryStat: '$2.68T',
    primaryLabel: 'Total market cap',
    secondaryStat: '58.2%',
    secondaryLabel: 'BTC dominance',
    chartData: [62, 64, 63, 66, 68, 67, 70, 72, 71, 74, 76, 75, 78, 80, 79, 82],
    metrics: [
      { label: 'Bitcoin (BTC)', value: '$67,240', change: '+1.12%', positive: true },
      { label: 'Ethereum (ETH)', value: '$3,714', change: '-0.36%', positive: false },
      { label: '24h volume', value: '$98.4B', change: '+4.2%', positive: true },
      { label: 'Fear & Greed', value: '62', change: 'Greed', positive: true },
    ],
    highlights: [
      'Spot ETF inflows remain positive for a third consecutive week.',
      'Layer-2 activity accelerating on Ethereum mainnet.',
      'Stablecoin market cap at record highs — liquidity supportive.',
    ],
  },
  forex: {
    headline: 'Foreign Exchange Desk',
    subheadline: 'USD firm on rate differential · Yen intervention risk monitored',
    primaryStat: '104.28',
    primaryLabel: 'USD Index (DXY)',
    secondaryStat: '1.0842',
    secondaryLabel: 'EUR / USD',
    chartData: [55, 54, 56, 55, 57, 56, 58, 57, 59, 58, 60, 59, 61, 60, 62, 61],
    metrics: [
      { label: 'EUR/USD', value: '1.0842', change: '-0.08%', positive: false },
      { label: 'GBP/USD', value: '1.2718', change: '+0.14%', positive: true },
      { label: 'USD/JPY', value: '154.32', change: '+0.22%', positive: true },
      { label: 'Volatility (CVIX)', value: '7.8', change: 'Low', positive: true },
    ],
    highlights: [
      'Fed speakers lean data-dependent; cuts priced for Q4.',
      'ECB holds steady — euro range-bound near 1.08.',
      'Asia session liquidity thin ahead of US CPI release.',
    ],
  },
  stocks: {
    headline: 'Global Equities Overview',
    subheadline: 'Mega-cap tech earnings beat · Europe financials steady',
    primaryStat: '5,842.50',
    primaryLabel: 'S&P 500',
    secondaryStat: '+0.42%',
    secondaryLabel: 'Session change',
    chartData: [48, 50, 49, 52, 54, 53, 56, 58, 57, 60, 62, 61, 64, 66, 65, 68],
    metrics: [
      { label: 'NASDAQ 100', value: '21,112', change: '+0.36%', positive: true },
      { label: 'Dow Jones', value: '42,856', change: '+0.28%', positive: true },
      { label: 'Nikkei 225', value: '39,872', change: '+0.55%', positive: true },
      { label: 'VIX', value: '13.2', change: '-2.1%', positive: true },
    ],
    highlights: [
      'AI infrastructure names lead sector rotation.',
      'Financials outperform in Europe ahead of BoE decision.',
      'Emerging markets see selective inflows on China stimulus.',
    ],
  },
  commodities: {
    headline: 'Commodities & Energy',
    subheadline: 'Gold holds support · Oil range-bound on demand outlook',
    primaryStat: '$2,348.20',
    primaryLabel: 'Gold (XAU/USD)',
    secondaryStat: '$82.45',
    secondaryLabel: 'Brent crude',
    chartData: [52, 51, 53, 52, 54, 53, 55, 54, 56, 55, 57, 56, 58, 57, 59, 58],
    metrics: [
      { label: 'Gold', value: '$2,348', change: '+0.15%', positive: true },
      { label: 'Silver', value: '$27.84', change: '+0.42%', positive: true },
      { label: 'Brent Oil', value: '$82.45', change: '-0.75%', positive: false },
      { label: 'Natural Gas', value: '$2.18', change: '-1.2%', positive: false },
    ],
    highlights: [
      'Central bank gold purchases remain elevated year-to-date.',
      'OPEC+ supply discipline supports crude floor near $80.',
      'Industrial metals mixed on China property data.',
    ],
  },
};
