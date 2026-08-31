# BitDevs DMV

Static site for **BitDevs DMV** — Socratic Seminars on Bitcoin protocol research in DC, Maryland, and Virginia.

- Site: [bitdevsdmv.com](https://bitdevsdmv.com)
- Stack: [Astro](https://astro.build) (`output: 'static'`) + Cloudflare Worker for topic suggestions
- Host: GitHub Pages (site) · Cloudflare Workers (API)

## Develop

Requires Node.js 22+.

```sh
npm install
cp .env.example .env   # optional; points suggest form at local Worker
npm run worker:dev     # terminal 1 — API on :8787
npm run dev            # terminal 2 — site on :4321
```

UI: Bootstrap 5 + Font Awesome, navy/orange BitDevs DMV brand.

## LLM / agent discovery

- [`/llms.txt`](https://bitdevsdmv.com/llms.txt) — curated index ([llmstxt.org](https://llmstxt.org/) v2)
- [`/llms-full.txt`](https://bitdevsdmv.com/llms-full.txt) — expanded plain-text context
- Markdown mirrors: `/about.md`, `/rules.md`, `/contribute.md`, `/events.md`, `/events/<id>.md`
- [`/events.json`](https://bitdevsdmv.com/events.json) — structured seminar index
- [`/calendar.ics`](https://bitdevsdmv.com/calendar.ics) — calendar subscribe (ET)
- HTML pages link `rel="describedby"` → llms.txt and `rel="alternate" type="text/markdown"` where applicable

## Timezone

- All event times are **ET** (`America/New_York`)

## Canonical history

Edit `src/data/historical-events.json` for the chapter continuum (number, date, optional `slug` when a reading room exists). Reading rooms live in `src/content/events/`.

## SEO

Canonical URLs, Open Graph / Twitter cards, `robots.txt`, prioritized `sitemap.xml`, breadcrumbs, and JSON-LD (`Organization`, `WebSite`, `WebPage`/`Event`, `BreadcrumbList`).

## Suggest topics API

GitHub issues are not used. Submissions go to a Cloudflare Worker (`workers/suggest/`) → KV, then a GitHub-hosted Action publishes ntfy.

See [workers/suggest/README.md](workers/suggest/README.md).

## Add a seminar

Create `src/content/events/your-slug.md`:

```md
---
title: "Socratic Seminar 002"
date: 2026-10-22
venue: "Shared with RSVP"
rsvp: "https://..."
doors: "5:30pm"
seminar: "6:30pm"
depart: "9:00pm"
tags: [core, lightning]
draft: false
---

## Ground rules
...

## Announcements
- [Title](https://example.com) — why it matters
```

Use newsletter-style `##` sections so the reading-room layout stays consistent. Push to `main` to publish.

## Brand

Primary mark: `public/brand/bitdevs-dmv-logo.png` (transparent). Source JPG kept alongside for edits.

## Deploy

- **Site:** `.github/workflows/deploy.yml` → GitHub Pages. `public/CNAME` is `bitdevsdmv.com`.
- **API:** `npm run worker:deploy` after creating the KV namespace and filling IDs in `workers/suggest/wrangler.toml`. Set `PUBLIC_SUGGEST_API_URL` in the Pages/build env to the Worker URL.
