ALTER TABLE `presets` ADD `upvotes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `presets` ADD `downvotes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `presets_preset_unique` ON `presets` (`preset`);