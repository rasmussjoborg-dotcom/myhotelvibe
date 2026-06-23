-- Production lock-down for My Hotel Vibe
-- Goal:
-- 1. Keep the public site readable
-- 2. Block all public writes from the deployed frontend
-- 3. Preserve local admin as an out-of-band workflow rather than a public capability

BEGIN;

-- Keep RLS enabled.
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Remove the prototype-wide open write policies.
DROP POLICY IF EXISTS "Allow public insert to hotels" ON public.hotels;
DROP POLICY IF EXISTS "Allow public update to hotels" ON public.hotels;
DROP POLICY IF EXISTS "Allow public delete to hotels" ON public.hotels;

-- Normalize the read policy so anon/authenticated traffic can still fetch hotels.
DROP POLICY IF EXISTS "Allow public read access to hotels" ON public.hotels;
CREATE POLICY "Allow public read access to hotels"
  ON public.hotels
  FOR SELECT
  TO public
  USING (true);

-- Defense in depth: revoke table-level write privileges from browser-facing roles.
-- Supabase still evaluates RLS, but revoking these privileges makes the intent explicit.
REVOKE INSERT, UPDATE, DELETE ON public.hotels FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.hotels FROM authenticated;

-- Keep read privileges available for the public site.
GRANT SELECT ON public.hotels TO anon;
GRANT SELECT ON public.hotels TO authenticated;

COMMIT;

