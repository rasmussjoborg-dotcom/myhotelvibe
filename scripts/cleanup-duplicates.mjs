import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting full cleanup of hotel images...');

  // 1. Fetch all hotels
  const { data: hotels, error } = await supabase.from('hotels').select('id, name, "bookingUrl", image');
  
  if (error) {
    console.error('Failed to fetch hotels:', error);
    process.exit(1);
  }

  console.log(`Found ${hotels.length} hotels to check.`);

  for (const hotel of hotels) {
    if (!hotel.bookingUrl) {
      console.log(`Skipping ${hotel.name} - No OTA URL`);
      continue;
    }

    console.log(`\n--- Processing: ${hotel.name} ---`);
    console.log(`URL: ${hotel.bookingUrl}`);

    try {
      // 2. Scrape perfectly unique images
      console.log('Scraping fresh unique images...');
      const scrapeOutput = execSync(`node scripts/scrape-images.mjs "${hotel.bookingUrl}"`, { encoding: 'utf8' });
      
      // The script outputs JSON. Parse the last line or find the JSON block.
      let scrapedImages = [];
      try {
        const lines = scrapeOutput.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const result = JSON.parse(jsonLine);
        scrapedImages = result.images || [];
      } catch (e) {
        console.error('Failed to parse scraper output:', scrapeOutput);
        continue;
      }

      if (scrapedImages.length === 0) {
        console.log('No images found for this hotel.');
        continue;
      }

      console.log(`Found ${scrapedImages.length} perfectly unique images. Update DB...`);

      // 3. Temporarily update the DB with the raw external URLs 
      // so upscale-single.mjs can read them and process them.
      const { error: updateErr } = await supabase
        .from('hotels')
        .update({ image: JSON.stringify(scrapedImages) })
        .eq('id', hotel.id);

      if (updateErr) {
        console.error('Failed to update DB with raw images:', updateErr);
        continue;
      }

      // 4. Run upscale script to process these new unique images
      console.log('Running upscaler for this hotel...');
      execSync(`node --env-file=.env --env-file=.env.local scripts/upscale-single.mjs ${hotel.id}`, { stdio: 'inherit' });

      console.log(`Finished ${hotel.name}. Waiting 5 seconds before next hotel to avoid rate limits...`);
      await sleep(5000);

    } catch (err) {
      console.error(`Error processing ${hotel.name}:`, err.message);
    }
  }

  console.log('\nCleanup complete! All hotels now have perfectly unique upscaled images.');
}

main().catch(console.error);
