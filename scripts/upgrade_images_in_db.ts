import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function upgradeBookingImageUrl(url: string) {
  if (!url) return url;
  
  // Booking.com image upgrade
  if (url.includes('bstatic.com') && url.includes('/images/hotel/')) {
    return url.replace(/\/images\/hotel\/[^\/]+\//i, '/images/hotel/max2000/');
  }
  
  // Expedia / Hotels.com image upgrade
  if (url.includes('images.trvl-media.com') || url.includes('expedia.com')) {
    return url.replace(/_[a-z]\.(jpg|jpeg|png)$/i, '_z.$1');
  }

  return url;
}

async function run() {
  const { data: hotels, error } = await supabase.from('hotels').select('*');
  if (error || !hotels) {
    console.error("Failed to fetch hotels", error);
    return;
  }

  console.log(`Found ${hotels.length} hotels. Upgrading image URLs...`);
  let updatedCount = 0;

  for (const hotel of hotels) {
    let changed = false;
    
    const newImage = upgradeBookingImageUrl(hotel.image || '');
    if (newImage !== hotel.image) changed = true;
    
    let newImages = hotel.images || [];
    if (Array.isArray(newImages)) {
      const mapped = newImages.map(upgradeBookingImageUrl);
      // Check if arrays are different
      if (JSON.stringify(mapped) !== JSON.stringify(newImages)) {
        changed = true;
        newImages = mapped;
      }
    }
    
    if (changed) {
      console.log(`Upgrading images for ${hotel.name}...`);
      const { error: updateError } = await supabase
        .from('hotels')
        .update({ image: newImage, images: newImages })
        .eq('id', hotel.id);
        
      if (updateError) {
        console.error(`  Failed to update ${hotel.name}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`Done! Upgraded image URLs for ${updatedCount} hotels.`);
}

run();
