import { createContext, useContext, type ReactNode } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import type { DashboardPayload } from '../types';

type DashboardContextValue = ReturnType<typeof useDashboard>;

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const value = useDashboard();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardData(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboardData must be used within DashboardProvider');
  }
  return ctx;
}

export type { DashboardPayload };
