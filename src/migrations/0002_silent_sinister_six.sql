ALTER TABLE `stories` ADD `rating` numeric DEFAULT '0';--> statement-breakpoint
ALTER TABLE `stories` ADD `numOfRatings` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `stories` DROP COLUMN `user`;