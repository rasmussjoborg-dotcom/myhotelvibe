import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "dummy");

export async function generateHotelDraft(hotelQuery: string) {
  if (!apiKey) throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");

  // We use gemini-2.5-flash as it is fast and supports JSON schema
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Exact name of the hotel" },
          location: { type: SchemaType.STRING, description: "City and Country, e.g. 'Rome, Italy'" },
          region: { type: SchemaType.STRING, description: "General region, e.g. 'europe', 'asia', 'americas'" },
          luxuriousValue: { type: SchemaType.NUMBER, description: "Scale 1 to 5" },
          distanceValue: { type: SchemaType.NUMBER, description: "Distance in km from main transport/airport" },
          spaScore: { type: SchemaType.NUMBER, description: "Scale 1 to 5" },
          description: { type: SchemaType.STRING, description: "A beautifully written, poetic, premium description of the hotel (2-3 sentences)." },
          tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "2-4 vibe tags, e.g. 'Minimalist', 'Historic', 'Seaside'" },
          whyFits: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Exactly 2 short bullet points explaining why it's a great choice for discerning travelers." },
          tradeoff: { type: SchemaType.STRING, description: "A witty, honest tradeoff. Start exactly with 'Tradeoff: ' e.g., 'Tradeoff: You are paying for the view, the rooms themselves are tiny.'" },
          amenities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Select applicable from: 'Spa', 'Pool', 'Fine Dining', 'Pet Friendly'" },
          settings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Select applicable from: 'Secluded', 'Mountain View', 'Forest'" },
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
        required: ["name", "location", "region", "luxuriousValue", "distanceValue", "spaScore", "description", "tags", "whyFits", "tradeoff", "amenities", "settings", "seasonalPrices"]
      }
    }
  });

  const prompt = `You are a high-end luxury travel curator for 'My Hotel Vibe'.
Please generate a factual but highly editorial hotel profile for the following hotel search query: "${hotelQuery}".
If the query is just a name, infer the best match. 
Tone: Premium, honest, poetic, and highly curated. DO NOT use generic marketing speak.
CRITICAL REQUIREMENT for seasonalPrices: You are curating elite, high-end properties. The seasonal prices must be grounded in reality for 5-star/luxury stays. Do not output low prices like €150. Prices should reflect true €€€€ luxury rates (e.g. €600, €1200, €2500+ depending on the season and location).`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function discoverReplacementHotelDraft(oldHotelName: string, location: string, vibe: string) {
  if (!apiKey) throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");

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
          guestSummary: { type: SchemaType.STRING, description: "A 1-2 sentence summary of what real guests typically rave or complain about regarding this hotel." },
          localGems: { 
            type: SchemaType.OBJECT, 
            description: "4 hand-picked nearby restaurants or bars. CRITICAL: Match the restaurant's vibe to the hotel's vibe (e.g., if the hotel is 'City energy', pick a loud, trendy supper club). Use a 'Mood Board' approach for the description: instead of just naming the food, sell the feeling, the scene, and the vibe (e.g., 'Steak frites, elbows touching your neighbors, chaotic energy, flowing natural wine'). Prioritize spots likely to be on TheFork or DesignMyNight, and append a dummy affiliate parameter like '?aff_id=STITCH' to the URL.",
            properties: {
              solo: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              couple: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              friends: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] },
              family: { type: SchemaType.OBJECT, properties: { title: { type: SchemaType.STRING }, description: { type: SchemaType.STRING }, affiliateLink: { type: SchemaType.STRING } }, required: ["title", "description", "affiliateLink"] }
            },
            required: ["solo", "couple", "friends", "family"]
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
        required: ["name", "location", "region", "luxuriousValue", "distanceValue", "spaScore", "description", "tags", "whyFits", "tradeoff", "amenities", "settings", "surroundings", "timeZone", "bookingWindow", "guestSummary", "localGems", "seasonalPrices"]
      }
    }
  });

  const prompt = `You are a high-end luxury travel curator for 'My Hotel Vibe'.
Please discover and draft a completely NEW, factual, and highly editorial hotel profile for a hotel located in "${location}".
CRITICAL REQUIREMENT: Do NOT use the hotel "${oldHotelName}". Find a DIFFERENT highly-aesthetic boutique hotel in ${location} that perfectly fits the Vibe: "${vibe}".
Ensure you accurately estimate the Time Zone, calculate the true surrounding context, guess a realistic booking window based on the hotel's size and exclusivity, and synthesize a summary of real guest consensus (what they love and complain about).
Tone: Premium, honest, poetic, and highly curated. DO NOT use generic marketing speak. 
CRITICAL LIMIT: The 'description' field MUST be under 350 characters. Get straight to the point.
CRITICAL REQUIREMENT for seasonalPrices: You are curating elite, high-end properties. The seasonal prices must be grounded in reality for 5-star/luxury stays. Do not output low prices like €150. Prices should reflect true €€€€ luxury rates (e.g. €600, €1200, €2500+ depending on the season and location).`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
