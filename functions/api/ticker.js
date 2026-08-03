const ROW1 = [
  { id: 'eth', name: 'Ethereum', value: 3714, changePct: -0.36, category: 'crypto' },
  { id: 'btc', name: 'Bitcoin', value: 67240, changePct: 1.12, category: 'crypto' },
  { id: 'brent', name: 'Brent Oil', value: 82.45, changePct: -0.75, category: 'commodity' },
  { id: 'gold', name: 'Gold', value: 2348.2, changePct: 0.15, category: 'commodity' },
  { id: 'dxy', name: 'USD Index', value: 104.28, changePct: 0.12, category: 'fx' },
  { id: 'nasdaq', name: 'NASDAQ 100', value: 21112.32, changePct: 0.36, category: 'index' },
];

const ROW2 = [
  { id: 'sp500', name: 'S&P 500', value: 5842.5, changePct: 0.42, category: 'index' },
  { id: 'dow', name: 'Dow Jones', value: 42856.3, changePct: 0.28, category: 'index' },
  { id: 'nikkei', name: 'Nikkei 225', value: 39872.4, changePct: 0.55, category: 'index' },
  { id: 'dax', name: 'DAX', value: 18456.2, changePct: 0.21, category: 'index' },
  { id: 'ftse', name: 'FTSE 100', value: 8421.3, changePct: -0.12, category: 'index' },
  { id: 'hsi', name: 'Hang Seng', value: 17842.1, changePct: -0.34, category: 'index' },
];

const FINNHUB = {
  eth: 'BINANCE:ETHUSDT',
  btc: 'BINANCE:BTCUSDT',
  nasdaq: '^NDX',
  sp500: '^GSPC',
  dow: '^DJI',
  nikkei: '^N225',
  dax: '^GDAXI',
  ftse: '^FTSE',
  hsi: '^HSI',
};

async function quote(symbol, token) {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
  );
  if (!res.ok) return null;
  const q = await res.json();
  if (!q.c) return null;
  return { value: q.c, changePct: q.dp ?? 0 };
}

async function hydrate(items, token) {
  return Promise.all(
    items.map(async (item) => {
      const sym = FINNHUB[item.id];
      if (!sym || !token) return item;
      try {
        const live = await quote(sym, token);
        return live ? { ...item, value: live.value, changePct: live.changePct } : item;
      } catch {
        return item;
      }
    }),
  );
}

export async function onRequestGet(context) {
  const env = context.env;
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
    'Access-Control-Allow-Origin': '*',
  };

  if (!env?.FINNHUB_API_KEY) {
    return Response.json({ row1: ROW1, row2: ROW2, source: 'seed' }, { headers });
  }

  try {
    const [row1, row2] = await Promise.all([
      hydrate(ROW1, env.FINNHUB_API_KEY),
      hydrate(ROW2, env.FINNHUB_API_KEY),
    ]);
    return Response.json({ row1, row2, source: 'finnhub' }, { headers });
  } catch {
    return Response.json({ row1: ROW1, row2: ROW2, source: 'seed' }, { headers });
  }
}
