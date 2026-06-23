# My Hotel Vibe Go-Live

This project can be hosted on Vercel as a public, read-only frontend.

## Recommended architecture

- Vercel: public website
- Supabase: hotel database
- Local machine only: admin / curation workflow

## What is already handled in code

- Admin UI is local-only by default.
- Hotel writes are blocked unless local admin mode is enabled.
- Public-facing hotel browsing remains read-only.

Relevant files:

- `src/lib/runtime.ts`
- `src/lib/api.ts`
- `src/App.tsx`
- `src/components/SearchSection.tsx`

## Required pre-launch database step

Run:

- `migration4_production_readonly.sql`

This removes the prototype's public write policies and leaves the public site with read-only access.

## Vercel environment variables

Only set the variables needed by the public site.

Required:

- `VITE_SITE_URL=https://myhotelvibe.com`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`

Do not expose local-only or experimental keys in production unless the public site truly needs them.

Review carefully before launch:

- `VITE_DUFFEL_TOKEN`
- `VITE_REPLICATE_API_TOKEN`
- `VITE_SERPER_API_KEY`
- `VITE_GOOGLE_PLACES_API_KEY`
- `VITE_RAPIDAPI_KEY`
- `VITE_GEMINI_API_KEY`

Anything prefixed with `VITE_` is bundled into the frontend and should be treated as public.

## Vercel deployment settings

Framework:

- Vite

Build command:

- `npm run build`

Output directory:

- `dist`

## Domain

Use `myhotelvibe.com` as the production domain and set:

- `VITE_SITE_URL=https://myhotelvibe.com`

This keeps canonical URLs and SEO output aligned with production.

## Pre-launch checks

1. Verify `myhotelvibe.com` resolves to the Vercel project.
2. Confirm hotel pages load directly by URL.
3. Confirm `Book now` links work.
4. Confirm `Admin` is not visible in production.
5. Confirm writes are blocked in production.
6. Confirm About / Privacy / Contact / affiliate disclosure are visible.
7. Confirm mobile drawers and hotel detail pages behave correctly.

## Local admin workflow

Keep admin local only.

Default behavior:

- admin enabled on `localhost`
- admin hidden in production

Optional override:

- `VITE_ENABLE_LOCAL_ADMIN=true`

Do not set that override in Vercel.

