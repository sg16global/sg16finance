/** Live market data — Binance + CoinGecko (crypto), Yahoo (stocks/commodities), Frankfurter (forex). */

const YAHOO_UA = 'Mozilla/5.0 (compatible; SG16Finance/1.0)';

/** Per-request Yahoo cache — avoids rate limits when many symbols load at once */
let yahooFetch = yahooChart;

function createYahooCache() {
  const cache = new Map();
  return (symbol) => {
    if (!cache.has(symbol)) cache.set(symbol, yahooChart(symbol));
    return cache.get(symbol);
  };
}

function isValidQuote(q) {
  return q && Number.isFinite(q.value) && Number.isFinite(q.changePct);
}

function quoteFromChart(chart) {
  return { value: chart.value, changePct: chart.changePct };
}

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
    const value = parseFloat(d.lastPrice);
    const changePct = parseFloat(d.priceChangePercent);
    if (!Number.isFinite(value) || !Number.isFinite(changePct)) return null;
    return { value, changePct };
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

async function cryptoQuote(binanceSymbol, geckoId, yahooSymbol) {
  const fromBinance = await binance24hr(binanceSymbol);
  if (fromBinance) return fromBinance;
  const markets = await coingeckoMarkets([geckoId]);
  if (markets?.[geckoId]) return markets[geckoId];
  if (yahooSymbol) {
    const y = await yahooFetch(yahooSymbol);
    if (y) return { value: y.value, changePct: y.changePct };
  }
  return null;
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
    yahooFetch('EURUSD=X'),
    yahooFetch('GBPUSD=X'),
    yahooFetch('USDJPY=X'),
    yahooFetch('AUDUSD=X'),
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
  // Yahoo first — reliable on Cloudflare; Binance/CoinGecko often blocked or rate-limited
  const [yBtc, yEth, ySol, yXrp] = await Promise.all([
    yahooFetch('BTC-USD'),
    yahooFetch('ETH-USD'),
    yahooFetch('SOL-USD'),
    yahooFetch('XRP-USD'),
  ]);

  if (isValidQuote(yBtc) && isValidQuote(yEth)) {
    const chartData = yBtc.chartData?.length ? yBtc.chartData : [];
    const quotes = {
      btc: quoteFromChart(yBtc),
      eth: quoteFromChart(yEth),
      sol: isValidQuote(ySol) ? quoteFromChart(ySol) : null,
      xrp: isValidQuote(yXrp) ? quoteFromChart(yXrp) : null,
    };
    return buildCryptoPayload(quotes, chartData);
  }

  const [btc, eth, sol, xrp, btcKlines, cgChart] = await Promise.all([
    binance24hr('BTCUSDT'),
    binance24hr('ETHUSDT'),
    binance24hr('SOLUSDT'),
    binance24hr('XRPUSDT'),
    binanceKlines('BTCUSDT'),
    coingeckoBtcChart(),
  ]);

  let quotes = { btc, eth, sol, xrp };
  let chartData = btcKlines?.slice(-16) ?? [];

  if (!isValidQuote(quotes.btc) || !isValidQuote(quotes.eth)) {
    const geckoIds = CRYPTO_COINS.map((c) => c.gecko);
    const cg = await coingeckoMarkets(geckoIds);
    if (cg?.bitcoin && cg?.ethereum) {
      quotes = {
        btc: cg.bitcoin,
        eth: cg.ethereum,
        sol: cg.solana ?? null,
        xrp: cg.ripple ?? null,
      };
      if (!chartData.length && cgChart?.length) chartData = cgChart.slice(-16);
    }
  }

  if (!isValidQuote(quotes.btc) || !isValidQuote(quotes.eth)) return null;

  if (!isValidQuote(quotes.xrp)) {
    const yXrpRetry = await yahooFetch('XRP-USD');
    if (isValidQuote(yXrpRetry)) quotes.xrp = quoteFromChart(yXrpRetry);
  }

  return buildCryptoPayload(quotes, chartData);
}

