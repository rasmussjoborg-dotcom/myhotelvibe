import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeDatabase() {
  console.log("Wiping all hotels from database...");
  
  // We'll fetch all IDs and delete them since Supabase JS client doesn't support DELETE without filters well
  const { data: hotels, error: fetchError } = await supabase.from('hotels').select('id');
  if (fetchError) throw fetchError;
  
  if (!hotels || hotels.length === 0) {
    console.log("Database is already empty.");
    return;
  }
  
  console.log(`Found ${hotels.length} hotels to delete...`);
  
  // Batch delete
  const { error: deleteError } = await supabase
    .from('hotels')
    .delete()
    .in('id', hotels.map(h => h.id));
    
  if (deleteError) {
    throw deleteError;
  }
  
  console.log("Database wiped successfully!");
}

wipeDatabase().catch(console.error);
