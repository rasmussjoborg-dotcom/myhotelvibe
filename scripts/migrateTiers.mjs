import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function migrate() {
  const map = {
    'The Accessible Gem (€€)': 'Boutique (€€)',
    'The Attainable Luxury (€€€)': 'Luxe (€€€)',
    'The Iconic Splurge (€€€€)': 'Iconic (€€€€)'
  };
  
  for (const [oldTier, newTier] of Object.entries(map)) {
    console.log(`Updating ${oldTier} to ${newTier}...`);
    const { data, error } = await supabase
      .from('hotels')
      .update({ priceTier: newTier })
      .eq('priceTier', oldTier);
      
    if (error) {
      console.error('Error:', error);
    } else {
      console.log(`Success for ${newTier}`);
    }
  }
}
migrate();
