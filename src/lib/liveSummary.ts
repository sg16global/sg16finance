import type { AssetCategory } from '../data/assetCategories';
import type { LiveCategoryData } from '../types';
import { formatPct } from './format';

/** One-line live summary from real metrics — replaces static subheadline */
export function buildLiveSummary(category: AssetCategory, ws: LiveCategoryData['workspace']): string {
  const m = ws.metrics;

  switch (category) {
    case 'crypto': {
      const btc = m.find((x) => x.label.includes('Bitcoin'));
      const eth = m.find((x) => x.label.includes('Ethereum'));
      const parts = [];
      if (btc) parts.push(`BTC ${formatPct(btc.changePct)}`);
      if (eth) parts.push(`ETH ${formatPct(eth.changePct)}`);
      return parts.length ? `${parts.join(' · ')} · Live digital asset session` : 'Live cryptocurrency markets';
    }
    case 'forex': {
      const eur = m.find((x) => x.label.includes('EUR'));
      const jpy = m.find((x) => x.label.includes('JPY'));
      const parts = [];
      if (eur) parts.push(`EUR/USD ${formatPct(eur.changePct)}`);
      if (jpy) parts.push(`USD/JPY ${formatPct(jpy.changePct)}`);
      return parts.length ? `${parts.join(' · ')} · Major FX pairs` : 'Live foreign exchange desk';
    }
    case 'stocks': {
      const ndx = m.find((x) => x.label.includes('NASDAQ'));
      const vix = m.find((x) => x.label.includes('VIX'));
      const parts = [];
      if (ws.secondaryIsPct) parts.push(`S&P ${formatPct(ws.secondaryValue)}`);
      if (ndx) parts.push(`NASDAQ ${formatPct(ndx.changePct)}`);
      if (vix) parts.push(`VIX ${formatPct(vix.changePct)}`);
      return parts.join(' · ') || 'Live global equities overview';
    }
    case 'commodities': {
      const gold = m.find((x) => x.label.toLowerCase().includes('gold'));
      const oil = m.find((x) => x.label.toLowerCase().includes('oil'));
      const parts = [];
      if (gold) parts.push(`Gold ${formatPct(gold.changePct)}`);
      if (oil) parts.push(`Oil ${formatPct(oil.changePct)}`);
      return parts.length ? `${parts.join(' · ')} · Metals & energy` : 'Live commodities & energy';
    }
    default:
      return 'Live market workspace';
  }
}
