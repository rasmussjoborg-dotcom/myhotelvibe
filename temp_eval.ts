
const audoForestImage = 'audoForest';
const ettHemImage = 'ettHem';
const greekIslandHideawayImage = 'greekIslandHideaway';
const hotelArcticImage = 'hotelArctic';
const lisbonDesignHouseImage = 'lisbonDesignHouse';
const mallorcaFamilyResortImage = 'mallorcaFamilyResort';
const manshausenIslandImage = 'manshausenIsland';
const romePalazzoImage = 'romePalazzo';
const theRetreatImage = 'theRetreat';
const treehotelImage = 'treehotel';
const tuscanyVineyardRetreatImage = 'tuscanyVineyardRetreat';
const villaCopenhagenImage = 'villaCopenhagen';
const villaValsImage = 'villaVals';
const palacioAndaluzImage = 'palacioAndaluz';
const azoresEcoLodgeImage = 'azoresEcoLodge';
const londonShardSuitesImage = 'londonShardSuites';
const algarveFamilyResortImage = 'algarveFamilyResort';
const lakeComoVillaImage = 'lakeComoVilla';
const bardenasDesertCampImage = 'bardenasDesertCamp';
const parisBoutiqueSuiteImage = 'parisBoutiqueSuite';
const douroValleyWineImage = 'douroValleyWine';
const amalfiCliffsideImage = 'amalfiCliffside';
const scottishHighlandsLodgeImage = 'scottishHighlandsLodge';
const bavarianAlpsRetreatImage = 'bavarianAlpsRetreat';
const corsicanBeachHideawayImage = 'corsicanBeachHideaway';
const transylvanianCastleStayImage = 'transylvanianCastleStay';
const dalmatianCoastResortImage = 'dalmatianCoastResort';
const costaRicaJungleLodgeImage = 'costaRicaJungleLodge';
const marrakechRiadImage = 'marrakechRiad';
const rivieraMayaFamilyResortImage = 'rivieraMayaFamilyResort';
const tokyoSkylineRyokanImage = 'tokyoSkylineRyokan';




































const svgPlaceholder = (seed: string) => {
  const hash = Array.from(seed).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const hueA = hash % 360;
  const hueB = (hueA + 28 + (hash % 40)) % 360;
  const hueC = (hueA + 180 + (hash % 50)) % 360;
  const id = `g${hash.toString(16)}`;
  const initials = seed
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const match = word.match(/[A-Za-z0-9]/);
      return match ? match[0].toUpperCase() : '';
    })
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .slice(0, 2);

  // Note: avoid an XML declaration here; some browsers fail to render data-URI SVGs with it.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hueA} 45% 88%)"/>
      <stop offset="0.55" stop-color="hsl(${hueB} 40% 84%)"/>
      <stop offset="1" stop-color="hsl(${hueC} 35% 86%)"/>
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
  </defs>
  <rect width="1200" height="800" rx="44" fill="url(#${id})"/>
  <g filter="url(#blur)" opacity="0.85">
    <circle cx="240" cy="230" r="190" fill="hsl(${hueB} 55% 76% / 0.55)"/>
    <circle cx="930" cy="320" r="240" fill="hsl(${hueC} 55% 78% / 0.45)"/>
    <rect x="120" y="520" width="720" height="170" rx="80" fill="hsl(${hueA} 45% 74% / 0.35)"/>
  </g>
  <g opacity="0.34">
    <path d="M0 560 C220 520, 360 600, 560 560 C760 520, 900 620, 1200 560 L1200 800 L0 800 Z" fill="white"/>
  </g>
  <g>
    <rect x="74" y="60" width="140" height="140" rx="38" fill="white" opacity="0.45"/>
    <text x="144" y="148" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="56" font-weight="800" fill="hsl(${hueA} 28% 30% / 0.78)">${initials}</text>
  </g>
