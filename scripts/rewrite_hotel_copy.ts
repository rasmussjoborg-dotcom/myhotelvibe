import { createClient } from "@supabase/supabase-js";
import { generateHotelDraft } from "./generate_tier.js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching all hotels from the database...");
  const { data: hotels, error } = await supabase.from('hotels').select('*');
  
  if (error || !hotels) {
    console.error("Failed to fetch hotels:", error);
    process.exit(1);
  }

  console.log(`Found ${hotels.length} hotels to rewrite.`);

  for (const hotel of hotels) {
    console.log(`\nRegenerating copy for: ${hotel.name}...`);
    try {
      // Find the primary vibe (first tag)
      const primaryVibe = (hotel.tags && hotel.tags.length > 0) ? hotel.tags[0] : "Quiet luxury";
      
      // Since backdrop isn't stored in the db directly, we can infer it or just pass "Ultra-luxury travel"
      // Wait, we can pass a generic backdrop if we don't have it, since it's just context for the prompt.
      const draft = await generateHotelDraft(hotel.name, hotel.location, "Luxury travel", primaryVibe);
      
      // Update only the editorial fields
      const updates = {
        description: draft.description,
        cardTeaser: draft.cardTeaser,
        whyFits: draft.whyFits,
        tradeoff: draft.tradeoff,
        surroundings: draft.surroundings,
        guestSummary: draft.guestSummary,
        localGems: draft.localGems
      };

      const { error: updateError } = await supabase
        .from('hotels')
        .update(updates)
        .eq('id', hotel.id);
        
      if (updateError) {
        console.error(`Error updating ${hotel.name}:`, updateError.message);
      } else {
        console.log(`✅ Successfully updated ${hotel.name}`);
      }
    } catch (e) {
      console.error(`Failed to regenerate ${hotel.name}:`, e);
    }
    
    // Delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log("\nAll hotels have been updated with the new editorial tone!");
}

run().catch(console.error);
