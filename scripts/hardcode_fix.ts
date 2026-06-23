import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL as string, process.env.VITE_SUPABASE_ANON_KEY as string);

const fixes = {
  "cap-rocat": { priceValue: 800, distanceValue: 20, luxuriousValue: 5, spaScore: 4 },
  "borgo-santo-pietro": { priceValue: 1000, distanceValue: 60, luxuriousValue: 5, spaScore: 5 },
  "six-senses-douro-valley": { priceValue: 600, distanceValue: 90, luxuriousValue: 5, spaScore: 5 },
  "areias-do-seixo": { priceValue: 400, distanceValue: 45, luxuriousValue: 4, spaScore: 4 },
  "les-roches-rouges": { priceValue: 500, distanceValue: 60, luxuriousValue: 4, spaScore: 3 },
  "s-o-louren-o-do-barrocal": { priceValue: 450, distanceValue: 100, luxuriousValue: 5, spaScore: 4 },
  "euphoria-retreat": { priceValue: 400, distanceValue: 180, luxuriousValue: 4, spaScore: 5 },
  "heckfield-place": { priceValue: 800, distanceValue: 45, luxuriousValue: 5, spaScore: 4 },
  "airelles-gordes-la-bastide": { priceValue: 1200, distanceValue: 60, luxuriousValue: 5, spaScore: 5 },
  "forestis": { priceValue: 600, distanceValue: 60, luxuriousValue: 5, spaScore: 5 },
  "juvet-landscape-hotel": { priceValue: 300, distanceValue: 90, luxuriousValue: 4, spaScore: 3 },
  "7132-hotel": { priceValue: 700, distanceValue: 120, luxuriousValue: 5, spaScore: 5 },
  "arctic-bath": { priceValue: 800, distanceValue: 75, luxuriousValue: 5, spaScore: 4 },
  "the-newt": { priceValue: 600, distanceValue: 60, luxuriousValue: 5, spaScore: 4 },
  "masseria-moroseta": { priceValue: 350, distanceValue: 45, luxuriousValue: 4, spaScore: 3 },
  "lefay-resort-spa-lago-di-garda": { priceValue: 500, distanceValue: 90, luxuriousValue: 5, spaScore: 5 }
};

async function run() {
  for (const [id, values] of Object.entries(fixes)) {
    console.log(`Updating ${id}...`);
    await supabase.from('hotels').update(values).eq('id', id);
  }
  console.log("Done!");
}

run();
