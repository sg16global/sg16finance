/**
 * Catch-all router for sg16finance.com.
 *
 * Pages cannot tell a client-side React Router path from a genuinely missing
 * page, so the old blanket `/* -> /index.html 200` rewrite answered every
 * unknown URL with the app shell. This serves the shell only for paths the
 * router actually defines and a real 404 for everything else.
 *
 * Keep APP_ROUTES and APP_ROUTE_PREFIXES in sync with src/App.tsx.
 */

const APP_ROUTES = new Set([
  '/',
  '/markets',
  '/sectors',
  '/earnings',
  '/about',
  '/disclaimer',
  '/privacy',
  '/contact',
  '/premium',
]);

const APP_ROUTE_PREFIXES = ['/sectors/', '/earnings/'];

function normalise(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '') || '/';
  }
  return pathname;
}

function isAppRoute(pathname) {
  const path = normalise(pathname);
  if (APP_ROUTES.has(path)) return true;
  return APP_ROUTE_PREFIXES.some(
    (prefix) => path.startsWith(prefix) && path.slice(prefix.length).length > 0,
  );
}

async function serveShell(env, url, file, status) {
  const res = await env.ASSETS.fetch(new Request(new URL(file, url), { method: 'GET' }));
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return new Response(res.body, { status, headers });
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  const asset = await env.ASSETS.fetch(request);
  if (asset.status !== 404) return asset;

  if (isAppRoute(url.pathname)) return serveShell(env, url, '/index.html', 200);
  return serveShell(env, url, '/404.html', 404);
}
