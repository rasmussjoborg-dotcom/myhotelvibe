import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { ensureDir, emptyDir } from 'fs-extra/esm';

function buildAffiliateUrl(rawUrl, hotelName, location) {
  if (!rawUrl || rawUrl.trim() === '') {
    const fallback = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${hotelName} ${location}`)}`;
    return applyAffiliateTracking(fallback);
  }
  let url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  return applyAffiliateTracking(url);
}

function applyAffiliateTracking(url) {
  const cjTemplate = process.env.VITE_CJ_AFFILIATE_TEMPLATE;
  const directAid = process.env.VITE_BOOKING_AID;

  if (cjTemplate && cjTemplate.includes('{url}')) {
    return cjTemplate.replace('{url}', encodeURIComponent(url));
  }
  if (directAid) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('aid', directAid);
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}

const projectRoot = path.resolve(import.meta.dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const hotelsPath = path.join(projectRoot, 'hotels.json');

dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true, quiet: true });

const siteUrl = (process.env.VITE_SITE_URL || process.env.APP_URL || 'https://myhotelvibe.com').replace(/\/+$/, '');
const siteName = 'My Hotel Vibe';
const defaultDescription =
  'Editorial hotel discovery for travelers choosing by mood, setting, and the kind of stay they want to remember.';
const backdropOptions = [
  'Pristine Shores',
  'Iconic Cities',
  'Alpine & Peaks',
  'Remote Sanctuaries',
  'Exclusive Islands',
  'Lakeside Estates',
  'Desert Oases',
  'Winter Escapes',
];
const backdropSet = new Set(backdropOptions);
const vibeOptions = [
  'The Romantic Reset',
  'The Social Weekender',
  'The Urban Explorer',
  'The Creative Retreat',
  'The Epicurean Pilgrimage',
  'The Sun-Drenched Escape',
];
const vibeSet = new Set(vibeOptions);
const vibeAliases = {
  'The Romantic Reset': ['romance', 'quiet luxury'],
  'The Social Weekender': ['city energy', 'city break', 'riviera lifestyle'],
  'The Urban Explorer': ['iconic cities', 'city break'],
  'The Creative Retreat': ['design-forward', 'quiet luxury', 'remote sanctuaries'],
  'The Epicurean Pilgrimage': ['food & wine', 'culinary excellence'],
  'The Sun-Drenched Escape': ['beach & sun', 'pristine shores', 'riviera lifestyle'],
};

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
  { test: /\bfrance|provence|côte d'azur|riviera\b/i, country: 'France' },
  { test: /\bportugal|algarve|douro\b/i, country: 'Portugal' },
  { test: /\bgreece|santorini|mykonos\b/i, country: 'Greece' },
  { test: /\buk|united kingdom|england|scotland|cotswolds|highlands\b/i, country: 'United Kingdom' },
  { test: /\bgermany|bavaria\b/i, country: 'Germany' },
  { test: /\baustria\b/i, country: 'Austria' },
  { test: /\bnorway|lofoten\b/i, country: 'Norway' },
  { test: /\bsweden|lapland|stockholm\b/i, country: 'Sweden' },
  { test: /\biceland|reykjavik\b/i, country: 'Iceland' },
  { test: /\bireland\b/i, country: 'Ireland' },
  { test: /\bnetherlands|amsterdam\b/i, country: 'Netherlands' },
];

function slugifyHotelValue(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('Missing dist/index.html. Run `npm run build` first.');
  process.exit(1);
}

if (!fs.existsSync(hotelsPath)) {
  console.error('Missing hotels.json. Cannot generate SEO pages.');
  process.exit(1);
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

function normalizeHotelRecord(hotel) {
  const normalized = normalizeLocation(hotel.location, hotel.region);
  return {
    ...hotel,
    location: normalized.location,
  };
}

async function loadHotels() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const requireLiveSeoSource =
    process.env.SEO_REQUIRE_SUPABASE === 'true' ||
    process.env.SEO_REQUIRE_SUPABASE === '1' ||
    process.env.VERCEL === '1';

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      console.log('Fetching hotels from Supabase...');
      let data = [];
      let from = 0;
      const pageSize = 1000;

      while (true) {
        const { data: pageData, error } = await supabase
          .from('hotels')
          .select('*')
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Error fetching from Supabase:', error.message);
          process.exit(1);
        }

        if (pageData && pageData.length > 0) {
          data = [...data, ...pageData];
        }

        if (!pageData || pageData.length < pageSize) {
          break;
        }

        from += pageSize;
      }
      console.log(`Loaded ${data.length} hotels from Supabase for SEO generation`);
      return data.map(normalizeHotelRecord);
    } catch (error) {
      console.warn('Supabase SEO source unavailable, falling back to local hotels.json');
      console.warn(
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null
            ? JSON.stringify(error)
            : String(error)
      );

      if (requireLiveSeoSource) {
        console.error(
          'SEO generation is configured to require Supabase, but the live source could not be loaded.'
        );
        process.exit(1);
      }
    }
  }

  if (requireLiveSeoSource) {
    console.error(
      'SEO generation is configured to require Supabase, but VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not both set.'
    );
    process.exit(1);
  }

  const localHotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
  console.log(`Loaded ${localHotels.length} hotels from local hotels.json for SEO generation`);
  return localHotels.map(normalizeHotelRecord);
}

const hotels = await loadHotels();
const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const jsFile = (html.match(/src="\.\/assets\/(index-[^"]+\.js)"/) || [])[1] ?? null;
const cssFile = (html.match(/href="\.\/assets\/(index-[^"]+\.css)"/) || [])[1] ?? null;

if (!jsFile || !cssFile) {
  console.error('Could not locate built asset filenames in dist/index.html.');
  process.exit(1);
}

