import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data } = await supabase.from('hotels').select('*').limit(10);
  if (data && data.length > 0) {
    console.log(JSON.stringify(data[data.length - 1], null, 2));
  } else {
    console.log("No data found");
  }
}
run();
