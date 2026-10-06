CREATE TABLE `serverspulseLinks` (
	`serverId` integer PRIMARY KEY NOT NULL,
	`listingRef` text NOT NULL,
	`linkToken` text,
	`consumerName` text NOT NULL,
	`slug` text,
	`linkStatus` text DEFAULT 'active' NOT NULL,
	`linkedAt` integer NOT NULL,
	`lastCheckedAt` integer,
	`lastSuccessAt` integer,
	`lastStateCheckAt` integer,
	`lastPayload` text,
	`lastError` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `serverspulseLinks_listingRef_unique` ON `serverspulseLinks` (`listingRef`);--> statement-breakpoint
CREATE INDEX `serverspulseLinks_status_idx` ON `serverspulseLinks` (`linkStatus`);