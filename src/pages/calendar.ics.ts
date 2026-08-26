import type { APIRoute } from 'astro';
import { buildEventsIcs, getPublishedEvents } from '../lib/events';

export const GET: APIRoute = async () => {
  const events = await getPublishedEvents();
  const body = buildEventsIcs(events);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="bitdevs-dmv.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
