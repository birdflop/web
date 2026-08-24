CREATE TABLE `serverReports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serverId` integer NOT NULL,
	`reason` text NOT NULL,
	`details` text,
	`reporterId` text,
	`ip` text,
	`resolved` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reporterId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `serverReports_server_idx` ON `serverReports` (`serverId`);--> statement-breakpoint
CREATE INDEX `serverReports_resolved_idx` ON `serverReports` (`resolved`);--> statement-breakpoint
CREATE TABLE `serverVotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serverId` integer NOT NULL,
	`username` text NOT NULL,
	`ip` text,
	`votifierDelivered` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `serverVotes_server_created_idx` ON `serverVotes` (`serverId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `serverVotes_username_idx` ON `serverVotes` (`username`);--> statement-breakpoint
CREATE TABLE `servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ownerId` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`shortDescription` text,
	`edition` text DEFAULT 'java' NOT NULL,
	`javaHost` text,
	`javaPort` integer,
	`bedrockHost` text,
	`bedrockPort` integer,
	`website` text,
	`discord` text,
	`bannerUrl` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`votifierHost` text,
	`votifierPort` integer,
	`votifierToken` text,
	`featured` integer DEFAULT false NOT NULL,
	`featuredUntil` integer,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `servers_slug_unique` ON `servers` (`slug`);--> statement-breakpoint
CREATE INDEX `servers_owner_idx` ON `servers` (`ownerId`);--> statement-breakpoint
CREATE INDEX `servers_featured_idx` ON `servers` (`featured`);