# BitDevs DMV — topic suggestion Worker

Cloudflare Worker backend for `/contribute` form submissions. Stores suggestions in KV. ntfy is sent by the Zeus self-hosted runner ([`.github/workflows/ntfy.yml`](../../.github/workflows/ntfy.yml)), not from this Worker.

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

### Notify (Zeus runner → ntfy)

The Worker calls `repository_dispatch` (`event_type: ntfy`). Zeus’s runner posts to ntfy. Do not point this Worker at `ntfy.sh`.

1. Repo **Actions** secret `NTFY_URL` = `https://ntfy.sh/<topic>`
2. Fine-grained PAT (this repo only, **Contents: Read and write**) stored on the Worker:

```sh
npx wrangler secret put GH_DISPATCH_TOKEN -c workers/suggest/wrangler.toml
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
