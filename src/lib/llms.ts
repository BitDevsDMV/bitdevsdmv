import {
  formatClock,
  formatEventDateLong,
  formatRelativeDate,
  getHistoricalEvents,
  getPublishedEvents,
  TIMEZONE,
  TIMEZONE_LABEL,
  toDateIso,
  type EventEntry,
} from './events';

const SITE = 'https://bitdevsdmv.com';

export function siteUrl(path = '/'): string {
  if (path === '/' || path === '') return `${SITE}/`;
  return `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function buildLlmsTxt(): Promise<string> {
  const events = await getPublishedEvents();
  const lines = [
    '# BitDevs DMV',
    '',
    '> BitDevs DMV hosts technical Socratic Seminars on Bitcoin protocol research and development in the Washington, DC / Maryland / Virginia (DMV) area. Discussion is technical, under Chatham House Rule, with no recordings. This is the chapter site at bitdevsdmv.com — not a price, investing, or networking meetup. Event times are Eastern Time (ET / America/New_York).',
    '',
    'Prefer the Markdown (`.md`) URLs linked below when loading page content into context. HTML pages advertise the same files via `rel="alternate" type="text/markdown"`. The machine-readable event index is `/events.json`. The human RSS feed is `/rss.xml`. Calendar subscribe: `/calendar.ics`.',
    '',
    '## Core',
    '',
    `- [Home](${SITE}/): Next/latest seminar and recent archive`,
    `- [About](${SITE}/about.md): What BitDevs DMV is and is not`,
    `- [Ground rules](${SITE}/rules.md): Chatham House, no recordings, technical bar`,
    `- [Suggest topics](${SITE}/contribute.md): How to propose primary sources (form posts to Cloudflare Worker API)`,
    `- [Events archive](${SITE}/events.md): Chronological list of Socratic Seminars`,
    `- [Events JSON](${SITE}/events.json): Structured event index for agents`,
    `- [Calendar ICS](${SITE}/calendar.ics): Subscribe to published seminars`,
    '',
    '## Seminars',
    '',
  ];

  for (const event of events) {
    const when = `${formatEventDateLong(event.data.date)} (${formatRelativeDate(event.data.date)})`;
    const tags = event.data.tags.length ? ` Tags: ${event.data.tags.join(', ')}.` : '';
    lines.push(
      `- [${event.data.title}](${SITE}/events/${event.id}.md): ${when}.${tags}`,
    );
  }

  if (events.length === 0) {
    lines.push('- No published seminars yet.');
  }

  lines.push(
    '',
    '## Optional',
    '',
    `- [llms-full.txt](${SITE}/llms-full.txt): Expanded plain-text dump of about, rules, and seminar frontmatter`,
    `- [RSS](${SITE}/rss.xml): Event feed`,
    `- [Sitemap](${SITE}/sitemap.xml): URL inventory`,
    `- [BitDevs Map](https://www.bitdevsmap.org/): Other independent BitDevs chapters worldwide`,
    '',
  );

  return lines.join('\n');
}

export async function buildLlmsFullTxt(): Promise<string> {
  const events = await getPublishedEvents();
  const historical = getHistoricalEvents();
  const parts: string[] = [
    '# BitDevs DMV — full context',
    '',
    `Generated for LLM/agent consumption. Canonical site: ${SITE}/`,
    '',
    '## Identity',
    '',
    'BitDevs DMV is an independent local chapter of the BitDevs Socratic Seminar format.',
    'Focus: Bitcoin and related protocols (consensus, implementations, Lightning, cryptography, mining, privacy, operational research).',
    'Not: market talk, token pitches, investor networking, or recruitment spam.',
    'Ground rules: Chatham House Rule; no photos/video/recordings of discussion; keep it technical.',
    `Timezone: ${TIMEZONE_LABEL} (${TIMEZONE}).`,
    '',
    '## Key URLs',
    '',
    `- HTML home: ${SITE}/`,
    `- About (md): ${SITE}/about.md`,
    `- Rules (md): ${SITE}/rules.md`,
    `- Suggest topics (md): ${SITE}/contribute.md`,
    `- Events (md): ${SITE}/events.md`,
    `- Events JSON: ${SITE}/events.json`,
    `- Calendar ICS: ${SITE}/calendar.ics`,
    `- llms.txt: ${SITE}/llms.txt`,
    '',
    '## Canonical historical registry',
    '',
  ];

  if (historical.length === 0) {
    parts.push('Registry empty — see `src/data/historical-events.json`.');
    parts.push('');
  } else {
    for (const item of historical) {
      const link = item.slug ? `${SITE}/events/${item.slug}` : 'no reading room yet';
      parts.push(`- #${String(item.number).padStart(3, '0')} ${item.title} (${item.date}) — ${link}`);
    }
    parts.push('');
  }

  parts.push('## Published seminars', '');

  for (const event of events) {
    parts.push(eventToMarkdown(event));
    parts.push('');
  }

  return parts.join('\n');
}

