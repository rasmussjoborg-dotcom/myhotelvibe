import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import 'dotenv/config';

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
  if (downscaledUrl.includes('bstatic.com')) {
    downscaledUrl = downscaledUrl.replace(/\/max[^\/]+\//, '/max1024/');
  }

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

  // Images in stays-images are the raw Booking.com JPEGs — they still need upscaling

  console.log(`Processing ${hotel.id}...`);
  const newImagePaths = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const originalUrl = imageUrls[i];
    if (!originalUrl) continue;
    
    // If it's already a local path, it's problematic but let's skip for now or try to use it
    if (originalUrl.startsWith('/')) {
      newImagePaths.push(originalUrl);
      continue;
    }

    console.log(`  Upscaling image ${i+1}/${imageUrls.length}...`);
    try {
      const upscaledUrl = await upscaleImage(originalUrl);
      
      console.log(`  Downloading and compressing image ${i+1}...`);
      const res = await fetch(upscaledUrl);
      if (!res.ok) throw new Error(`Failed to fetch upscaled image: ${res.statusText}`);
      const buffer = await res.arrayBuffer();

      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 2000, withoutEnlargement: true })
        .jpeg({ quality: 92 })
        .toBuffer();

      const filePath = `${hotel.id}/${i + 1}.jpg`;

      console.log(`  Uploading image ${i+1} to Supabase...`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('stays-images')
        .upload(filePath, optimizedBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/stays-images/${filePath}`;
      newImagePaths.push(publicUrl);
      console.log(`  -> Saved to ${publicUrl}`);
    } catch (e) {
      console.error(`  -> Failed to upscale/upload image ${i+1}:`, e.message);
      newImagePaths.push(originalUrl); // Fallback to original
    }
  }

  // Update DB
  const { error: updateError } = await supabase
    .from('hotels')
    .update({ 
      image: newImagePaths.length > 0 ? JSON.stringify(newImagePaths) : hotel.image
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