const homeFallbackMarkup = `
      <main style="max-width: 920px; margin: 0 auto; padding: 32px 20px 80px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222;">
        <h1 style="margin: 0 0 12px; font-size: 42px; line-height: 1.05;">My Hotel Vibe</h1>
        <p style="font-size: 19px; line-height: 1.7; margin: 0 0 16px;">Editorial hotel discovery for travelers choosing by mood, setting, and the kind of stay they want to remember.</p>
        <p style="font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Browse a considered collection of standout stays, from Riviera icons and Alpine hideaways to city hotels worth planning a trip around.</p>
        <section>
          <h2 style="margin: 0 0 12px; font-size: 24px;">Priority hotel guides</h2>
          <ul style="padding-left: 20px; line-height: 1.9; margin: 0 0 28px;">
            ${getPriorityCollectionRoutes(hotels, 6)
              .map((route) => `<li><a href="${getCollectionPath(route)}">${escapeHtml(route.label)}</a> <span style="color:#666;">(${escapeHtml(route.kind)}, ${route.hotelCount} hotels)</span></li>`)
              .join('')}
          </ul>
        </section>
        <section>
          <h2 style="margin: 0 0 12px; font-size: 24px;">Featured hotel guides</h2>
          <ul style="padding-left: 20px; line-height: 1.9; margin: 0;">
            ${hotels
              .map((hotel) => `<li><a href="${hotelPath(hotel)}">${escapeHtml(hotel.name)}</a> <span style="color:#666;">in ${escapeHtml(hotel.location)}</span></li>`)
              .join('')}
          </ul>
        </section>
        <section style="margin-top: 28px;">
          <h2 style="margin: 0 0 12px; font-size: 24px;">Browse by destination</h2>
          <ul style="padding-left: 20px; line-height: 1.9; margin: 0;">
            ${[...new Map(hotels.map((hotel) => [getDestinationSlug(hotel.location), hotel.location])).entries()]
              .map(([slug, label]) => `<li><a href="/destinations/${slug}/">${escapeHtml(label)}</a></li>`)
              .join('')}
          </ul>
        </section>
      </main>
`;

