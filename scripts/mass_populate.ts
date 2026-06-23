import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { execSync } from "child_process";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

const destinations = [
  // Concrete jungle (Paris & London already done)
  { location: 'Berlin, Germany', backdrop: 'Concrete jungle' },
  { location: 'Milan, Italy', backdrop: 'Concrete jungle' },
  // Way up high
  { location: 'Dolomites, Italy', backdrop: 'Way up high' },
  { location: 'Swiss Alps', backdrop: 'Way up high' },
  { location: 'Tyrol, Austria', backdrop: 'Way up high' },
  // Middle of nowhere
  { location: 'Scottish Highlands, UK', backdrop: 'Middle of nowhere' },
  { location: 'Tuscany, Italy', backdrop: 'Middle of nowhere' },
  { location: 'Lapland, Finland', backdrop: 'Middle of nowhere' },
  // Island hopping
  { location: 'Cyclades, Greece', backdrop: 'Island hopping' },
  { location: 'Balearic Islands, Spain', backdrop: 'Island hopping' },
  { location: 'Azores, Portugal', backdrop: 'Island hopping' },
  // Lake life
  { location: 'Lake Como, Italy', backdrop: 'Lake life' },
  { location: 'Lake Geneva, Switzerland', backdrop: 'Lake life' },
  { location: 'Lake Garda, Italy', backdrop: 'Lake life' },
  // Desert heat
  { location: 'Almeria, Spain', backdrop: 'Desert heat' },
  { location: 'Bardenas Reales, Spain', backdrop: 'Desert heat' },
  // Freezing but cute
  { location: 'Tromso, Norway', backdrop: 'Freezing but cute' },
  { location: 'Reykjavik, Iceland', backdrop: 'Freezing but cute' }
];

const vibes = [
  "Do absolutely nothing", "Heavy pampering", "Quiet luxury", 
  "Aesthetic hunting", "Romance", "Beach bumming", 
  "City energy", "Food & wine", "Touching grass", "Child survival mode"
];

async function run() {
  for (const dest of destinations) {
    console.log(`\n\n=== Generating list for ${dest.location} ===`);
    
    const prompt = `
      You are an elite travel curator for a highly-aesthetic boutique hotel platform.
      Provide exactly 10 pristine, highly-aesthetic boutique hotels in "${dest.location}".
      HARD RULE: Every suggested hotel MUST be actively listed and bookable on major OTAs (Booking.com or Expedia).
      Assign each hotel one of these exact Vibes: ${vibes.join(', ')}.
      
      Return a JSON array of objects with keys: "name" and "vibe".
    `;
    
    try {
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const hotels = JSON.parse(text);
      
      console.log(`Found ${hotels.length} hotels. Executing headless_draft...`);
      
      const args = hotels.map((h: any) => `"${h.name}|${dest.location}|${dest.backdrop}|${h.vibe}"`).join(" ");
      
      const cmd = `npx tsx scripts/headless_draft.ts ${args}`;
      console.log(`Running: ${cmd}`);
      
      // Execute the draft synchronously so we don't overload Gemini/Supabase APIs
      execSync(cmd, { stdio: 'inherit' });
      
    } catch (e) {
      console.error(`Failed to process ${dest.location}:`, e);
    }
  }
}

run();
