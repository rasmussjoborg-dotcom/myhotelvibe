import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fix() {
  const localPaths = Array.from({ length: 7 }, (_, i) => `/stays/la-mirande/la-mirande-${i + 1}.jpg`);
  const { error } = await supabase.from('hotels').update({ image: JSON.stringify(localPaths) }).eq('id', 'la-mirande');
  if (error) console.error(error);
  else console.log('Fixed la-mirande!');
}

fix();
