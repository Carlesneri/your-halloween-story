DROP INDEX IF EXISTS "stories_imageId_unique";--> statement-breakpoint
ALTER TABLE `stories` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT 1729665832230;--> statement-breakpoint
CREATE UNIQUE INDEX `stories_imageId_unique` ON `stories` (`imageId`);