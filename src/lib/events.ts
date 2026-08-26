import site from '../data/site.json';
import historical from '../data/historical-events.json';
import { getCollection, type CollectionEntry } from 'astro:content';

export type EventEntry = CollectionEntry<'events'>;

export const TIMEZONE = site.timezone;
export const TIMEZONE_LABEL = site.timezoneLabel;
export const TELEGRAM_URL = site.telegram;
export const TELEGRAM_HANDLE = site.telegramHandle;

export type HistoricalEvent = {
  number: number;
  title: string;
  date: string;
  slug: string | null;
  notes: string | null;
};

export function getHistoricalEvents(): HistoricalEvent[] {
  return [...historical].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPublishedEvents(): Promise<EventEntry[]> {
  const events = await getCollection('events', ({ data }) => !data.draft);
  return events.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getNextEvent(): Promise<EventEntry | undefined> {
  const events = await getPublishedEvents();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter((event) => event.data.date.valueOf() >= startOfToday.valueOf())
    .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  return upcoming[0] ?? events[0];
}

/** True when the event calendar day is today or later (local). */
export function isUpcomingOrToday(date: Date, now: Date = new Date()): boolean {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const eventDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const todayUtc = Date.UTC(
    startOfToday.getFullYear(),
    startOfToday.getMonth(),
    startOfToday.getDate(),
  );
  return eventDay >= todayUtc;
}

export function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatEventDateLong(date: Date): string {
  return `${formatEventDate(date)} (${TIMEZONE_LABEL})`;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Format a clock string like "5:30pm" with timezone label. */
export function formatClock(time: string | undefined): string | undefined {
  if (!time) return undefined;
  const trimmed = time.trim();
  if (!trimmed) return undefined;
  if (/\b(ET|EST|EDT|UTC|GMT)\b/i.test(trimmed)) return trimmed;
  return `${trimmed} ${TIMEZONE_LABEL}`;
}

/** Calendar date as YYYY-MM-DD in UTC (for data attributes / parsing). */
export function toDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Human relative label for a calendar date (UTC day).
 * Examples: "today", "tomorrow", "in 5 days", "3 weeks ago"
 */
export function formatRelativeDate(date: Date, now: Date = new Date()): string {
  const target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dayMs = 86_400_000;
  const deltaDays = Math.round((target - today) / dayMs);

  if (deltaDays === 0) return 'today';
  if (deltaDays === 1) return 'tomorrow';
  if (deltaDays === -1) return 'yesterday';

  const abs = Math.abs(deltaDays);
  const ahead = deltaDays > 0;

  const unitLabel = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural}`;

  let amount: string;
  if (abs < 14) {
    amount = unitLabel(abs, 'day', 'days');
  } else if (abs < 60) {
    amount = unitLabel(Math.round(abs / 7), 'week', 'weeks');
  } else if (abs < 730) {
    amount = unitLabel(Math.round(abs / 30.437), 'month', 'months');
  } else {
    amount = unitLabel(Math.round(abs / 365.25), 'year', 'years');
  }

  return ahead ? `in ${amount}` : `${amount} ago`;
}

export function buildTagIndex(events: EventEntry[]): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  for (const event of events) {
    for (const tag of event.data.tags) {
      const key = tag.toLowerCase();
      if (!index[key]) index[key] = [];
      index[key].push(event.id);
    }
  }
  return index;
}

export function allTags(events: EventEntry[]): string[] {
  const tags = new Set<string>();
  for (const event of events) {
    for (const tag of event.data.tags) tags.add(tag.toLowerCase());
  }
  return [...tags].sort();
}

/** Parse "5:30pm" / "18:00" into { hour, minute } 24h. */
export function parseClock(time: string): { hour: number; minute: number } | null {
  const cleaned = time.trim().toLowerCase().replace(/\s+(et|est|edt)\b/g, '');
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let hour = Number(match12[1]);
    const minute = Number(match12[2]);
    const mer = match12[3].toLowerCase();
    if (mer === 'pm' && hour < 12) hour += 12;
    if (mer === 'am' && hour === 12) hour = 0;
    return { hour, minute };
  }
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return { hour: Number(match24[1]), minute: Number(match24[2]) };
  }
  return null;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local civil datetime stamp for ICS TZID (YYYYMMDDTHHMMSS). */
export function toIcsLocalStamp(dateIso: string, hour: number, minute: number): string {
  const [y, m, d] = dateIso.split('-');
  return `${y}${m}${d}T${pad(hour)}${pad(minute)}00`;
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function buildEventsIcs(events: EventEntry[]): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BitDevs DMV//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BitDevs DMV',
    `X-WR-TIMEZONE:${TIMEZONE}`,
    'BEGIN:VTIMEZONE',
    `TZID:${TIMEZONE}`,
    'X-LIC-LOCATION:America/New_York',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];

  for (const event of events) {
    const dateIso = toDateIso(event.data.date);
    const startClock = parseClock(event.data.seminar || event.data.doors || '18:00') || {
      hour: 18,
      minute: 0,
    };
    const endClock = parseClock(event.data.depart || '21:00') || { hour: 21, minute: 0 };
    const dtStart = toIcsLocalStamp(dateIso, startClock.hour, startClock.minute);
    const dtEnd = toIcsLocalStamp(dateIso, endClock.hour, endClock.minute);
    const uid = `${event.id}@bitdevsdmv.com`;
    const url = `https://bitdevsdmv.com/events/${event.id}`;
    const description = [
      event.data.venue,
      `Timezone: ${TIMEZONE_LABEL} (${TIMEZONE})`,
      url,
      event.data.rsvp ? `RSVP: ${event.data.rsvp}` : null,
    ]
      .filter(Boolean)
      .join('\\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${TIMEZONE}:${dtStart}`,
      `DTEND;TZID=${TIMEZONE}:${dtEnd}`,
      `SUMMARY:${escapeIcsText(event.data.title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(event.data.venue)}`,
      `URL:${url}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}
