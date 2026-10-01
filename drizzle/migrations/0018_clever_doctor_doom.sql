ALTER TABLE `servers` ADD `pluginsPublic` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `servers` ADD `hiddenPlugins` text DEFAULT '[]' NOT NULL;