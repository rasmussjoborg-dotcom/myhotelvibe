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

const VIBES = [
  "Do absolutely nothing", "Heavy pampering", "Quiet luxury", 
  "Aesthetic hunting", "Romance", "Beach bumming", 
  "City energy", "Food & wine", "Touching grass", "Child survival mode"
];

const TIER_1 = [
  { location: "Paris, France", backdrop: "Concrete jungle" },
  { location: "Amalfi Coast, Italy", backdrop: "Beach & sun" },
  { location: "London, UK", backdrop: "Concrete jungle" },
  { location: "Rome, Italy", backdrop: "Concrete jungle" },
  { location: "Santorini, Greece", backdrop: "Beach & sun" },
  { location: "Lake Como, Italy", backdrop: "Lake life" },
  { location: "Mallorca, Spain", backdrop: "Island hopping" },
  { location: "Venice, Italy", backdrop: "Concrete jungle" },
  { location: "Swiss Alps, Switzerland", backdrop: "Freezing but cute" },
  { location: "Barcelona, Spain", backdrop: "Concrete jungle" },
  { location: "Tuscany, Italy", backdrop: "Middle of nowhere" },
  { location: "Copenhagen, Denmark", backdrop: "Concrete jungle" },
  { location: "Florence, Italy", backdrop: "Concrete jungle" },
  { location: "Madrid, Spain", backdrop: "Concrete jungle" },
  { location: "Lisbon, Portugal", backdrop: "Concrete jungle" },
  { location: "Amsterdam, Netherlands", backdrop: "Concrete jungle" },
  { location: "French Riviera, France", backdrop: "Beach & sun" },
  { location: "Dublin, Ireland", backdrop: "Concrete jungle" },
  { location: "Prague, Czechia", backdrop: "Concrete jungle" },
  { location: "Vienna, Austria", backdrop: "Concrete jungle" }
];

