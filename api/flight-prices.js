// api/flight-prices.js - Vercel Serverless & Vite Middleware Handler for Live Flight Rates

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const origin = urlObj.searchParams.get('origin') || 'ARN';
  const destination = urlObj.searchParams.get('destination') || 'PMI';
  const departureDate = urlObj.searchParams.get('departureDate');
  const returnDate = urlObj.searchParams.get('returnDate');

  if (!departureDate || !returnDate) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'departureDate and returnDate are required' }));
    return;
  }

  if (origin === destination) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ isLocalStay: true, available: false }));
    return;
  }

  const duffelToken = process.env.VITE_DUFFEL_TOKEN || process.env.DUFFEL_TOKEN;

  // Try live Duffel API if token is present
  if (duffelToken && duffelToken.trim() !== '') {
    try {
      const duffelRes = await fetch('https://api.duffel.com/air/offer_requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${duffelToken}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            slices: [
              { origin, destination, departure_date: departureDate },
              { origin: destination, destination: origin, departure_date: returnDate }
            ],
            passengers: [{ type: 'adult' }],
            cabin_class: 'economy'
          }
        })
      });

      if (duffelRes.ok) {
        const duffelData = await duffelRes.json();
        const offers = duffelData?.data?.offers || [];
        if (offers.length > 0) {
          const cheapest = offers.reduce((min, cur) => (parseFloat(cur.total_amount) < parseFloat(min.total_amount) ? cur : min), offers[0]);
          const returnPrice = Math.round(parseFloat(cheapest.total_amount));
          const currency = cheapest.total_currency || 'EUR';

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
          res.end(JSON.stringify({
            status: 'available',
            available: true,
            returnPrice,
            currency,
            airline: cheapest.owner?.name || 'Major Airline',
            isDirect: cheapest.slices?.every(s => s.segments?.length === 1) ?? true,
            source: 'duffel'
          }));
          return;
        }
      }
    } catch (err) {
      console.warn('Duffel flight search failed, falling back to route estimate:', err);
    }
  }

  // Realistic Route pricing model (European & Global flights)
  const routeBasePrices = {
    'LHR': 95, 'LGW': 85, 'CPH': 80, 'AMS': 110, 'CDG': 125, 'BER': 95,
    'PMI': 175, 'IBZ': 195, 'BCN': 150, 'MAD': 165, 'AGP': 185, 'FAO': 195,
    'LIS': 185, 'FCO': 160, 'MXP': 140, 'NAP': 190, 'FLR': 180, 'VCE': 165,
    'ZRH': 185, 'GVA': 175, 'ATH': 195, 'JTR': 240, 'JMK': 230, 'HER': 210,
    'RAK': 260, 'KEF': 210, 'JAV': 680, 'LLA': 110, 'BOO': 185, 'HND': 790
  };

  const baseRate = routeBasePrices[destination] || 185;
  const hash = (origin + destination).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Seasonal variation
  const month = new Date(departureDate).getMonth() + 1;
  const isSummer = month >= 6 && month <= 8;
  const multiplier = isSummer ? 1.25 : 1.0;
  const returnPrice = Math.round((baseRate + (hash % 30) - 15) * multiplier);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=300');
  res.end(JSON.stringify({
    status: 'estimated',
    available: true,
    returnPrice,
    currency: 'EUR',
    isDirect: true,
    source: 'estimate'
  }));
}
