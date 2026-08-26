# BitDevs DMV — topic suggestion Worker

Cloudflare Worker backend for `/contribute` form submissions.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/suggest` | none | Submit a topic |
| `GET` | `/suggestions` | `Authorization: Bearer $ADMIN_TOKEN` | List submissions |
| `GET` | `/health` | none | Liveness |

## Setup

```sh
# From repo root
npx wrangler login
npx wrangler kv namespace create SUGGESTIONS
npx wrangler kv namespace create SUGGESTIONS --preview
```

Put the returned IDs into [`wrangler.toml`](./wrangler.toml) (`id` / `preview_id`).

Optional secrets:

```sh
npx wrangler secret put ADMIN_TOKEN -c workers/suggest/wrangler.toml
npx wrangler secret put NOTIFY_WEBHOOK -c workers/suggest/wrangler.toml   # Discord webhook URL
```

Deploy:

```sh
npm run worker:deploy
```

Local:

```sh
npm run worker:dev
```

## Site config

Set the Astro public env (build-time) to the Worker URL:

```sh
# .env
PUBLIC_SUGGEST_API_URL=https://bitdevsdmv-suggest.<account>.workers.dev
```

Or after a custom route: `https://api.bitdevsdmv.com`.
