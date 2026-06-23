import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Deleting all rows from the hotels table...');
  const { data, error } = await supabase
    .from('hotels')
    .delete()
    .neq('id', 'dummy_id_to_delete_all'); // delete all rows where id is not dummy
    
  if (error) {
    console.error('Error deleting rows:', error);
  } else {
    console.log('Successfully wiped the hotels table.');
  }
}

run();
