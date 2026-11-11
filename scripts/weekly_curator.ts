import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const apiKey = process.env.VITE_GEMINI_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serperKey = process.env.VITE_SERPER_API_KEY;

if (!apiKey || !supabaseUrl || !supabaseKey) {
  console.error("Missing required environment variables (VITE_GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const supabase = createClient(supabaseUrl, supabaseKey);

const ALL_BACKDROPS = [
  'Pristine Shores',
  'Iconic Cities',
  'Alpine & Peaks',
  'Remote Sanctuaries',
  'Exclusive Islands',
  'Lakeside Estates',
  'Desert Oases',
  'Winter Escapes'
];

const ALL_VIBES = [
  "Do absolutely nothing",
  "The Romantic Reset",
  "The Social Weekender",
  "The Creative Retreat",
  "The Epicurean Pilgrimage",
  "The Sun-Drenched Escape",
  "The Urban Explorer",
  "Touching grass",
  "Heavy pampering",
  "Aesthetic hunting"
];

interface GapTarget {
  backdrop: string;
  vibe: string;
}

/**
 * 1. Audits live Supabase database for coverage gaps.
 */
async function auditGaps(): Promise<{ gaps: GapTarget[]; existingNames: Set<string> }> {
  const { data: stays, error } = await supabase
    .from('hotels')
    .select('name, primaryBackdrop, primaryPersona, location');

  if (error || !stays) {
    console.error("Error fetching stays from Supabase:", error);
    return {
      gaps: [
        { backdrop: 'Remote Sanctuaries', vibe: 'The Romantic Reset' },
        { backdrop: 'Lakeside Estates', vibe: 'The Epicurean Pilgrimage' },
        { backdrop: 'Alpine & Peaks', vibe: 'Touching grass' }
      ],
      existingNames: new Set()
    };
  }

  const existingNames = new Set(stays.map(s => s.name?.toLowerCase().trim()).filter(Boolean));
  const backdropCounts: Record<string, number> = {};
  ALL_BACKDROPS.forEach(b => backdropCounts[b] = 0);

  const vibeCounts: Record<string, number> = {};
  ALL_VIBES.forEach(v => vibeCounts[v] = 0);

  for (const s of stays) {
    if (s.primaryBackdrop && backdropCounts[s.primaryBackdrop] !== undefined) {
      backdropCounts[s.primaryBackdrop]++;
    }
    if (s.primaryPersona && vibeCounts[s.primaryPersona] !== undefined) {
      vibeCounts[s.primaryPersona]++;
    }
  }

  const sortedBackdrops = Object.entries(backdropCounts).sort((a, b) => a[1] - b[1]);
  const sortedVibes = Object.entries(vibeCounts).sort((a, b) => a[1] - b[1]);

  console.log("Database Audit: Total stays =", stays.length);
  console.log("Top 3 lowest backdrops:", sortedBackdrops.slice(0, 3).map(([b, c]) => `${b} (${c})`).join(', '));
  console.log("Top 3 lowest vibes:", sortedVibes.slice(0, 3).map(([v, c]) => `${v} (${c})`).join(', '));

  const gaps: GapTarget[] = [];
  for (let i = 0; i < 3; i++) {
    const backdrop = sortedBackdrops[i] ? sortedBackdrops[i][0] : ALL_BACKDROPS[i];
    const vibe = sortedVibes[i] ? sortedVibes[i][0] : ALL_VIBES[i];
    gaps.push({ backdrop, vibe });
  }

  return { gaps, existingNames };
}

async function callGeminiWithFallback(fn: (modelName: string) => Promise<any>) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: any = null;
  for (const m of models) {
    try {
      return await fn(m);
    } catch (e: any) {
      lastError = e;
      if (e?.status === 402 || e?.status === 404 || e?.status === 429) {
        console.warn(`Model ${m} encountered status ${e?.status}. Trying next model...`);
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

/**
 * 2. Uses Gemini to discover real candidate hotels filling the identified gaps.
 */
async function discoverCandidates(gap: GapTarget, existingNames: Set<string>): Promise<{ name: string; location: string; tier: string } | null> {
  const prompt = `You are a world-class luxury boutique travel curator for 'My Hotel Vibe'.
Find 4 real, highly-acclaimed 4-star superior or 5-star independent luxury boutique hotels in Europe or Mediterranean that fit:
- Backdrop: "${gap.backdrop}"
- Vibe: "${gap.vibe}"
CRITICAL RULES:
1. ONLY suggest genuine, world-renowned luxury or high-aesthetic design hotels (Relais & Chateaux, Michelin Key, Design Hotels, Leading Hotels of the World, or cult-favorite independent retreats).
2. DO NOT suggest budget hotels or standard corporate chains (no Marriott, Hilton, Ibis, Moxy).
3. The location MUST be strictly formatted as "City, Country" or "Region, Country".`;

  const candidates: Array<{ name: string; location: string; tier: string }> = await callGeminiWithFallback(async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              location: { type: SchemaType.STRING, description: "City, Country or Region, Country" },
              tier: { type: SchemaType.STRING, description: "Must be 'Iconic (€€€€)', 'Luxe (€€€)', or 'Boutique (€€)'" }
            },
            required: ["name", "location", "tier"]
          }
        }
      }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  });

  for (const c of candidates) {
    if (!existingNames.has(c.name.toLowerCase().trim())) {
      existingNames.add(c.name.toLowerCase().trim());
      return c;
    }
  }

  return candidates[0] || null;
}