const patchedIndexHtml = html
  .replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${homeFallbackMarkup}
    </div>`
  )
  .replace(
    '</head>',
    `    <link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />\n    ${
      hotels[0]
        ? `<meta property="og:image" content="${escapeHtml(absoluteMediaUrl(getHotelImages(hotels[0])[0] || ''))}" />\n    <meta name="twitter:image" content="${escapeHtml(absoluteMediaUrl(getHotelImages(hotels[0])[0] || ''))}" />\n    `
        : ''
    }</head>`
  );

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function getLocationParts(location = '') {
  const parts = String(location)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city: parts[0] || '',
    country: parts.at(-1) || '',
    label: parts.join(', '),
  };
}

function getDestinationSlug(location = '') {
  return slugifyHotelValue(getLocationParts(location).label);
}

function getCountrySlug(location = '') {
  return slugifyHotelValue(getLocationParts(location).country);
}

function getBackdropLabels(hotel) {
  const labels = new Set();

  if (hotel.primaryBackdrop) labels.add(hotel.primaryBackdrop);
  for (const tag of hotel.tags || []) {
    if (backdropSet.has(tag)) labels.add(tag);
  }

  return [...labels];
}

function getVibeLabels(hotel) {
  const labels = new Set();

  if (hotel.primaryPersona && vibeSet.has(hotel.primaryPersona)) {
    labels.add(hotel.primaryPersona);
  }

  const tagSet = new Set((hotel.tags || []).map((tag) => String(tag).toLowerCase()));
  for (const [persona, aliases] of Object.entries(vibeAliases)) {
    if (aliases.some((alias) => tagSet.has(alias))) {
      labels.add(persona);
    }
  }

  return [...labels];
}

function getCollectionPath(route) {
  if (route.kind === 'destination') return `/destinations/${route.slug}/`;
  if (route.kind === 'country') return `/countries/${route.slug}/`;
  if (route.kind === 'vibe') return `/vibes/${route.slug}/`;
  return `/backdrops/${route.slug}/`;
}

function getCollectionIndexDecision(kind, hotels) {
  const hotelCount = hotels.length;
  const destinationCount = new Set(hotels.map((hotel) => getDestinationSlug(hotel.location))).size;
  const countryCount = new Set(hotels.map((hotel) => getCountrySlug(hotel.location))).size;

  if (kind === 'country') {
    return hotelCount >= 3 && destinationCount >= 2 ? 'index-now' : 'keep-accessible';
  }

  if (kind === 'destination') {
    if (hotelCount >= 3) return 'index-now';
    if (hotelCount === 2) return 'index-lightly';
    return 'keep-accessible';
  }

  if (kind === 'vibe') {
    if (hotelCount >= 6 && destinationCount >= 3 && countryCount >= 2) return 'index-now';
    if (hotelCount >= 4 && destinationCount >= 2) return 'index-lightly';
    return 'support-internally';
  }

  if (hotelCount >= 6 && destinationCount >= 3) return 'index-now';
  if (hotelCount >= 4 && destinationCount >= 2) return 'index-lightly';
  return 'support-internally';
}

function getPriorityCollectionRoutes(hotels, max = 8) {
  const groups = new Map();

  const addToGroup = (route, hotel) => {
    const key = `${route.kind}:${route.slug}`;
    const existing = groups.get(key);
    if (existing) {
      existing.hotels.push(hotel);
      existing.destinations.add(getDestinationSlug(hotel.location));
      existing.countries.add(getCountrySlug(hotel.location));
      return;
    }

    groups.set(key, {
      route,
      hotels: [hotel],
      destinations: new Set([getDestinationSlug(hotel.location)]),
      countries: new Set([getCountrySlug(hotel.location)]),
    });
  };

  for (const hotel of hotels) {
    const location = getLocationParts(hotel.location);

    if (location.label) {
      addToGroup({ kind: 'destination', slug: getDestinationSlug(hotel.location), label: location.label }, hotel);
    }

    if (location.country) {
      addToGroup({ kind: 'country', slug: getCountrySlug(hotel.location), label: location.country }, hotel);
    }

    for (const label of getBackdropLabels(hotel)) {
      addToGroup({ kind: 'backdrop', slug: slugifyHotelValue(label), label }, hotel);
    }

    for (const label of getVibeLabels(hotel)) {
      addToGroup({ kind: 'vibe', slug: slugifyHotelValue(label), label }, hotel);
    }
  }

  return [...groups.values()]
    .map(({ route, hotels: groupedHotels, destinations, countries }) => {
      const hotelCount = groupedHotels.length;
      const destinationCount = destinations.size;
      const countryCount = countries.size;

      const score =
        route.kind === 'country'
          ? hotelCount * 5 + destinationCount * 4 + countryCount * 2
          : route.kind === 'vibe'
            ? hotelCount * 4 + destinationCount * 3 + countryCount * 3 + 4
            : route.kind === 'backdrop'
              ? hotelCount * 4 + destinationCount * 3 + countryCount * 2 + 2
              : hotelCount * 4 + countryCount * 2 + 1;

      return { ...route, score, hotelCount };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.label.localeCompare(b.label);
    })
    .slice(0, max);
}

function getPriorityRoutesForHotel(hotel, hotels, max = 4) {
  const destinationSlug = getDestinationSlug(hotel.location);
  const countrySlug = getCountrySlug(hotel.location);
  const backdropSlugs = new Set(getBackdropLabels(hotel).map((label) => slugifyHotelValue(label)));
  const vibeSlugs = new Set(getVibeLabels(hotel).map((label) => slugifyHotelValue(label)));

  return getPriorityCollectionRoutes(hotels, 100)
    .filter((route) => {
      if (route.kind === 'destination') return route.slug === destinationSlug;
      if (route.kind === 'country') return route.slug === countrySlug;
      if (route.kind === 'backdrop') return backdropSlugs.has(route.slug);
      return vibeSlugs.has(route.slug);
    })
    .slice(0, max);
}

function getCollectionEditorialContent(kind, label, hotels) {
  const count = hotels.length;
  const routeKey = `${kind}:${slugifyHotelValue(label)}`;

  const editorialOverrides = {
    'country:france': {
      eyebrow: 'Country guide',
      heading: 'France hotels',
      intro:
        'A sharper view of France through hotels with real pull: grand Paris addresses, Provençal retreats, Riviera icons, and countryside stays that feel worth crossing a border for.',
      description:
        'Explore an editorial guide to France hotels, from Paris icons and Riviera legends to Provençal hideaways and country estates chosen for mood, setting, and standout character.',
    },
    'vibe:the-creative-retreat': {
      eyebrow: 'Vibe guide',
      heading: 'The Creative Retreat hotels',
      intro:
        'Hotels for travelers who want the trip to feel visually clarifying: quieter palettes, stronger architecture, and the kind of atmosphere that sharpens your eye instead of fighting for attention.',
      description:
        'Explore hotels for The Creative Retreat, an editorial collection of design-led, mood-rich stays chosen for architecture, restraint, and visual calm.',
    },
    'vibe:the-romantic-reset': {
      eyebrow: 'Vibe guide',
      heading: 'The Romantic Reset hotels',
      intro:
        'A more grown-up edit of romantic hotels, built around privacy, beautiful rooms, softer pacing, and the feeling that the stay itself is doing half the seduction.',
      description:
        'Explore hotels for The Romantic Reset, an editorial collection of private, mood-rich stays chosen for romance, atmosphere, and memorable design.',
    },
    'vibe:the-urban-explorer': {
      eyebrow: 'Vibe guide',
      heading: 'The Urban Explorer hotels',
      intro:
        'City hotels for travelers who want culture, restaurants, and great addresses within reach, but still care how the room feels when the city finally goes quiet.',
      description:
        'Explore hotels for The Urban Explorer, an editorial collection of city stays chosen for strong location, cultural access, and rooms with real atmosphere.',
    },
    'vibe:the-social-weekender': {
      eyebrow: 'Vibe guide',
      heading: 'The Social Weekender hotels',
      intro:
        'A tighter edit for weekends with momentum: glamorous coastal hotels, better lunch energy, aperitivo hours that drift into dinner, and stays that know how to host a scene without feeling chaotic.',
      description:
        'Explore hotels for The Social Weekender, an editorial collection of lively, design-aware stays chosen for long lunches, aperitivo energy, and weekend glamour.',
    },
    'vibe:the-sun-drenched-escape': {
      eyebrow: 'Vibe guide',
      heading: 'The Sun-Drenched Escape hotels',
      intro:
        'Hotels for people chasing brightness first: sea-facing rooms, terraces, saltwater afternoons, and the kind of stay that makes every hour between breakfast and sunset feel unusually easy.',
      description:
        'Explore hotels for The Sun-Drenched Escape, an editorial collection of coastal and sun-soaked stays chosen for sea views, warmth, and laid-back glamour.',
    },
    'backdrop:iconic-cities': {
      eyebrow: 'Backdrop guide',
      heading: 'Iconic Cities hotels',
      intro:
        'A city-first edit for travelers who want the cultural gravity of a major address without giving up intimacy, taste, or the feeling of staying somewhere with actual personality.',
      description:
        'Explore Iconic Cities hotels, an editorial collection of standout urban stays chosen for strong addresses, cultural proximity, and memorable interiors.',
    },
    'backdrop:pristine-shores': {
      eyebrow: 'Backdrop guide',
      heading: 'Pristine Shores hotels',
      intro:
        'Hotels where the coastline does a lot of the storytelling: cliff edges, sea access, brighter rooms, and the particular luxury of feeling close to the water from the moment you wake up.',
      description:
        'Explore Pristine Shores hotels, an editorial collection of coastal stays chosen for sea views, shoreline access, and a stronger sense of place.',
    },
  };

  if (editorialOverrides[routeKey]) {
    return editorialOverrides[routeKey];
  }

  if (kind === 'destination') {
    return {
      eyebrow: 'Destination guide',
      heading: `${label} hotels`,
      intro: `A tighter, mood-first edit of hotels in ${label}, for travelers who want a stay with presence rather than just availability.`,
      description: `A considered edit of ${label} hotels for travelers chasing atmosphere, strong addresses, and stays worth planning around.`,
    };
  }

  if (kind === 'country') {
    return {
      eyebrow: 'Country guide',
      heading: `${label} hotels`,
      intro: `A country-level edit of hotels in ${label}, spanning standout city stays, atmospheric hideaways, and addresses with real personality.`,
      description: `Explore ${count} editorial hotel picks across ${label}, chosen for mood, setting, and the kind of stay that lingers after checkout.`,
    };
  }

  if (kind === 'vibe') {
    return {
      eyebrow: 'Vibe guide',
      heading: `${label} hotels`,
      intro: `A sharper edit of stays for ${label.toLowerCase()}, where the emotional pull of the trip matters as much as the room itself.`,
      description: `Explore ${count} editorial hotel picks for ${label.toLowerCase()}, chosen for travelers following a stronger mood than a generic star rating.`,
    };
  }

  return {
    eyebrow: 'Backdrop guide',
    heading: `${label} hotels`,
    intro: `A mood-led edit of stays for travelers drawn to ${label.toLowerCase()}, where the setting does as much work as the room itself.`,
    description: `Explore ${count} editorial hotel picks for ${label.toLowerCase()}, selected for travelers who choose atmosphere first.`,
  };
}

function getHotelImages(hotel) {
  const candidates = [hotel.image, hotel.image2, hotel.image3].filter(Boolean);

  if (typeof hotel.image === 'string' && hotel.image.startsWith('[')) {
    try {
      const parsed = JSON.parse(hotel.image);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return candidates;
    }
  }

  return candidates;
}

function getCardCopy(hotel) {
  const description = stripHtml(hotel.description || '');
  const whyFits = Array.isArray(hotel.whyFits) ? stripHtml(hotel.whyFits[0] || '') : '';
  const pieces = [description, whyFits].filter(Boolean);
  const combined = pieces.join(' ').trim();
  if (!combined) return defaultDescription;
  return combined.length > 180 ? `${combined.slice(0, 177).trimEnd()}...` : combined;
}

function absoluteUrl(pathname) {
  return `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function absoluteMediaUrl(url = '') {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return absoluteUrl(url);
}

