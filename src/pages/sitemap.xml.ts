import type { APIRoute } from 'astro';
import { getPublishedEvents, toDateIso } from '../lib/events';
import { siteUrl } from '../lib/llms';

export const GET: APIRoute = async () => {
  const events = await getPublishedEvents();
  const today = new Date().toISOString().slice(0, 10);

  type Entry = { loc: string; lastmod?: string; changefreq?: string; priority?: string };

  const entries: Entry[] = [
    { loc: siteUrl('/'), changefreq: 'weekly', priority: '1.0', lastmod: today },
    { loc: siteUrl('/events'), changefreq: 'weekly', priority: '0.9', lastmod: today },
    { loc: siteUrl('/about'), changefreq: 'monthly', priority: '0.7', lastmod: today },
    { loc: siteUrl('/rules'), changefreq: 'monthly', priority: '0.7', lastmod: today },
    { loc: siteUrl('/llms.txt'), changefreq: 'weekly', priority: '0.5', lastmod: today },
    { loc: siteUrl('/events.json'), changefreq: 'weekly', priority: '0.4', lastmod: today },
    { loc: siteUrl('/rss.xml'), changefreq: 'weekly', priority: '0.4', lastmod: today },
    { loc: siteUrl('/calendar.ics'), changefreq: 'weekly', priority: '0.5', lastmod: today },
    { loc: siteUrl('/about.md'), changefreq: 'monthly', priority: '0.3', lastmod: today },
    { loc: siteUrl('/rules.md'), changefreq: 'monthly', priority: '0.3', lastmod: today },
    { loc: siteUrl('/events.md'), changefreq: 'weekly', priority: '0.4', lastmod: today },
  ];

  for (const event of events) {
    const lastmod = toDateIso(event.data.date);
    entries.push(
      {
        loc: siteUrl(`/events/${event.id}`),
        lastmod,
        changefreq: 'monthly',
        priority: '0.8',
      },
      {
        loc: siteUrl(`/events/${event.id}.md`),
        lastmod,
        changefreq: 'monthly',
        priority: '0.3',
      },
    );
  }

  const seen = new Set<string>();
  const unique = entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map((entry) => {
    const parts = [`    <loc>${entry.loc}</loc>`];
    if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
    return `  <url>\n${parts.join('\n')}\n  </url>`;
  })
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
