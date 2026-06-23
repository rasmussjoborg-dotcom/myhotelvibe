import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.rpc('get_table_columns');
  if (error) {
    // If no RPC, let's insert a dummy hotel without localGems
    const finalHotel = {
      id: "dummy-test-" + Date.now(),
      name: "Dummy",
      location: "Paris",
      region: "europe",
      priceCategory: "€",
      priceValue: 100,
      luxuriousValue: 1,
      distanceValue: 10,
      spaScore: 1,
      image: "",
      imageAlt: "Dummy",
      description: "Dummy",
      tags: [],
      whyFits: [],
      tradeoff: "Tradeoff: Dummy",
      amenities: [],
      settings: []
    };
    const { error: insertError } = await supabase.from('hotels').insert([finalHotel]).select();
    console.log("Insert Error:", insertError);
    if (!insertError) {
      await supabase.from('hotels').delete().eq('id', finalHotel.id);
    }
  } else {
    console.log(data);
  }
}
run();
