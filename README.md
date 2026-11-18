# HostelWatch Ghana

Students anonymously report hostel prices; every report counts as a petition signature.
React + TypeScript + Material UI on Cloudflare Pages, Pages Functions for the API, D1 (SQLite) for storage, Turnstile for bot checks. All free tier.

## Ubuntu setup (once)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
code .            # VS Code
npm install
```

## Run locally (2 terminals)
```bash
npm run build && npm run db:local     # build once, create local DB
npm run dev:api                       # terminal 1: API + D1 on :8788
npm run dev                           # terminal 2: UI on :5173 (proxies /api)
```
Local Turnstile keys in `.env.local` / `.dev.vars` are Cloudflare's always-pass test keys.
`npm run test:api` runs the API against a local DB (wipes local rows). `npm run typecheck:api` checks the functions.

## Deploy (free)
1. Push to GitHub.
2. Create the database: `npx wrangler login`, then `npx wrangler d1 create hostelwatch`. Paste the `database_id` into `wrangler.toml`, then `npx wrangler d1 migrations apply hostelwatch --remote`.
3. Cloudflare dashboard, Turnstile: add a widget for your `*.pages.dev` domain. Copy site key and secret.
4. Workers & Pages, Create, Pages, Connect to Git. Build command `npm run build`, output `dist`.
5. In the Pages project settings add: `VITE_TURNSTILE_SITEKEY` (build variable), and secrets `TURNSTILE_SECRET` and `HASH_PEPPER` (any long random string, never change it later). Redeploy.

## Moderation (comments are hidden until approved)
```bash
npx wrangler d1 execute hostelwatch --remote --command "SELECT id,hostel_name,comment FROM reports WHERE comment IS NOT NULL AND comment_approved=0"
npx wrangler d1 execute hostelwatch --remote --command "UPDATE reports SET comment_approved=1 WHERE id=12"
npx wrangler d1 execute hostelwatch --remote --command "UPDATE reports SET hidden=1 WHERE id=12"   # remove a fake report
```

## Layout
```
functions/api/   reports.ts (GET list, POST submit), summary.ts, _lib.ts (validation, Turnstile, hashing)
migrations/      0001_init.sql
src/data/        universities.json, roomTypes.json   (edit these, push, done)
src/pages/       Home, Submit, University
scripts/         test-api.ts
```
