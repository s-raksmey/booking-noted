DROP INDEX `room_idx`;--> statement-breakpoint
DROP INDEX `bookings_user_idx`;--> statement-breakpoint
DROP INDEX `status_idx`;--> statement-breakpoint
CREATE INDEX `booking_room_idx` ON `bookings` (`room_id`);--> statement-breakpoint
CREATE INDEX `booking_user_idx` ON `bookings` (`user_id`);--> statement-breakpoint
CREATE INDEX `booking_status_idx` ON `bookings` (`status`);--> statement-breakpoint
DROP INDEX `name_idx`;--> statement-breakpoint
CREATE INDEX `room_name_idx` ON `rooms` (`name`);