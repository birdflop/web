ALTER TABLE `servers` ADD `verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `servers_verified_idx` ON `servers` (`verified`);