export interface Env {
  SUGGESTIONS: KVNamespace;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_MAX: string;
  RATE_LIMIT_WINDOW_SECONDS: string;
  /** Optional Discord/Slack incoming webhook */
  NOTIFY_WEBHOOK?: string;
  /** Bearer token for GET /suggestions */
  ADMIN_TOKEN?: string;
}

interface SuggestBody {
  title?: string;
  url?: string;
  why?: string;
  section?: string;
  contact?: string;
  /** Honeypot — must stay empty */
  website?: string;
}

const SECTIONS = new Set([
  'Announcements',
  'Mailing Lists, Meetings and Bitcoin Optech',
  'Network Data',
  'Research',
  'InfoSec',
  'Pull Requests and repo updates',
  'New Releases',
  'Mining',
  'Miscellaneous',
  '',
]);

function parseOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(origin: string | null, allowed: string[]): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  if (origin && allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}

function json(data: unknown, status = 200, extra: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extra,
    },
  });
}

function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

async function rateLimited(env: Env, ip: string): Promise<boolean> {
  const max = Number(env.RATE_LIMIT_MAX || '3');
  const windowSec = Number(env.RATE_LIMIT_WINDOW_SECONDS || '3600');
  const key = `rate:${ip}`;
  const raw = await env.SUGGESTIONS.get(key);
  const now = Date.now();
  let count = 0;
  let start = now;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { count: number; start: number };
      if (now - parsed.start < windowSec * 1000) {
        count = parsed.count;
        start = parsed.start;
      }
    } catch {
      /* reset */
    }
  }

  if (count >= max) return true;

  await env.SUGGESTIONS.put(
    key,
    JSON.stringify({ count: count + 1, start }),
    { expirationTtl: Math.max(windowSec, 60) },
  );
  return false;
}

async function handleSuggest(request: Request, env: Env, cors: HeadersInit): Promise<Response> {
  let body: SuggestBody;
  try {
    body = (await request.json()) as SuggestBody;
  } catch {
    return json({ ok: false, error: 'Invalid JSON body.' }, 400, cors);
  }

  // Honeypot
  if (body.website && body.website.trim() !== '') {
    return json({ ok: true }, 200, cors);
  }

  const title = (body.title || '').trim();
  const url = (body.url || '').trim();
  const why = (body.why || '').trim();
  const section = (body.section || '').trim();
  const contact = (body.contact || '').trim();

  if (title.length < 3 || title.length > 200) {
    return json({ ok: false, error: 'Title must be 3–200 characters.' }, 400, cors);
  }
  if (!url || !isHttpUrl(url) || url.length > 2000) {
    return json({ ok: false, error: 'A valid http(s) primary-source URL is required.' }, 400, cors);
  }
  if (why.length > 500) {
    return json({ ok: false, error: '“Why it matters” must be under 500 characters.' }, 400, cors);
  }
  if (contact.length > 200) {
    return json({ ok: false, error: 'Contact must be under 200 characters.' }, 400, cors);
  }
  if (!SECTIONS.has(section)) {
    return json({ ok: false, error: 'Invalid section.' }, 400, cors);
  }

  const ip = clientIp(request);
  if (await rateLimited(env, ip)) {
    return json({ ok: false, error: 'Too many suggestions. Try again later.' }, 429, cors);
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const record = {
    id,
    createdAt,
    title,
    url,
    why: why || null,
    section: section || null,
    contact: contact || null,
    ip,
    userAgent: request.headers.get('User-Agent')?.slice(0, 300) || null,
  };

  await env.SUGGESTIONS.put(`suggestion:${id}`, JSON.stringify(record));
  await env.SUGGESTIONS.put(`suggestion-index:${createdAt}:${id}`, id);

  if (env.NOTIFY_WEBHOOK) {
    const text = [
      '**New BitDevs DMV topic suggestion**',
      `**${title}**`,
      url,
      why ? `_Why:_ ${why}` : null,
      section ? `_Section:_ ${section}` : null,
      contact ? `_Contact:_ ${contact}` : null,
      `\`${id}\``,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await fetch(env.NOTIFY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.slice(0, 1900) }),
      });
    } catch {
      /* don't fail the submit if notify fails */
    }
  }

  return json({ ok: true, id }, 201, cors);
}

async function handleList(request: Request, env: Env, cors: HeadersInit): Promise<Response> {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ ok: false, error: 'Unauthorized.' }, 401, cors);
  }

  const listed = await env.SUGGESTIONS.list({ prefix: 'suggestion:', limit: 200 });
  const items = [];
  for (const key of listed.keys) {
    if (key.name.startsWith('suggestion-index:')) continue;
    const raw = await env.SUGGESTIONS.get(key.name);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      delete parsed.ip;
      items.push(parsed);
    } catch {
      /* skip */
    }
  }

  items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return json({ ok: true, items }, 200, cors);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = parseOrigins(env.ALLOWED_ORIGINS || '');
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, allowed);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'bitdevsdmv-suggest' }, 200, cors);
    }

    if (url.pathname === '/suggest' && request.method === 'POST') {
      if (origin && !allowed.includes(origin)) {
        return json({ ok: false, error: 'Origin not allowed.' }, 403, cors);
      }
      return handleSuggest(request, env, cors);
    }

    if (url.pathname === '/suggestions' && request.method === 'GET') {
      return handleList(request, env, cors);
    }

    return json({ ok: false, error: 'Not found.' }, 404, cors);
  },
} satisfies ExportedHandler<Env>;
