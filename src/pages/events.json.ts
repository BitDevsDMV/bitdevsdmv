import type { APIRoute } from 'astro';
import {
  formatClock,
  formatEventDateLong,
  formatRelativeDate,
  getHistoricalEvents,
  getPublishedEvents,
  TIMEZONE,
  TIMEZONE_LABEL,
  toDateIso,
} from '../lib/events';
import { siteUrl } from '../lib/llms';

export const GET: APIRoute = async () => {
  const events = await getPublishedEvents();
  const historical = getHistoricalEvents();
  const payload = {
    site: siteUrl('/'),
    generatedAt: new Date().toISOString(),
    timezone: TIMEZONE,
    timezoneLabel: TIMEZONE_LABEL,
    calendarUrl: siteUrl('/calendar.ics'),
    count: events.length,
    events: events.map((event) => ({
      id: event.id,
      title: event.data.title,
      date: toDateIso(event.data.date),
      dateLabel: formatEventDateLong(event.data.date),
      relative: formatRelativeDate(event.data.date),
      venue: event.data.venue,
      rsvp: event.data.rsvp || null,
      doors: formatClock(event.data.doors) || null,
      seminar: formatClock(event.data.seminar) || null,
      depart: formatClock(event.data.depart) || null,
      tags: event.data.tags,
      url: siteUrl(`/events/${event.id}`),
      markdownUrl: siteUrl(`/events/${event.id}.md`),
    })),
    historical,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
