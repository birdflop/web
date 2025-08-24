CREATE TABLE `presets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`author` text NOT NULL,
	`userId` text,
	`description` text,
	`preset` text NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`pending` integer DEFAULT true NOT NULL
);
