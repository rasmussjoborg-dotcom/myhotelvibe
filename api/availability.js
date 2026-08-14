// api/availability.js - Vercel Serverless & Vite Middleware Handler

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Parse query params
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const hotelName = urlObj.searchParams.get('hotelName');
  const checkin = urlObj.searchParams.get('checkin');
  const checkout = urlObj.searchParams.get('checkout');
  const priceTier = urlObj.searchParams.get('priceTier') || 'BOUTIQUE';

  if (!checkin || !checkout) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'checkin and checkout dates are required' }));
    return;
  }

  const apiKey = process.env.LITEAPI_KEY || process.env.VITE_LITEAPI_KEY;

  // Calculate number of nights
  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));

  // If LiteAPI key is present, attempt live API fetch
  if (apiKey && apiKey.trim() !== '') {
    try {
      // 1. Search hotel in LiteAPI
      const searchRes = await fetch(`https://api.liteapi.travel/v3.0/data/hotels?name=${encodeURIComponent(hotelName || '')}`, {
        headers: { 'X-API-Key': apiKey }
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const hotel = searchData?.data?.[0];

        if (hotel?.id) {
          // 2. Fetch live rates for hotel
          const ratesRes = await fetch(`https://api.liteapi.travel/v3.0/hotels/rates?hotelIds=${hotel.id}&checkin=${checkin}&checkout=${checkout}&adults=2&currency=EUR`, {
            headers: { 'X-API-Key': apiKey }
          });

          if (ratesRes.ok) {
            const ratesData = await ratesRes.json();
            const offers = ratesData?.data?.[0]?.rates || [];

            if (offers.length > 0) {
              const cheapest = offers.reduce((min, cur) => (cur.retailRate?.total?.[0]?.amount < min.retailRate?.total?.[0]?.amount ? cur : min), offers[0]);
              const totalPrice = Math.round(cheapest.retailRate?.total?.[0]?.amount || 0);
              const nightlyRate = Math.round(totalPrice / nights);

              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
              res.end(JSON.stringify({
                status: 'available',
                available: true,
                nightlyRate,
                totalPrice,
                currency: 'EUR',
                roomName: cheapest.name || 'Standard Room',
                nights,
                source: 'liteapi'
              }));
              return;
            } else {
              // Sold out on LiteAPI
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'sold_out',
                available: false,
                nights,
                source: 'liteapi'
              }));
              return;
            }
          }
        }
      }
    } catch (err) {
      console.warn('LiteAPI fetch failed, falling back to heuristic:', err);
    }
  }

  // Graceful fallback / simulation when API key is pending or hotel not in GDS
  const baseRate = priceTier.includes('ULTRA') || priceTier.includes('€€€€') ? 650 : priceTier.includes('LUXE') || priceTier.includes('€€€') ? 380 : 220;
  const hash = (hotelName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const nightlyRate = baseRate + (hash % 80) - 40;
  const totalPrice = nightlyRate * nights;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=300');
  res.end(JSON.stringify({
    status: 'estimated',
    available: true,
    nightlyRate,
    totalPrice,
    currency: 'EUR',
    roomName: 'Standard Room / Suite',
    nights,
    source: 'estimate'
  }));
}
