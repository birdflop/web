CREATE TABLE `savedPresets` (
	`userId` text NOT NULL,
	`presetId` integer NOT NULL,
	`savedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`userId`, `presetId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`presetId`) REFERENCES `presets`(`id`) ON UPDATE no action ON DELETE cascade
);
