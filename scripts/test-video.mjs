import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const REPLICATE_API_TOKEN = process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('Missing VITE_REPLICATE_API_TOKEN in .env');
  process.exit(1);
}

// We will use Luma Ray as it's currently top-tier for cinematic camera motion from a single image.
// Another great option is minimax/video-01 or stability-ai/stable-video-diffusion
const MODEL_IDENTIFIER = 'luma/ray'; 

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateVideo(imageUrl, prompt) {
  console.log('Sending to Replicate (Luma Ray)...');
  console.log(`Image: ${imageUrl}`);
  console.log(`Prompt: ${prompt}`);

  // Note: For luma/ray via Replicate, the input schema might be different.
  // Actually, let's use a standard model we know the schema for.
  // minimax/video-01 is extremely good right now.
  // Input: { prompt: string, first_frame_image: string }
  
  const createRes = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        first_frame_image: imageUrl,
        prompt: prompt || 'Slow cinematic pan, highly detailed, photorealistic, 4k, smooth motion',
      }
    })
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create prediction: ${await createRes.text()}`);
  }

  const prediction = await createRes.json();
  const id = prediction.id;
  console.log(`Prediction created: ${id}. Polling... (This usually takes 2-3 minutes)`);

  while (true) {
    await sleep(5000);
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
      return pollData.output; // usually a URL to an mp4
    } else if (pollData.status === 'failed' || pollData.status === 'canceled') {
      throw new Error(`Prediction failed: ${pollData.error}`);
    } else {
      process.stdout.write('.');
    }
  }
}

async function main() {
  const imageUrl = process.argv[2];
  const prompt = process.argv[3] || 'Slow cinematic pan, highly detailed, photorealistic, 4k, smooth motion';

  if (!imageUrl) {
    console.error('Usage: node --env-file=.env scripts/test-video.mjs <image_url> "[prompt]"');
    process.exit(1);
  }

  try {
    const videoUrl = await generateVideo(imageUrl, prompt);
    console.log('\nSuccess! Video URL:', videoUrl);
  } catch (e) {
    console.error('\nError:', e);
  }
}

main().catch(console.error);
