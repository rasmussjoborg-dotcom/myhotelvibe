import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const originalIds = [
  'audo-forest',
  'villa-vals',
  'manshausen-island',
  'ett-hem',
  'the-retreat',
  'villa-copenhagen',
  'treehotel',
  'hotel-arctic',
  'mallorca-family-resort',
  'rome-palazzo',
  'palacio-andaluz',
  'provence-bastide',
  'alpine-wellness-lodge',
  'costa-brava-villa'
];

async function run() {
  console.log("Fetching all hotels...");
  const { data: hotels } = await supabase.from('hotels').select('id');
  if (!hotels) return;

  for (const hotel of hotels) {
    if (!originalIds.includes(hotel.id)) {
      console.log(`Deleting ${hotel.id}...`);
      await supabase.from('hotels').delete().eq('id', hotel.id);
    } else {
      // Clear out any old array images or reset the image column
      // Wait, we don't need to clear the original images because they use the local assets which is fine.
    }
  }
  console.log("Cleanup complete!");
}

run();
