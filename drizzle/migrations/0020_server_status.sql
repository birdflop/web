CREATE TABLE `serverStatus` (
	`serverId` integer PRIMARY KEY NOT NULL,
	`online` integer NOT NULL,
	`players` integer DEFAULT 0 NOT NULL,
	`maxPlayers` integer DEFAULT 0 NOT NULL,
	`version` text,
	`motd` text,
	`icon` text,
	`edition` text NOT NULL,
	`host` text NOT NULL,
	`port` integer,
	`checkedAt` integer NOT NULL,
	FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `serverStatus_checked_idx` ON `serverStatus` (`checkedAt`);--> statement-breakpoint
CREATE INDEX `serverStatus_online_players_idx` ON `serverStatus` (`online`,`players`);