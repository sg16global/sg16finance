// @ts-nocheck
import type { Plugin } from 'vite';
import { buildDashboard } from './lib/dashboard-data.mjs';

export function devDashboardApi(): Plugin {
  return {
    name: 'dev-dashboard-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/dashboard' && !req.url?.startsWith('/api/dashboard?')) {
          next();
          return;
        }

        try {
          const payload = await buildDashboard();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(payload));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'dashboard failed' }));
        }
      });
    },
  };
}
