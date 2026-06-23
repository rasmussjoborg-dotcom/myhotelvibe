import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
import { VIBE_OPTIONS, BACKDROP_OPTIONS } from "../src/types";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !apiKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  const { data: hotels, error } = await supabase.from('hotels').select('id, name, location, tags');
  if (error || !hotels) {
    console.error("Failed to fetch hotels", error);
    return;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          vibe: { type: SchemaType.STRING, description: `Must be exactly one of: ${VIBE_OPTIONS.join(', ')}` },
          backdrop: { type: SchemaType.STRING, description: `Must be exactly one of: ${BACKDROP_OPTIONS.join(', ')}` }
        },
        required: ["vibe", "backdrop"]
      }
    }
  });

  console.log(`Found ${hotels.length} hotels. Fixing tags...`);

  for (const hotel of hotels) {
    console.log(`Mapping tags for ${hotel.name}...`);
    try {
      const prompt = `Hotel: ${hotel.name}\nLocation: ${hotel.location}\nCurrent Tags: ${hotel.tags?.join(', ')}\nPick the most appropriate vibe and backdrop from the strictly allowed lists.`;
      const result = await model.generateContent(prompt);
      const json = JSON.parse(result.response.text());
      
      const newTags = [json.vibe, json.backdrop];
      console.log(`  -> New Tags: [${newTags.join(', ')}]`);
      
      const { error: updateError } = await supabase
        .from('hotels')
        .update({ tags: newTags })
        .eq('id', hotel.id);
        
      if (updateError) {
        console.error(`  Failed to update ${hotel.name}:`, updateError);
      }
    } catch (e: any) {
      console.error(`Error processing ${hotel.name}:`, e.message);
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log("Done fixing tags!");
}

run();
