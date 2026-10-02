import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const marketAssets = sqliteTable("market_assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: text("price").notNull(),
  change: text("change").notNull(),
  changePercent: text("change_percent").notNull(),
  high24h: text("high_24h"),
  low24h: text("low_24h"),
  volume: text("volume"),
  marketCap: text("market_cap"),
  peRatio: text("pe_ratio"),
  dividendYield: text("dividend_yield"),
  sparkline: text("sparkline", { mode: "json" }).$type<number[]>(),
  aiSentiment: text("ai_sentiment"),
  aiSummary: text("ai_summary"),
  exchange: text("exchange"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sectors = sqliteTable("sectors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  marketWeightPercent: text("market_weight_percent").notNull(),
  change1D: text("change_1d").notNull(),
  change1M: text("change_1m").notNull(),
  change1Y: text("change_1y").notNull(),
  peRatio: text("pe_ratio").notNull(),
  dividendYield: text("dividend_yield").notNull(),
  topHoldings: text("top_holdings", { mode: "json" }).$type<
    { symbol: string; name: string; weight: string; price: number; change: number }[]
  >(),
  macroCatalysts: text("macro_catalysts", { mode: "json" }).$type<string[]>(),
  aiOutlook: text("ai_outlook").notNull(),
  aiRating: text("ai_rating").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const earningsReports = sqliteTable("earnings_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull(),
  companyName: text("company_name").notNull(),
  sector: text("sector").notNull(),
  reportDate: text("report_date").notNull(),
  fiscalPeriod: text("fiscal_period").notNull(),
  epsEstimate: text("eps_estimate").notNull(),
  epsActual: text("eps_actual"),
  revenueEstimate: text("revenue_estimate").notNull(),
  revenueActual: text("revenue_actual"),
  beatStatus: text("beat_status").notNull(),
  surprisePercent: text("surprise_percent"),
  plainEnglishSummary: text("plain_english_summary").notNull(),
  marketReactionReason: text("market_reaction_reason").notNull(),
  guidanceSentiment: text("guidance_sentiment").notNull(),
  catalysts: text("catalysts", { mode: "json" }).$type<string[]>(),
  keyTakeaways: text("key_takeaways", { mode: "json" }).$type<string[]>(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const supportTickets = sqliteTable("support_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  tier: text("tier").default("VIP Pro").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  message: text("message").notNull(),
  status: text("status").default("AI Resolved").notNull(),
  priority: text("priority").default("High").notNull(),
  aiResponse: text("ai_response"),
  aiConfidence: text("ai_confidence").default("98.5"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userWatchlist = sqliteTable("user_watchlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").default("guest_institutional_user").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  priceAtAdd: text("price_at_add").notNull(),
  targetPrice: text("target_price"),
  notes: text("notes"),
  alertCondition: text("alert_condition"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const marketAlerts = sqliteTable("market_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  symbol: text("symbol"),
  severity: text("severity").notNull(),
  category: text("category").notNull(),
  message: text("message").notNull(),
  timestampStr: text("timestamp_str").notNull(),
  read: integer("read", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