function hotelPath(hotel) {
  return `/hotels/${slugifyHotelValue(hotel.name || hotel.id)}/`;
}

function destinationPath(location) {
  return `/destinations/${getDestinationSlug(location)}/`;
}

function countryPath(country) {
  return `/countries/${slugifyHotelValue(country)}/`;
}

function backdropPath(label) {
  return `/backdrops/${slugifyHotelValue(label)}/`;
}

function vibePath(label) {
  return `/vibes/${slugifyHotelValue(label)}/`;
}

function buildItemListSchema(items) {
  return items.map((hotel, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: hotel.name,
    url: absoluteUrl(hotelPath(hotel)),
  }));
}

function getHotelFaq(stay) {
  const faqs = [];

  if (stay.primaryPersona) {
    faqs.push({
      question: `What kind of traveler is ${stay.name} best for?`,
      answer: `${stay.name} is highly recommended for travelers seeking a ${stay.primaryPersona.toLowerCase()} experience. It caters to those who appreciate thoughtful design and a specific aesthetic mood.`,
    });
  }

  if (stay.primaryBackdrop) {
    faqs.push({
      question: `What is the setting and location like at ${stay.name}?`,
      answer: `The hotel is located in ${stay.location}, offering a stunning ${stay.primaryBackdrop.toLowerCase()} setting. This backdrop plays a major role in the overall atmosphere of the stay.`,
    });
  }

  const notableAmenities = (stay.amenities || []).slice(0, 3).join(', ').toLowerCase();
  if (notableAmenities) {
    faqs.push({
      question: `What are the standout amenities at ${stay.name}?`,
      answer: `Guests can expect premium amenities including ${notableAmenities}, contributing to a highly curated and comfortable experience.`,
    });
  }

  return faqs;
}

function buildHotelSchema(hotel, description, image) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      name: hotel.name,
      description,
      url: absoluteUrl(hotelPath(hotel)),
      image: image ? [image] : undefined,
      address: {
        '@type': 'PostalAddress',
        addressLocality: hotel.location?.split(',')[0]?.trim() || hotel.location || '',
        addressCountry: hotel.location?.split(',').at(-1)?.trim() || '',
      },
      amenityFeature: (hotel.amenities || []).slice(0, 10).map((amenity) => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity,
        value: true,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: siteName,
          item: absoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: hotel.name,
          item: absoluteUrl(hotelPath(hotel)),
        },
      ],
    },
    ...(getHotelFaq(hotel).length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: getHotelFaq(hotel).map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          },
        ]
      : []),
  ];
}

function getCollectionSummary(kind, hotels) {
  const destinations = new Set(hotels.map((hotel) => getDestinationSlug(hotel.location))).size;
  const countries = new Set(hotels.map((hotel) => getCountrySlug(hotel.location))).size;
  const boutiqueCount = hotels.filter((hotel) => String(hotel.priceTier || '').toLowerCase().includes('boutique')).length;
  const luxeCount = hotels.filter((hotel) => String(hotel.priceTier || '').toLowerCase().includes('luxe')).length;
  const iconicCount = hotels.filter((hotel) => String(hotel.priceTier || '').toLowerCase().includes('iconic')).length;

  const focusLine =
    kind === 'destination'
      ? `${hotels.length} hotels in this destination edit`
      : kind === 'country'
        ? `${hotels.length} hotels across ${destinations} destinations`
        : kind === 'vibe'
          ? `${hotels.length} hotels shaped around one travel mood`
          : `${hotels.length} hotels grouped by setting first`;

  return {
    focusLine,
    destinations,
    countries,
    boutiqueCount,
    luxeCount,
    iconicCount,
  };
}

