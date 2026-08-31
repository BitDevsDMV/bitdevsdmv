export interface Env {
  SUGGESTIONS: KVNamespace;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_MAX: string;
  RATE_LIMIT_WINDOW_SECONDS: string;
  /** Where suggestion emails go */
  NOTIFY_EMAIL_TO: string;
  /** From address (must be allowed by your Resend domain) */
  NOTIFY_EMAIL_FROM: string;
  /** Resend API key — set via `wrangler secret put RESEND_API_KEY` */
  RESEND_API_KEY?: string;
  /** Fine-grained PAT: Contents write on BitDevsDMV/bitdevsdmv */
  GH_DISPATCH_TOKEN?: string;
  /** owner/name, default BitDevsDMV/bitdevsdmv */
  GH_DISPATCH_REPO?: string;
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

type SuggestionRecord = {
  id: string;
  createdAt: string;
  title: string;
  url: string;
  why: string | null;
  section: string | null;
  contact: string | null;
  ip: string;
  userAgent: string | null;
};

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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
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

async function sendSuggestionEmail(env: Env, record: SuggestionRecord): Promise<void> {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL_TO || !env.NOTIFY_EMAIL_FROM) return;

  const lines = [
    'New BitDevs DMV topic suggestion',
    '',
    `Title: ${record.title}`,
    `URL: ${record.url}`,
    record.why ? `Why: ${record.why}` : null,
    record.section ? `Section: ${record.section}` : null,
    record.contact ? `Contact: ${record.contact}` : null,
    '',
    `Id: ${record.id}`,
    `Submitted: ${record.createdAt}`,
  ].filter((line) => line !== null);

  const text = lines.join('\n');
  const html = `
    <h2>New BitDevs DMV topic suggestion</h2>
    <p><strong>${escapeHtml(record.title)}</strong></p>
    <p><a href="${escapeHtml(record.url)}">${escapeHtml(record.url)}</a></p>
    ${record.why ? `<p><em>Why:</em> ${escapeHtml(record.why)}</p>` : ''}
    ${record.section ? `<p><em>Section:</em> ${escapeHtml(record.section)}</p>` : ''}
    ${record.contact ? `<p><em>Contact:</em> ${escapeHtml(record.contact)}</p>` : ''}
    <p style="color:#666;font-size:12px">Id: ${escapeHtml(record.id)} · ${escapeHtml(record.createdAt)}</p>
  `.trim();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.NOTIFY_EMAIL_FROM,
      to: [env.NOTIFY_EMAIL_TO],
      subject: `BitDevs DMV suggestion: ${record.title}`.slice(0, 200),
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Resend email failed', res.status, detail.slice(0, 500));
  }
}

function suggestionMessage(record: SuggestionRecord): string {
  return [
    record.title,
    record.url,
    record.why ? `Why: ${record.why}` : null,
    record.section ? `Section: ${record.section}` : null,
    record.contact ? `Contact: ${record.contact}` : null,
    `Id: ${record.id}`,
  ]
    .filter((line) => line !== null)
    .join('\n')
    .slice(0, 1900);
}

async function sendGithubNtfyDispatch(env: Env, record: SuggestionRecord): Promise<void> {
  if (!env.GH_DISPATCH_TOKEN) {
    console.error('GH_DISPATCH_TOKEN is not set; skipping ntfy dispatch');
    return;
  }

  const repo = (env.GH_DISPATCH_REPO || 'BitDevsDMV/bitdevsdmv').trim();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    console.error('GH_DISPATCH_REPO is invalid');
    return;
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'bitdevsdmv-suggest',
    },
    body: JSON.stringify({
      event_type: 'ntfy',
      client_payload: {
        title: 'BitDevs DMV suggestion',
        message: suggestionMessage(record),
      },
    }),
  });

  if (res.status !== 204) {
    const detail = await res.text().catch(() => '');
    console.error('GitHub dispatch failed', res.status, detail.slice(0, 300));
  }
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
  const record: SuggestionRecord = {
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

  try {
    await sendSuggestionEmail(env, record);
  } catch (err) {
    console.error('Email notify threw', err);
  }

  try {
    await sendGithubNtfyDispatch(env, record);
  } catch (err) {
    console.error('GitHub dispatch threw', err);
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
