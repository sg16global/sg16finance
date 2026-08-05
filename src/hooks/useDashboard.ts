import { useCallback, useEffect, useState } from 'react';
import type { DashboardPayload } from '../types';

const REFRESH_MS = 60_000;

const EMPTY: DashboardPayload = {
  source: 'offline',
  updatedAt: new Date().toISOString(),
  categories: { crypto: null, forex: null, stocks: null, commodities: null },
  ticker: { row1: [], row2: [] },
  insights: { sectors: [], movers: [] },
  news: { crypto: [], forex: [], stocks: [], commodities: [] },
  headlines: [],
};

export function useDashboard() {
  const [data, setData] = useState<DashboardPayload>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) return;
      const payload = (await res.json()) as DashboardPayload;
      if (payload?.categories) setData(payload);
    } catch {
      /* keep last good data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { data, loading, refresh };
}
