import { useEffect, useState } from 'react';
import { TICKER_ROW_1, TICKER_ROW_2 } from '../data/ticker';
import type { TickerItem } from '../types';

export function useTickerRows() {
  const [row1, setRow1] = useState<TickerItem[]>(TICKER_ROW_1);
  const [row2, setRow2] = useState<TickerItem[]>(TICKER_ROW_2);

  useEffect(() => {
    fetch('/api/ticker')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.row1) && data.row1.length) setRow1(data.row1);
        if (Array.isArray(data?.row2) && data.row2.length) setRow2(data.row2);
      })
      .catch(() => undefined);
  }, []);

  return { row1, row2 };
}
