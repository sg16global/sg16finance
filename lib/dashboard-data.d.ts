export type DashboardBuildResult = {
  source: string;
  updatedAt: string;
  categories: Record<string, unknown>;
  ticker: { row1: unknown[]; row2: unknown[] };
};

export function buildDashboard(apiKey?: string): Promise<DashboardBuildResult>;
