import type { Sector } from '../types';

export const SECTORS: Sector[] = [
  {
    slug: 'technology',
    name: 'Technology',
    tagline: 'Software, chips, cloud & AI',
    summary:
      'The global tech sector sets the tone for growth stocks. Investors watch capex cycles, AI monetization, and rate sensitivity more than any other group.',
    drivers: ['AI infrastructure spend', 'Cloud growth', 'Interest rates', 'USD moves', 'Export controls'],
    keyPlayers: ['Apple', 'Microsoft', 'NVIDIA', 'Amazon', 'Alphabet', 'TSMC'],
    risks: ['Rich valuations', 'Regulation', 'Demand digestion after hype', 'Supply chain shocks'],
    outlook: 'Winners will show revenue from AI products, not just GPU shipments. Earnings quality beats narrative.',
  },
  {
    slug: 'energy',
    name: 'Energy',
    tagline: 'Oil, gas & integrated majors',
    summary:
      'Energy equities track crude prices, OPEC+ policy, and geopolitical supply risk. They also influence global inflation expectations.',
    drivers: ['Oil price', 'OPEC+ output', 'Refining margins', 'Geopolitics', 'Transition policy'],
    keyPlayers: ['ExxonMobil', 'Chevron', 'Shell', 'BP', 'TotalEnergies'],
    risks: ['Oil price collapse', 'Windfall taxes', 'Long-term demand debate', 'ESG outflows'],
    outlook: 'Volatile but essential for macro context. Pair commodity charts with company discipline on returns.',
  },
  {
    slug: 'financials',
    name: 'Financials',
    tagline: 'Banks, insurers & payments',
    summary:
      'Financials reflect credit conditions and central bank policy. UK and Asian banks add regional rate and FX angles global investors often miss.',
    drivers: ['Policy rates', 'Loan growth', 'Credit losses', 'Capital rules', 'FX volatility'],
    keyPlayers: ['JPMorgan', 'HSBC', 'Goldman Sachs', 'Visa', 'Mastercard'],
    risks: ['Recession defaults', 'Commercial real estate', 'Regulatory fines', 'Deposit competition'],
    outlook: 'Net interest income fades as rates fall; fee income and cost control become the differentiators.',
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    tagline: 'Pharma, biotech & services',
    summary:
      'Often treated as defensive, healthcare still swings on pipelines, approvals, and reimbursement policy — especially in the US and EU.',
    drivers: ['Drug pipelines', 'FDA/EMA approvals', 'Pricing policy', 'Demographics', 'GLP-1 demand'],
    keyPlayers: ['UnitedHealth', 'J&J', 'Pfizer', 'Roche', 'Eli Lilly'],
    risks: ['Patent cliffs', 'Trial failures', 'Litigation', 'Reimbursement cuts'],
    outlook: 'Aging populations support demand; stock selection hinges on pipeline depth and margin durability.',
  },
  {
    slug: 'consumer',
    name: 'Consumer',
    tagline: 'Staples & discretionary retail',
    summary:
      'Consumer names reveal household confidence worldwide. Staples offer stability; discretionary names amplify economic cycles.',
    drivers: ['Employment', 'Goods inflation', 'China consumption', 'Input costs', 'Tourism'],
    keyPlayers: ['Walmart', 'Costco', 'LVMH', 'Nike', 'Toyota'],
    risks: ['Weak spending', 'Inventory gluts', 'Currency headwinds', 'Private label pressure'],
    outlook: 'Regional income trends matter as much as global brands — watch US, Europe, and Asia separately.',
  },
  {
    slug: 'industrials',
    name: 'Industrials',
    tagline: 'Manufacturing, aerospace & infrastructure',
    summary:
      'Industrials bridge the real economy and equity markets — orders, backlogs, and PMI data often lead earnings revisions.',
    drivers: ['PMI / ISM', 'Cap goods orders', 'Freight rates', 'Government infrastructure', 'USD'],
    keyPlayers: ['GE Aerospace', 'Siemens', 'Honeywell', 'CAT', 'Airbus'],
    risks: ['Cycle downturn', 'Supply chain bottlenecks', 'Labor costs', 'China industrial slowdown'],
    outlook: 'Reshoring and energy transition capex support select names; breadth depends on global PMI recovery.',
  },
];

export function sectorBySlug(slug: string) {
  return SECTORS.find((s) => s.slug === slug);
}
