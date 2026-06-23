import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_VERSION = '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b'; 

if (!SUPABASE_URL || !SUPABASE_KEY || !REPLICATE_API_TOKEN) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upscaleImage(imageUrl) {
  let downscaledUrl = imageUrl;
  // Booking.com: replace any max... folder with max1024
  if (downscaledUrl.includes('bstatic.com')) {
    downscaledUrl = downscaledUrl.replace(/\/max[^\/]+\//, '/max1024/');
  }
  // Expedia: replace _z or _b with _y (which is typically smaller) if needed, or leave it.
  // Actually Replicate can handle 1024px. If it's already a reasonable size, it's fine.


  let createRes;
  let retryCount = 0;
  while (retryCount < 5) {
    createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          image: downscaledUrl,
          scale: 4,
          face_enhance: false
        }
      })
    });

    if (createRes.status === 429) {
      console.log('  Rate limited by Replicate. Waiting 5 seconds before retrying...');
      await sleep(5000);
      retryCount++;
      continue;
    }
    
    if (!createRes.ok) {
      throw new Error(`Failed to create prediction: ${await createRes.text()}`);
    }
    break;
  }
  
  if (!createRes || !createRes.ok) {
     throw new Error(`Failed to create prediction after retries.`);
  }

  const prediction = await createRes.json();
  const id = prediction.id;

  while (true) {
    await sleep(2000);
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`
      }
    });

    if (!pollRes.ok) {
      throw new Error(`Poll failed: ${await pollRes.text()}`);
    }

    const pollData = await pollRes.json();
    if (pollData.status === 'succeeded') {
      return pollData.output;
    } else if (pollData.status === 'failed' || pollData.status === 'canceled') {
      throw new Error(`Prediction failed: ${pollData.error}`);
    }
  }
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
}

async function main() {
  const hotelId = process.argv[2];
  if (!hotelId) {
    console.error('Please provide a hotel ID as an argument');
    process.exit(1);
  }

  const { data: hotels, error } = await supabase.from('hotels').select('*').eq('id', hotelId);
  if (error || !hotels || hotels.length === 0) {
    console.error('Error fetching hotel or not found:', error);
    return;
  }

  const hotel = hotels[0];
    let imageUrls = hotel.images || [];
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      try {
        imageUrls = typeof hotel.image === 'string' && hotel.image.startsWith('[') ? JSON.parse(hotel.image) : [hotel.image].filter(Boolean);
      } catch(e) {
        console.error('Failed to parse legacy image field', e);
      }
    }

    // Check if it needs upscaling
    if (!imageUrls.some(u => typeof u === 'string' && u.startsWith('http'))) {
      console.log(`Skipping ${hotel.id}, already local.`);
      return;
    }

    console.log(`Processing ${hotel.id}...`);
    const localPaths = [];
    const dirPath = path.resolve(`public/stays/${hotel.id}`);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    for (let i = 0; i < imageUrls.length; i++) {
      const originalUrl = imageUrls[i];
      if (!originalUrl) continue;
      
      if (originalUrl.startsWith('/')) {
        localPaths.push(originalUrl);
        continue;
      }

      console.log(`  Upscaling image ${i+1}/${imageUrls.length}...`);
      try {
        const upscaledUrl = await upscaleImage(originalUrl);
        const filename = `${hotel.id}-${i + 1}.jpg`;
        const localPath = `/stays/${hotel.id}/${filename}`;
        const absoluteDest = path.resolve(dirPath, filename);
        
        await downloadImage(upscaledUrl, absoluteDest);
        
        // Generate thumbnail
        const thumbDest = path.resolve(dirPath, `${hotel.id}-${i + 1}-thumb.jpg`);
        try {
          execSync(`sips -Z 800 "${absoluteDest}" --out "${thumbDest}"`, { stdio: 'ignore' });
        } catch (err) {
          console.error(`  -> Failed to generate thumbnail for image ${i+1}:`, err.message);
        }

        localPaths.push(localPath);
        console.log(`  -> Saved to ${localPath} and generated thumbnail`);
      } catch (e) {
        console.error(`  -> Failed to upscale/download image ${i+1}:`, e);
        localPaths.push(originalUrl); // Fallback to original
      }
    }

    // Update DB
    const { error: updateError } = await supabase
      .from('hotels')
      .update({ 
        image: localPaths.length > 0 ? JSON.stringify(localPaths) : hotel.image
      })
      .eq('id', hotel.id);

    if (updateError) {
      console.error(`Error updating DB for ${hotel.id}:`, updateError);
    } else {
      console.log(`Successfully updated ${hotel.id} in Supabase!`);
    }

  console.log('Finished processing hotel.');
}

main().catch(console.error);