/**
 * 3. Fetches official Booking.com URL and verified high-res 2000px images via Serper API.
 */
async function fetchVerifiedBookingData(hotelName: string, location: string): Promise<{ bookingUrl: string; images: string[] }> {
  let bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${hotelName} ${location}`)}`;
  const images: string[] = [];

  if (!serperKey) {
    console.warn("No VITE_SERPER_API_KEY found. Using fallback URLs.");
    return { bookingUrl, images };
  }

  try {
    // 1. Find clean hotel URL
    const searchRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `site:booking.com/hotel "${hotelName}" "${location}"`,
        num: 3
      })
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.organic && searchData.organic.length > 0) {
        for (const item of searchData.organic) {
          if (item.link && item.link.includes('booking.com/hotel')) {
            bookingUrl = item.link.split('?')[0];
            break;
          }
        }
      }
    }

    // 2. Find high-res Booking.com CDN images
    const imageRes = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `site:cf.bstatic.com "${hotelName}" ${location}`,
        num: 10
      })
    });

    if (imageRes.ok) {
      const imageData = await imageRes.json();
      if (imageData.images && Array.isArray(imageData.images)) {
        const seenIds = new Set<string>();

        for (const img of imageData.images) {
          const rawUrl: string = img.imageUrl || '';
          if (rawUrl.includes('cf.bstatic.com/xdata/images/hotel/')) {
            // Upgrade image resolution to max2000
            const upgradedUrl = rawUrl.replace(/\/images\/hotel\/[^\/]+\//i, '/images/hotel/max2000/');
            const idMatch = upgradedUrl.match(/\/([0-9]+)\.(?:jpg|jpeg|png)/i);
            const id = idMatch ? idMatch[1] : upgradedUrl;

            if (!seenIds.has(id)) {
              seenIds.add(id);
              images.push(upgradedUrl);
              if (images.length >= 4) break;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error resolving Booking.com data for ${hotelName}:`, err);
  }

  return { bookingUrl, images };
}

/**
 * 4. Generates rich editorial copy and metadata for the hotel.
 */
async function generateEditorialProfile(hotelName: string, location: string, backdrop: string, vibe: string) {
  const prompt = `Generate a razor-sharp editorial hotel profile for '${hotelName}' located in '${location}'.
Backdrop: '${backdrop}'
Vibe: '${vibe}'
NO CLICHES: Never use 'nestled', 'oasis', 'luxury', 'boasts', or 'hidden gem'. Write in calm, tactile, editorial magazine tone.
Description MUST be strictly under 350 characters.
CardTeaser MUST be strictly 110-130 characters.`;

  return await callGeminiWithFallback(async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            region: { type: SchemaType.STRING },
            luxuriousValue: { type: SchemaType.NUMBER, description: "Score 1-5" },
            distanceValue: { type: SchemaType.NUMBER, description: "Minutes from nearest airport" },
            spaScore: { type: SchemaType.NUMBER, description: "Score 1-5" },
            description: { type: SchemaType.STRING, description: "Max 350 chars punchy editorial description. Banned words: 'nestled', 'oasis', 'luxury', 'boasts'." },
            cardTeaser: { type: SchemaType.STRING, description: "Exactly 2 short sentences, strictly 110-130 characters total." },
            tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            whyFits: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Exactly 2 items: 'The Draw: [reason]' and 'The Flex: [reason]'" },
            tradeoff: { type: SchemaType.STRING, description: "One brutally honest sentence on who would dislike this stay." },
            amenities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            settings: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            surroundings: { type: SchemaType.STRING },
            timeZone: { type: SchemaType.STRING },
            bookingWindow: { type: SchemaType.STRING },
            guestSummary: { type: SchemaType.STRING },
            localGems: {
              type: SchemaType.OBJECT,
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
          required: ["region", "luxuriousValue", "distanceValue", "spaScore", "description", "cardTeaser", "tags", "whyFits", "tradeoff", "amenities", "settings", "surroundings", "timeZone", "bookingWindow", "guestSummary", "localGems", "seasonalPrices"]
        }
      }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  });
}

/**
 * Main Autonomous Orchestrator.
 */
async function run() {
  console.log("==========================================");
  console.log("🚀 Starting Autonomous Weekly Hotel Curator");
  console.log("==========================================\n");

  const { gaps, existingNames } = await auditGaps();
  console.log(`\nIdentified ${gaps.length} priority gaps to fulfill.`);

  const curatedHotels: string[] = [];

  for (let i = 0; i < gaps.length; i++) {
    const gap = gaps[i];
    console.log(`\n[${i + 1}/${gaps.length}] Discovering stay for gap: "${gap.backdrop}" × "${gap.vibe}"...`);

    const candidate = await discoverCandidates(gap, existingNames);
    if (!candidate) {
      console.warn(`No suitable candidate found for gap ${gap.backdrop} × ${gap.vibe}`);
      continue;
    }

    console.log(`Selected Candidate: ${candidate.name} in ${candidate.location} (${candidate.tier})`);

    // 1. Fetch verified Booking.com data and photos
    console.log(`Resolving verified Booking.com link & 2000px images...`);
    const { bookingUrl, images } = await fetchVerifiedBookingData(candidate.name, candidate.location);
    console.log(`Found ${images.length} verified 2000px images. Booking URL: ${bookingUrl}`);

    if (images.length === 0) {
      console.warn(`Skipping ${candidate.name}: No verified high-res images found.`);
      continue;
    }

    // 2. Generate editorial copy
    console.log(`Writing editorial copy & travel logistics...`);
    const profile = await generateEditorialProfile(candidate.name, candidate.location, gap.backdrop, gap.vibe);

    const cleanId = candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const priceCategory = candidate.tier.includes('€€€€') ? '€€€€' : candidate.tier.includes('€€€') ? '€€€' : '€€';

    const payload = {
      id: cleanId,
      name: candidate.name,
      location: candidate.location,
      region: profile.region || candidate.location.split(',')[0].trim(),
      primaryBackdrop: gap.backdrop,
      primaryPersona: gap.vibe,
      priceTier: candidate.tier,
      priceCategory,
      priceValue: profile.seasonalPrices?.summer || 450,
      luxuriousValue: Math.round(Number(profile.luxuriousValue) || 4),
      distanceValue: Math.round(Number(profile.distanceValue) || 45),
      spaScore: Math.round(Number(profile.spaScore) || 4),
      description: profile.description,
      cardTeaser: profile.cardTeaser,
      tags: Array.from(new Set([gap.vibe, ...(profile.tags || [])])),
      whyFits: profile.whyFits,
      tradeoff: profile.tradeoff,
      amenities: profile.amenities || [],
      settings: profile.settings || [],
      surroundings: profile.surroundings,
      timeZone: profile.timeZone || 'CET',
      bookingWindow: profile.bookingWindow || '2-3 months',
      guestSummary: profile.guestSummary,
      localGems: profile.localGems,
      seasonalPrices: profile.seasonalPrices,
      bookingUrl,
      image: JSON.stringify(images),
      imageAlt: candidate.name,
      updated_at: new Date().toISOString()
    };

    console.log(`Saving ${candidate.name} directly to live Supabase database...`);
    const { error } = await supabase.from('hotels').upsert([payload]);

    if (error) {
      console.error(`❌ Failed to save ${candidate.name}:`, error.message);
    } else {
      console.log(`✅ Successfully published ${candidate.name}!`);
      curatedHotels.push(`${candidate.name} (${candidate.location})`);
    }

    // Rate-limit spacer
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n==========================================");
  console.log(`✨ Weekly Curation Complete! Added ${curatedHotels.length} stays:`);
  curatedHotels.forEach((h, idx) => console.log(`   ${idx + 1}. ${h}`));
  console.log("==========================================");

  // Trigger optional Vercel deploy hook to re-generate static SEO pages
  const deployHook = process.env.VERCEL_DEPLOY_HOOK;
  if (deployHook && curatedHotels.length > 0) {
    try {
      console.log("\nTriggering Vercel Deploy Hook to rebuild SEO pages...");
      const hookRes = await fetch(deployHook, { method: 'POST' });
      console.log(`Deploy Hook status: ${hookRes.status} ${hookRes.statusText}`);
    } catch (e) {
      console.error("Failed to trigger Vercel Deploy Hook:", e);
    }
  }

  // Trigger optional Notification Webhook (e.g. Telegram / Discord / Slack)
  const notifyWebhook = process.env.NOTIFICATION_WEBHOOK;
  if (notifyWebhook && curatedHotels.length > 0) {
    try {
      await fetch(notifyWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `✨ My Hotel Vibe: ${curatedHotels.length} new luxury stays published:\n` +
            curatedHotels.map(h => `• ${h}`).join('\n') +
            `\n\nLive now at https://myhotelvibe.com`
        })
      });
      console.log("Notification sent successfully.");
    } catch (e) {
      console.error("Failed to send notification webhook:", e);
    }
  }
}

run().catch(err => {
  console.error("Curator fatal error:", err);
  process.exit(1);
});
