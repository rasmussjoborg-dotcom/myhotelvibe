import { generateHotelDraft } from './generate_tier';
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

async function seedSingle() {
  console.log("Seeding single hotel: Cheval Blanc Paris...");
  try {
    const hotelDraft = await generateHotelDraft(
      "Cheval Blanc Paris",
      "Paris, France",
      "City energy",
      "Heavy pampering"
    );

    // Mock an image
    hotelDraft.image = JSON.stringify([
      "https://cf.bstatic.com/xdata/images/hotel/max2000/570769500.jpg?k=f4352f7e33b5625dc9b9b7bf011a79a25cfc303e10429420239bfc25",
      "https://cf.bstatic.com/xdata/images/hotel/max2000/570769501.jpg",
      "https://cf.bstatic.com/xdata/images/hotel/max2000/570769502.jpg"
    ]);

    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cleanId = "cheval-blanc-paris";
    
    const payload = {
      id: cleanId,
      ...hotelDraft,
      priceCategory: "€€€€",
      priceValue: 0,
      imageAlt: hotelDraft.name
    };

    const { error } = await supabase
      .from('hotels')
      .upsert([payload]);

    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Successfully saved Cheval Blanc Paris!");
    }
  } catch (err) {
    console.error("Failed:", err);
  }
}

seedSingle();
