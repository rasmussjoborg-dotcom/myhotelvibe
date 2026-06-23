-- Add a new JSONB column for seasonal prices
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS "seasonalPrices" JSONB;
