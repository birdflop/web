CREATE TABLE `birdflopIpCache` (
	`id` integer PRIMARY KEY NOT NULL,
	`ips` text DEFAULT '[]' NOT NULL,
	`fetchedAt` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `servers` ADD `birdflopHosted` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `servers` ADD `birdflopCheckedAt` integer;