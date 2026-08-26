import type { APIRoute } from 'astro';
import { formatEventDateLong, formatRelativeDate, getPublishedEvents, toDateIso } from '../lib/events';
import { siteUrl } from '../lib/llms';

export const GET: APIRoute = async () => {
  const events = await getPublishedEvents();
  const lines = [
    '# Events — BitDevs DMV',
    '',
    'Chronological archive of Socratic Seminars. Prefer per-event `.md` files for full reading-room content. Times are Eastern (ET). Calendar: /calendar.ics',
    '',
  ];
  for (const event of events) {
    lines.push(
      `- [${event.data.title}](${siteUrl(`/events/${event.id}.md`)}): ${formatEventDateLong(event.data.date)} (${formatRelativeDate(event.data.date)}; \`${toDateIso(event.data.date)}\`)`,
    );
  }
  lines.push('');
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
