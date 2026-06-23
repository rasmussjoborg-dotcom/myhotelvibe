import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const geminiKey = process.env.VITE_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        whyFits: {
          type: "array",
          items: { type: "string" },
          description: "MUST contain exactly TWO items. The first item MUST start with 'The Draw: ' and describe the main appeal (~15-20 words). The second item MUST start with 'The Flex: ' and describe a unique highlight or flex (~15-20 words)."
        }
      },
      required: ["whyFits"]
    }
  }
});

async function run() {
  const { data: hotels, error } = await supabase.from('hotels').select('id, name, location, whyFits');
  if (error || !hotels) {
    console.error("Failed to fetch hotels", error);
    return;
  }

  console.log(`Found ${hotels.length} hotels. Checking whyFits format...`);

  for (const hotel of hotels) {
    let needsUpdate = false;
    
    // Check if whyFits is strictly an array of 2 items, starting with The Draw: and The Flex:
    if (!Array.isArray(hotel.whyFits) || hotel.whyFits.length !== 2) {
      needsUpdate = true;
    } else {
      const [first, second] = hotel.whyFits;
      if (!first?.startsWith('The Draw:') || !second?.startsWith('The Flex:')) {
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`Updating ${hotel.name}... (Current: ${JSON.stringify(hotel.whyFits)})`);
      try {
        const prompt = `Rewrite the appeal points for the luxury hotel '${hotel.name}' in '${hotel.location}'.
Base it on these existing points if provided: ${JSON.stringify(hotel.whyFits)}
Format MUST be exactly TWO items. The first item MUST start with 'The Draw: ' and describe the main appeal (~15-20 words). The second item MUST start with 'The Flex: ' and describe a unique highlight or flex (~15-20 words).`;
        
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        
        if (parsed.whyFits && parsed.whyFits.length === 2) {
          const { error: updateError } = await supabase
            .from('hotels')
            .update({ whyFits: parsed.whyFits })
            .eq('id', hotel.id);
            
          if (updateError) {
            console.error(`Failed to update ${hotel.name}:`, updateError);
          } else {
            console.log(`✅ Updated ${hotel.name}`);
          }
        }
      } catch (e: any) {
        console.error(`Error processing ${hotel.name}:`, e.message);
      }
    } else {
      console.log(`Skipping ${hotel.name} (already formatted correctly)`);
    }
  }
}

run();