function getCollectionFaq(kind, label, hotels) {
  const summary = getCollectionSummary(kind, hotels);
  const routeKey = `${kind}:${slugifyHotelValue(label)}`;

  const faqOverrides = {
    'country:france': [
      {
        question: 'What kind of France hotels are featured here?',
        answer:
          'This France guide focuses on hotels with strong point of view: Riviera legends, polished Paris addresses, Provençal retreats, and country estates with enough atmosphere to justify the trip on their own.',
      },
      {
        question: 'Why start with France as a hotel guide instead of one city?',
        answer:
          `Because the current France edit already spans ${summary.destinations} distinct destinations, it works as a useful country-level view of how different moods show up across Paris, Provence, the Riviera, and beyond.`,
      },
    ],
    'vibe:the-creative-retreat': [
      {
        question: 'What makes a hotel fit The Creative Retreat?',
        answer:
          'These hotels share a certain visual intelligence: stronger architecture, calmer rooms, better materiality, and a pace that leaves room to think, look, and reset.',
      },
      {
        question: 'Is The Creative Retreat about remote hotels only?',
        answer:
          `No. This collection includes ${hotels.length} hotels across ${summary.countries} countries, and the common thread is not remoteness alone but aesthetic clarity and a more thoughtful atmosphere.`,
      },
    ],
    'vibe:the-romantic-reset': [
      {
        question: 'What kind of romance does The Romantic Reset aim for?',
        answer:
          'Less obvious honeymoon cliche, more privacy, mood, and beautiful stillness. The best hotels in this collection feel seductive because they are calm, polished, and slightly removed from the noise around them.',
      },
      {
        question: 'Are these hotels only for couples?',
        answer:
          'Not strictly, but they are especially strong for trips where pace, intimacy, and atmosphere matter more than packed itineraries or high-energy social scenes.',
      },
    ],
    'vibe:the-urban-explorer': [
      {
        question: 'What defines an Urban Explorer hotel here?',
        answer:
          'A strong city base with cultural access, restaurant gravity, and enough design or service quality that coming back to the hotel still feels like part of the trip rather than just recovery time.',
      },
      {
        question: 'Is this collection about location only?',
        answer:
          'Location matters, but the edit is also about how the hotel holds the city: whether the atmosphere feels elevated, the rooms feel restorative, and the address adds something to the overall trip.',
      },
    ],
    'vibe:the-social-weekender': [
      {
        question: 'What makes a hotel fit The Social Weekender?',
        answer:
          'These are hotels with outward pull: stronger lunch energy, aperitivo momentum, glamorous shared spaces, and locations that naturally support a better weekend rhythm.',
      },
      {
        question: 'Are these party hotels?',
        answer:
          'Not necessarily. The goal is social ease and momentum, not chaos. The best picks here still feel design-led and controlled, just more outward-looking than a quiet retreat.',
      },
    ],
    'vibe:the-sun-drenched-escape': [
      {
        question: 'What kind of trip suits The Sun-Drenched Escape?',
        answer:
          'Trips built around brightness, water, outdoor meals, and long slow afternoons. The collection favors hotels where the climate and coastline genuinely shape the experience.',
      },
      {
        question: 'Is this just a beach hotels page?',
        answer:
          'It overlaps with coastal travel, but the real filter is emotional: these are hotels chosen for warmth, ease, and the kind of daylight-rich atmosphere that changes how the whole trip feels.',
      },
    ],
    'backdrop:iconic-cities': [
      {
        question: 'What counts as an Iconic Cities hotel on My Hotel Vibe?',
        answer:
          'Hotels in culturally weighty cities where the surrounding neighborhood, architecture, and urban energy matter as much as the room itself. The edit favors addresses with presence, not just convenience.',
      },
      {
        question: 'Why group these hotels by backdrop rather than country?',
        answer:
          'Because some travelers start with city atmosphere first. This page is for people who want urban intensity, landmark proximity, and a hotel that can hold its own inside a major destination.',
      },
    ],
    'backdrop:pristine-shores': [
      {
        question: 'What defines a Pristine Shores hotel here?',
        answer:
          'A stronger relationship to the water: direct sea access, elevated coastal views, brighter pacing, and a setting where the shoreline is central to the mood of the stay.',
      },
      {
        question: 'Are all Pristine Shores hotels interchangeable beach resorts?',
        answer:
          'No. The common thread is coastline quality and atmosphere, but the individual hotels still vary from Riviera institutions to more design-led seaside stays.',
      },
    ],
  };

  if (faqOverrides[routeKey]) {
    return faqOverrides[routeKey];
  }

  if (kind === 'destination') {
    return [
      {
        question: `What kind of hotels are included in ${label}?`,
        answer: `${label} is presented as an editorial hotel edit, not an exhaustive booking directory. The focus is on atmosphere, design signal, and hotels that feel worth planning a trip around.`,
      },
      {
        question: `How many hotels are featured in this ${label} guide?`,
        answer: `This guide currently includes ${hotels.length} hotels, chosen to give a tighter view of the destination rather than a generic long list.`,
      },
    ];
  }

  if (kind === 'country') {
    return [
      {
        question: `How is this ${label} hotel guide organized?`,
        answer: `The ${label} guide groups hotels through mood, setting, and destination quality rather than star rating alone. It currently spans ${summary.destinations} destinations and ${hotels.length} stays.`,
      },
      {
        question: `Are these all the hotels in ${label}?`,
        answer: `No. This is a curated shortlist designed to highlight standout stays in ${label}, from city addresses with presence to more atmospheric hideaways.`,
      },
    ];
  }

  if (kind === 'vibe') {
    return [
      {
        question: `What does ${label} mean in hotel terms?`,
        answer: `${label} is used here as an editorial travel lens. The hotels in this guide are grouped by shared feeling, aesthetic pull, and trip energy rather than by price or geography alone.`,
      },
      {
        question: `How broad is this ${label} hotel collection?`,
        answer: `This collection currently includes ${hotels.length} hotels across ${summary.countries} countries, giving the mood enough range without losing its point of view.`,
      },
    ];
  }

  return [
    {
      question: `What defines the ${label} hotel backdrop?`,
      answer: `${label} is treated as a setting-led collection. The hotels here are grouped because the landscape, atmosphere, and wider environment shape the trip as much as the property itself.`,
    },
    {
      question: `How many hotels are featured in this ${label} guide?`,
      answer: `This guide currently includes ${hotels.length} hotels chosen for travelers who start with atmosphere first and narrow from there.`,
    },
  ];
}

