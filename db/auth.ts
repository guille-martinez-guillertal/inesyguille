import { ApiError } from './http';
import { getDatabase } from './database';

export const SESSION_COOKIE = 'wedding_guest';
const SESSION_MAX_AGE = 60 * 60 * 24 * 180;
const PIN_ITERATIONS = 100_000;

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

function bytesToBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlToBytes(value: string) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function derivePin(pin: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(salt).buffer, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPin(pin: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePin(pin, salt, PIN_ITERATIONS);
  return `pbkdf2$${PIN_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`;
}

export async function verifyPin(pin: string, storedHash: string) {
  const [algorithm, iterationsValue, saltValue, hashValue] = storedHash.split('$');
  const iterations = Number(iterationsValue);
  if (
    algorithm !== 'pbkdf2' ||
    !Number.isInteger(iterations) ||
    iterations < 10_000 ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  try {
    const expected = base64UrlToBytes(hashValue);
    const actual = await derivePin(pin, base64UrlToBytes(saltValue), iterations);
    if (actual.length !== expected.length) return false;
    let difference = 0;
    for (let index = 0; index < actual.length; index += 1) {
      difference |= actual[index] ^ expected[index];
    }
    return difference === 0;
  } catch {
    return false;
  }
}

export function normaliseDisplayName(value: string) {
  return value.normalize('NFKC').toLowerCase();
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
    .prepare(
      `SELECT g.id, g.display_name, g.phone
       FROM guest_sessions s
       JOIN guests g ON g.id = s.guest_id
       WHERE s.token_hash = ?1
       LIMIT 1`,
    )
    .bind(tokenHash)
    .first<{ id: string; display_name: string; phone: string | null }>();
  return row ? { id: row.id, displayName: row.display_name, phone: row.phone } : null;
}

export async function createGuestSession(guestId: string) {
  const token = createGuestToken();
  await getDatabase()
    .prepare(
      `INSERT INTO guest_sessions (id, guest_id, token_hash, created_at)
       VALUES (?1, ?2, ?3, ?4)`,
    )
    .bind(crypto.randomUUID(), guestId, await hashToken(token), new Date().toISOString())
    .run();
  return token;
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

export async function deleteGuestSession(request: Request) {
  const token = parseCookies(request).get(SESSION_COOKIE);
  if (!token || !/^[A-Za-z0-9_-]{32,128}$/.test(token)) return;
  await getDatabase()
    .prepare('DELETE FROM guest_sessions WHERE token_hash = ?1')
    .bind(await hashToken(token))
    .run();
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
