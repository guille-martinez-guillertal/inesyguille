import { NextResponse } from 'next/server';
import {
  clearSessionCookie,
  createGuestSession,
  deleteGuestSession,
  findGuestByToken,
  getGuest,
  hashPin,
  normaliseDisplayName,
  sessionCookie,
  verifyPin,
} from '@/db/auth';
import { getDatabase } from '@/db/database';
import { ApiError, jsonError, readJson, requireSameOrigin } from '@/db/http';
import { validateIdentity } from '@/db/validation';

export const dynamic = 'force-dynamic';
const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCK_MS = 15 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const guest = await getGuest(request);
    if (!guest) throw new ApiError(401, 'UNAUTHENTICATED', 'Please identify yourself first.');
    return NextResponse.json({ guest });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);

    if (typeof body.token === 'string') {
      const guest = await findGuestByToken(body.token);
      if (!guest) throw new ApiError(401, 'INVALID_TOKEN', 'This private guest link is not valid.');
      const response = NextResponse.json({ guest });
      response.headers.set('Set-Cookie', sessionCookie(body.token));
      return response;
    }

    const { displayName, phone, pin } = validateIdentity(body);
    const displayNameKey = normaliseDisplayName(displayName);
    const db = getDatabase();
    const now = new Date().toISOString();
    const existing = await db
      .prepare(
        `SELECT id, display_name, pin_hash, phone, failed_pin_attempts, pin_locked_until
         FROM guests
         WHERE display_name_key = ?1
         LIMIT 1`,
      )
      .bind(displayNameKey)
      .first<{
        id: string;
        display_name: string;
        pin_hash: string;
        phone: string | null;
        failed_pin_attempts: number;
        pin_locked_until: string | null;
      }>();

    let guest: { id: string; displayName: string; phone: string | null };
    let status = 200;

    if (existing) {
      if (existing.pin_locked_until && Date.parse(existing.pin_locked_until) > Date.now()) {
        throw new ApiError(429, 'PIN_LOCKED', 'Too many attempts. Try again in 15 minutes.');
      }

      if (!(await verifyPin(pin, existing.pin_hash))) {
        const attempts = Number(existing.failed_pin_attempts) + 1;
        const shouldLock = attempts >= MAX_PIN_ATTEMPTS;
        await db
          .prepare(
            `UPDATE guests
             SET failed_pin_attempts = ?1, pin_locked_until = ?2
             WHERE id = ?3`,
          )
          .bind(
            shouldLock ? 0 : attempts,
            shouldLock ? new Date(Date.now() + PIN_LOCK_MS).toISOString() : null,
            existing.id,
          )
          .run();
        throw new ApiError(
          401,
          'INVALID_CREDENTIALS',
          shouldLock ? 'Too many attempts. Try again in 15 minutes.' : 'That name and PIN do not match.',
        );
      }

      const updatedPhone = phone ?? existing.phone;
      await db
        .prepare(
          `UPDATE guests
           SET phone = ?1, failed_pin_attempts = 0, pin_locked_until = NULL
           WHERE id = ?2`,
        )
        .bind(updatedPhone, existing.id)
        .run();
      guest = { id: existing.id, displayName: existing.display_name, phone: updatedPhone };
    } else {
      guest = { id: crypto.randomUUID(), displayName, phone };
      try {
        await db
          .prepare(
            `INSERT INTO guests
               (id, display_name, display_name_key, pin_hash, phone, failed_pin_attempts, pin_locked_until, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, 0, NULL, ?6)`,
          )
          .bind(guest.id, guest.displayName, displayNameKey, await hashPin(pin), guest.phone, now)
          .run();
      } catch (error) {
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
          throw new ApiError(409, 'NAME_TAKEN', 'That name was just registered. Try signing in again.');
        }
        throw error;
      }
      status = 201;
    }

    const token = await createGuestSession(guest.id);
    const response = NextResponse.json({ guest }, { status });
    response.headers.set('Set-Cookie', sessionCookie(token));
    return response;
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    await deleteGuestSession(request);
    const response = NextResponse.json({ ok: true });
    response.headers.set('Set-Cookie', clearSessionCookie());
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
