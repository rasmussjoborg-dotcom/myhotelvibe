import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data } = await supabase.from('hotels').select('id');
  console.log("IDs:", data?.map(d => d.id).slice(0, 10));
}
run();