export function eventToMarkdown(event: EventEntry, body?: string): string {
  const lines = [
    `# ${event.data.title}`,
    '',
    `- Date: ${formatEventDateLong(event.data.date)} (\`${toDateIso(event.data.date)}\`)`,
    `- Relative: ${formatRelativeDate(event.data.date)}`,
    `- Timezone: ${TIMEZONE_LABEL} (${TIMEZONE})`,
    `- Venue: ${event.data.venue}`,
  ];
  if (event.data.rsvp) lines.push(`- RSVP: ${event.data.rsvp}`);
  if (event.data.doors) lines.push(`- Doors: ${formatClock(event.data.doors)}`);
  if (event.data.seminar) lines.push(`- Seminar: ${formatClock(event.data.seminar)}`);
  if (event.data.depart) lines.push(`- Depart: ${formatClock(event.data.depart)}`);
  if (event.data.tags.length) lines.push(`- Tags: ${event.data.tags.join(', ')}`);
  lines.push(`- HTML: ${SITE}/events/${event.id}`);
  lines.push(`- Markdown: ${SITE}/events/${event.id}.md`);
  lines.push('');
  if (body) {
    lines.push(body.trim());
    lines.push('');
  }
  return lines.join('\n');
}

export function aboutMarkdown(): string {
  return `# About BitDevs DMV

BitDevs DMV hosts monthly Socratic Seminars: open, technical discussions curated from pull requests, mailing lists, research, Optech, and network data. This is the DMV chapter at ${SITE}/.

## Contact

- Calendar: ${SITE}/calendar.ics
- Timezone: ${TIMEZONE_LABEL} (${TIMEZONE})

## What a Socratic Seminar is

Instead of a lecture series, BitDevs events are discussion-first. Organizers and attendees collate primary sources ahead of time. At the meetup, the room works through those sources together — questioning assumptions, comparing implementations, and learning in public without turning the conversation into content.

The format is used by independent chapters worldwide. There is no central authority over chapters.

## Who should come

Engineers, researchers, operators, and serious learners. Newcomers are welcome if they arrive ready for technical discussion. Fundamentals are not re-taught every month; new mechanisms are contextualized when they appear.

## What we are not

This is not an investor mixer, recruiting fair, or price-talk meetup. Pitch decks and altcoin promotion do not belong here.

## Related

- [Ground rules](${SITE}/rules.md)
- [Suggest topics](${SITE}/contribute.md)
- [Events](${SITE}/events.md)
- [BitDevs Map](https://www.bitdevsmap.org/)
`;
}

export function rulesMarkdown(): string {
  return `# Ground rules — BitDevs DMV

These rules exist so people can speak freely and the room stays useful for protocol work.

## 1. Chatham House Rule

Participants are free to use the information received, but neither the identity nor the affiliation of the speaker(s), nor that of any other participant, may be revealed.

## 2. No photos, video, or recordings

The discussion portion of the event is never recorded. Do not photograph or film attendees or the conversation. Personal notes are fine; publishing attributable quotes is not.

## 3. Keep it technical

Topics center on Bitcoin and related protocols: consensus changes, implementations, cryptography, privacy, mining, Lightning, and operational research. Market talk, token pitches, and recruitment spam get cut short.

## 4. Respect the room

Argue ideas hard; treat people carefully. Circular culture-war debates and tired rehashes with no new technical content will be steered away by the host.

## 5. Come prepared when you can

The event page is a reading room. Skimming linked primary sources before you arrive makes the seminar better for everyone.
`;
}

export function contributeMarkdown(): string {
  return `# Suggest topics — BitDevs DMV

Submit primary sources for the next Socratic Seminar via the HTML form at ${SITE}/contribute.

## What to send

Link the source itself when you can:

- Bitcoin Core / LDK / LND / CLN pull requests with substantial changes
- Mailing list posts and Bitcoin Optech notes
- Research papers, BIPs, BOLTs
- Network data, vulnerability disclosures, release notes

## API

The form posts JSON to a Cloudflare Worker (\`POST /suggest\`). The Worker stores the suggestion and asks Zeus to send ntfy. Do not use GitHub issues for topic suggestions.

## Sections used on event pages

Announcements; Mailing Lists, Meetings and Bitcoin Optech; Network Data; Research; InfoSec; Pull Requests and repo updates; New Releases; Mining; Miscellaneous.
`;
}
