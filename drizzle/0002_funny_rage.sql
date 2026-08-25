DELETE FROM `ride_requests`;--> statement-breakpoint
DELETE FROM `rides`;--> statement-breakpoint
DELETE FROM `guests`;--> statement-breakpoint
CREATE TABLE `guest_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_guest_sessions_token_hash` ON `guest_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_guest_sessions_guest_id` ON `guest_sessions` (`guest_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_guests` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`display_name_key` text NOT NULL,
	`pin_hash` text NOT NULL,
	`phone` text,
	`failed_pin_attempts` integer DEFAULT 0 NOT NULL,
	`pin_locked_until` text,
	`created_at` text NOT NULL,
	CONSTRAINT "guests_display_name_length" CHECK(length("__new_guests"."display_name") BETWEEN 2 AND 80),
	CONSTRAINT "guests_pin_attempts_nonnegative" CHECK("__new_guests"."failed_pin_attempts" >= 0)
);
--> statement-breakpoint
DROP TABLE `guests`;--> statement-breakpoint
ALTER TABLE `__new_guests` RENAME TO `guests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_guests_display_name_key` ON `guests` (`display_name_key`);
