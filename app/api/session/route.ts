import { NextResponse } from 'next/server';
import {
  clearSessionCookie,
  createGuestToken,
  findGuestByToken,
  getGuest,
  hashToken,
  sessionCookie,
} from '@/db/auth';
import { getDatabase } from '@/db/database';
import { ApiError, jsonError, readJson, requireSameOrigin } from '@/db/http';
import { validateIdentity } from '@/db/validation';

export const dynamic = 'force-dynamic';

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

    const { displayName, phone } = validateIdentity(body);
    const token = createGuestToken();
    const now = new Date().toISOString();
    const guest = { id: crypto.randomUUID(), displayName, phone };

    await getDatabase()
      .prepare(
        `INSERT INTO guests (id, display_name, token_hash, phone, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .bind(guest.id, guest.displayName, await hashToken(token), guest.phone, now)
      .run();

    const response = NextResponse.json({ guest }, { status: 201 });
    response.headers.set('Set-Cookie', sessionCookie(token));
    return response;
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const response = NextResponse.json({ ok: true });
    response.headers.set('Set-Cookie', clearSessionCookie());
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
