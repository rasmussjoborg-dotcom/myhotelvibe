-- Add missing columns to the hotels table
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS "guestSummary" TEXT,
ADD COLUMN IF NOT EXISTS "bookingUrl" TEXT,
ADD COLUMN IF NOT EXISTS "expediaUrl" TEXT;

-- Drop existing restrictive policies if any (optional, but good for clean slate)
DROP POLICY IF EXISTS "Allow public read access to hotels" ON public.hotels;
DROP POLICY IF EXISTS "Allow public insert to hotels" ON public.hotels;
DROP POLICY IF EXISTS "Allow public update to hotels" ON public.hotels;
DROP POLICY IF EXISTS "Allow public delete to hotels" ON public.hotels;

-- Enable RLS (just in case)
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (Read, Insert, Update, Delete) for the prototype
CREATE POLICY "Allow public read access to hotels" ON public.hotels FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to hotels" ON public.hotels FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update to hotels" ON public.hotels FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete to hotels" ON public.hotels FOR DELETE TO public USING (true);
