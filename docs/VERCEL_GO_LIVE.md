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
- `SEO_REQUIRE_SUPABASE=true`

Do not expose local-only or experimental keys in production unless the public site truly needs them.

Review carefully before launch:

- `VITE_DUFFEL_TOKEN`
- `VITE_REPLICATE_API_TOKEN`
- `VITE_SERPER_API_KEY`
- `VITE_GOOGLE_PLACES_API_KEY`
- `VITE_RAPIDAPI_KEY`
- `VITE_GEMINI_API_KEY`

Anything prefixed with `VITE_` is bundled into the frontend and should be treated as public.

## Recommended Vercel setup flow

1. Import the GitHub repository into Vercel.
2. Select the Vite framework preset if Vercel does not detect it automatically.
3. Before the first production deploy, add:
   - `VITE_SITE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SEO_REQUIRE_SUPABASE`
4. Make sure `VITE_ENABLE_LOCAL_ADMIN` is not set in Vercel.
5. Run the first production deployment only after the public read-only Supabase migration is in place.

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

## SEO build source safety

The SEO page generator can fall back to the local `hotels.json` file when Supabase is unavailable.

For production this fallback should not be allowed, otherwise Vercel could deploy a site with stale or incomplete SEO pages.

Set:

- `SEO_REQUIRE_SUPABASE=true`

This makes the build fail if the live Supabase hotel source cannot be loaded during SEO generation.

In practice, this means:

- local builds can still work offline with fallback data
- production Vercel builds must succeed against live Supabase
- if Supabase is unreachable during deploy, the deployment should fail instead of silently publishing stale SEO output

## What a healthy production build should look like

During `postbuild`, the SEO script should log something equivalent to:

- `Loaded X hotels from Supabase for SEO generation`

It should not log:

- `Supabase SEO source unavailable, falling back to local hotels.json`

If you see the fallback message in production, treat that deploy as invalid.

## Pre-launch checks

1. Verify `myhotelvibe.com` resolves to the Vercel project.
2. Confirm hotel pages load directly by URL.
3. Confirm `Book now` links work.
4. Confirm `Admin` is not visible in production.
5. Confirm writes are blocked in production.
6. Confirm About / Privacy / Contact / affiliate disclosure are visible.
7. Confirm mobile drawers and hotel detail pages behave correctly.
8. Confirm sitemap and robots are live at:
   - `/sitemap.xml`
   - `/robots.txt`
9. Confirm a production build is using live Supabase hotel data rather than local fallback data.

## Local admin workflow

Keep admin local only.

Default behavior:

- admin enabled on `localhost`
- admin hidden in production

Optional override:

- `VITE_ENABLE_LOCAL_ADMIN=true`

Do not set that override in Vercel.
