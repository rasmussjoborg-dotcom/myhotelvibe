import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const hotelsPath = path.join(projectRoot, 'hotels.json');
const docsDir = path.join(projectRoot, 'docs');
const outputJsonPath = path.join(docsDir, 'seo-coverage-report.json');
const outputMarkdownPath = path.join(docsDir, 'SEO_COVERAGE_REPORT.md');
const siteUrl = 'https://myhotelvibe.com';

const BACKDROP_OPTIONS = [
  'Pristine Shores',
  'Iconic Cities',
  'Alpine & Peaks',
  'Remote Sanctuaries',
  'Exclusive Islands',
  'Lakeside Estates',
  'Desert Oases',
  'Winter Escapes',
];

const TRIP_PERSONAS = [
  'The Romantic Reset',
  'The Social Weekender',
  'The Urban Explorer',
  'The Creative Retreat',
  'The Epicurean Pilgrimage',
  'The Sun-Drenched Escape',
];

const COUNTRY_NAMES = [
  'Italy',
  'Switzerland',
  'Spain',
  'Denmark',
  'France',
  'Portugal',
  'Greece',
  'United Kingdom',
  'UK',
  'Germany',
  'Austria',
  'Norway',
  'Sweden',
  'Iceland',
  'Ireland',
  'Netherlands',
];

