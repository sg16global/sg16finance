const SEED = [
  { id: 'sp500', name: 'S&P 500', region: 'US', value: 5842.5, changePct: 0.42 },
  { id: 'nasdaq', name: 'NASDAQ 100', region: 'US', value: 21245.8, changePct: 0.68 },
  { id: 'ftse', name: 'FTSE 100', region: 'UK', value: 8421.3, changePct: -0.12 },
  { id: 'dax', name: 'DAX', region: 'EU', value: 18456.2, changePct: 0.21 },
  { id: 'nikkei', name: 'Nikkei 225', region: 'JP', value: 39872.4, changePct: 0.55 },
  { id: 'hsi', name: 'Hang Seng', region: 'HK', value: 17842.1, changePct: -0.34 },
];

const FINNHUB = {
  sp500: '^GSPC',
  nasdaq: '^NDX',
  ftse: '^FTSE',
  dax: '^GDAXI',
  nikkei: '^N225',
  hsi: '^HSI',
};

export async function onRequestGet(_request, env) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
    'Access-Control-Allow-Origin': '*',
  };

  if (!env?.FINNHUB_API_KEY) {
    return Response.json({ indices: SEED, source: 'seed' }, { headers });
  }

  try {
    const indices = await Promise.all(
      SEED.map(async (seed) => {
        const sym = FINNHUB[seed.id];
        if (!sym) return seed;
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${env.FINNHUB_API_KEY}`,
        );
        if (!res.ok) return seed;
        const q = await res.json();
        if (!q.c) return seed;
        return { ...seed, value: q.c, changePct: q.dp ?? seed.changePct };
      }),
    );
    return Response.json({ indices, source: 'finnhub' }, { headers });
  } catch {
    return Response.json({ indices: SEED, source: 'seed' }, { headers });
  }
}
