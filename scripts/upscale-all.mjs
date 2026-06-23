import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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
  const downscaledUrl = imageUrl.replace('max2000', 'max1024');

  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
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

  if (!createRes.ok) {
    throw new Error(`Failed to create prediction: ${await createRes.text()}`);
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
  const { data: hotels, error } = await supabase.from('hotels').select('*');
  if (error) {
    console.error('Error fetching hotels:', error);
    return;
  }

  for (const hotel of hotels) {
    let imageUrls = [];
    try {
      imageUrls = typeof hotel.image === 'string' && hotel.image.startsWith('[') ? JSON.parse(hotel.image) : [hotel.image];
    } catch(e) {
      continue;
    }

    // Check if it needs upscaling
    if (!imageUrls.some(u => typeof u === 'string' && u.startsWith('http'))) {
      console.log(`Skipping ${hotel.id}, already local.`);
      continue;
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
        localPaths.push(localPath);
        console.log(`  -> Saved to ${localPath}`);
      } catch (e) {
        console.error(`  -> Failed to upscale/download image ${i+1}:`, e);
        localPaths.push(originalUrl); // Fallback to original
      }
    }

    // Update DB
    const { error: updateError } = await supabase
      .from('hotels')
      .update({ image: JSON.stringify(localPaths) })
      .eq('id', hotel.id);

    if (updateError) {
      console.error(`Error updating DB for ${hotel.id}:`, updateError);
    } else {
      console.log(`Successfully updated ${hotel.id} in Supabase!`);
    }
  }

  console.log('Finished processing all hotels.');
}

main().catch(console.error);