function buildHotelPage(hotel) {
  const pagePath = hotelPath(hotel);
  const pageUrl = absoluteUrl(pagePath);
  const image = absoluteMediaUrl(getHotelImages(hotel)[0] || '');
  const description = getCardCopy(hotel);
  const title = `${hotel.name} in ${hotel.location} | ${siteName}`;
  const schema = buildHotelSchema(hotel, description, image);
  const settings = Array.isArray(hotel.settings) ? hotel.settings.slice(0, 4) : [];
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities.slice(0, 6) : [];
  const whyFits = Array.isArray(hotel.whyFits) ? hotel.whyFits.slice(0, 2) : [];
  const { country } = getLocationParts(hotel.location);
  const backdrops = getBackdropLabels(hotel);
  const vibes = getVibeLabels(hotel);
  const priorityRoutes = getPriorityRoutesForHotel(hotel, hotels, 4);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#F5F0F0" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body>
    <div id="root">
      <main style="max-width: 860px; margin: 0 auto; padding: 32px 20px 80px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222;">
        <p style="margin: 0 0 10px; color: #1540c5; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">Hotel Guide</p>
        <h1 style="margin: 0 0 12px; font-size: 42px; line-height: 1.05;">${escapeHtml(hotel.name)}</h1>
        <p style="margin: 0 0 24px; color: #666; font-size: 16px;">${escapeHtml(hotel.location)}</p>
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(hotel.imageAlt || hotel.name)}" style="width: 100%; border-radius: 20px; display: block; margin-bottom: 24px; object-fit: cover;" />` : ''}
        <p style="font-size: 19px; line-height: 1.7; margin: 0 0 24px;">${escapeHtml(hotel.description || description)}</p>
        ${whyFits.length ? `<section style="margin: 0 0 24px;"><h2 style="font-size: 22px; margin: 0 0 12px;">Why it stands out</h2><ul style="padding-left: 20px; line-height: 1.7;">${whyFits.map((item) => `<li>${escapeHtml(stripHtml(item))}</li>`).join('')}</ul></section>` : ''}
        ${amenities.length ? `<section style="margin: 0 0 24px;"><h2 style="font-size: 22px; margin: 0 0 12px;">Key amenities</h2><p style="line-height: 1.7; margin: 0;">${escapeHtml(amenities.join(' • '))}</p></section>` : ''}
        ${settings.length ? `<section style="margin: 0 0 24px;"><h2 style="font-size: 22px; margin: 0 0 12px;">Setting</h2><p style="line-height: 1.7; margin: 0;">${escapeHtml(settings.join(' • '))}</p></section>` : ''}
        ${hotel.tradeoff ? `<section style="margin: 0 0 32px;"><h2 style="font-size: 22px; margin: 0 0 12px;">Good to know</h2><p style="line-height: 1.7; margin: 0;">${escapeHtml(stripHtml(hotel.tradeoff))}</p></section>` : ''}
        ${
          priorityRoutes.length
            ? `<section style="margin: 0 0 32px;"><h2 style="font-size: 22px; margin: 0 0 12px;">Priority guides</h2><ul style="padding-left: 20px; line-height: 1.9; margin: 0;">${priorityRoutes
                .map((route) => `<li><a href="${getCollectionPath(route)}">${escapeHtml(route.label)}</a> <span style="color:#666;">(${escapeHtml(route.kind)}, ${route.hotelCount} hotels)</span></li>`)
                .join('')}</ul></section>`
            : ''
        }
        <section style="margin: 0 0 32px;">
          <h2 style="font-size: 22px; margin: 0 0 12px;">Explore more</h2>
          <ul style="padding-left: 20px; line-height: 1.9; margin: 0;">
            <li><a href="${destinationPath(hotel.location)}">More stays in ${escapeHtml(hotel.location)}</a></li>
            ${country ? `<li><a href="${countryPath(country)}">Browse hotels in ${escapeHtml(country)}</a></li>` : ''}
            ${backdrops.map((label) => `<li><a href="${backdropPath(label)}">See more ${escapeHtml(label.toLowerCase())} stays</a></li>`).join('')}
            ${vibes.map((label) => `<li><a href="${vibePath(label)}">Browse ${escapeHtml(label.toLowerCase())} stays</a></li>`).join('')}
          </ul>
        </section>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="/" style="display: inline-block; border: 1px solid #1540c5; border-radius: 999px; padding: 12px 18px; color: #1540c5; text-decoration: none; font-weight: 600;">Open in My Hotel Vibe</a>
          <a href="${escapeHtml(buildAffiliateUrl(hotel.bookingUrl, hotel.name, hotel.location))}" style="display: inline-block; background: #1540c5; border-radius: 999px; padding: 12px 18px; color: white; text-decoration: none; font-weight: 600;" target="_blank" rel="noopener noreferrer">Book now</a>
        </div>
      </main>
    </div>
    <script>window.__SEO_HOTEL_SLUG=${JSON.stringify(slugifyHotelValue(hotel.name || hotel.id))};</script>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>`;
}

function buildCollectionPage({
  kind,
  title,
  description,
  pagePath,
  image,
  eyebrow,
  heading,
  intro,
  hotels,
  relatedLinks = [],
}) {
  const pageUrl = absoluteUrl(pagePath);
  const socialImage = absoluteMediaUrl(image);
  const summary = getCollectionSummary(kind, hotels);
  const faq = getCollectionFaq(kind, heading.replace(/\s+hotels$/i, ''), hotels);
  const indexDecision = getCollectionIndexDecision(kind, hotels);
  const robots =
    indexDecision === 'index-now' || indexDecision === 'index-lightly'
      ? 'index,follow,max-image-preview:large'
      : 'noindex,follow,max-image-preview:large';
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: pageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: siteName,
          item: absoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: heading,
          item: pageUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: heading,
      itemListElement: buildItemListSchema(hotels),
    },
    ...(faq.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          },
        ]
      : []),
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#F5F0F0" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    ${socialImage ? `<meta property="og:image" content="${escapeHtml(socialImage)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${socialImage ? `<meta name="twitter:image" content="${escapeHtml(socialImage)}" />` : ''}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body>
    <div id="root">
      <main style="max-width: 920px; margin: 0 auto; padding: 32px 20px 80px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222;">
        <p style="margin: 0 0 10px; color: #1540c5; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">${escapeHtml(eyebrow)}</p>
        <h1 style="margin: 0 0 12px; font-size: 42px; line-height: 1.05;">${escapeHtml(heading)}</h1>
        <p style="font-size: 19px; line-height: 1.7; margin: 0 0 24px;">${escapeHtml(intro)}</p>
        <section style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin:0 0 28px;">
          <div style="border:1px solid rgba(21,64,197,0.16); border-radius:18px; padding:16px; background:#faf8f5;">
            <div style="margin:0 0 6px; color:#1540c5; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">At a glance</div>
            <div style="line-height:1.6;">${escapeHtml(summary.focusLine)}</div>
          </div>
          <div style="border:1px solid rgba(21,64,197,0.16); border-radius:18px; padding:16px; background:#faf8f5;">
            <div style="margin:0 0 6px; color:#1540c5; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">Price mix</div>
            <div style="line-height:1.6;">${escapeHtml(
              `${summary.boutiqueCount > 0 ? `${summary.boutiqueCount} boutique` : 'No boutique'}${summary.luxeCount > 0 ? `, ${summary.luxeCount} luxe` : ''}${summary.iconicCount > 0 ? `, ${summary.iconicCount} iconic` : ''}`
            )}</div>
          </div>
          <div style="border:1px solid rgba(21,64,197,0.16); border-radius:18px; padding:16px; background:#faf8f5;">
            <div style="margin:0 0 6px; color:#1540c5; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">Spread</div>
            <div style="line-height:1.6;">${escapeHtml(
              `${summary.destinations} destination${summary.destinations === 1 ? '' : 's'}${summary.countries > 1 ? ` across ${summary.countries} countries` : ''}`
            )}</div>
          </div>
        </section>
        <section style="margin: 0 0 32px;">
          <h2 style="font-size: 24px; margin: 0 0 12px;">Hotels in this edit</h2>
          <ul style="padding-left: 20px; line-height: 1.9; margin: 0;">
            ${hotels
              .map((hotel) => `<li><a href="${hotelPath(hotel)}">${escapeHtml(hotel.name)}</a> <span style="color:#666;">in ${escapeHtml(hotel.location)}</span></li>`)
              .join('')}
          </ul>
        </section>
        ${
          relatedLinks.length
            ? `<section><h2 style="font-size: 24px; margin: 0 0 12px;">Keep exploring</h2><ul style="padding-left: 20px; line-height: 1.9; margin: 0;">${relatedLinks
                .map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`)
                .join('')}</ul></section>`
            : ''
        }
        ${
          faq.length
            ? `<section style="margin-top:32px;"><h2 style="font-size: 24px; margin: 0 0 12px;">Common questions</h2><div style="display:grid; gap:12px;">${faq
                .map(
                  (item) =>
                    `<div style="border:1px solid rgba(21,64,197,0.16); border-radius:18px; padding:16px; background:#faf8f5;"><h3 style="margin:0 0 8px; font-size:16px;">${escapeHtml(item.question)}</h3><p style="margin:0; line-height:1.7;">${escapeHtml(item.answer)}</p></div>`
                )
                .join('')}</div></section>`
            : ''
        }
      </main>
    </div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>`;
}

