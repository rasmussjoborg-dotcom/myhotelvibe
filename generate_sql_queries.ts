import fs from 'fs';

const stays = JSON.parse(fs.readFileSync('stays.json', 'utf8'));

let sql = `
-- Create the hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT,
  "priceCategory" TEXT,
  "priceValue" INTEGER,
  "luxuriousValue" INTEGER,
  "distanceValue" INTEGER,
  "spaScore" INTEGER,
  image TEXT,
  "imageAlt" TEXT,
  description TEXT,
  tags TEXT[],
  "whyFits" TEXT[],
  tradeoff TEXT,
  amenities TEXT[],
  settings TEXT[]
);

-- Enable RLS and add a policy for public read access
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to hotels"
  ON public.hotels
  FOR SELECT
  TO public
  USING (true);

-- Insert data
`;

for (const stay of stays) {
  const formatArray = (arr: any) => arr ? `ARRAY[${arr.map((s: string) => `'${s.replace(/'/g, "''")}'`).join(', ')}]` : 'NULL';
  const formatString = (s: any) => s ? `'${s.replace(/'/g, "''")}'` : 'NULL';
  const formatNumber = (n: any) => n !== undefined ? n : 'NULL';

  sql += `
INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  ${formatString(stay.id)},
  ${formatString(stay.name)},
  ${formatString(stay.location)},
  ${formatString(stay.region)},
  ${formatString(stay.priceCategory)},
  ${formatNumber(stay.priceValue)},
  ${formatNumber(stay.luxuriousValue)},
  ${formatNumber(stay.distanceValue)},
  ${formatNumber(stay.spaScore)},
  ${formatString(stay.image)},
  ${formatString(stay.imageAlt)},
  ${formatString(stay.description)},
  ${formatArray(stay.tags)},
  ${formatArray(stay.whyFits)},
  ${formatString(stay.tradeoff)},
  ${formatArray(stay.amenities)},
  ${formatArray(stay.settings)}
) ON CONFLICT (id) DO NOTHING;
`;
}

fs.writeFileSync('supabase-setup.sql', sql);
