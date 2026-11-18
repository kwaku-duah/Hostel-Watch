# HostelWatch Ghana

Students anonymously report hostel prices; every report counts as a petition signature.
React + TypeScript + Material UI on Cloudflare Pages, Pages Functions for the API, D1 (SQLite) for storage, Turnstile for bot checks. All free tier.

## Layout
```
functions/api/   reports.ts (GET list, POST submit), summary.ts, _lib.ts (validation, Turnstile, hashing)
migrations/      0001_init.sql
src/data/        universities.json, roomTypes.json
src/pages/       Home, Submit, University
scripts/         test-api.ts
```