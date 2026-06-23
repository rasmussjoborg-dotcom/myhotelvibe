-- Add extra image columns to the hotels table
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS "image2" TEXT,
ADD COLUMN IF NOT EXISTS "image3" TEXT;