function buildCryptoPayload(quotes, chartData) {
  const sparkline = chartData.length >= 2 ? chartData.slice(-14) : [quotes.btc.value, quotes.btc.value];
  return {
    card: {
      statLabel: 'BTC 24h',
      changePct: quotes.btc.changePct,
      sparkline,
    },
    workspace: {
      primaryValue: quotes.btc.value,
      primaryLabel: 'Bitcoin (BTC)',
      secondaryValue: quotes.eth.value,
      secondaryLabel: 'Ethereum (ETH)',
      chartData: chartData.length >= 2 ? chartData : sparkline,
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
    yahooFetch('^GSPC'),
    yahooFetch('^NDX'),
    yahooFetch('^DJI'),
    yahooFetch('^N225'),
    yahooFetch('^VIX'),
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
    yahooFetch('GC=F'),
    yahooFetch('SI=F'),
    yahooFetch('CL=F'),
    yahooFetch('NG=F'),
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
      const q = await yahooFetch(s.sym);
      return q ? { name: s.name, changePct: q.changePct } : null;
    })),
    Promise.all(moverSymbols.map(async (m) => {
      const q = await yahooFetch(m.symbol);
      return q ? { symbol: m.symbol, name: m.name, changePct: q.changePct } : null;
    })),
  ]);

  return {
    sectors: sectors.filter(Boolean),
    movers: movers.filter(Boolean),
  };
}

function decodeXml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim();
}

function parseRssItems(xml, limit = 4) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) && items.length < limit) {
    const block = match[1];
    const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? '';
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? '';
    const title = decodeXml(rawTitle);
    if (title) items.push({ title, url: link, publishedAt: pubDate });
  }
  return items;
}

async function fetchYahooNews(symbol, limit = 4) {
  try {
    const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`;
    const res = await fetch(url, { headers: { 'User-Agent': YAHOO_UA } });
    if (!res.ok) return [];
    return parseRssItems(await res.text(), limit);
  } catch {
    return [];
  }
}

async function fetchMarketHeadlines(limit = 6) {
  try {
    const res = await fetch('https://finance.yahoo.com/news/rssindex', {
      headers: { 'User-Agent': YAHOO_UA },
    });
    if (!res.ok) return [];
    return parseRssItems(await res.text(), limit);
  } catch {
    return [];
  }
}

const NEWS_SYMBOLS = {
  crypto: 'BTC-USD',
  forex: 'EURUSD=X',
  stocks: '^GSPC',
  commodities: 'GC=F',
};

async function fetchCategoryNews() {
  const entries = await Promise.all(
    Object.entries(NEWS_SYMBOLS).map(async ([category, symbol]) => {
      const items = await fetchYahooNews(symbol, 4);
      return [category, items];
    }),
  );
  return Object.fromEntries(entries);
}

async function fetchTicker() {
  const items = [
    { id: 'eth', name: 'Ethereum', fetch: () => cryptoQuote('ETHUSDT', 'ethereum', 'ETH-USD'), category: 'crypto' },
    { id: 'btc', name: 'Bitcoin', fetch: () => cryptoQuote('BTCUSDT', 'bitcoin', 'BTC-USD'), category: 'crypto' },
    { id: 'wti', name: 'WTI Oil', fetch: () => yahooFetch('CL=F'), category: 'commodity' },
    { id: 'gold', name: 'Gold', fetch: () => yahooFetch('GC=F'), category: 'commodity' },
    { id: 'eurusd', name: 'EUR/USD', fetch: () => yahooFetch('EURUSD=X'), category: 'fx' },
    { id: 'nasdaq', name: 'NASDAQ 100', fetch: () => yahooFetch('^NDX'), category: 'index' },
    { id: 'sp500', name: 'S&P 500', fetch: () => yahooFetch('^GSPC'), category: 'index' },
    { id: 'dow', name: 'Dow Jones', fetch: () => yahooFetch('^DJI'), category: 'index' },
    { id: 'nikkei', name: 'Nikkei 225', fetch: () => yahooFetch('^N225'), category: 'index' },
    { id: 'dax', name: 'DAX', fetch: () => yahooFetch('^GDAXI'), category: 'index' },
    { id: 'ftse', name: 'FTSE 100', fetch: () => yahooFetch('^FTSE'), category: 'index' },
    { id: 'hsi', name: 'Hang Seng', fetch: () => yahooFetch('^HSI'), category: 'index' },
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
  yahooFetch = createYahooCache();

  // Load market categories first — crypto needs Yahoo before rate limits kick in
  const [crypto, forex, stocks, commodities] = await Promise.all([
    fetchCrypto(),
    fetchForex(),
    fetchStocks(),
    fetchCommodities(),
  ]);

  const [ticker, insights, news, headlines] = await Promise.all([
    fetchTicker(),
    fetchInsights(),
    fetchCategoryNews(),
    fetchMarketHeadlines(),
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
    news,
    headlines,
  };
}