</svg>`;
  // Base64 is the most reliable across file:// + standalone builds.
  // SVG string is ASCII-only, so we can base64 encode directly in the browser.
  const base64 =
    typeof btoa === 'function'
      ? btoa(svg)
      : typeof (globalThis as any).Buffer !== 'undefined'
        ? (globalThis as any).Buffer.from(svg, 'utf8').toString('base64')
        : '';
  return `data:image/svg+xml;base64,${base64}`;
};

const ALL_STAY_IMAGES: string[] = [
  audoForestImage, ettHemImage, greekIslandHideawayImage, hotelArcticImage,
  lisbonDesignHouseImage, mallorcaFamilyResortImage, manshausenIslandImage,
  romePalazzoImage, theRetreatImage, treehotelImage, tuscanyVineyardRetreatImage,
  villaCopenhagenImage, villaValsImage, palacioAndaluzImage, azoresEcoLodgeImage,
  londonShardSuitesImage, algarveFamilyResortImage, lakeComoVillaImage,
  bardenasDesertCampImage, parisBoutiqueSuiteImage, douroValleyWineImage,
  amalfiCliffsideImage, scottishHighlandsLodgeImage, bavarianAlpsRetreatImage,
  corsicanBeachHideawayImage, transylvanianCastleStayImage, dalmatianCoastResortImage,
  costaRicaJungleLodgeImage, marrakechRiadImage, rivieraMayaFamilyResortImage,
  tokyoSkylineRyokanImage,
];

const INITIAL_STAYS= [
  {
    id: 'audo-forest',
    name: 'The Audo Forest',
    location: 'Swedish Lapland',
    region: 'Lapland',
    priceCategory: '€€€',
    priceValue: 300,
    luxuriousValue: 4,
    distanceValue: 120, // 2h from airport
    spaScore: 5,
    image: audoForestImage,
    imageAlt: 'A modern forest retreat in Swedish Lapland.',
    tags: ['Nature reset', 'Spa focus'],
    whyFits: [
      'You are seeking a sanctuary where quiet minimalism and raw nature seamlessly merge.',
      'Ideal for those who appreciate architectural precision set against a backdrop of deep, ancient woods.'
    ],
    tradeoff: 'Tradeoff: Longer transfer — around 2 hours from the airport.',
    amenities: ['Spa', 'Pool'],
    settings: ['Forest', 'Secluded']
  },
  {
    id: 'villa-vals',
    name: 'Villa Vals',
    location: 'Swiss Alps',
    region: 'Alps',
    priceCategory: '€€€€',
    priceValue: 650,
    luxuriousValue: 5,
    distanceValue: 15,
    spaScore: 4,
    image: villaValsImage,
    imageAlt: 'An architectural alpine villa with mountain views in Switzerland.',
    tags: ['Feel fancy', 'Mountain View'],
    whyFits: [
      'You value total seclusion and the architectural marvel of living seamlessly within the earth.',
      'A masterful choice for finding profound stillness away from the noise of modern life.'
    ],
    tradeoff: 'Tradeoff: Top-tier pricing — this is a “go big” stay.',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    settings: ['Mountain View', 'Secluded']
  },
  {
    id: 'manshausen-island',
    name: 'Manshausen Island',
    location: 'Northern Norway',
    region: 'Norway',
    priceCategory: '€€',
    priceValue: 180,
    luxuriousValue: 4,
    distanceValue: 90,
    spaScore: 3,
    image: manshausenIslandImage,
    imageAlt: 'A secluded coastal cabin stay in Northern Norway.',
    tags: ['Nature reset', 'Secluded'],
    whyFits: [
      'You are drawn to raw, elemental landscapes viewed from the comfort of striking, glass-fronted design.',
      'Perfect for those who find ultimate relaxation at the edge of the world.'
    ],
    tradeoff: 'Tradeoff: Limited dining choice — mostly on-site options.',
    amenities: ['Fine Dining', 'Pool'],
    settings: ['Secluded']
  },
  {
    id: 'ett-hem',
    name: 'Ett Hem',
    location: 'Stockholm, Sweden',
    region: 'Sweden',
    priceCategory: '€€€',
    priceValue: 350,
    luxuriousValue: 5,
    distanceValue: 5,
    spaScore: 5,
    image: ettHemImage,
    imageAlt: 'A boutique townhouse hotel in Stockholm.',
    description: 'A townhouse hotel that feels like a beautifully designed home — calm, intimate, and quietly luxurious.',
    tags: ['Nature reset', 'Design-forward', 'Sauna'],
    whyFits: [
      'You appreciate the intimate atmosphere of a private townhouse infused with impeccable Scandinavian taste.',
      'A sophisticated choice for those seeking a highly curated refuge in the heart of the city.'
    ],
    tradeoff: 'Tradeoff: Books out fast — you often need to plan ahead.',
    amenities: ['Spa', 'Fine Dining', 'Pet Friendly'],
    settings: ['Forest']
  },
  {
    id: 'the-retreat',
    name: 'The Retreat',
    location: 'Blue Lagoon, Iceland',
    region: 'Iceland',
    priceCategory: '€€€€',
    priceValue: 800,
    luxuriousValue: 5,
    distanceValue: 45,
    spaScore: 5,
    image: theRetreatImage,
    imageAlt: 'A minimalist spa hotel by the Blue Lagoon in Iceland.',
    description: 'Minimalist suites with immediate access to mineral-rich waters — built for recovery and deep relaxation.',
    tags: ['Spa focus', 'Nature reset', 'Secluded'],
    whyFits: [
      'You are seeking a sanctuary where wellness and thermal waters are the main event.',
      'Ideal for those who appreciate letting the volcanic landscape and understated design take center stage.'
    ],
    tradeoff: 'Tradeoff: You’ll mostly eat on-site due to the location.',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    settings: ['Secluded', 'Mountain View']
  },
  {
    id: 'villa-copenhagen',
    name: 'Villa Copenhagen',
    location: 'Copenhagen, Denmark',
    region: 'Copenhagen',
    priceCategory: '€€€',
    priceValue: 290,
    luxuriousValue: 4,
    distanceValue: 2,
    spaScore: 4,
    image: villaCopenhagenImage,
    imageAlt: 'A grand yet modern hotel in central Copenhagen.',
    tags: ['Grand heritage', 'Rooftop pool', 'Sustainable luxury'],
    whyFits: [
      'You thrive on vibrant urban energy but demand a beautifully designed, historic setting to return to.',
      'A splendid match for those who enjoy world-class dining just steps from their suite.'
    ],
    tradeoff: 'Tradeoff: More city buzz than a quiet retreat.',
    amenities: ['Pool', 'Fine Dining', 'Spa'],
    settings: ['Mountain View']
  },
  {
    id: 'treehotel',
    name: 'Treehotel',
    location: 'Harads, Sweden',
    region: 'Sweden',
    priceCategory: '€€€€',
    priceValue: 550,
    luxuriousValue: 5,
    distanceValue: 100,
    spaScore: 4,
    image: treehotelImage,
    imageAlt: 'A design-forward cabin hotel in the Swedish forest.',
    tags: ['Nature reset', 'Secluded', 'Architectural icon'],
    whyFits: [
      'You desire an unconventional escape that elevates you—literally—into the canopy of nature.',
      'Perfect for rediscovering a sense of wonder without sacrificing the comforts of luxury design.'
    ],
    tradeoff: 'Tradeoff: Remote — expect a longer journey to get there.',
    amenities: ['Spa', 'Pet Friendly'],
    settings: ['Forest', 'Secluded']
  },
  {
    id: 'hotel-arctic',
    name: 'Hotel Arctic',
    location: 'Ilulissat, Greenland',
    region: 'Greenland',
    priceCategory: '€€€',
    priceValue: 380,
    luxuriousValue: 4,
    distanceValue: 180,
    spaScore: 3,
    image: hotelArcticImage,
    imageAlt: 'An arctic hotel with iceberg views in Greenland.',
    tags: ['Adventure luxury', 'Arctic views'],
    whyFits: [
      'You want to witness the stark, breathtaking beauty of the ice fjords from a place of supreme warmth.',
      'Ideal for those who view travel as an opportunity for profound, once-in-a-lifetime encounters.'
    ],
    tradeoff: 'Tradeoff: Getting here takes time — usually multiple flights.',
    amenities: ['Fine Dining', 'Spa'],
    settings: ['Secluded', 'Mountain View']
  },
  {
    id: 'mallorca-family-resort',
    name: 'Can Sol Family Estate',
    location: 'Mallorca, Spain',
    region: 'Balearic Islands',
    priceCategory: '€€€',
    priceValue: 420,
    luxuriousValue: 4,
    distanceValue: 35,
    spaScore: 3,
    image: mallorcaFamilyResortImage,
    imageAlt: 'A refined family-friendly beach resort in Mallorca.',
    description: 'A polished Mediterranean resort with enough space for kids, but still elegant enough for adults.',
    tags: ['Family-friendly', 'Beach & sun', 'Kids pool'],
    whyFits: [
      'You refuse to compromise on aesthetics or culinary excellence while traveling with loved ones.',
      'A beautiful balance of Mediterranean serenity and thoughtful, engaging spaces for all ages.'
    ],
    tradeoff: 'Tradeoff: Less secluded in peak summer; best for people who want resort energy.',
    amenities: ['Pool', 'Spa', 'Fine Dining'],
    settings: ['Secluded']
  },
  {
    id: 'rome-palazzo',
    name: 'Palazzo Aurelia',
    location: 'Rome, Italy',
    region: 'Rome',
    priceCategory: '€€€€',
    priceValue: 720,
    luxuriousValue: 5,
    distanceValue: 8,
    spaScore: 3,
    image: romePalazzoImage,
    imageAlt: 'A restored palazzo hotel in Rome.',
    description: 'A romantic city hotel for people who want old-world rooms, proper service, and a rooftop aperitivo.',
    tags: ['Romance', 'City luxury', 'Grand heritage'],
    whyFits: [
      'You are captivated by the grandeur of history, reimagined with flawless contemporary luxury.',
      'The definitive choice for experiencing the Eternal City like modern royalty.'
    ],
    tradeoff: 'Tradeoff: Not a quiet escape; you are very much in the middle of the city.',
    amenities: ['Fine Dining', 'Spa'],
    settings: ['Secluded']
  },
  {
    id: 'palacio-andaluz',
    name: 'Palacio Andaluz',
    location: 'Granada, Spain',
    region: 'Andalusia',
    priceCategory: '€€',
    priceValue: 260,
    luxuriousValue: 4,
    distanceValue: 20,
    spaScore: 4,
    image: palacioAndaluzImage,
    imageAlt: 'A boutique Moorish palace hotel in Granada.',
    description: 'An intimate courtyard stay with Moorish tiled details, a small pool, and a slower rhythm behind the city walls.',
    tags: ['Boutique', 'Romance', 'Design hotel'],
    whyFits: [
      'You long to immerse yourself in Moorish architecture and the deeply romantic rhythms of Andalusia.',
      'Perfect for those who favor ornate, palatial elegance and sun-drenched courtyards.'
    ],
    tradeoff: 'Tradeoff: The city can feel busy once you leave the property.',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    settings: ['Secluded']
  },
  {
    id: 'greek-island-hideaway',
    name: 'Asteri Cliff House',
    location: 'Santorini, Greece',
    region: 'Cyclades',
    priceCategory: '€€€€',
    priceValue: 680,
    luxuriousValue: 5,
    distanceValue: 25,
    spaScore: 3,
    image: greekIslandHideawayImage,
    imageAlt: 'A whitewashed boutique hotel on a Greek island.',
    description: 'A cliffside island hotel built for slow breakfasts, sea views, and doing very little beautifully.',
    tags: ['Romance', 'Sea views', 'Feel fancy'],
    whyFits: [
      'You seek the quintessential Aegean dream: stark white lines, brilliant blue water, and effortless elegance.',
      'Ideal for days spent tracing the sun’s arc from a private, cliffside plunge pool.'
    ],
    tradeoff: 'Tradeoff: Expensive and not ideal for families with small kids.',
    amenities: ['Pool', 'Fine Dining', 'Spa'],
    settings: ['Secluded', 'Mountain View']
  },
  {
    id: 'lisbon-design-house',
    name: 'Casa do Azulejo',
    location: 'Lisbon, Portugal',
    region: 'Lisbon',
    priceCategory: '€€',
    priceValue: 240,
    luxuriousValue: 4,
    distanceValue: 12,
    spaScore: 2,
    image: lisbonDesignHouseImage,
    imageAlt: 'A design boutique hotel in Lisbon.',
    description: 'A compact design hotel for a stylish city break: tiles, good lighting, and easy neighborhood wandering.',
    tags: ['Design hotel', 'City break', 'Boutique'],
    whyFits: [
      'You are inspired by rich textures, artisanal craftsmanship, and the soulful charm of an ancient neighborhood.',
      'A quiet, creatively inspiring haven hidden amidst winding, cobbled streets.'
    ],
    tradeoff: 'Tradeoff: Light on resort amenities; this is more city base than retreat.',
    amenities: ['Fine Dining', 'Pet Friendly'],
    settings: ['Secluded']
  },
  {
    id: 'azores-eco-lodge',
    name: 'Azores Eco Lodge',
    location: 'São Miguel, Portugal',
    region: 'Azores',
    priceCategory: '€€€',
    priceValue: 390,
    luxuriousValue: 4,
    distanceValue: 160,
    spaScore: 4,
    image: azoresEcoLodgeImage,
    imageAlt: 'A lush eco-lodge in the Azores.',
    description: 'An open-air nature lodge for travelers who want wellness, volcanic hikes, and a little adventure without roughing it.',
    tags: ['Adventure', 'Nature reset', 'Eco-luxury'],
    whyFits: [
      'You want to be entirely enveloped by lush, dramatic landscapes in a setting that honors the earth.',
      'A pristine hideaway for those whose ultimate luxury is untouched nature.'
    ],
    tradeoff: 'Tradeoff: Weather can be highly unpredictable.',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    settings: ['Forest', 'Secluded']
  },
  {
    id: 'tuscany-vineyard-retreat',
    name: 'Tenuta Val d Oro',
    location: 'Tuscany, Italy',
    region: 'Tuscany',
    priceCategory: '€€€',
    priceValue: 360,
    luxuriousValue: 4,
    distanceValue: 75,
    spaScore: 3,
    image: tuscanyVineyardRetreatImage,
    imageAlt: 'A Tuscany vineyard hotel with pool and terrace.',
    description: 'A vineyard retreat for long lunches, pool afternoons, and staying somewhere that feels like the destination.',
    tags: ['Food & wine', 'Countryside', 'Romance'],
    whyFits: [
      'You believe that the finest things in life are slow mornings, rolling hills, and exceptional vintage wines.',
      'A deeply romantic estate designed for savoring the true essence of the Italian countryside.'
    ],
    tradeoff: 'Tradeoff: You will want a car to get the best out of the area.',
    amenities: ['Pool', 'Fine Dining', 'Spa'],
    settings: ['Secluded', 'Mountain View']
  },
  {
    id: 'london-shard-suites',
    name: 'The Shard Suites',
    location: 'London, UK',
    region: 'London',
    priceCategory: '€€€€',
    priceValue: 620,
    luxuriousValue: 5,
    distanceValue: 6,
    spaScore: 4,
    image: londonShardSuitesImage,
    imageAlt: 'A calm luxury hotel room overlooking the London skyline.',
    description: 'A serene high-rise stay for city travelers who still want quiet, high tea rituals, and refined service.',
    tags: ['City luxury', 'Quiet', 'Business-friendly'],
    whyFits: [
      'You want the city laid out at your feet from an unparalleled, sky-high vantage point.',
      'Perfect for those who require seamless service and sleek modernity in the center of a metropolis.'
    ],
    tradeoff: 'Tradeoff: Premium pricing and less resort-like than a country estate.',
    amenities: ['Spa', 'Fine Dining'],
    settings: ['Mountain View']
  },
  {
    id: 'algarve-family-resort',
    name: 'Algarve Sun Resort',
    location: 'Algarve, Portugal',
    region: 'Algarve',
    priceCategory: '€€€',
    priceValue: 330,
    luxuriousValue: 4,
    distanceValue: 55,
    spaScore: 4,
    image: algarveFamilyResortImage,
    imageAlt: 'A premium family beach resort in the Algarve.',
    description: 'A sunny, easy resort for families who want pools, food handled, and enough comfort for the adults too.',
    tags: ['Family-friendly', 'All-inclusive feel', 'Beach & sun'],
    whyFits: [
      'You desire a sophisticated coastal escape where the Atlantic breeze meets manicured perfection.',
      'An effortless blend of high-end leisure and vibrant, sun-soaked relaxation.'
    ],
    tradeoff: 'Tradeoff: Less boutique and more resort-scale.',
    amenities: ['Pool', 'Spa', 'Fine Dining'],
    settings: ['Secluded']
  },
  {
    id: 'lake-como-villa',
    name: 'Villa Lario',
    location: 'Lake Como, Italy',
    region: 'Lombardy',
    priceCategory: '€€€€',
    priceValue: 950,
    luxuriousValue: 5,
    distanceValue: 75,
    spaScore: 5,
    image: lakeComoVillaImage,
    imageAlt: 'A lakeside luxury villa in Lake Como.',
    description: 'Lakeside terraces, classic Riva boats, and a spa built for doing nothing—beautifully.',
    tags: ['Feel fancy', 'Beach & sun', 'Spa focus'],
    whyFits: [
      'You appreciate the timeless, aristocratic allure of one of the world’s most romantic lakes.',
      'The quintessential setting for those seeking cinematic beauty and classic Italian hospitality.'
    ],
    tradeoff: 'Tradeoff: Very expensive, and requires advance booking in summer.',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    settings: ['Secluded']
  },
  {
    id: 'bardenas-desert-camp',
    name: 'Bardenas Desert Camp',
    location: 'Navarre, Spain',
    region: 'Navarre',
    priceCategory: '€€€€',
    priceValue: 780,
    luxuriousValue: 5,
    distanceValue: 55,
    spaScore: 4,
    image: bardenasDesertCampImage,
    imageAlt: 'A luxury desert camp-style hotel in Spain.',
    description: 'Desert calm with grown-up luxury: sunset dinners, quiet pools, and spa rituals in a unique European semi-desert.',
    tags: ['Recover & be pampered', 'Secluded', 'Feel fancy'],
    whyFits: [
      'You are captivated by stark, lunar landscapes and the stark beauty of a semi-desert environment.',
      'A surreal, highly curated escape for those who find clarity in wide open spaces.'
    ],
    tradeoff: 'Tradeoff: More about atmosphere than exploring a vibrant town.',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    settings: ['Secluded']
  },
  {
    id: 'paris-boutique-suite',
    name: 'Le Marais Boutique',
    location: 'Paris, France',
    region: 'Ile-de-France',
    priceCategory: '€€€€',
    priceValue: 690,
    luxuriousValue: 5,
    distanceValue: 10,
    spaScore: 2,
    image: parisBoutiqueSuiteImage,
    imageAlt: 'A luxury boutique hotel suite in Paris.',
    description: 'A quietly luxurious city stay: great rooms, Haussmann details, and a lobby that feels like a members club.',
    tags: ['City luxury', 'Design hotel', 'Food & wine'],
    whyFits: [
      'You wish to experience the Marais not just as a visitor, but from within a flawlessly designed private residence.',
      'Ideal for those who value intimate luxury and walking access to the city’s finest galleries and cafes.'
    ],
    tradeoff: 'Tradeoff: Limited resort amenities; it’s a city-first stay.',
    amenities: ['Fine Dining', 'Pet Friendly'],
    settings: ['Secluded']
  },
  {
    id: 'douro-valley-wine',
    name: 'Douro Wine Estate',
    location: 'Douro Valley, Portugal',
    region: 'Douro',
    priceCategory: '€€€',
    priceValue: 420,
    luxuriousValue: 4,
    distanceValue: 95,
    spaScore: 5,
    image: douroValleyWineImage,
    imageAlt: 'A terraced vineyard hotel in the Douro Valley.',
    description: 'Historic estate with small pools overlooking the river, a strong wine focus, and a slower, greener setting.',
    tags: ['Nature reset', 'Food & wine', 'Romance'],
    whyFits: [
      'You are drawn to the poetic rhythm of terraced vineyards and the quiet flow of the river below.',
      'A sanctuary for those who wish to indulge in fine wine and the slow passage of time.'
    ],
    tradeoff: 'Tradeoff: Winding mountain roads to get there.',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    settings: ['Forest', 'Secluded']
  },
  {
    id: 'amalfi-cliffside',
    name: 'Amalfi Cliffside',
    location: 'Positano, Italy',
    region: 'Amalfi Coast',
    priceCategory: '€€€€',
    priceValue: 950,
    luxuriousValue: 5,
    distanceValue: 60,
    spaScore: 4,
    image: amalfiCliffsideImage,
    imageAlt: 'A glamorous hotel perched on the cliffs of Positano.',
    description: 'Classic Italian glamour with terraces cascading down the cliff to the sea.',
    tags: ['Romance', 'Feel fancy', 'Food & wine'],
    whyFits: [
      'You dream of classic Italian glamour, where terraces cascade dramatically toward the Tyrrhenian Sea.',
      'The ultimate destination for witnessing the breathtaking, sun-drenched theater of the coast.'
    ],
    tradeoff: 'Tradeoff: Very crowded in peak summer, and prices are steep.',
    amenities: ['Pool', 'Spa', 'Fine Dining'],
    settings: ['Mountain View']
  },
  {
    id: 'scottish-highlands-lodge',
    name: 'Glencoe Lodge',
    location: 'Glencoe, Scotland',
    region: 'Highlands',
    priceCategory: '€€€',
    priceValue: 450,
    luxuriousValue: 4,
    distanceValue: 120,
    spaScore: 3,
    image: scottishHighlandsLodgeImage,
    imageAlt: 'A misty lodge in the Scottish Highlands.',
    description: 'Cozy fireplaces, single malt whisky, and sweeping views of the dramatic Scottish glens.',
    tags: ['Adventure', 'Nature reset', 'Quiet'],
    whyFits: [
      'You are seeking the brooding romance of misty glens, roaring fires, and single malt whisky.',
      'A warm, highly atmospheric refuge designed for returning to after exploring wild landscapes.'
    ],
    tradeoff: 'Tradeoff: Weather is famously unpredictable.',
    amenities: ['Fine Dining', 'Pet Friendly'],
    settings: ['Mountain View', 'Secluded']
  },
  {
    id: 'bavarian-alps-retreat',
    name: 'Bavarian Alps Retreat',
    location: 'Bavaria, Germany',
    region: 'Bavaria',
    priceCategory: '€€€',
    priceValue: 320,
    luxuriousValue: 4,
    distanceValue: 80,
    spaScore: 5,
    image: bavarianAlpsRetreatImage,
    imageAlt: 'A wellness retreat in the Bavarian Alps.',
    description: 'A pristine alpine wellness hotel with extensive saunas, indoor-outdoor pools, and fresh mountain air.',
    tags: ['Spa focus', 'Nature reset', 'Quiet'],
    whyFits: [
      'You consider a restorative, world-class spa experience to be the cornerstone of a perfect trip.',
      'Ideal for breathing crisp alpine air and experiencing unparalleled wellness traditions.'
    ],
    tradeoff: 'Tradeoff: Traditional decor in some areas might feel a bit old-fashioned to some.',
    amenities: ['Spa', 'Pool', 'Fine Dining'],
    settings: ['Mountain View', 'Forest']
  },
  {
    id: 'corsican-beach-hideaway',
    name: 'Corsican Hideaway',
    location: 'Corsica, France',
    region: 'Corsica',
    priceCategory: '€€€',
    priceValue: 380,
    luxuriousValue: 4,
    distanceValue: 45,
    spaScore: 3,
    image: corsicanBeachHideawayImage,
    imageAlt: 'A secluded beach resort in Corsica.',
    description: 'A chic, laid-back beach property framed by rugged mountains and the crystal-clear Mediterranean.',
    tags: ['Beach & sun', 'Romance', 'Secluded'],
    whyFits: [
      'You prefer your Mediterranean beaches rugged, exclusive, and framed by dramatic mountains.',
      'A chic, barefoot-luxury retreat for those who wish to disappear into a private cove.'
    ],
    tradeoff: 'Tradeoff: High season is busy, and driving the coastal roads can be challenging.',
    amenities: ['Pool', 'Fine Dining'],
    settings: ['Secluded', 'Mountain View']
  },
  {
    id: 'transylvanian-castle-stay',
    name: 'Bran Castle Estate',
    location: 'Brasov, Romania',
    region: 'Transylvania',
    priceCategory: '€€',
    priceValue: 180,
    luxuriousValue: 3,
    distanceValue: 160,
    spaScore: 1,
    image: transylvanianCastleStayImage,
    imageAlt: 'A historic castle hotel in Transylvania.',
    description: 'A deeply atmospheric stay in a refurbished historic manor surrounded by the dark forests of the Carpathians.',
    tags: ['Grand heritage', 'Adventure', 'Quiet'],
    whyFits: [
      'You are intrigued by deep history, atmospheric architecture, and the dark romance of ancient forests.',
      'A rare opportunity to inhabit a living legend in a truly dramatic, secluded setting.'
    ],
    tradeoff: 'Tradeoff: Less luxurious amenities; focus is on the heritage experience.',
    amenities: ['Pet Friendly'],
    settings: ['Forest', 'Mountain View']
  },
  {
    id: 'dalmatian-coast-resort',
    name: 'Dubrovnik Cliff Resort',
    location: 'Dubrovnik, Croatia',
    region: 'Dalmatia',
    priceCategory: '€€€',
    priceValue: 410,
    luxuriousValue: 4,
    distanceValue: 20,
    spaScore: 4,
    image: dalmatianCoastResortImage,
    imageAlt: 'A modern resort on the cliffs overlooking the Adriatic Sea.',
    description: 'Sleek modern design built directly into the cliffs, offering private sea access and views of the old town.',
    tags: ['Beach & sun', 'City luxury', 'Feel fancy'],
    whyFits: [
      'You want the crystalline Adriatic at your fingertips, paired with sleek, contemporary coastal design.',
      'Perfect for balancing serene seaside days with the vibrant history of a nearby walled city.'
    ],
    tradeoff: 'Tradeoff: Very crowded in peak summer months.',
    amenities: ['Pool', 'Spa', 'Fine Dining'],
    settings: ['Mountain View']
  }
];


// Dump to JSON
console.log(JSON.stringify(INITIAL_STAYS));
