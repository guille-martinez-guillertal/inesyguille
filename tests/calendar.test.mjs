import test from 'node:test';
import assert from 'node:assert/strict';
import { wedding } from '../app/content.ts';
import { calendarDateRange, calendarIcs, calendarLinks, getCalendarEvent } from '../lib/calendar.ts';

for (const language of ['es', 'en']) {
  test(`${language}: one weekend, correct Spain time, full agenda and no bank details`, () => {
    const event = getCalendarEvent(wedding, language);
    assert.equal(new Date(event.start).toISOString(), '2026-09-25T17:00:00.000Z');
    assert.equal(new Date(event.end).toISOString(), '2026-09-27T14:00:00.000Z');
    assert.equal((Date.parse(event.end) - Date.parse(event.start)) / 3600000, 45);
    assert.match(calendarDateRange(event, language), /19:00/);
    assert.match(calendarDateRange(event, language), /16:00/);
    assert.equal(event.timeZone, 'Europe/Madrid');
    assert.match(event.description, /19:00/);
    assert.match(event.description, /14:30/);
    assert.ok(event.description.includes(wedding.calendar.website));
    for (const day of wedding.content[language].agenda.days) {
      for (const item of day.events) assert.ok(event.description.includes(item.description));
    }
    assert.ok(event.location.includes(wedding.venue));
    assert.ok(!JSON.stringify(event).includes(wedding.bank.iban));
    assert.ok(!JSON.stringify(event).includes(wedding.bank.holder));
  });

  test(`${language}: Google and Outlook open events directly; only Others downloads ICS`, () => {
    const event = getCalendarEvent(wedding, language);
    const links = calendarLinks(event, language);
    assert.deepEqual(links.map((link) => link.id), ['google', 'outlook', 'other']);
    assert.deepEqual(links.map((link) => link.download), [false, false, true]);
    assert.deepEqual(Object.keys(wedding.content[language].agenda.calendar.providers), ['google', 'outlook', 'other']);
    for (const link of links) {
      if (link.download) {
        assert.equal(link.id, 'other');
        assert.equal(link.href, `/api/calendar?lang=${language}`);
        continue;
      }
      const url = new URL(link.href);
      assert.equal(url.protocol, 'https:');
      const params = url.searchParams;
      assert.equal(params.get('location'), event.location);
      if (link.id === 'outlook') {
        assert.equal(url.hostname, 'outlook.live.com');
        assert.equal(url.pathname, '/calendar/0/deeplink/compose');
        assert.equal(params.get('path'), '/calendar/action/compose');
        assert.equal(params.get('rru'), 'addevent');
        assert.equal(params.get('startdt'), '2026-09-25T17:00:00.000Z');
        assert.equal(params.get('enddt'), '2026-09-27T14:00:00.000Z');
        assert.equal(params.get('allday'), 'false');
        assert.equal(params.get('subject'), event.title);
        assert.equal(params.get('body'), event.description);
        continue;
      }
      assert.equal(link.id, 'google');
      assert.equal(url.hostname, 'calendar.google.com');
      assert.equal(params.get('dates'), '20260925T170000Z/20260927T140000Z');
      assert.equal(params.get('stz'), 'Europe/Madrid');
      assert.equal(params.get('etz'), 'Europe/Madrid');
      assert.equal(params.get('text'), event.title);
      assert.equal(params.get('details'), event.description);
    }
  });

  test(`${language}: ICS has one event, stable UID, UTC times and valid UTF-8 folding`, () => {
    const event = getCalendarEvent(wedding, language);
    const ics = calendarIcs(event);
    const unfolded = ics.replace(/\r\n /g, '');
    assert.equal(ics.match(/BEGIN:VEVENT/g).length, 1);
    assert.ok(unfolded.includes(`UID:${wedding.calendar.uid}`));
    assert.ok(unfolded.includes('DTSTART:20260925T170000Z\r\n'));
    assert.ok(unfolded.includes('DTEND:20260927T140000Z\r\n'));
    assert.ok(unfolded.includes(`URL:${wedding.calendar.website}`));
    assert.ok(unfolded.includes('SUMMARY:' + event.title));
    assert.ok(unfolded.includes('Inés'));
    assert.ok(!unfolded.includes(wedding.bank.iban));
    assert.ok(!unfolded.includes('ATTENDEE:'));
    assert.ok(!unfolded.includes('ORGANIZER:'));
    assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
    for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
    assert.ok(!ics.replace(/\r\n/g, '').includes('\n'));
  });
}

test('ICS escapes text and folds multibyte characters without data loss', () => {
  const description = 'Á'.repeat(100) + '\nHello, world; \\ test';
  const ics = calendarIcs({ ...getCalendarEvent(wedding, 'es'), description });
  const unfolded = ics.replace(/\r\n /g, '');
  assert.ok(unfolded.includes(`DESCRIPTION:${'Á'.repeat(100)}\\nHello\\, world\\; \\\\ test\r\n`));
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
});
