DROP INDEX IF EXISTS "stories_imageId_unique";--> statement-breakpoint
ALTER TABLE `stories` ALTER COLUMN "rating" TO "rating" real;--> statement-breakpoint
CREATE UNIQUE INDEX `stories_imageId_unique` ON `stories` (`imageId`);--> statement-breakpoint
ALTER TABLE `stories` ALTER COLUMN "rating" TO "rating" real DEFAULT 0;