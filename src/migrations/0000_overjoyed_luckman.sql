CREATE TABLE `stories` (
	`imageId` text,
	`originalImage` text,
	`transformedImage` text,
	`prompt` text,
	`story` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stories_imageId_unique` ON `stories` (`imageId`);