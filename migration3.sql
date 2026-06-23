-- Add columns to make the locked state and updated time robust
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
