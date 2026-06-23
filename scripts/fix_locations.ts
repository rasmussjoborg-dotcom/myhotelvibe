import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: hotels, error } = await supabase.from('hotels').select('id, location');
  if (error || !hotels) {
    console.error(error);
    return;
  }

  for (const hotel of hotels) {
    let loc = hotel.location;
    if (loc === "Antibes" || loc === "Avignon" || loc === "Èze" || loc === "Gordes" || loc === "Saint-Raphaël" || loc === "Paris" || loc === "Ramatuelle" || loc === "Massignac" || loc === "Méribel" || loc === "La Croix-Valmer") {
      const newLoc = `${loc}, France`;
      console.log(`Updating ${loc} -> ${newLoc}`);
      await supabase.from('hotels').update({ location: newLoc }).eq('id', hotel.id);
    }
    if (loc === "London") {
      const newLoc = `${loc}, UK`;
      console.log(`Updating ${loc} -> ${newLoc}`);
      await supabase.from('hotels').update({ location: newLoc }).eq('id', hotel.id);
    }
  }
  console.log("Done fixing locations!");
}

run();
