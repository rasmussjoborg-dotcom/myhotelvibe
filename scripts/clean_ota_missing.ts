import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: hotels, error } = await supabase.from('hotels').select('id, name, bookingUrl, expediaUrl');
  if (error || !hotels) {
    console.error("Failed to fetch hotels", error);
    return;
  }

  const missing = hotels.filter(h => !h.bookingUrl && !h.expediaUrl);
  console.log(`Found ${missing.length} hotels missing OTA links.`);

  for (const hotel of missing) {
    console.log(`Deleting ${hotel.name}...`);
    const { error: deleteError } = await supabase
      .from('hotels')
      .delete()
      .eq('id', hotel.id);
      
    if (deleteError) {
      console.error(`  Failed to delete ${hotel.name}:`, deleteError);
    }
  }
  
  console.log("Cleanup complete.");
}

run();
