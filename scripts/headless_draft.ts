import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { verifyAndFetchOTA } from "./ota_verifier";
import { normalizeLocation } from '../src/lib/location';

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

async function generateHotelDraft(hotelName: string, location: string, backdrop: string, persona: string, priceTier: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          location: { type: SchemaType.STRING },
          region: { type: SchemaType.STRING },
          luxuriousValue: { type: SchemaType.NUMBER, description: "Score from 1 to 5" },
          distanceValue: { type: SchemaType.NUMBER, description: "Distance from nearest major airport in minutes" },
          spaScore: { type: SchemaType.NUMBER, description: "Score from 1 to 5" },
          description: { type: SchemaType.STRING, description: "A punchy, editorial description of the hotel. MUST be strictly between 2 to 4 sentences and absolutely NO longer than 350 characters. Be concise and impactful." },
          tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          whyFits: { 
            type: SchemaType.ARRAY, 
            items: { type: SchemaType.STRING },
            description: "MUST contain exactly TWO items. The first item MUST start with 'The Draw: ' and describe the main appeal (~15-20 words). The second item MUST start with 'The Flex: ' and describe a unique highlight or flex (~15-20 words)."
          },
          amenities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          settings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          surroundings: { type: SchemaType.STRING, description: "Description of the hotel's setting and proximity to attractions/nature." },
          timeZone: { type: SchemaType.STRING, description: "The standard time zone string for the location (e.g., 'CET (Central European Time)')" },
          bookingWindow: { type: SchemaType.STRING, description: "An educated guess on how far in advance this hotel usually books out based on its exclusivity." },
          guestSummary: { type: SchemaType.STRING, description: "A 1-2 sentence summary of what real guests typically rave or complain about regarding this hotel." },
          localGems: { 
            type: SchemaType.OBJECT, 
            description: "CRITICAL: MUST be 4 hand-picked, highly-rated RESTAURANTS or DINING EXPERIENCES (not general activities) near the hotel, specifically tailored for the assigned Trip Persona. Prioritize restaurants bookable on TheFork or OpenTable, and append a dummy affiliate parameter like '?aff_id=STITCH' to the URL.",
            properties: {
              restaurant1: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              restaurant2: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              restaurant3: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              restaurant4: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] }
            },
            required: ["restaurant1", "restaurant2", "restaurant3", "restaurant4"]
          },
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
        required: ["name", "location", "region", "luxuriousValue", "distanceValue", "spaScore", "description", "tags", "whyFits", "amenities", "settings", "surroundings", "timeZone", "bookingWindow", "guestSummary", "localGems", "seasonalPrices"]
      }
    }
  });

  const prompt = `You are a high-end luxury travel curator for a highly editorial travel platform.
Generate a highly editorial, factual hotel profile for: ${hotelName} in ${location}.
It must fit the backdrop: "${backdrop}" and the Trip Persona: "${persona}".
The hotel belongs to the Price Tier: "${priceTier}".

Tone: Premium, honest, poetic, and highly curated. DO NOT use generic marketing speak. 
CRITICAL LIMIT: The 'description' field MUST be under 350 characters. Get straight to the point.
CRITICAL REQUIREMENT for seasonalPrices: The seasonal prices must be grounded in reality and reflect the assigned Price Tier (${priceTier}).`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

async function run() {
  const queries = process.argv.slice(2);
  if (queries.length === 0) {
    console.log("Usage: npx tsx scripts/headless_draft.ts 'Hotel|Location|Backdrop|Persona|PriceTier'");
    return;
  }

  console.log(`Processing ${queries.length} hotels...`);

  for (const query of queries) {
    const [hotelName, location, backdrop, persona, priceTier] = query.split('|');
    if (!hotelName || !location || !backdrop || !persona || !priceTier) {
      console.error(`Skipping invalid format: ${query}. Must be 'Hotel|Location|Backdrop|Persona|PriceTier'`);
      continue;
    }
    
    console.log(`Verifying OTA presence for: ${hotelName}...`);
    const otaResult = await verifyAndFetchOTA(hotelName, location);
    
    if (!otaResult) {
      console.error(`[OTA Missing] Skipping ${hotelName} - Not found on Booking.com.`);
      continue;
    }


    console.log(`Drafting: ${hotelName}...`);
    try {
      const draft = await generateHotelDraft(hotelName, location, backdrop, persona, priceTier);
      const normalizedLocation = normalizeLocation(draft.location || location, draft.region);
      
      const finalHotel = {
        ...draft,
        id: draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location: normalizedLocation.location,
        priceCategory: priceTier.includes('€€€€') ? '€€€€' : priceTier.includes('€€€') ? '€€€' : priceTier.includes('€€') ? '€€' : '€',
        priceTier: priceTier,
        primaryPersona: persona,
        primaryBackdrop: backdrop,
        priceValue: 0,
        luxuriousValue: Math.round(Number(draft.luxuriousValue) || 0),
        distanceValue: Math.round(Number(draft.distanceValue) || 0),
        spaScore: Math.round(Number(draft.spaScore) || 0),
        tags: Array.from(new Set([persona, ...(draft.tags || [])])),
        bookingUrl: otaResult.bookingUrl,
        image: '',
        imageAlt: draft.name,
      };

      const { error } = await supabase.from('hotels').insert([finalHotel]);
      
      if (error) {
        console.error(`Error saving ${query}:`, error);
      } else {
        console.log(`✅ Saved ${draft.name} to queue!`);
      }
    } catch (e: any) {
      console.error(`Failed to process ${query}:`, e.message);
    }
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
}

run();
