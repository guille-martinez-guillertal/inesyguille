import { NextResponse } from 'next/server';
import { getGuest, requireGuest } from '@/db/auth';
import { getDatabase } from '@/db/database';
import { jsonError, readJson, requireSameOrigin } from '@/db/http';
import { validateRide } from '@/db/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const guest = await getGuest(request);
    const db = getDatabase();

    const ridesResult = await db
      .prepare(
        `SELECT r.id, r.driver_guest_id, g.display_name AS driver_name,
                  r.direction, r.area_name, r.departure_at, r.seat_capacity,
                  r.notes, r.status, r.created_at, r.updated_at,
                  r.seat_capacity - COALESCE(SUM(CASE WHEN rr.status = 'ACCEPTED' THEN rr.seats_requested ELSE 0 END), 0) AS remaining_seats
           FROM rides r
           JOIN guests g ON g.id = r.driver_guest_id
           LEFT JOIN ride_requests rr ON rr.ride_id = r.id
           WHERE r.status = 'ACTIVE'
           GROUP BY r.id
           ORDER BY r.direction DESC, r.departure_at ASC, r.created_at ASC`,
      )
      .all();

    if (!guest) {
      return NextResponse.json({
        guest: null,
        rides: ridesResult.results,
        myRequests: [],
        incomingRequests: [],
      });
    }

    const [myRequestsResult, incomingResult] = await Promise.all([
      db
        .prepare(
          `SELECT rr.id, rr.ride_id, rr.seats_requested, rr.status,
                  r.direction, r.area_name, r.departure_at,
                  g.display_name AS driver_name,
                  CASE WHEN rr.status = 'ACCEPTED' THEN g.phone ELSE NULL END AS driver_phone
           FROM ride_requests rr
           JOIN rides r ON r.id = rr.ride_id
           JOIN guests g ON g.id = r.driver_guest_id
           WHERE rr.guest_id = ?1 AND rr.status IN ('REQUESTED', 'ACCEPTED')
           ORDER BY r.departure_at ASC`,
        )
        .bind(guest.id)
        .all(),
      db
        .prepare(
          `SELECT rr.id, rr.ride_id, rr.seats_requested, rr.status,
                  g.display_name AS passenger_name,
                  CASE WHEN rr.status = 'ACCEPTED' THEN g.phone ELSE NULL END AS passenger_phone
           FROM ride_requests rr
           JOIN rides r ON r.id = rr.ride_id
           JOIN guests g ON g.id = rr.guest_id
           WHERE r.driver_guest_id = ?1 AND r.status = 'ACTIVE'
             AND rr.status IN ('REQUESTED', 'ACCEPTED')
           ORDER BY CASE rr.status WHEN 'REQUESTED' THEN 0 ELSE 1 END, rr.created_at ASC`,
        )
        .bind(guest.id)
        .all(),
    ]);

    return NextResponse.json({
      guest,
      rides: ridesResult.results,
      myRequests: myRequestsResult.results,
      incomingRequests: incomingResult.results,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const guest = await requireGuest(request);
    const ride = validateRide(await readJson(request));
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await getDatabase()
      .prepare(
        `INSERT INTO rides
           (id, driver_guest_id, direction, area_name, departure_at, seat_capacity, notes, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'ACTIVE', ?8, ?8)`,
      )
      .bind(
        id,
        guest.id,
        ride.direction,
        ride.areaName,
        ride.departureAt,
        ride.seatCapacity,
        ride.notes,
        now,
      )
      .run();

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
