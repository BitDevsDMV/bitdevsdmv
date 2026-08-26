import type { APIRoute } from 'astro';
import { getPublishedEvents, formatEventDateLong } from '../lib/events';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async () => {
  const events = await getPublishedEvents();
  const site = 'https://bitdevsdmv.com';

  const items = events
    .map((event) => {
      const link = `${site}/events/${event.id}`;
      const title = escapeXml(event.data.title);
      const description = escapeXml(
        `${formatEventDateLong(event.data.date)} — BitDevs DMV Socratic Seminar reading room.`,
      );
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${event.data.date.toUTCString()}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BitDevs DMV Events</title>
    <link>${site}</link>
    <description>Socratic Seminars for Bitcoin protocol research in the DMV.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
