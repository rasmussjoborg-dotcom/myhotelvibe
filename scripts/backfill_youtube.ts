import { createClient } from "@supabase/supabase-js";
import { fetchYoutubeShorts } from "./youtube_verifier";
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
  const { data: hotels, error } = await supabase.from('hotels').select('id, name, location, youtubeUrl');
  if (error || !hotels) {
    console.error("Failed to fetch hotels", error);
    return;
  }

  console.log(`Found ${hotels.length} hotels. Backfilling YouTube shorts...`);

  for (const hotel of hotels) {
    if (!hotel.youtubeUrl) {
      console.log(`Fetching YouTube Shorts for ${hotel.name}...`);
      try {
        const youtubeShorts = await fetchYoutubeShorts(hotel.name, hotel.location);
        if (youtubeShorts) {
          const { error: updateError } = await supabase
            .from('hotels')
            .update({ youtubeUrl: youtubeShorts })
            .eq('id', hotel.id);
            
          if (updateError) {
            console.error(`Failed to update ${hotel.name}:`, updateError);
          } else {
            console.log(`✅ Updated ${hotel.name}`);
          }
        } else {
          console.log(`No shorts found for ${hotel.name}.`);
        }
      } catch (e: any) {
        console.error(`Error processing ${hotel.name}:`, e.message);
      }
      
      // Delay to avoid hitting Serper rate limits
      await new Promise(r => setTimeout(r, 1000));
    } else {
      console.log(`Skipping ${hotel.name} (already has youtubeUrl)`);
    }
  }
  console.log("Done!");
}

run();
