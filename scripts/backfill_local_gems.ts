import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const apiKey = process.env.VITE_GEMINI_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!apiKey || !supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillHotelLocalGems(hotelName: string, location: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          localGems: { 
            type: SchemaType.OBJECT, 
            description: "4 hand-picked, highly-rated nearby spots specifically tailored for each traveler group. Prioritize spots bookable on TheFork or OpenTable, and append a dummy affiliate parameter like '?aff_id=STITCH' to the URL.",
            properties: {
              solo: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              couple: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              friends: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              family: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] }
            },
            required: ["solo", "couple", "friends", "family"]
          }
        },
        required: ["localGems"]
      }
    }
  });

  const prompt = `You are a high-end luxury travel curator for 'My Hotel Vibe'.
Please generate 4 local gems (one for solo, couple, friends, and family) near the hotel "${hotelName}" located in "${location}".
These should be actual, real places (restaurants, bars, or experiences). Make the descriptions punchy and appealing.`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

async function run() {
  console.log("Fetching hotels missing localGems...");
  
  // Use filter to only get rows where localGems is null.
  // Sometimes it's null, sometimes it might be missing entirely depending on how it was inserted.
  const { data: hotels, error } = await supabase
    .from('hotels')
    .select('id, name, location, "localGems"');

  if (error) {
    console.error("Error fetching hotels:", error);
    return;
  }

  const missingGems = hotels.filter(h => !h.localGems);
  console.log(`Found ${missingGems.length} hotels needing backfill.`);

  for (const hotel of missingGems) {
    console.log(`Backfilling gems for: ${hotel.name} in ${hotel.location}...`);
    try {
      const generated = await backfillHotelLocalGems(hotel.name, hotel.location);
      
      const { error: updateError } = await supabase
        .from('hotels')
        .update({ localGems: generated.localGems })
        .eq('id', hotel.id);
        
      if (updateError) {
        console.error(`Failed to update ${hotel.name}:`, updateError);
      } else {
        console.log(`Successfully updated ${hotel.name}.`);
      }
    } catch (err) {
      console.error(`Error generating for ${hotel.name}:`, err);
    }
    
    // Add a small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log("Done backfilling local gems!");
}

run();
