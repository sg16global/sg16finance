import { useEffect, useState } from 'react';
import { MARKETS } from '../data/markets';
import type { MarketIndex } from '../types';

export function useMarkets() {
  const [markets, setMarkets] = useState<MarketIndex[]>(MARKETS);

  useEffect(() => {
    fetch('/api/quotes')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.indices) && data.indices.length) {
          setMarkets(data.indices);
        }
      })
      .catch(() => undefined);
  }, []);

  return markets;
}
