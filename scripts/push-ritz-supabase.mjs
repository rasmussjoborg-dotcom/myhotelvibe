import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newImages = [
  "/stays/ritz-london/ritz-1.jpg",
  "/stays/ritz-london/ritz-2.jpg",
  "/stays/ritz-london/ritz-3.jpg",
  "/stays/ritz-london/ritz-4.jpg",
  "/stays/ritz-london/ritz-5.jpg"
];

async function updateDB() {
  const { data, error } = await supabase
    .from('hotels')
    .update({ image: JSON.stringify(newImages) })
    .eq('id', 'the-ritz-london');

  if (error) {
    console.error('Error updating DB:', error);
  } else {
    console.log('Successfully updated the-ritz-london in Supabase!');
  }
}

updateDB();
