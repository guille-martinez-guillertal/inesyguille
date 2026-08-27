import { wedding } from '@/app/content';
import { calendarIcs, getCalendarEvent } from '@/lib/calendar';

export function GET(request: Request) {
  const language = new URL(request.url).searchParams.get('lang') === 'en' ? 'en' : 'es';
  return new Response(calendarIcs(getCalendarEvent(wedding, language)), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="ines-y-guille-${language}.ics"`,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
