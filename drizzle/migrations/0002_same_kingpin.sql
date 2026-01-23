ALTER TABLE `presets` RENAME COLUMN "upvotes" TO "likes";--> statement-breakpoint
ALTER TABLE `presets` RENAME COLUMN "downvotes" TO "dislikes";--> statement-breakpoint
CREATE TABLE `presetReactions` (
	`userId` text NOT NULL,
	`presetId` integer NOT NULL,
	`reaction` text NOT NULL,
	`reactedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`userId`, `presetId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`presetId`) REFERENCES `presets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `presets` ADD `saves` integer DEFAULT 0 NOT NULL;