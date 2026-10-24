-- Rows inserted before timestamps were set explicitly got the CURRENT_TIMESTAMP
-- default, a text 'YYYY-MM-DD HH:MM:SS' value. Text sorts above every number in
-- SQLite, so these rows matched every `createdAt >= cutoff` check forever
-- (permanent vote/report cooldowns, inflated monthly vote counts). Convert them
-- to the epoch-ms integers the timestamp_ms columns expect.
UPDATE `serverVotes` SET `createdAt` = CAST(strftime('%s', `createdAt`) AS INTEGER) * 1000 WHERE typeof(`createdAt`) = 'text';--> statement-breakpoint
UPDATE `serverReports` SET `createdAt` = CAST(strftime('%s', `createdAt`) AS INTEGER) * 1000 WHERE typeof(`createdAt`) = 'text';--> statement-breakpoint
UPDATE `servers` SET `createdAt` = CAST(strftime('%s', `createdAt`) AS INTEGER) * 1000 WHERE typeof(`createdAt`) = 'text';--> statement-breakpoint
UPDATE `servers` SET `updatedAt` = CAST(strftime('%s', `updatedAt`) AS INTEGER) * 1000 WHERE typeof(`updatedAt`) = 'text';
