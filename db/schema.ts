import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const guests = sqliteTable(
  'guests',
  {
    id: text('id').primaryKey(),
    displayName: text('display_name').notNull(),
    tokenHash: text('token_hash').notNull(),
    phone: text('phone'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_guests_token_hash').on(table.tokenHash),
    check('guests_display_name_length', sql`length(${table.displayName}) BETWEEN 2 AND 80`),
  ],
);

export const rides = sqliteTable(
  'rides',
  {
    id: text('id').primaryKey(),
    driverGuestId: text('driver_guest_id')
      .notNull()
      .references(() => guests.id, { onDelete: 'restrict' }),
    direction: text('direction', { enum: ['TO_WEDDING', 'FROM_WEDDING'] }).notNull(),
    areaName: text('area_name').notNull(),
    departureAt: text('departure_at').notNull(),
    seatCapacity: integer('seat_capacity').notNull(),
    notes: text('notes'),
    status: text('status', { enum: ['ACTIVE', 'CANCELLED'] }).notNull().default('ACTIVE'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_rides_direction_status_departure').on(
      table.direction,
      table.status,
      table.departureAt,
    ),
    index('idx_rides_driver_guest_id').on(table.driverGuestId),
    check('rides_seat_capacity_range', sql`${table.seatCapacity} BETWEEN 1 AND 8`),
    check('rides_area_name_length', sql`length(${table.areaName}) BETWEEN 2 AND 80`),
  ],
);

export const rideRequests = sqliteTable(
  'ride_requests',
  {
    id: text('id').primaryKey(),
    rideId: text('ride_id')
      .notNull()
      .references(() => rides.id, { onDelete: 'cascade' }),
    guestId: text('guest_id')
      .notNull()
      .references(() => guests.id, { onDelete: 'restrict' }),
    seatsRequested: integer('seats_requested').notNull(),
    status: text('status', {
      enum: ['REQUESTED', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
    })
      .notNull()
      .default('REQUESTED'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_ride_requests_ride_guest').on(table.rideId, table.guestId),
    index('idx_ride_requests_ride_status').on(table.rideId, table.status),
    index('idx_ride_requests_guest_status').on(table.guestId, table.status),
    check('ride_requests_seats_range', sql`${table.seatsRequested} BETWEEN 1 AND 8`),
  ],
);
