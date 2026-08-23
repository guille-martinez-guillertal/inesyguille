import { NextResponse } from 'next/server';
import { requireGuest } from '@/db/auth';
import { getDatabase } from '@/db/database';
import { ApiError, jsonError, readJson, requireSameOrigin } from '@/db/http';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ requestId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireSameOrigin(request);
    const guest = await requireGuest(request);
    const { requestId } = await context.params;
    const status = (await readJson(request)).status;
    if (status !== 'ACCEPTED' && status !== 'REJECTED') {
      throw new ApiError(400, 'INVALID_INPUT', 'Choose accept or reject.');
    }

    const db = getDatabase();
    const item = await db
      .prepare(
        `SELECT rr.id
         FROM ride_requests rr
         JOIN rides r ON r.id = rr.ride_id
         WHERE rr.id = ?1 AND r.driver_guest_id = ?2 AND r.status = 'ACTIVE' AND rr.status = 'REQUESTED'`,
      )
      .bind(requestId, guest.id)
      .first();
    if (!item) throw new ApiError(404, 'REQUEST_NOT_FOUND', 'This request is no longer pending.');

    const now = new Date().toISOString();
    if (status === 'ACCEPTED') {
      const result = await db
        .prepare(
          `UPDATE ride_requests
           SET status = 'ACCEPTED', updated_at = ?1
           WHERE id = ?2 AND status = 'REQUESTED'
             AND seats_requested <= (
               SELECT r.seat_capacity - COALESCE((
                 SELECT SUM(other.seats_requested)
                 FROM ride_requests other
                 WHERE other.ride_id = r.id AND other.status = 'ACCEPTED'
               ), 0)
               FROM rides r
               WHERE r.id = ride_requests.ride_id AND r.status = 'ACTIVE'
             )`,
        )
        .bind(now, requestId)
        .run();
      if (!result.meta.changes) {
        throw new ApiError(409, 'NOT_ENOUGH_SEATS', 'There are no longer enough seats for this request.');
      }
    } else {
      await db
        .prepare("UPDATE ride_requests SET status = 'REJECTED', updated_at = ?1 WHERE id = ?2")
        .bind(now, requestId)
        .run();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    requireSameOrigin(request);
    const guest = await requireGuest(request);
    const { requestId } = await context.params;
    const result = await getDatabase()
      .prepare(
        `UPDATE ride_requests
         SET status = 'CANCELLED', updated_at = ?1
         WHERE id = ?2 AND guest_id = ?3 AND status IN ('REQUESTED', 'ACCEPTED')`,
      )
      .bind(new Date().toISOString(), requestId, guest.id)
      .run();
    if (!result.meta.changes) {
      throw new ApiError(404, 'REQUEST_NOT_FOUND', 'This request can no longer be cancelled.');
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
