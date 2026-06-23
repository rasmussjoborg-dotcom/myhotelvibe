import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const apiKey = process.env.VITE_GEMINI_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!apiKey || !supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSeasonalPrices(hotelName: string, location: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          seasonalPrices: {
            type: SchemaType.OBJECT,
            description: "Realistic average nightly prices in Euros per season. NOTE: These are €€€€ luxury hotels, so prices should typically range from €500 to €3000+, reflecting real-world high-end rates.",
            properties: {
              spring: { type: SchemaType.NUMBER },
              summer: { type: SchemaType.NUMBER },
              autumn: { type: SchemaType.NUMBER },
              winter: { type: SchemaType.NUMBER }
            },
            required: ["spring", "summer", "autumn", "winter"]
          }
        },
        required: ["seasonalPrices"]
      }
    }
  });

  const prompt = `You are a high-end luxury travel curator.
Please estimate realistic average nightly prices in Euros per season for the hotel: "${hotelName}" located in "${location}".
CRITICAL REQUIREMENT: These are elite, high-end properties. The seasonal prices must be grounded in reality for 5-star/luxury stays. Do not output low prices like €150. Prices should reflect true €€€€ luxury rates (e.g. €600, €1200, €2500+ depending on the season and location).`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()).seasonalPrices;
}

async function run() {
  console.log("Fetching hotels without seasonalPrices...");
  const { data: hotels, error } = await supabase
    .from("hotels")
    .select("id, name, location")
    .is("seasonalPrices", null);

  if (error) {
    console.error("Error fetching hotels:", error);
    process.exit(1);
  }

  if (!hotels || hotels.length === 0) {
    console.log("All hotels already have seasonal prices.");
    return;
  }

  console.log(`Found ${hotels.length} hotels to backfill.`);

  for (const hotel of hotels) {
    try {
      console.log(`Generating prices for: ${hotel.name} in ${hotel.location}...`);
      const prices = await generateSeasonalPrices(hotel.name, hotel.location);
      
      const { error: updateError } = await supabase
        .from("hotels")
        .update({ seasonalPrices: prices })
        .eq("id", hotel.id);

      if (updateError) {
        console.error(`Failed to update ${hotel.name}:`, updateError);
      } else {
        console.log(`Successfully updated ${hotel.name} with prices:`, prices);
      }
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`Error processing ${hotel.name}:`, e);
    }
  }

  console.log("Backfill complete!");
}

run();
