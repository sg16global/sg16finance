/** Live market data — Binance + CoinGecko (crypto), Yahoo (stocks/commodities), Frankfurter (forex). */

const YAHOO_UA = 'Mozilla/5.0 (compatible; SG16Finance/1.0)';

const CRYPTO_COINS = [
  { binance: 'BTCUSDT', gecko: 'bitcoin', label: 'Bitcoin (BTC)' },
  { binance: 'ETHUSDT', gecko: 'ethereum', label: 'Ethereum (ETH)' },
  { binance: 'SOLUSDT', gecko: 'solana', label: 'Solana (SOL)' },
  { binance: 'XRPUSDT', gecko: 'ripple', label: 'XRP (XRP)' },
];

async function yahooChart(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo`;
    const res = await fetch(url, { headers: { 'User-Agent': YAHOO_UA } });
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta ?? {};
    const closes = (result.indicators?.quote?.[0]?.close ?? []).filter((v) => v != null);
    if (!closes.length) return null;

    const value = meta.regularMarketPrice ?? closes[closes.length - 1];
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? closes[closes.length - 2] ?? value;
    const changePct =
      meta.regularMarketChangePercent ??
      (prevClose ? ((value - prevClose) / prevClose) * 100 : 0);

    return { value, changePct, chartData: closes.slice(-16) };
  } catch {
    return null;
  }
}

async function binance24hr(symbol) {
  try {
    const res = await fetch(`https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`);
    if (!res.ok) return null;
    const d = await res.json();
    return {
      value: parseFloat(d.lastPrice),
      changePct: parseFloat(d.priceChangePercent),
    };
  } catch {
    return null;
  }
}

async function binanceKlines(symbol, limit = 30) {
  try {
    const res = await fetch(
      `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=1d&limit=${limit}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    return data.map((k) => parseFloat(k[4]));
  } catch {
    return null;
  }
}