async function discoverHotelsForLocation(location: string, backdrop: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            vibe: { type: SchemaType.STRING, description: `Must be one of: ${VIBES.join(", ")}` }
          },
          required: ["name", "vibe"]
        }
      }
    }
  });

  const prompt = `You are a high-end luxury travel curator.
Find exactly 8 pristine, highly-aesthetic, ultra-luxury boutique hotels in ${location}.
The backdrop is ${backdrop}.
CRITICAL RULE: Every suggested hotel MUST be a true 5-star or ultra-luxury property. DO NOT suggest budget brands like Moxy, Ibis, or Smarthotel. Think Aman, Six Senses, Cheval Blanc, or highly acclaimed independent luxury boutique hotels.
Categorize each hotel with the single best fitting vibe.`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function generateHotelDraft(hotelName: string, location: string, backdrop: string, vibe: string) {
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
          cardTeaser: { type: SchemaType.STRING, description: "A highly-curated hook designed specifically for the list view card. MUST be exactly 2 short, complete sentences. Total length MUST be strictly between 110 and 130 characters so it fits perfectly on exactly 3 lines without getting truncated. Do not just repeat the first sentence of the main description." },
          tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          whyFits: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "CRITICAL: Must contain EXACTLY TWO items. Item 1 must be 'The Draw: [reason]'. Item 2 must be 'The Flex: [reason]'. These should be punchy, salesy, premium arguments for why this hotel made our ultra-luxury list." },
          tradeoff: { type: SchemaType.STRING, description: "Identify the exact type of traveler who would absolutely HATE this hotel, and explain why in one punchy sentence. Be brutally honest to build trust (e.g. 'If you want nightlife, skip this...')." },
          amenities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          settings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          surroundings: { type: SchemaType.STRING, description: "Description of the hotel's setting and proximity to attractions/nature." },
          timeZone: { type: SchemaType.STRING, description: "The standard time zone string for the location (e.g., 'CET (Central European Time)')" },
          bookingWindow: { type: SchemaType.STRING, description: "An educated guess on how far in advance this hotel usually books out based on its exclusivity." },
          guestSummary: { type: SchemaType.STRING, description: "Summarize the general consensus of the hotel's atmosphere as a factual, objective observation. DO NOT use the words 'guests', 'reviewers', or 'say'. State the reality of the experience directly." },
          localGems: { 
            type: SchemaType.OBJECT, 
            description: "CRITICAL: MUST be 4 hand-picked, highly-rated RESTAURANTS or DINING EXPERIENCES (not general activities) near the hotel, specifically tailored for each traveler group. Prioritize restaurants bookable on TheFork or OpenTable, and append a dummy affiliate parameter like '?aff_id=STITCH' to the URL.",
            properties: {
              static1: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              static2: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              static3: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              couple: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              friends: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              family: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] }
            },
            required: ["static1", "static2", "static3", "couple", "friends", "family"]
          },
          seasonalPrices: {
            type: SchemaType.OBJECT,
            properties: {
              spring: { type: SchemaType.NUMBER },
              summer: { type: SchemaType.NUMBER },
              autumn: { type: SchemaType.NUMBER },
              winter: { type: SchemaType.NUMBER }
            },
            required: ["spring", "summer", "autumn", "winter"]
          }
        },
        required: ["name", "location", "region", "luxuriousValue", "distanceValue", "spaScore", "description", "cardTeaser", "tags", "whyFits", "tradeoff", "amenities", "settings", "surroundings", "timeZone", "bookingWindow", "guestSummary", "localGems", "seasonalPrices"]
      }
    }
  });

  const prompt = `You are a high-end luxury travel curator for 'My Hotel Vibe'.
Generate a highly editorial, factual hotel profile for: ${hotelName} in ${location}.
It must fit the backdrop: "${backdrop}" and the vibe: "${vibe}".
Tone Focus: Since the vibe is "${vibe}", lean heavily into that specific persona. If it's a food vibe, focus on sensory details and tasting menus. If it's a social vibe, focus on the crowd and energy.
CRITICAL BANNED WORDS: You are strictly FORBIDDEN from using any of the following words in ANY of your output fields: "nestled", "boasts", "oasis", "hidden gem", "guests consistently rave", "impeccable", "unforgettable", "a stone's throw", "bustling", "paradise", "luxury". Do not use them.
CRITICAL LIMIT: The 'description' field MUST be under 350 characters.
CRITICAL FORMAT: The 'location' field MUST ALWAYS be formatted strictly as "City, Country" or "Region, Country" (e.g. "Paris, France", "Amalfi Coast, Italy"). Do not omit the country.
CRITICAL REQUIREMENT for seasonalPrices: You are curating elite, high-end properties. The seasonal prices must be grounded in reality for 5-star/luxury stays. Prices should reflect true €€€€ luxury rates (e.g. €600, €1200, €2500+ depending on the season and location).`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

async function run() {
  console.log("Starting Tier 1 Hyper-Automated Mass Generation...");
  
  for (const target of TIER_1) {
    console.log(`\n\n=== Discovering Hotels for ${target.location} ===`);
    try {
      const discovered = await discoverHotelsForLocation(target.location, target.backdrop);
      console.log(`Found ${discovered.length} ultra-luxury hotels.`);
      
      for (const hotel of discovered) {
        console.log(`Drafting profile for: ${hotel.name} (${hotel.vibe})...`);
        try {
          const draft = await generateHotelDraft(hotel.name, target.location, target.backdrop, hotel.vibe);
          
          const finalHotel = {
            ...draft,
            id: draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            priceCategory: '€€€€',
            tags: Array.from(new Set([hotel.vibe, ...(draft.tags || [])])),
            priceValue: 0,
            luxuriousValue: Math.round(Number(draft.luxuriousValue) || 0),
            distanceValue: Math.round(Number(draft.distanceValue) || 0),
            spaScore: Math.round(Number(draft.spaScore) || 0),
            image: '',
            imageAlt: draft.name,
          };
          
          const { error } = await supabase.from('hotels').upsert(finalHotel);
          if (error) {
            console.error(`Supabase Error for ${hotel.name}:`, error.message);
          } else {
            console.log(`Successfully saved ${hotel.name}!`);
          }
          
        } catch (e) {
          console.error(`Failed to draft ${hotel.name}:`, e);
        }
        
        // Small delay to avoid aggressive rate limiting
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e) {
      console.error(`Failed to discover hotels for ${target.location}:`, e);
    }
  }
  
  console.log("\\n\\nAll Tier 1 locations have been processed!");
}

// run().catch(console.error);
