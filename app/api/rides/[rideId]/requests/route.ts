import { NextResponse } from 'next/server';
import { requireGuest } from '@/db/auth';
import { getDatabase } from '@/db/database';
import { ApiError, jsonError, readJson, requireSameOrigin } from '@/db/http';
import { validateSeats } from '@/db/validation';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ rideId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    requireSameOrigin(request);
    const guest = await requireGuest(request);
    const { rideId } = await context.params;
    const seats = validateSeats((await readJson(request)).seatsRequested);
    const db = getDatabase();

    const ride = await db
      .prepare(
        `SELECT r.driver_guest_id, r.seat_capacity -
                COALESCE(SUM(CASE WHEN rr.status = 'ACCEPTED' THEN rr.seats_requested ELSE 0 END), 0) AS remaining_seats
         FROM rides r
         LEFT JOIN ride_requests rr ON rr.ride_id = r.id
         WHERE r.id = ?1 AND r.status = 'ACTIVE'
         GROUP BY r.id`,
      )
      .bind(rideId)
      .first<{ driver_guest_id: string; remaining_seats: number }>();

    if (!ride) throw new ApiError(404, 'RIDE_NOT_FOUND', 'This ride is no longer available.');
    if (ride.driver_guest_id === guest.id) {
      throw new ApiError(409, 'OWN_RIDE', 'You cannot request seats in your own ride.');
    }
    if (seats > Number(ride.remaining_seats)) {
      throw new ApiError(409, 'NOT_ENOUGH_SEATS', 'There are not enough seats available.');
    }

    const existing = await db
      .prepare('SELECT id, status FROM ride_requests WHERE ride_id = ?1 AND guest_id = ?2')
      .bind(rideId, guest.id)
      .first<{ id: string; status: string }>();
    const now = new Date().toISOString();

    if (existing && (existing.status === 'REQUESTED' || existing.status === 'ACCEPTED')) {
      throw new ApiError(409, 'REQUEST_EXISTS', 'You already have a request for this ride.');
    }

    if (existing) {
      await db
        .prepare(
          `UPDATE ride_requests
           SET seats_requested = ?1, status = 'REQUESTED', updated_at = ?2
           WHERE id = ?3`,
        )
        .bind(seats, now, existing.id)
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO ride_requests
             (id, ride_id, guest_id, seats_requested, status, created_at, updated_at)
           VALUES (?1, ?2, ?3, ?4, 'REQUESTED', ?5, ?5)`,
        )
        .bind(crypto.randomUUID(), rideId, guest.id, seats, now)
        .run();
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
