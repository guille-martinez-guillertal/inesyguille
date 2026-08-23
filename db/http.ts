import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json(
    { error: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
    { status: 500 },
  );
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    throw new ApiError(403, 'INVALID_ORIGIN', 'This request did not come from the wedding site.');
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) {
    throw new ApiError(415, 'INVALID_CONTENT_TYPE', 'Expected a JSON request.');
  }
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
    return body as Record<string, unknown>;
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'The request could not be read.');
  }
}
