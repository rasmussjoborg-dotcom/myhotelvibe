import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Fetch Error:", error);
  } else {
    console.log("Fetch Success, length:", data?.length);
    if (data?.length > 0) {
      console.log("Keys in first row:", Object.keys(data[0]));
    }
  }
}
test();
