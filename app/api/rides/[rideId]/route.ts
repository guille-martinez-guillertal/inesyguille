import { NextResponse } from 'next/server';
import { requireGuest } from '@/db/auth';
import { getDatabase } from '@/db/database';
import { ApiError, jsonError, readJson, requireSameOrigin } from '@/db/http';
import { validateRide } from '@/db/validation';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ rideId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireSameOrigin(request);
    const guest = await requireGuest(request);
    const { rideId } = await context.params;
    const ride = validateRide(await readJson(request));
    const db = getDatabase();

    const owned = await db
      .prepare(
        `SELECT r.id,
                COALESCE(SUM(CASE WHEN rr.status = 'ACCEPTED' THEN rr.seats_requested ELSE 0 END), 0) AS accepted_seats
         FROM rides r
         LEFT JOIN ride_requests rr ON rr.ride_id = r.id
         WHERE r.id = ?1 AND r.driver_guest_id = ?2 AND r.status = 'ACTIVE'
         GROUP BY r.id`,
      )
      .bind(rideId, guest.id)
      .first<{ id: string; accepted_seats: number }>();

    if (!owned) throw new ApiError(404, 'RIDE_NOT_FOUND', 'This ride could not be found.');
    if (ride.seatCapacity < Number(owned.accepted_seats)) {
      throw new ApiError(409, 'SEATS_ALREADY_ACCEPTED', 'The ride already has more accepted seats.');
    }

    await db
      .prepare(
        `UPDATE rides
         SET direction = ?1, area_name = ?2, departure_at = ?3,
             seat_capacity = ?4, notes = ?5, updated_at = ?6
         WHERE id = ?7 AND driver_guest_id = ?8 AND status = 'ACTIVE'`,
      )
      .bind(
        ride.direction,
        ride.areaName,
        ride.departureAt,
        ride.seatCapacity,
        ride.notes,
        new Date().toISOString(),
        rideId,
        guest.id,
      )
      .run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    requireSameOrigin(request);
    const guest = await requireGuest(request);
    const { rideId } = await context.params;
    const db = getDatabase();
    const now = new Date().toISOString();

    const owned = await db
      .prepare("SELECT id FROM rides WHERE id = ?1 AND driver_guest_id = ?2 AND status = 'ACTIVE'")
      .bind(rideId, guest.id)
      .first();
    if (!owned) throw new ApiError(404, 'RIDE_NOT_FOUND', 'This ride could not be found.');

    await db.batch([
      db
        .prepare("UPDATE rides SET status = 'CANCELLED', updated_at = ?1 WHERE id = ?2")
        .bind(now, rideId),
      db
        .prepare("UPDATE ride_requests SET status = 'CANCELLED', updated_at = ?1 WHERE ride_id = ?2 AND status IN ('REQUESTED', 'ACCEPTED')")
        .bind(now, rideId),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
