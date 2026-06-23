import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyze() {
  const { data: stays, error } = await supabase
    .from('hotels')
    .select('*');

  if (error) {
    console.error("Error fetching stays:", error);
    return;
  }

  // Define new taxonomy backdrops
  const allBackdrops = [
    'Pristine Shores',
    'Iconic Cities',
    'Alpine & Peaks',
    'Remote Sanctuaries',
    'Exclusive Islands',
    'Lakeside Estates',
    'Desert Oases',
    'Winter Escapes'
  ];

  const destinationsByBackdrop: Record<string, string[]> = {
    'Pristine Shores': ['Amalfi Coast, Italy', 'Santorini, Greece', 'Algarve, Portugal', 'San Sebastian, Spain'],
    'Iconic Cities': ['Paris, France', 'London, UK', 'Rome, Italy', 'Copenhagen, Denmark', 'Amsterdam, Netherlands'],
    'Alpine & Peaks': ['Swiss Alps (Zermatt/St. Moritz), Switzerland', 'Dolomites, Italy', 'Engadin Valley, Switzerland'],
    'Remote Sanctuaries': ['Tuscany, Italy', 'The Cotswolds, UK', 'Scottish Highlands', 'Provence, France'],
    'Exclusive Islands': ['Mallorca, Spain', 'Ibiza, Spain', 'Mykonos, Greece', 'Madeira, Portugal', 'Corsica, France'],
    'Lakeside Estates': ['Lake Como, Italy', 'Geneva, Switzerland', 'Lake Bled, Slovenia', 'Lake Annecy, France'],
    'Desert Oases': ['Andalusia (Seville/Granada), Spain', 'Matera, Italy'],
    'Winter Escapes': ['Reykjavik, Iceland', 'Lofoten Islands, Norway']
  };

  const backdrops: Record<string, number> = {};
  allBackdrops.forEach(b => backdrops[b] = 0);
  const tiers: Record<string, number> = {};

  for (const stay of stays || []) {
    const bd = stay.primaryBackdrop || stay.primary_backdrop || stay.primarybackdrop;
    const pt = stay.priceTier || stay.price_tier || stay.pricetier;
    
    if (bd && backdrops[bd] !== undefined) backdrops[bd]++;
    if (pt) tiers[pt] = (tiers[pt] || 0) + 1;
  }

  console.log("--- GAP ANALYSIS ---");
  console.log("Current Backdrops count:");
  const sortedBackdrops = Object.entries(backdrops).sort((a, b) => a[1] - b[1]);
  sortedBackdrops.forEach(([k, v]) => {
    console.log(`- ${k}: ${v}`);
  });

  const targetBackdrop = sortedBackdrops[0][0];
  const candidates = destinationsByBackdrop[targetBackdrop];
  const targetDestination = candidates[Math.floor(Math.random() * candidates.length)];

  console.log(`\nRECOMMENDATION: Target the backdrop with the lowest count: ${targetBackdrop}`);
  console.log(`SUGGESTED DESTINATION: ${targetDestination}`);
}

analyze();
