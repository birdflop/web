PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_presets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`author` text NOT NULL,
	`userId` text,
	`description` text,
	`preset` text NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`pending` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_presets`("id", "name", "author", "userId", "description", "preset", "createdAt", "pending") SELECT "id", "name", "author", "userId", "description", "preset", "createdAt", "pending" FROM `presets`;--> statement-breakpoint
DROP TABLE `presets`;--> statement-breakpoint
ALTER TABLE `__new_presets` RENAME TO `presets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;