function buildHubPage({ title, description, pagePath, eyebrow, heading, intro, links }) {
  const pageUrl = absoluteUrl(pagePath);
  const robots = 'index,follow';
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: pageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: siteName,
          item: absoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: heading,
          item: pageUrl,
        },
      ],
    }
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <link rel="stylesheet" href="../assets/${cssFile}" />
  </head>
  <body>
    <div id="root">
      <main style="max-width: 920px; margin: 0 auto; padding: 32px 20px 80px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #222;">
        <p style="margin: 0 0 10px; color: #1540c5; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">${escapeHtml(eyebrow)}</p>
        <h1 style="margin: 0 0 12px; font-size: 42px; line-height: 1.05;">${escapeHtml(heading)}</h1>
        <p style="font-size: 19px; line-height: 1.7; margin: 0 0 24px;">${escapeHtml(intro)}</p>
        <section style="margin: 0 0 32px;">
          <ul style="padding-left: 20px; line-height: 1.9; margin: 0;">
            ${links
              .map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a> <span style="color:#666;">(${link.count} hotels)</span></li>`)
              .join('')}
          </ul>
        </section>
      </main>
    </div>
  </body>
</html>`;
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
}

for (const hotel of hotels) {
  writeFile(path.join(distDir, 'hotels', slugifyHotelValue(hotel.name || hotel.id), 'index.html'), buildHotelPage(hotel));
}

const destinationGroups = [...new Map(hotels.map((hotel) => [getDestinationSlug(hotel.location), { slug: getDestinationSlug(hotel.location), label: getLocationParts(hotel.location).label }])).values()]
  .map((group) => ({
    ...group,
    hotels: hotels.filter((hotel) => getDestinationSlug(hotel.location) === group.slug),
  }));

const countryGroups = [...new Map(hotels.map((hotel) => [getCountrySlug(hotel.location), { slug: getCountrySlug(hotel.location), label: getLocationParts(hotel.location).country }])).values()]
  .filter((group) => group.label)
  .map((group) => ({
    ...group,
    hotels: hotels.filter((hotel) => getCountrySlug(hotel.location) === group.slug),
  }));

const backdropGroups = [...new Map(hotels.flatMap((hotel) => getBackdropLabels(hotel).map((label) => [slugifyHotelValue(label), { slug: slugifyHotelValue(label), label }]))).values()]
  .map((group) => ({
    ...group,
    hotels: hotels.filter((hotel) => getBackdropLabels(hotel).some((label) => slugifyHotelValue(label) === group.slug)),
  }));

const vibeGroups = [...new Map(hotels.flatMap((hotel) => getVibeLabels(hotel).map((label) => [slugifyHotelValue(label), { slug: slugifyHotelValue(label), label }]))).values()]
  .map((group) => ({
    ...group,
    hotels: hotels.filter((hotel) => getVibeLabels(hotel).some((label) => slugifyHotelValue(label) === group.slug)),
  }));

