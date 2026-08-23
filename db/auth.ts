import { ApiError } from './http';
import { getDatabase } from './database';

export const SESSION_COOKIE = 'wedding_guest';
const SESSION_MAX_AGE = 60 * 60 * 24 * 180;

export type Guest = {
  id: string;
  displayName: string;
  phone: string | null;
};

export function createGuestToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function parseCookies(request: Request) {
  const values = new Map<string, string>();
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator > 0) values.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }
  return values;
}

export async function findGuestByToken(token: string): Promise<Guest | null> {
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) return null;
  const tokenHash = await hashToken(token);
  const row = await getDatabase()
    .prepare('SELECT id, display_name, phone FROM guests WHERE token_hash = ?1 LIMIT 1')
    .bind(tokenHash)
    .first<{ id: string; display_name: string; phone: string | null }>();
  return row ? { id: row.id, displayName: row.display_name, phone: row.phone } : null;
}

export async function getGuest(request: Request): Promise<Guest | null> {
  const token = parseCookies(request).get(SESSION_COOKIE);
  return token ? findGuestByToken(token) : null;
}

export async function requireGuest(request: Request) {
  const guest = await getGuest(request);
  if (!guest) throw new ApiError(401, 'UNAUTHENTICATED', 'Please identify yourself first.');
  return guest;
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
