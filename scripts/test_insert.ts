import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const apiKey = process.env.VITE_GEMINI_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function testReplace() {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.9,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          location: { type: SchemaType.STRING },
          region: { type: SchemaType.STRING },
          priceCategory: { type: SchemaType.STRING, description: "e.g. '€€€'" },
          priceValue: { type: SchemaType.NUMBER, description: "Average nightly price in Euros (e.g. 400, 800)" },
          luxuriousValue: { type: SchemaType.NUMBER, description: "Score from 1 to 5" },
          distanceValue: { type: SchemaType.NUMBER, description: "Distance from nearest major airport in minutes" },
          spaScore: { type: SchemaType.NUMBER, description: "Score from 1 to 5" },
          description: { type: SchemaType.STRING, description: "A punchy, editorial description of the hotel. MUST be strictly between 2 to 4 sentences and absolutely NO longer than 350 characters. Be concise and impactful." },
          tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          whyFits: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          tradeoff: { type: SchemaType.STRING },
          amenities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          settings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          surroundings: { type: SchemaType.STRING, description: "Description of the hotel's setting and proximity to attractions/nature." },
          timeZone: { type: SchemaType.STRING, description: "The standard time zone string for the location (e.g., 'CET (Central European Time)')" },
          bookingWindow: { type: SchemaType.STRING, description: "An educated guess on how far in advance this hotel usually books out based on its exclusivity." },
          guestSummary: { type: SchemaType.STRING, description: "A 1-2 sentence summary of what real guests typically rave or complain about regarding this hotel." }
        },
        required: ["name", "location", "region", "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", "description", "tags", "whyFits", "tradeoff", "amenities", "settings", "surroundings", "timeZone", "bookingWindow", "guestSummary"]
      }
    }
  });

  const prompt = `You are a high-end luxury travel curator for 'My Hotel Vibe'.
Please discover and draft a completely NEW, factual, and highly editorial hotel profile for a hotel located in "Paris".
CRITICAL REQUIREMENT: Do NOT use the hotel "Hôtel Madame Rêve". Find a DIFFERENT highly-aesthetic boutique hotel in Paris that perfectly fits the Vibe: "City energy".
Ensure you accurately estimate the Time Zone, calculate the true surrounding context, guess a realistic booking window based on the hotel's size and exclusivity, and synthesize a summary of real guest consensus (what they love and complain about).
Tone: Premium, honest, poetic, and highly curated. DO NOT use generic marketing speak. 
CRITICAL LIMIT: The 'description' field MUST be under 350 characters. Get straight to the point.`;

  console.log("Generating...");
  const result = await model.generateContent(prompt);
  const draft = JSON.parse(result.response.text());
  
  const finalHotel = {
    ...draft,
    id: draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    priceValue: Math.round(Number(draft.priceValue) || 0),
    luxuriousValue: Math.round(Number(draft.luxuriousValue) || 0),
    distanceValue: Math.round(Number(draft.distanceValue) || 0),
    spaScore: Math.round(Number(draft.spaScore) || 0),
    image: '',
    imageAlt: draft.name,
  };

  console.log("Inserting...", finalHotel.id);
  const { error } = await supabase
    .from('hotels')
    .insert([finalHotel])
    .select();

  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success!");
    // delete it
    await supabase.from('hotels').delete().eq('id', finalHotel.id);
  }
}
testReplace();