for (const group of destinationGroups) {
  const editorial = getCollectionEditorialContent('destination', group.label, group.hotels);
  writeFile(
    path.join(distDir, 'destinations', group.slug, 'index.html'),
    buildCollectionPage({
      kind: 'destination',
      title: `${editorial.heading} | ${siteName}`,
      description: editorial.description,
      pagePath: destinationPath(group.label),
      image: getHotelImages(group.hotels[0] || {})[0],
      eyebrow: editorial.eyebrow,
      heading: editorial.heading,
      intro: editorial.intro,
      hotels: group.hotels,
      relatedLinks: countryGroups
        .filter((country) => country.label === getLocationParts(group.label).country)
        .map((country) => ({ href: countryPath(country.label), label: `More hotels in ${country.label}` })),
    })
  );
}

for (const group of countryGroups) {
  const editorial = getCollectionEditorialContent('country', group.label, group.hotels);
  writeFile(
    path.join(distDir, 'countries', group.slug, 'index.html'),
    buildCollectionPage({
      kind: 'country',
      title: `${editorial.heading === `${group.label} hotels` ? `${group.label} Hotel Guide` : editorial.heading} | ${siteName}`,
      description: editorial.description,
      pagePath: countryPath(group.label),
      image: getHotelImages(group.hotels[0] || {})[0],
      eyebrow: editorial.eyebrow,
      heading: editorial.heading,
      intro: editorial.intro,
      hotels: group.hotels,
      relatedLinks: destinationGroups
        .filter((destination) => getLocationParts(destination.label).country === group.label)
        .map((destination) => ({ href: destinationPath(destination.label), label: destination.label })),
    })
  );
}

for (const group of backdropGroups) {
  const editorial = getCollectionEditorialContent('backdrop', group.label, group.hotels);
  writeFile(
    path.join(distDir, 'backdrops', group.slug, 'index.html'),
    buildCollectionPage({
      kind: 'backdrop',
      title: `${editorial.heading} | ${siteName}`,
      description: editorial.description,
      pagePath: backdropPath(group.label),
      image: getHotelImages(group.hotels[0] || {})[0],
      eyebrow: editorial.eyebrow,
      heading: editorial.heading,
      intro: editorial.intro,
      hotels: group.hotels,
      relatedLinks: destinationGroups
        .filter((destination) => group.hotels.some((hotel) => getDestinationSlug(hotel.location) === destination.slug))
        .map((destination) => ({ href: destinationPath(destination.label), label: destination.label })),
    })
  );
}

for (const group of vibeGroups) {
  const editorial = getCollectionEditorialContent('vibe', group.label, group.hotels);
  writeFile(
    path.join(distDir, 'vibes', group.slug, 'index.html'),
    buildCollectionPage({
      kind: 'vibe',
      title: `${editorial.heading} | ${siteName}`,
      description: editorial.description,
      pagePath: vibePath(group.label),
      image: getHotelImages(group.hotels[0] || {})[0],
      eyebrow: editorial.eyebrow,
      heading: editorial.heading,
      intro: editorial.intro,
      hotels: group.hotels,
      relatedLinks: destinationGroups
        .filter((destination) => group.hotels.some((hotel) => getDestinationSlug(hotel.location) === destination.slug))
        .map((destination) => ({ href: destinationPath(destination.label), label: destination.label })),
    })
  );
}

writeFile(
  path.join(distDir, 'destinations', 'index.html'),
  buildHubPage({
    title: `All Destinations | ${siteName}`,
    description: `Discover boutique and luxury hotels across all our curated destinations.`,
    pagePath: '/destinations/',
    eyebrow: 'Directory',
    heading: 'All Destinations',
    intro: 'Browse our collection of handpicked hotels by destination.',
    links: destinationGroups.map((group) => ({
      href: destinationPath(group.label),
      label: group.label,
      count: group.hotels.length,
    })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  })
);

writeFile(
  path.join(distDir, 'vibes', 'index.html'),
  buildHubPage({
    title: `All Vibes | ${siteName}`,
    description: `Find your perfect stay based on the vibe you are looking for.`,
    pagePath: '/vibes/',
    eyebrow: 'Directory',
    heading: 'All Vibes',
    intro: 'Explore hotels curated by mood, setting, and experience.',
    links: vibeGroups.map((group) => ({
      href: vibePath(group.label),
      label: group.label,
      count: group.hotels.length,
    })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  })
);

const sitemapUrls = [
  absoluteUrl('/'),
  absoluteUrl('/destinations/'),
  absoluteUrl('/vibes/'),
  ...hotels.map((hotel) => absoluteUrl(hotelPath(hotel))),
  ...destinationGroups
    .filter((group) => {
      const decision = getCollectionIndexDecision('destination', group.hotels);
      return decision === 'index-now' || decision === 'index-lightly';
    })
    .map((group) => absoluteUrl(destinationPath(group.label))),
  ...countryGroups
    .filter((group) => {
      const decision = getCollectionIndexDecision('country', group.hotels);
      return decision === 'index-now' || decision === 'index-lightly';
    })
    .map((group) => absoluteUrl(countryPath(group.label))),
  ...backdropGroups
    .filter((group) => {
      const decision = getCollectionIndexDecision('backdrop', group.hotels);
      return decision === 'index-now' || decision === 'index-lightly';
    })
    .map((group) => absoluteUrl(backdropPath(group.label))),
  ...vibeGroups
    .filter((group) => {
      const decision = getCollectionIndexDecision('vibe', group.hotels);
      return decision === 'index-now' || decision === 'index-lightly';
    })
    .map((group) => absoluteUrl(vibePath(group.label))),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map((url) => `  <url><loc>${escapeHtml(url)}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`)
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Host: ${siteUrl}

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;

writeFile(path.join(distDir, 'sitemap.xml'), sitemap);
writeFile(path.join(distDir, 'robots.txt'), robots);
writeFile(path.join(distDir, 'index.html'), patchedIndexHtml);

console.log(`Wrote ${hotels.length} hotel SEO pages`);
console.log('Wrote dist/sitemap.xml');
console.log('Wrote dist/robots.txt');
console.log('Patched dist/index.html canonical metadata');
