import { buildDashboard } from '../../lib/dashboard-data.mjs';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequestGet(_request) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=90, stale-while-revalidate=120',
    'Access-Control-Allow-Origin': '*',
  };

  const payload = await buildDashboard();
  return Response.json(payload, { headers });
}
