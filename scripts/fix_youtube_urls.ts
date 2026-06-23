import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fetchYoutubeShorts } from "./youtube_verifier";

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
  const { data: hotels, error } = await supabase.from('hotels').select('id, name, location, youtubeUrl');
  if (error || !hotels) {
    console.error("Failed to fetch hotels", error);
    return;
  }

  console.log(`Found ${hotels.length} hotels. Fetching YouTube Shorts...`);

  for (const hotel of hotels) {
    console.log(`Fetching shorts for ${hotel.name}...`);
    try {
      const shorts = await fetchYoutubeShorts(hotel.name, hotel.location);
      if (shorts) {
        console.log(`  -> Found ${shorts.split(',').length} shorts`);
        
        const { error: updateError } = await supabase
          .from('hotels')
          .update({ youtubeUrl: shorts })
          .eq('id', hotel.id);
          
        if (updateError) {
          console.error(`  Failed to update ${hotel.name}:`, updateError);
        }
      } else {
        console.log(`  -> No shorts found.`);
      }
    } catch (e: any) {
      console.error(`Error processing ${hotel.name}:`, e.message);
    }
    
    // Rate limit safety
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log("Done updating YouTube URLs!");
}

run();
