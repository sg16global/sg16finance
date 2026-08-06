import { useCallback, useEffect, useState } from 'react';
import type { DashboardPayload } from '../types';

const REFRESH_MS = 60_000;
const CACHE_KEY = 'sg16finance_dashboard_v1';
const CACHE_TTL_MS = 120_000;

const EMPTY: DashboardPayload = {
  source: 'offline',
  updatedAt: new Date().toISOString(),
  categories: { crypto: null, forex: null, stocks: null, commodities: null },
  ticker: { row1: [], row2: [] },
  insights: { sectors: [], movers: [] },
  news: { crypto: [], forex: [], stocks: [], commodities: [] },
  headlines: [],
};

function readCachedDashboard(): DashboardPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { savedAt, payload } = JSON.parse(raw) as { savedAt: number; payload: DashboardPayload };
    if (Date.now() - savedAt > CACHE_TTL_MS || !payload?.categories) return null;
    return payload;
  } catch {
    return null;
  }
}

function writeCachedDashboard(payload: DashboardPayload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), payload }));
  } catch {
    /* quota / private mode */
  }
}

export function useDashboard() {
  const [data, setData] = useState<DashboardPayload>(() => readCachedDashboard() ?? EMPTY);
  const [loading, setLoading] = useState(() => readCachedDashboard() == null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-cache' });
      if (!res.ok) return;
      const payload = (await res.json()) as DashboardPayload;
      if (payload?.categories) {
        setData(payload);
        writeCachedDashboard(payload);
      }
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
