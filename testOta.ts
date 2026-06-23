import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Simplified fetchRapidAPI
async function fetchRapidAPI(endpoint: string, params: Record<string, string>) {
  const RAPIDAPI_KEY = process.env.VITE_RAPIDAPI_KEY;
  if (!RAPIDAPI_KEY) throw new Error("Missing key");
  
  const queryParams = new URLSearchParams(params).toString();
  const url = `https://booking-com.p.rapidapi.com${endpoint}?${queryParams}`;
  console.log(`Fetching: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'booking-com.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`RapidAPI Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function runTest(locationName: string) {
  try {
    const locData = await fetchRapidAPI('/v1/hotels/locations', {
      name: locationName,
      locale: 'en-gb'
    });
    
    console.log(`Found locations for ${locationName}:`, locData.length);
    if (locData.length > 0) {
      console.log(`First loc: ${locData[0].name} (dest_id: ${locData[0].dest_id})`);
    } else {
      console.log("No locations found! THIS IS THE BUG.");
    }
  } catch (e) {
    console.error(e);
  }
}

runTest("Concrete jungle");
runTest("Rome, Italy");
