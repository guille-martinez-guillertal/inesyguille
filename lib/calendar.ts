import type { Language, wedding } from '../app/content';

type CalendarSource = Pick<typeof wedding, 'calendar' | 'venue' | 'address' | 'content'>;

export type CalendarEvent = {
  title: string;
  start: string;
  end: string;
  timeZone: string;
  location: string;
  description: string;
  website: string;
  uid: string;
  updatedAt: string;
};

/** Allowlist only event details: never serialize the wedding config or bank data. */
export function getCalendarEvent(source: CalendarSource, language: Language): CalendarEvent {
  const { calendar, venue, address, content } = source;
  const agenda = content[language].agenda;
  const description = agenda.days.map((day) => [
    `${day.day}, ${day.date}`,
    ...day.events.map((event) => `${event.time} · ${event.title}. ${event.description}`),
  ].join('\n')).join('\n\n');
  return {
    title: calendar.title[language],
    start: calendar.start,
    end: calendar.end,
    timeZone: calendar.timeZone,
    location: `${venue}, ${address}`,
    description: [description, calendar.closing[language], agenda.calendar.timeZone, calendar.website].join('\n\n'),
    website: calendar.website,
    uid: calendar.uid,
    updatedAt: calendar.updatedAt,
  };
}

export function calendarDateRange(event: CalendarEvent, language: Language) {
  const format = new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-GB', {
    timeZone: event.timeZone, weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  return `${format.format(new Date(event.start))} — ${format.format(new Date(event.end))}`;
}

function utcStamp(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function calendarLinks(event: CalendarEvent, language: Language) {
  const google = new URL('https://calendar.google.com/calendar/r/eventedit');
  google.search = new URLSearchParams({
    action: 'TEMPLATE', text: event.title,
    dates: `${utcStamp(event.start)}/${utcStamp(event.end)}`,
    stz: event.timeZone, etz: event.timeZone, ctz: event.timeZone,
    details: event.description, location: event.location,
  }).toString();

  const outlook = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  outlook.search = new URLSearchParams({
    path: '/calendar/action/compose', rru: 'addevent', subject: event.title,
    startdt: new Date(event.start).toISOString(), enddt: new Date(event.end).toISOString(),
    body: event.description, location: event.location, allday: 'false',
  }).toString();

  const downloadUrl = `/api/calendar?lang=${language}`;
  return [
    { id: 'google' as const, href: google.toString(), download: false },
    { id: 'outlook' as const, href: outlook.toString(), download: false },
    { id: 'other' as const, href: downloadUrl, download: true },
  ];
}

function escapeText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

/** RFC 5545: fold at 75 UTF-8 octets without splitting a Unicode character. */
function foldLine(value: string) {
  const encoder = new TextEncoder();
  let result = '';
  let bytes = 0;
  for (const character of value) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      result += '\r\n ';
      bytes = 1;
    }
    result += character;
    bytes += size;
  }
  return result;
}

export function calendarIcs(event: CalendarEvent) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ines y Guille//Wedding//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${escapeText(event.uid)}`, `DTSTAMP:${utcStamp(event.updatedAt)}`,
    `DTSTART:${utcStamp(event.start)}`, `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`, `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`, `URL:${event.website}`,
    'STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'END:VEVENT', 'END:VCALENDAR',
  ].map(foldLine).join('\r\n') + '\r\n';
}
