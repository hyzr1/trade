CREATE TABLE `daily_returns` (
	`portfolio_id` text NOT NULL,
	`date` text NOT NULL,
	`value_index` real NOT NULL,
	`daily_pct` real NOT NULL,
	PRIMARY KEY(`portfolio_id`, `date`),
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`source_id` text NOT NULL,
	`blurb` text NOT NULL,
	`inception_date` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portfolios_slug_unique` ON `portfolios` (`slug`);--> statement-breakpoint
CREATE TABLE `positions` (
	`portfolio_id` text NOT NULL,
	`ticker` text NOT NULL,
	`weight_pct` real NOT NULL,
	`shares` real NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`portfolio_id`, `ticker`),
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prices` (
	`ticker` text NOT NULL,
	`date` text NOT NULL,
	`close` real NOT NULL,
	`stale` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`ticker`, `date`)
);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`snapshot_date` text NOT NULL,
	`holdings_json` text NOT NULL,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `snap_portfolio_date` ON `snapshots` (`portfolio_id`,`snapshot_date`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`ticker` text NOT NULL,
	`action` text NOT NULL,
	`trade_date` text NOT NULL,
	`disclosed_date` text NOT NULL,
	`source_url` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON UPDATE no action ON DELETE no action
);