const REGION_TO_COUNTRY_RULES = [
  { test: /\bitaly|tuscany|dolomites|amalfi|lake como|sicily|sardinia|puglia\b/i, country: 'Italy' },
  { test: /\bswitzerland|engadin|graubünden|grisons|swiss alps|st\.?\s*moritz\b/i, country: 'Switzerland' },
  { test: /\bspain|basque country|andalusia|mallorca|ibiza|san sebastian\b/i, country: 'Spain' },
  { test: /\bdenmark|copenhagen\b/i, country: 'Denmark' },
  { test: /\bfrance|provence|côte d'azur|french riviera|riviera\b/i, country: 'France' },
  { test: /\bportugal|algarve|douro\b/i, country: 'Portugal' },
  { test: /\bgreece|santorini|mykonos\b/i, country: 'Greece' },
  { test: /\buk|united kingdom|england|scotland|cotswolds|highlands|london\b/i, country: 'United Kingdom' },
  { test: /\bgermany|bavaria\b/i, country: 'Germany' },
  { test: /\baustria\b/i, country: 'Austria' },
  { test: /\bnorway|lofoten\b/i, country: 'Norway' },
  { test: /\bsweden|lapland|stockholm\b/i, country: 'Sweden' },
  { test: /\biceland|reykjavik\b/i, country: 'Iceland' },
  { test: /\bireland\b/i, country: 'Ireland' },
  { test: /\bnetherlands|amsterdam\b/i, country: 'Netherlands' },
];

const BACKDROP_ALIAS_RULES = [
  { test: /\biconic cities|city luxury|city break|urban|historic center|central\b/i, label: 'Iconic Cities' },
  { test: /\balpine|mountain|ski|snow|three valleys|peaks\b/i, label: 'Alpine & Peaks' },
  { test: /\bpristine shores|beach|sea|coast|coastal|riviera|mediterranean|waterfront|bay\b/i, label: 'Pristine Shores' },
  { test: /\bremote sanctuaries|secluded|countryside|country estate|quiet luxury|pastoral\b/i, label: 'Remote Sanctuaries' },
  { test: /\bexclusive islands|island\b/i, label: 'Exclusive Islands' },
  { test: /\blakeside estates|lake\b/i, label: 'Lakeside Estates' },
  { test: /\bdesert oases|desert|arid\b/i, label: 'Desert Oases' },
  { test: /\bwinter escapes|winter\b/i, label: 'Winter Escapes' },
];

const VIBE_ALIAS_RULES = [
  { test: /\bromance|romantic\b/i, label: 'The Romantic Reset' },
  { test: /\briviera lifestyle|city energy|social|aperitivo|weekend\b/i, label: 'The Social Weekender' },
  { test: /\biconic cities|city break|urban|cultural\b/i, label: 'The Urban Explorer' },
  { test: /\bdesign-forward|quiet luxury|creative|design hotel\b/i, label: 'The Creative Retreat' },
  { test: /\bfood & wine|culinary excellence|culinary|michelin\b/i, label: 'The Epicurean Pilgrimage' },
  { test: /\bbeach & sun|pristine shores|sun-drenched|coastal\b/i, label: 'The Sun-Drenched Escape' },
];

function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getCountryRouteSlug(country = '') {
  return country === 'United Kingdom' ? 'uk' : slugify(country);
}

function extractCountryFromText(text = '') {
  if (!text) return '';

  const direct = COUNTRY_NAMES.find((country) =>
    new RegExp(`\\b${country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );
  if (direct) return direct === 'UK' ? 'United Kingdom' : direct;

  const inferred = REGION_TO_COUNTRY_RULES.find((rule) => rule.test.test(text));
  return inferred?.country || '';
}

function normalizeLocation(location = '', region = '') {
  const rawLocation = String(location || '').trim();
  const rawRegion = String(region || '').trim();

  if (!rawLocation && !rawRegion) {
    return { location: 'Unknown', place: 'Unknown', country: 'Unknown' };
  }

  const locationParts = rawLocation
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const locationCountry = extractCountryFromText(rawLocation);
  const regionCountry = extractCountryFromText(rawRegion);
  const country = locationCountry || regionCountry || 'Unknown';

  let place = locationParts[0] || rawLocation || rawRegion || 'Unknown';
  if (locationParts.length >= 2 && extractCountryFromText(locationParts[locationParts.length - 1])) {
    place = locationParts.slice(0, -1).join(', ') || place;
  }

  return {
    location: country !== 'Unknown' ? `${place}, ${country}` : place,
    place,
    country,
  };
}

function getBackdropLabels(hotel) {
  const labels = new Set();
  const candidates = [hotel.primaryBackdrop, ...(hotel.tags || []), hotel.location, hotel.region].filter(Boolean);

  for (const value of candidates) {
    const exact = BACKDROP_OPTIONS.find((option) => option.toLowerCase() === String(value).toLowerCase());
    if (exact) labels.add(exact);

    for (const rule of BACKDROP_ALIAS_RULES) {
      if (rule.test.test(String(value))) labels.add(rule.label);
    }
  }

  return [...labels];
}

function getVibeLabels(hotel) {
  const labels = new Set();
  const candidates = [hotel.primaryPersona, ...(hotel.tags || []), hotel.location, hotel.region].filter(Boolean);

  for (const value of candidates) {
    const exact = TRIP_PERSONAS.find((option) => option.toLowerCase() === String(value).toLowerCase());
    if (exact) labels.add(exact);

    for (const rule of VIBE_ALIAS_RULES) {
      if (rule.test.test(String(value))) labels.add(rule.label);
    }
  }

  return [...labels];
}

function increment(map, key, label, hotelName) {
  const current = map.get(key) || { label, count: 0, hotels: [] };
  current.count += 1;
  current.hotels.push(hotelName);
  map.set(key, current);
}

const rawHotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
const hotels = rawHotels.map((hotel) => {
  const normalized = normalizeLocation(hotel.location, hotel.region);
  return {
    ...hotel,
    location: normalized.location,
    country: normalized.country,
    destination: normalized.location,
  };
});

const countries = new Map();
const destinations = new Map();
const vibes = new Map();
const backdrops = new Map();

for (const hotel of hotels) {
  if (hotel.country && hotel.country !== 'Unknown') {
    increment(countries, getCountryRouteSlug(hotel.country), hotel.country, hotel.name);
  }

  if (hotel.destination && hotel.destination !== 'Unknown') {
    increment(destinations, slugify(hotel.destination), hotel.destination, hotel.name);
  }

  for (const vibe of getVibeLabels(hotel)) {
    increment(vibes, slugify(vibe), vibe, hotel.name);
  }

  for (const backdrop of getBackdropLabels(hotel)) {
    increment(backdrops, slugify(backdrop), backdrop, hotel.name);
  }
}

const sortEntries = (map) =>
  [...map.entries()]
    .map(([slug, value]) => ({ slug, ...value, url: `${siteUrl}/${map === countries ? 'countries' : map === destinations ? 'destinations' : map === vibes ? 'vibes' : 'backdrops'}/${slug}/` }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });

const report = {
  generatedAt: new Date().toISOString(),
  totalHotels: hotels.length,
  totals: {
    countries: countries.size,
    destinations: destinations.size,
    vibes: vibes.size,
    backdrops: backdrops.size,
  },
  countries: sortEntries(countries),
  destinations: sortEntries(destinations),
  vibes: sortEntries(vibes),
  backdrops: sortEntries(backdrops),
};

fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(outputJsonPath, JSON.stringify(report, null, 2));

const renderSection = (title, items) => `## ${title}

| Route | Hotels | URL |
| --- | ---: | --- |
${items.map((item) => `| ${item.label} | ${item.count} | ${item.url} |`).join('\n')}
`;

const markdown = `# SEO Coverage Report

Generated: ${report.generatedAt}

## Totals

- Hotels in source: ${report.totalHotels}
- Countries with SEO routes: ${report.totals.countries}
- Destinations with SEO routes: ${report.totals.destinations}
- Vibe routes with coverage: ${report.totals.vibes}
- Backdrop routes with coverage: ${report.totals.backdrops}

${renderSection('Countries', report.countries)}

${renderSection('Destinations', report.destinations)}

${renderSection('Vibes', report.vibes)}

${renderSection('Backdrops', report.backdrops)}
`;

fs.writeFileSync(outputMarkdownPath, markdown);

console.log(`Wrote ${outputJsonPath}`);
console.log(`Wrote ${outputMarkdownPath}`);
