import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!apiKey || !supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: hotels } = await supabase.from('hotels').select('*');
  if (!hotels) return;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          priceValue: { type: SchemaType.NUMBER, description: "Average price per night in Euros (e.g. 350, 800)" },
          distanceValue: { type: SchemaType.NUMBER, description: "Distance from nearest major airport in minutes (e.g. 45, 120)" },
          luxuriousValue: { type: SchemaType.NUMBER, description: "Luxury score from 1 to 5" },
          spaScore: { type: SchemaType.NUMBER, description: "Spa and wellness score from 1 to 5" },
        },
        required: ["priceValue", "distanceValue", "luxuriousValue", "spaScore"]
      }
    }
  });

  for (const hotel of hotels) {
    // Only fix ones that look like they have hallucinated prices (e.g., under 50 euros for a luxury hotel)
    if (hotel.priceValue < 50) {
      console.log(`Fixing data for ${hotel.name}...`);
      try {
        const prompt = `Provide the estimated metrics for the luxury hotel: ${hotel.name} in ${hotel.location}.
        Ensure priceValue is a realistic nightly price in Euros.`;
        
        const result = await model.generateContent(prompt);
        const metrics = JSON.parse(result.response.text());
        
        await supabase.from('hotels').update({
          priceValue: Math.round(Number(metrics.priceValue)),
          distanceValue: Math.round(Number(metrics.distanceValue)),
          luxuriousValue: Math.round(Number(metrics.luxuriousValue)),
          spaScore: Math.round(Number(metrics.spaScore))
        }).eq('id', hotel.id);
        
        console.log(`Updated ${hotel.name}: €${metrics.priceValue}`);
      } catch (e) {
        console.error(`Failed to fix ${hotel.name}`, e);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

run();
