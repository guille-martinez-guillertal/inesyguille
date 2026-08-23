import { ApiError } from './http';

export type Direction = 'TO_WEDDING' | 'FROM_WEDDING';

function cleanText(value: unknown, field: string, min: number, max: number) {
  if (typeof value !== 'string') throw new ApiError(400, 'INVALID_INPUT', `${field} is required.`);
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (cleaned.length < min || cleaned.length > max) {
    throw new ApiError(400, 'INVALID_INPUT', `${field} must be between ${min} and ${max} characters.`);
  }
  return cleaned;
}

export function validateIdentity(body: Record<string, unknown>) {
  const displayName = cleanText(body.displayName, 'Name', 2, 80);
  const phone = body.phone ? cleanText(body.phone, 'Phone', 5, 30) : null;
  return { displayName, phone };
}

export function validateRide(body: Record<string, unknown>) {
  const direction = body.direction;
  if (direction !== 'TO_WEDDING' && direction !== 'FROM_WEDDING') {
    throw new ApiError(400, 'INVALID_INPUT', 'Choose a journey direction.');
  }
  const areaName = cleanText(body.areaName, 'Area', 2, 80);
  const departureAt = cleanText(body.departureAt, 'Departure time', 16, 25);
  const localValue = departureAt.slice(0, 16);
  if (!/^2026-09-(2[4-8])T([01]\d|2[0-3]):[0-5]\d$/.test(localValue)) {
    throw new ApiError(400, 'INVALID_INPUT', 'Choose a date between 24 and 28 September 2026.');
  }
  const seatCapacity = Number(body.seatCapacity);
  if (!Number.isInteger(seatCapacity) || seatCapacity < 1 || seatCapacity > 8) {
    throw new ApiError(400, 'INVALID_INPUT', 'Seats must be between 1 and 8.');
  }
  const notes = body.notes ? cleanText(body.notes, 'Notes', 1, 500) : null;
  return { direction: direction as Direction, areaName, departureAt: localValue, seatCapacity, notes };
}

export function validateSeats(value: unknown) {
  const seats = Number(value);
  if (!Number.isInteger(seats) || seats < 1 || seats > 8) {
    throw new ApiError(400, 'INVALID_INPUT', 'Requested seats must be between 1 and 8.');
  }
  return seats;
}
