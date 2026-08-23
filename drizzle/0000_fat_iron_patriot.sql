CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`token_hash` text NOT NULL,
	`phone` text,
	`created_at` text NOT NULL,
	CONSTRAINT "guests_display_name_length" CHECK(length("guests"."display_name") BETWEEN 2 AND 80)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_guests_token_hash` ON `guests` (`token_hash`);--> statement-breakpoint
CREATE TABLE `ride_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`ride_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`seats_requested` integer NOT NULL,
	`status` text DEFAULT 'REQUESTED' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`ride_id`) REFERENCES `rides`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "ride_requests_seats_range" CHECK("ride_requests"."seats_requested" BETWEEN 1 AND 8)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_ride_requests_ride_guest` ON `ride_requests` (`ride_id`,`guest_id`);--> statement-breakpoint
CREATE INDEX `idx_ride_requests_ride_status` ON `ride_requests` (`ride_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_ride_requests_guest_status` ON `ride_requests` (`guest_id`,`status`);--> statement-breakpoint
CREATE TABLE `rides` (
	`id` text PRIMARY KEY NOT NULL,
	`driver_guest_id` text NOT NULL,
	`direction` text NOT NULL,
	`area_name` text NOT NULL,
	`departure_at` text NOT NULL,
	`seat_capacity` integer NOT NULL,
	`notes` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`driver_guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "rides_seat_capacity_range" CHECK("rides"."seat_capacity" BETWEEN 1 AND 8),
	CONSTRAINT "rides_area_name_length" CHECK(length("rides"."area_name") BETWEEN 2 AND 80)
);
--> statement-breakpoint
CREATE INDEX `idx_rides_direction_status_departure` ON `rides` (`direction`,`status`,`departure_at`);--> statement-breakpoint
CREATE INDEX `idx_rides_driver_guest_id` ON `rides` (`driver_guest_id`);--> statement-breakpoint
PRAGMA optimize;
