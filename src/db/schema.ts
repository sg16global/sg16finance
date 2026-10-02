import { pgTable, text, timestamp, serial, numeric, boolean, jsonb } from "drizzle-orm/pg-core";

export const marketAssets = pgTable("market_assets", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'equities' | 'tech-ai' | 'macro-commodities' | 'crypto' | 'forex' | 'bonds'
  price: numeric("price", { precision: 14, scale: 4 }).notNull(),
  change: numeric("change", { precision: 14, scale: 4 }).notNull(),
  changePercent: numeric("change_percent", { precision: 8, scale: 4 }).notNull(),
  high24h: numeric("high_24h", { precision: 14, scale: 4 }),
  low24h: numeric("low_24h", { precision: 14, scale: 4 }),
  volume: text("volume"),
  marketCap: text("market_cap"),
  peRatio: numeric("pe_ratio", { precision: 8, scale: 2 }),
  dividendYield: numeric("dividend_yield", { precision: 6, scale: 2 }),
  sparkline: jsonb("sparkline").$type<number[]>(),
  aiSentiment: text("ai_sentiment"), // 'Bullish' | 'Neutral' | 'Bearish' | 'Extreme Greed' | 'Oversold'
  aiSummary: text("ai_summary"),
  exchange: text("exchange"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  marketWeightPercent: numeric("market_weight_percent", { precision: 5, scale: 2 }).notNull(),
  change1D: numeric("change_1d", { precision: 6, scale: 2 }).notNull(),
  change1M: numeric("change_1m", { precision: 6, scale: 2 }).notNull(),
  change1Y: numeric("change_1y", { precision: 6, scale: 2 }).notNull(),
  peRatio: numeric("pe_ratio", { precision: 6, scale: 2 }).notNull(),
  dividendYield: numeric("dividend_yield", { precision: 5, scale: 2 }).notNull(),
  topHoldings: jsonb("top_holdings").$type<{ symbol: string; name: string; weight: string; price: number; change: number }[]>(),
  macroCatalysts: jsonb("macro_catalysts").$type<string[]>(),
  aiOutlook: text("ai_outlook").notNull(),
  aiRating: text("ai_rating").notNull(), // 'Overweight' | 'Equal Weight' | 'Underweight'
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const earningsReports = pgTable("earnings_reports", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  companyName: text("company_name").notNull(),
  sector: text("sector").notNull(),
  reportDate: text("report_date").notNull(),
  fiscalPeriod: text("fiscal_period").notNull(), // e.g. "Q4 2024" or "Q1 2025"
  epsEstimate: numeric("eps_estimate", { precision: 8, scale: 2 }).notNull(),
  epsActual: numeric("eps_actual", { precision: 8, scale: 2 }),
  revenueEstimate: text("revenue_estimate").notNull(),
  revenueActual: text("revenue_actual"),
  beatStatus: text("beat_status").notNull(), // 'Beat' | 'Miss' | 'Inline' | 'Upcoming'
  surprisePercent: numeric("surprise_percent", { precision: 6, scale: 2 }),
  plainEnglishSummary: text("plain_english_summary").notNull(),
  marketReactionReason: text("market_reaction_reason").notNull(),
  guidanceSentiment: text("guidance_sentiment").notNull(), // 'Bullish' | 'Cautious' | 'Neutral' | 'Strong Expansion'
  catalysts: jsonb("catalysts").$type<string[]>(),
  keyTakeaways: jsonb("key_takeaways").$type<string[]>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  tier: text("tier").default("VIP Pro").notNull(), // 'Free' | 'VIP Pro' | 'Institutional' | 'Sovereign'
  subject: text("subject").notNull(),
  category: text("category").notNull(), // 'Terminal & Data' | 'API Access' | 'Portfolio Model' | 'Billing' | 'Market Inquiry'
  message: text("message").notNull(),
  status: text("status").default("AI Resolved").notNull(), // 'AI Resolved' | 'Investigating' | 'Closed'
  priority: text("priority").default("High").notNull(),
  aiResponse: text("ai_response"),
  aiConfidence: numeric("ai_confidence", { precision: 5, scale: 2 }).default("98.5"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userWatchlist = pgTable("user_watchlist", {
  id: serial("id").primaryKey(),
  userId: text("user_id").default("guest_institutional_user").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  priceAtAdd: numeric("price_at_add", { precision: 14, scale: 4 }).notNull(),
  targetPrice: numeric("target_price", { precision: 14, scale: 4 }),
  notes: text("notes"),
  alertCondition: text("alert_condition"), // 'above' | 'below' | 'change_3pct'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketAlerts = pgTable("market_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  symbol: text("symbol"),
  severity: text("severity").notNull(), // 'urgent' | 'high' | 'info'
  category: text("category").notNull(), // 'Central Bank' | 'Earnings' | 'Volatility' | 'Breakout'
  message: text("message").notNull(),
  timestampStr: text("timestamp_str").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
