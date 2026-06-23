import { BACKDROP_OPTIONS, PRICE_TIERS, Stay, TRIP_PERSONAS } from '../types';
import { slugifyHotelValue } from './site';

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
] as const;

const REGION_TO_COUNTRY_RULES: Array<{ test: RegExp; country: string }> = [
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

const BACKDROP_ALIAS_RULES: Array<{ test: RegExp; label: (typeof BACKDROP_OPTIONS)[number] }> = [
  { test: /\biconic cities|city luxury|city break|urban|historic center|central\b/i, label: 'Iconic Cities' },
  { test: /\balpine|mountain|ski|snow|three valleys|peaks\b/i, label: 'Alpine & Peaks' },
  { test: /\bpristine shores|beach|sea|coast|coastal|riviera|mediterranean|waterfront|bay\b/i, label: 'Pristine Shores' },
  { test: /\bremote sanctuaries|secluded|countryside|country estate|quiet luxury|pastoral\b/i, label: 'Remote Sanctuaries' },
  { test: /\bexclusive islands|island\b/i, label: 'Exclusive Islands' },
  { test: /\blakeside estates|lake\b/i, label: 'Lakeside Estates' },
  { test: /\bdesert oases|desert|arid\b/i, label: 'Desert Oases' },
  { test: /\bwinter escapes|winter\b/i, label: 'Winter Escapes' },
];

const VIBE_ALIAS_RULES: Array<{ test: RegExp; label: (typeof TRIP_PERSONAS)[number] }> = [
  { test: /\bromance|romantic\b/i, label: 'The Romantic Reset' },
  { test: /\briviera lifestyle|city energy|social|aperitivo|weekend\b/i, label: 'The Social Weekender' },
  { test: /\biconic cities|city break|urban|cultural\b/i, label: 'The Urban Explorer' },
  { test: /\bdesign-forward|quiet luxury|creative|design hotel\b/i, label: 'The Creative Retreat' },
  { test: /\bfood & wine|culinary excellence|culinary|michelin\b/i, label: 'The Epicurean Pilgrimage' },
  { test: /\bbeach & sun|pristine shores|sun-drenched|coastal\b/i, label: 'The Sun-Drenched Escape' },
];

export function normalizeCountryLabel(country = '') {
  return country === 'UK' ? 'United Kingdom' : country;
}

export function extractCountryFromText(text = '') {
  if (!text) return '';

  const direct = COUNTRY_NAMES.find((country) =>
    new RegExp(`\\b${country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );
  if (direct) return normalizeCountryLabel(direct);

  const inferred = REGION_TO_COUNTRY_RULES.find((rule) => rule.test.test(text));
  return inferred?.country || '';
}

export function normalizeLocation(location?: string | null, region?: string | null) {
  const rawLocation = (location || '').trim();
  const rawRegion = (region || '').trim();

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

  if (country !== 'Unknown') {
    return {
      location: `${place}, ${country}`,
      place,
      country,
    };
  }

  return {
    location: place,
    place,
    country,
  };
}

export function getCanonicalBackdropLabels(stayLike: Partial<Stay> & { tags?: string[]; region?: string }) {
  const labels = new Set<string>();

  const candidates = [
    stayLike.primaryBackdrop,
    ...(stayLike.tags || []),
    stayLike.location,
    stayLike.region,
  ].filter(Boolean) as string[];

  for (const value of candidates) {
    const exactBackdrop = BACKDROP_OPTIONS.find((option) => option.toLowerCase() === value.toLowerCase());
    if (exactBackdrop) labels.add(exactBackdrop);

    for (const rule of BACKDROP_ALIAS_RULES) {
      if (rule.test.test(value)) labels.add(rule.label);
    }
  }

  return [...labels];
}

export function getCanonicalVibeLabels(stayLike: Partial<Stay> & { tags?: string[]; region?: string }) {
  const labels = new Set<string>();

  const candidates = [
    stayLike.primaryPersona,
    ...(stayLike.tags || []),
    stayLike.location,
    stayLike.region,
  ].filter(Boolean) as string[];

  for (const value of candidates) {
    const exactVibe = TRIP_PERSONAS.find((option) => option.toLowerCase() === value.toLowerCase());
    if (exactVibe) labels.add(exactVibe);

    for (const rule of VIBE_ALIAS_RULES) {
      if (rule.test.test(value)) labels.add(rule.label);
    }
  }

  return [...labels];
}

export function inferPrimaryBackdrop(stayLike: Partial<Stay> & { tags?: string[]; region?: string }) {
  return getCanonicalBackdropLabels(stayLike)[0] || '';
}

export function inferPrimaryPersona(stayLike: Partial<Stay> & { tags?: string[]; region?: string }) {
  return getCanonicalVibeLabels(stayLike)[0] || '';
}

export function inferPriceTier(priceTier?: string | null, priceCategory?: string | null) {
  if (priceTier && PRICE_TIERS.includes(priceTier as (typeof PRICE_TIERS)[number])) {
    return priceTier;
  }

  if (priceCategory === '€€€€') return 'Iconic (€€€€)';
  if (priceCategory === '€€€') return 'Luxe (€€€)';
  if (priceCategory === '€€') return 'Boutique (€€)';

  return 'Boutique (€€)';
}

export function getCountrySlugFromLocation(location = '') {
  const country = normalizeLocation(location, '').country;
  return slugifyHotelValue(country);
}
