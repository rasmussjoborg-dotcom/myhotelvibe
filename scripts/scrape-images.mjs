import fs from 'fs';
import 'dotenv/config';

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error(JSON.stringify({ error: 'No URL provided' }));
    process.exit(1);
  }

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error(JSON.stringify({ error: 'FIRECRAWL_API_KEY not found in environment' }));
    process.exit(1);
  }

  try {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        formats: ['extract', 'html'],
        waitFor: 3000,
        mobile: false,
        extract: {
          schema: {
            type: 'object',
            properties: {
              images: {
                type: 'array',
                items: { type: 'string' },
                description: 'Extract exactly 10 high-resolution image URLs of the hotel property. Look deeply in the page source, script tags, and JSON-LD data. For Booking.com, find URLs containing cf.bstatic.com/xdata/images/hotel/. For Hotels.com, find URLs containing images.trvl-media.com. ONLY return valid https URLs ending in .jpg or .png.'
              }
            },
            required: ['images']
          }
        }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to scrape via Firecrawl');
    }

    let images = data.data?.extract?.images || [];
    const html = data.data?.html || '';

    // Fallback/Enhancement: regex the raw HTML to find any hidden images
    // Allow backslashes to catch URLs inside JSON blobs (e.g. \/images\/hotel\/)
    const urlRegex = /(?:https:)?\/\/(?:cf\.bstatic\.com[\\\/]+xdata[\\\/]+images[\\\/]+hotel[\\\/]+[^\s"'<]+|images\.trvl-media\.com[\\\/]+(?:hotels|lodging)[\\\/]+[^\s"'<]+)/g;
    const matches = [...html.matchAll(urlRegex)].map(m => m[0]);
    if (matches.length > 0) {
      images = [...images, ...matches];
    }
    
    // Cleanup basic formatting
    let rawImages = images
      .filter(u => u.startsWith('http') && !u.includes('maps.googleapis') && !u.includes('captcha-delivery.com'))
      .map(u => u.replace(/&amp;/g, '&'))
      .map(u => u.replace(/\\/g, ''));

    // Upgrade resolution natively and deduplicate by EXACT image ID to preserve order
    // and grab the first 10 truly unique images from the gallery.
    const seenIds = new Set();
    const trulyUniqueImages = [];

    for (let u of rawImages) {
      if (trulyUniqueImages.length >= 10) break; // Only need 10
      
      let id = u;
      let upgradedUrl = u;

      if (u.includes('bstatic.com')) {
        // Extract Booking.com core ID
        const match = u.match(/\/([^\/]+)\.(?:jpg|jpeg|png|webp)/i);
        if (match) id = `booking_${match[1]}`;
        // Upgrade resolution
        upgradedUrl = u.replace(/\/images\/hotel\/[^\/]+\//i, '/images/hotel/max1280x900/');
      } else if (u.includes('trvl-media.com')) {
        // Extract Expedia/Hotels.com ID
        const match = u.match(/\/([^\/]+)\.(?:jpg|jpeg|png|webp)/i);
        if (match) {
          let coreId = match[1].replace(/_[a-z]$/i, '');
          id = `expedia_${coreId}`;
        }
        // Upgrade resolution
        upgradedUrl = u.replace(/_[a-z]\.jpg/i, '_z.jpg');
      }

      if (!seenIds.has(id)) {
        seenIds.add(id);
        trulyUniqueImages.push(upgradedUrl);
      }
    }

    console.log(JSON.stringify({ images: trulyUniqueImages }));
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();
