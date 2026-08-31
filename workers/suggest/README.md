# BitDevs DMV — topic suggestion Worker

Cloudflare Worker backend for `/contribute` form submissions. Stores suggestions in KV and emails **josh@mybitcoinfuture.com** via [Resend](https://resend.com).

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

### Email (Resend)

1. Create a free account at [resend.com](https://resend.com) and copy an API key.
2. Until `bitdevsdmv.com` is verified in Resend, keep `NOTIFY_EMAIL_FROM = "BitDevs DMV <onboarding@resend.dev>"` (Resend only delivers to the account owner email in that mode — verify the domain ASAP for josh@).
3. Prefer verifying `bitdevsdmv.com` in Resend, then set:

```toml
NOTIFY_EMAIL_FROM = "BitDevs DMV <noreply@bitdevsdmv.com>"
NOTIFY_EMAIL_TO = "josh@mybitcoinfuture.com"
```

4. Store the API key:

```sh
npx wrangler secret put RESEND_API_KEY -c workers/suggest/wrangler.toml
```

### Notify without Resend (easiest: ntfy)

No email account. On your phone, install [ntfy](https://ntfy.sh/) and subscribe to a long random topic name (treat it like a password). Then:

```sh
npx wrangler secret put NOTIFY_WEBHOOK -c workers/suggest/wrangler.toml
# paste: https://ntfy.sh/your-long-random-topic
```

A Discord channel webhook URL works the same way (`https://discord.com/api/webhooks/…`).

```sh
npx wrangler secret put ADMIN_TOKEN -c workers/suggest/wrangler.toml
```

Deploy:

```sh
npm run worker:deploy
```

Local:

```sh
# .dev.vars next to wrangler.toml
RESEND_API_KEY=re_xxx
ADMIN_TOKEN=dev-token

npm run worker:dev
```

## Site config

Set the Astro public env (build-time) to the Worker URL:

```sh
# .env (local) and GitHub Actions / Pages build secret
PUBLIC_SUGGEST_API_URL=https://bitdevsdmv-suggest.<account>.workers.dev
```

Or after a custom route: `https://api.bitdevsdmv.com`.
