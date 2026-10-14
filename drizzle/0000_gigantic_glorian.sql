CREATE TABLE `access_passes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`plan` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`source_id` text,
	`starts_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dodo_events` (
	`webhook_id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `earnings_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`company_name` text NOT NULL,
	`sector` text NOT NULL,
	`report_date` text NOT NULL,
	`fiscal_period` text NOT NULL,
	`eps_estimate` text NOT NULL,
	`eps_actual` text,
	`revenue_estimate` text NOT NULL,
	`revenue_actual` text,
	`beat_status` text NOT NULL,
	`surprise_percent` text,
	`plain_english_summary` text NOT NULL,
	`market_reaction_reason` text NOT NULL,
	`guidance_sentiment` text NOT NULL,
	`catalysts` text,
	`key_takeaways` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `market_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`symbol` text,
	`severity` text NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`timestamp_str` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `market_assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price` text NOT NULL,
	`change` text NOT NULL,
	`change_percent` text NOT NULL,
	`high_24h` text,
	`low_24h` text,
	`volume` text,
	`market_cap` text,
	`pe_ratio` text,
	`dividend_yield` text,
	`sparkline` text,
	`ai_sentiment` text,
	`ai_summary` text,
	`exchange` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `market_assets_symbol_unique` ON `market_assets` (`symbol`);--> statement-breakpoint
CREATE TABLE `pass_usage` (
	`email` text NOT NULL,
	`day` text NOT NULL,
	`seconds` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`email`, `day`)
);
--> statement-breakpoint
CREATE TABLE `sectors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`description` text NOT NULL,
	`market_weight_percent` text NOT NULL,
	`change_1d` text NOT NULL,
	`change_1m` text NOT NULL,
	`change_1y` text NOT NULL,
	`pe_ratio` text NOT NULL,
	`dividend_yield` text NOT NULL,
	`top_holdings` text,
	`macro_catalysts` text,
	`ai_outlook` text NOT NULL,
	`ai_rating` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sectors_slug_unique` ON `sectors` (`slug`);--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`tier` text DEFAULT 'VIP Pro' NOT NULL,
	`subject` text NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'AI Resolved' NOT NULL,
	`priority` text DEFAULT 'High' NOT NULL,
	`ai_response` text,
	`ai_confidence` text DEFAULT '98.5',
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_watchlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text DEFAULT 'guest_institutional_user' NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`price_at_add` text NOT NULL,
	`target_price` text,
	`notes` text,
	`alert_condition` text,
	`created_at` integer NOT NULL
);
