import type { EarningsReport } from '../types';

export const EARNINGS: EarningsReport[] = [
  {
    symbol: 'AAPL',
    company: 'Apple',
    quarter: 'Q2 FY2026',
    headline: 'Services growth offsets modest iPhone softness',
    revenue: '$94.2B',
    eps: '$1.42',
    beatMiss: 'Revenue in-line · EPS slightly above consensus',
    summary:
      'Apple leaned on services and installed-base expansion while hardware reflected a mature upgrade cycle. Management emphasized on-device AI features rolling out globally.',
    takeaways: [
      'Services margin remains the quality anchor.',
      'China demand mixed — guidance is the next catalyst.',
      'Capital return continues at scale via buybacks.',
      'Educational summary only — not a recommendation.',
    ],
  },
  {
    symbol: 'MSFT',
    company: 'Microsoft',
    quarter: 'Q4 FY2026',
    headline: 'Azure acceleration drives cloud beat',
    revenue: '$72.8B',
    eps: '$3.18',
    beatMiss: 'Revenue beat · EPS beat',
    summary:
      'Cloud and AI workloads lifted Azure. Office 365 commercial seats grew steadily while capex rose to expand AI datacenter capacity.',
    takeaways: [
      'Market focus: AI revenue, not just capex.',
      'Productivity suite margins remain strong.',
      'Watch EU/US regulatory headlines.',
      'Educational summary only — not a recommendation.',
    ],
  },
  {
    symbol: 'NVDA',
    company: 'NVIDIA',
    quarter: 'Q1 FY2027',
    headline: 'Data-center demand elevated; supply improving',
    revenue: '$38.5B',
    eps: '$4.92',
    beatMiss: 'Revenue beat · EPS beat',
    summary:
      'AI accelerator demand stayed strong. Lead times improved as customers digest prior GPU deployments.',
    takeaways: [
      'Hyperscaler capex sets the next leg.',
      'Custom silicon competition is a medium-term theme.',
      'Valuation assumes sustained growth — expect volatility.',
      'Educational summary only — not a recommendation.',
    ],
  },
  {
    symbol: 'HSBA',
    company: 'HSBC',
    quarter: 'Q2 2026',
    headline: 'Asia wealth flows lift fee income',
    revenue: '$16.1B',
    eps: '$0.38',
    beatMiss: 'Overall in-line',
    summary:
      'HSBC highlighted wealth management in Hong Kong and UK commercial banking. Credit provisions stayed manageable.',
    takeaways: [
      'UK + Asia footprint is the strategic edge.',
      'Rate cuts would pressure net interest income.',
      'Buybacks signal capital confidence.',
      'Educational summary only — not a recommendation.',
    ],
  },
];

export function earningsBySymbol(symbol: string) {
  return EARNINGS.find((e) => e.symbol.toLowerCase() === symbol.toLowerCase());
}