/** CoinGecko fallback — works from Cloudflare edge when Binance is blocked */
async function coingeckoMarkets(ids) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&sparkline=false&price_change_percentage=24h`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    const map = {};
    for (const coin of data) {
      map[coin.id] = {
        value: coin.current_price,
        changePct: coin.price_change_percentage_24h ?? 0,
      };
    }
    return map;
  } catch {
    return null;
  }
}

async function coingeckoBtcChart() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily',
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const prices = data?.prices;
    if (!Array.isArray(prices) || prices.length < 4) return null;
    return prices.map((p) => p[1]);
  } catch {
    return null;
  }
}

async function cryptoQuote(binanceSymbol, geckoId) {
  const fromBinance = await binance24hr(binanceSymbol);
  if (fromBinance) return fromBinance;
  const markets = await coingeckoMarkets([geckoId]);
  return markets?.[geckoId] ?? null;
}

async function frankfurterHistory(days = 30) {
  try {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const res = await fetch(
      `https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=USD&to=EUR,GBP,JPY,AUD`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const dates = Object.keys(data.rates ?? {}).sort();
    if (!dates.length) return null;

    const series = { eurusd: [], gbpusd: [], usdjpy: [], audusd: [] };
    for (const date of dates) {
      const r = data.rates[date];
      if (r.EUR) series.eurusd.push(1 / r.EUR);
      if (r.GBP) series.gbpusd.push(1 / r.GBP);
      if (r.JPY) series.usdjpy.push(r.JPY);
      if (r.AUD) series.audusd.push(1 / r.AUD);
    }

    const latest = dates[dates.length - 1];
    const prev = dates[dates.length - 2];
    const latestRates = data.rates[latest];
    const prevRates = prev ? data.rates[prev] : latestRates;

    const pct = (curr, prevVal) => (prevVal ? ((curr - prevVal) / prevVal) * 100 : 0);

    return {
      eurusd: {
        value: 1 / latestRates.EUR,
        changePct: pct(1 / latestRates.EUR, 1 / prevRates.EUR),
        chartData: series.eurusd.slice(-16),
      },
      gbpusd: {
        value: 1 / latestRates.GBP,
        changePct: pct(1 / latestRates.GBP, 1 / prevRates.GBP),
        chartData: series.gbpusd.slice(-16),
      },
      usdjpy: {
        value: latestRates.JPY,
        changePct: pct(latestRates.JPY, prevRates.JPY),
        chartData: series.usdjpy.slice(-16),
      },
      audusd: {
        value: 1 / latestRates.AUD,
        changePct: pct(1 / latestRates.AUD, 1 / prevRates.AUD),
        chartData: series.audusd.slice(-16),
      },
    };
  } catch {
    return null;
  }
}

async function fetchForex() {
  const [yahooEur, yahooGbp, yahooJpy, yahooAud, frank] = await Promise.all([
    yahooChart('EURUSD=X'),
    yahooChart('GBPUSD=X'),
    yahooChart('USDJPY=X'),
    yahooChart('AUDUSD=X'),
    frankfurterHistory(),
  ]);

  const eur = yahooEur ?? frank?.eurusd;
  const gbp = yahooGbp ?? frank?.gbpusd;
  const jpy = yahooJpy ?? frank?.usdjpy;
  const aud = yahooAud ?? frank?.audusd;

  if (!eur) return null;

  return {
    card: { statLabel: 'EUR/USD', changePct: eur.changePct, sparkline: eur.chartData.slice(-14) },
    workspace: {
      primaryValue: eur.value,
      primaryLabel: 'EUR / USD',
      secondaryValue: gbp?.value ?? 0,
      secondaryLabel: 'GBP / USD',
      chartData: eur.chartData,
      metrics: [
        { label: 'EUR/USD', value: eur.value, changePct: eur.changePct },
        { label: 'GBP/USD', value: gbp?.value ?? 0, changePct: gbp?.changePct ?? 0 },
        { label: 'USD/JPY', value: jpy?.value ?? 0, changePct: jpy?.changePct ?? 0 },
        { label: 'AUD/USD', value: aud?.value ?? 0, changePct: aud?.changePct ?? 0 },
      ],
    },
  };
}

async function fetchCrypto() {
  const [btc, eth, sol, xrp, btcKlines, cgChart] = await Promise.all([
    binance24hr('BTCUSDT'),
    binance24hr('ETHUSDT'),
    binance24hr('SOLUSDT'),
    binance24hr('XRPUSDT'),
    binanceKlines('BTCUSDT'),
    coingeckoBtcChart(),
  ]);

  let quotes = { btc, eth, sol, xrp };

  if (!btc || !eth) {
    const geckoIds = CRYPTO_COINS.map((c) => c.gecko);
    const cg = await coingeckoMarkets(geckoIds);
    if (!cg) return null;
    quotes = {
      btc: cg.bitcoin ?? null,
      eth: cg.ethereum ?? null,
      sol: cg.solana ?? null,
      xrp: cg.ripple ?? null,
    };
    if (!quotes.btc || !quotes.eth) return null;
  }

  const chartData = (btcKlines?.length ? btcKlines : cgChart)?.slice(-16) ?? [];

  return {
    card: {
      statLabel: 'BTC 24h',
      changePct: quotes.btc.changePct,
      sparkline: chartData.slice(-14),
    },
    workspace: {
      primaryValue: quotes.btc.value,
      primaryLabel: 'Bitcoin (BTC)',
      secondaryValue: quotes.eth.value,
      secondaryLabel: 'Ethereum (ETH)',
      chartData,
      metrics: [
        { label: 'Bitcoin (BTC)', value: quotes.btc.value, changePct: quotes.btc.changePct },
        { label: 'Ethereum (ETH)', value: quotes.eth.value, changePct: quotes.eth.changePct },
        { label: 'Solana (SOL)', value: quotes.sol?.value ?? 0, changePct: quotes.sol?.changePct ?? 0 },
        { label: 'XRP (XRP)', value: quotes.xrp?.value ?? 0, changePct: quotes.xrp?.changePct ?? 0 },
      ],
    },
  };
}

async function fetchStocks() {
  const [sp500, nasdaq, dow, nikkei, vix] = await Promise.all([
    yahooChart('^GSPC'),
    yahooChart('^NDX'),
    yahooChart('^DJI'),
    yahooChart('^N225'),
    yahooChart('^VIX'),
  ]);

  if (!sp500) return null;

  return {
    card: { statLabel: 'S&P 500', changePct: sp500.changePct, sparkline: sp500.chartData.slice(-14) },
    workspace: {
      primaryValue: sp500.value,
      primaryLabel: 'S&P 500',
      secondaryValue: sp500.changePct,
      secondaryLabel: 'Session change',
      secondaryIsPct: true,
      chartData: sp500.chartData,
      metrics: [
        { label: 'NASDAQ 100', value: nasdaq?.value ?? 0, changePct: nasdaq?.changePct ?? 0 },
        { label: 'Dow Jones', value: dow?.value ?? 0, changePct: dow?.changePct ?? 0 },
        { label: 'Nikkei 225', value: nikkei?.value ?? 0, changePct: nikkei?.changePct ?? 0 },
        { label: 'VIX', value: vix?.value ?? 0, changePct: vix?.changePct ?? 0 },
      ],
    },
  };
}

async function fetchCommodities() {
  const [gold, silver, oil, gas] = await Promise.all([
    yahooChart('GC=F'),
    yahooChart('SI=F'),
    yahooChart('CL=F'),
    yahooChart('NG=F'),
  ]);

  if (!gold) return null;

  return {
    card: { statLabel: 'Gold spot', changePct: gold.changePct, sparkline: gold.chartData.slice(-14) },
    workspace: {
      primaryValue: gold.value,
      primaryLabel: 'Gold (XAU/USD)',
      secondaryValue: oil?.value ?? 0,
      secondaryLabel: 'WTI crude',
      chartData: gold.chartData,
      metrics: [
        { label: 'Gold', value: gold.value, changePct: gold.changePct },
        { label: 'Silver', value: silver?.value ?? 0, changePct: silver?.changePct ?? 0 },
        { label: 'WTI Oil', value: oil?.value ?? 0, changePct: oil?.changePct ?? 0 },
        { label: 'Natural Gas', value: gas?.value ?? 0, changePct: gas?.changePct ?? 0 },
      ],
    },
  };
}

async function fetchInsights() {
  const sectorSymbols = [
    { name: 'Technology', sym: 'XLK' },
    { name: 'Energy', sym: 'XLE' },
    { name: 'Financials', sym: 'XLF' },
    { name: 'Healthcare', sym: 'XLV' },
  ];
  const moverSymbols = [
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'MSFT', name: 'Microsoft' },
  ];

  const [sectors, movers] = await Promise.all([
    Promise.all(sectorSymbols.map(async (s) => {
      const q = await yahooChart(s.sym);
      return q ? { name: s.name, changePct: q.changePct } : null;
    })),
    Promise.all(moverSymbols.map(async (m) => {
      const q = await yahooChart(m.symbol);
      return q ? { symbol: m.symbol, name: m.name, changePct: q.changePct } : null;
    })),
  ]);

  return {
    sectors: sectors.filter(Boolean),
    movers: movers.filter(Boolean),
  };
}

async function fetchTicker() {
  const items = [
    { id: 'eth', name: 'Ethereum', fetch: () => cryptoQuote('ETHUSDT', 'ethereum'), category: 'crypto' },
    { id: 'btc', name: 'Bitcoin', fetch: () => cryptoQuote('BTCUSDT', 'bitcoin'), category: 'crypto' },
    { id: 'wti', name: 'WTI Oil', fetch: () => yahooChart('CL=F'), category: 'commodity' },
    { id: 'gold', name: 'Gold', fetch: () => yahooChart('GC=F'), category: 'commodity' },
    { id: 'eurusd', name: 'EUR/USD', fetch: () => yahooChart('EURUSD=X'), category: 'fx' },
    { id: 'nasdaq', name: 'NASDAQ 100', fetch: () => yahooChart('^NDX'), category: 'index' },
    { id: 'sp500', name: 'S&P 500', fetch: () => yahooChart('^GSPC'), category: 'index' },
    { id: 'dow', name: 'Dow Jones', fetch: () => yahooChart('^DJI'), category: 'index' },
    { id: 'nikkei', name: 'Nikkei 225', fetch: () => yahooChart('^N225'), category: 'index' },
    { id: 'dax', name: 'DAX', fetch: () => yahooChart('^GDAXI'), category: 'index' },
    { id: 'ftse', name: 'FTSE 100', fetch: () => yahooChart('^FTSE'), category: 'index' },
    { id: 'hsi', name: 'Hang Seng', fetch: () => yahooChart('^HSI'), category: 'index' },
  ];

  const results = await Promise.all(
    items.map(async (item) => {
      const q = await item.fetch();
      return q ? { id: item.id, name: item.name, value: q.value, changePct: q.changePct, category: item.category } : null;
    }),
  );

  const live = results.filter(Boolean);
  return {
    row1: live.slice(0, 6),
    row2: live.slice(6),
  };
}

export async function buildDashboard() {
  const [crypto, forex, stocks, commodities, ticker, insights] = await Promise.all([
    fetchCrypto(),
    fetchForex(),
    fetchStocks(),
    fetchCommodities(),
    fetchTicker(),
    fetchInsights(),
  ]);

  const categories = { crypto, forex, stocks, commodities };
  const loaded = Object.values(categories).filter(Boolean).length;
  const source = loaded === 4 ? 'live' : loaded > 0 ? 'partial' : 'offline';

  return {
    source,
    updatedAt: new Date().toISOString(),
    categories,
    ticker,
    insights,
  };
}
