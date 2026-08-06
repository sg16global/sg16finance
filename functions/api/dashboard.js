import { buildDashboard } from '../../lib/dashboard-data.mjs';

export async function onRequestGet(_request) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=90, stale-while-revalidate=120',
    'Access-Control-Allow-Origin': '*',
  };

  const payload = await buildDashboard();
  return Response.json(payload, { headers });
}
