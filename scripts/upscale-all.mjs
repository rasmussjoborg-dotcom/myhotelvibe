import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PROGRESS_FILE = 'upscale-progress.json';

async function main() {
  console.log('Fetching all hotels...');
  const { data: hotels, error } = await supabase.from('hotels').select('id');
  if (error) {
    console.error('Error fetching hotels:', error);
    return;
  }

  let progress = { completed: [] };
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }

  // Pre-mark carlton since we did it manually as a test
  if (!progress.completed.includes('carlton-hotel-st-moritz')) {
    progress.completed.push('carlton-hotel-st-moritz');
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  }

  const pendingHotels = hotels.filter(h => !progress.completed.includes(h.id));
  console.log(`Total hotels: ${hotels.length}`);
  console.log(`Already completed: ${progress.completed.length}`);
  console.log(`Pending: ${pendingHotels.length}`);

  for (let i = 0; i < pendingHotels.length; i++) {
    const hotelId = pendingHotels[i].id;
    console.log(`\n[${i + 1}/${pendingHotels.length}] Starting upscale for: ${hotelId}`);
    
    try {
      // Run the single upscale script synchronously so we don't overwhelm Replicate
      execSync(`node --env-file=.env --env-file=.env.local scripts/upscale-single.mjs ${hotelId}`, { stdio: 'inherit' });
      
      // If it succeeded without throwing, mark as completed
      progress.completed.push(hotelId);
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      console.log(`✅ Marked ${hotelId} as completed.`);
      
    } catch (err) {
      console.error(`❌ Error processing ${hotelId}. Skipping to next.`, err.message);
    }
  }
  
  console.log('\n🎉 Batch upscale complete!');
}

main().catch(console.error);
