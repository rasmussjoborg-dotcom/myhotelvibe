import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('hotels').select('location');
  if (error) throw error;
  
  const locations = [...new Set(data.map(h => h.location.split(',')[0].trim()))];
  console.log("Locations in DB:", locations);
  
  // Count hotels per location
  const counts = {};
  data.forEach(h => {
    const loc = h.location.split(',')[0].trim();
    counts[loc] = (counts[loc] || 0) + 1;
  });
  console.log("Counts per location:", counts);
}

run();
