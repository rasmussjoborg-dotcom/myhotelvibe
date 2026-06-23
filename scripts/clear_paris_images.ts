import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('hotels').select('id, location');
  if (error) throw error;
  
  const parisHotels = data.filter(h => h.location.toLowerCase().includes('paris'));
  console.log(`Found ${parisHotels.length} hotels in Paris.`);
  
  for (const hotel of parisHotels) {
    const { error: updateError } = await supabase
      .from('hotels')
      .update({ image: '[]' })
      .eq('id', hotel.id);
      
    if (updateError) {
      console.error(`Failed to clear ${hotel.id}:`, updateError);
    } else {
      console.log(`Cleared images for ${hotel.id}`);
    }
  }
}

run();
