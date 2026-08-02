CREATE TABLE `serverspulseLinks` (
	`serverId` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`verificationToken` text,
	`verifiedAt` integer,
	`lastCheckedAt` integer,
	`lastSuccessAt` integer,
	`lastPayload` text,
	`lastError` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `serverspulseLinks_slug_idx` ON `serverspulseLinks` (`slug`);