import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
dotenv.config({ path: '.env.local', override: true })

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!)

async function run() {
  const { data, error } = await supabase.from('hotels').select('*')
  if (error) {
    console.error(error)
    return
  }
  
  console.log(`Total hotels: ${data.length}`)
  
  const backdrops: Record<string, number> = {}
  const combinations: Record<string, number> = {}
  
  for (const stay of data) {
    const bd = stay.primaryBackdrop || stay.primary_backdrop || stay.primarybackdrop;
    const pt = stay.priceTier || stay.price_tier || stay.pricetier;
    
    if (bd) {
      backdrops[bd] = (backdrops[bd] || 0) + 1
      if (pt) {
        const combo = `${bd} × ${pt}`
        combinations[combo] = (combinations[combo] || 0) + 1
      }
    }
  }
  
  console.log('\nBackdrops:')
  for (const [b, c] of Object.entries(backdrops)) {
    console.log(`- ${b}: ${c}`)
  }
  
  console.log('\nCombinations:')
  for (const [combo, count] of Object.entries(combinations)) {
    console.log(`- ${combo}: ${count}`)
  }
}

run()
