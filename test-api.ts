import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

supabase.from('hotels').select('*').then(({ data }) => {
  const hotel = data[0];
  let parsedImages = [hotel.image, hotel.image2, hotel.image3].filter(Boolean);
  
  try {
    if (hotel.image && hotel.image.startsWith('[')) {
      const parsed = JSON.parse(hotel.image);
      if (Array.isArray(parsed)) parsedImages = parsed;
    }
  } catch(e) {}
  
  console.log("parsedImages:", parsedImages);
  console.log("fallback image:", parsedImages[0]);
});
