const fs = require('fs');

const content = fs.readFileSync('./src/data.ts', 'utf8');

// We want to keep the imports and the svgPlaceholder function
const arrayMatch = content.match(/export const INITIAL_STAYS: Stay\[\] = \[[\s\S]*?\n\];/);
if (!arrayMatch) throw new Error("Could not find INITIAL_STAYS array");

const newDataArray = `export const INITIAL_STAYS: Stay[] = [
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
      'Quiet forest setting that’s built for switching off.',
      'Strong wellness setup with sauna + treatments at the center.'
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
      'High-design stay with big mountain views and privacy.',
      'Wellness access on-site — ideal for a slow, indulgent weekend.'
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
      'Remote sea-cabin vibe with a calm, grown-up feel.',
      'Design-led comfort without being “stuffy luxury”.'
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
      'Boutique feel and top-level interiors for a “treat yourselves” trip.',
      'Great for couples who care about design and atmosphere.',
      'Sauna + wellness touches without turning into a big resort.'
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
      'Spa-first experience where the water and treatments are the main event.',
      'Architecture and rooms stay calm and understated.',
      'Excellent choice when “recover” is the top priority.'
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
      'Central base with a stylish, modern feel.',
      'Great mix of “city break” energy plus pool/wellness.'
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
      'Iconic cabins in the forest — unforgettable “different” stay.',
      'Strong match when you want nature + design, not a standard hotel.'
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
      'Once-in-a-lifetime scenery without giving up comfort.',
      'Best when you want “adventure” but still prefer a proper hotel.'
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
      'Good fit when the hotel matters more than the exact destination.',
      'Pool-first setup works well for families with younger children.',
      'Mediterranean design keeps it feeling grown-up, not theme-park-ish.'
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
      'Strong match for “most luxurious hotels in Rome” style searches.',
      'Palazzo setting makes the hotel itself the reason to go.',
      'Best for couples who want atmosphere over resort amenities.'
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
    image: "https://images.unsplash.com/photo-1542849463-5498846c4832?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A boutique Moorish palace hotel in Granada.',
    description: 'An intimate courtyard stay with Moorish tiled details, a small pool, and a slower rhythm behind the city walls.',
    tags: ['Boutique', 'Romance', 'Design hotel'],
    whyFits: [
      'Small-scale property with a clear sense of place.',
      'Good for couples who want atmosphere without huge resort scale.',
      'Spa and hammam angle supports a recovery-focused trip.'
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
      'Hotel-first choice where the room, view, and pool carry the trip.',
      'Strong fit for couples looking for a romantic sunny stay.',
      'Small boutique scale keeps it calmer than a large beach resort.'
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
      'Excellent match when design and location matter more than spa size.',
      'Good price-to-style ratio compared with bigger luxury capitals.',
      'Works for couples, solo trips, or friends who want an easy city base.'
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
    image: "https://images.unsplash.com/photo-1590523265581-22e70dcebd13?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A lush eco-lodge in the Azores.',
    description: 'An open-air nature lodge for travelers who want wellness, volcanic hikes, and a little adventure without roughing it.',
    tags: ['Adventure', 'Nature reset', 'Eco-luxury'],
    whyFits: [
      'Great for “I want something memorable, not another city hotel”.',
      'Private plunge-pool vibe supports a wellness trip.',
      'Adventure options nearby without losing comfort.'
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
      'Strong fit when the hotel experience is food, wine, and landscape.',
      'Good couples option that feels luxurious without city pricing.',
      'Pool and terrace setup makes downtime easy.'
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
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A calm luxury hotel room overlooking the London skyline.',
    description: 'A serene high-rise stay for city travelers who still want quiet, high tea rituals, and refined service.',
    tags: ['City luxury', 'Quiet', 'Business-friendly'],
    whyFits: [
      'Good match for a city trip where the hotel needs to feel restorative.',
      'Quiet design and skyline views make it more than a place to sleep.',
      'Works for solo, couple, or work-adjacent travel.'
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
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A premium family beach resort in the Algarve.',
    description: 'A sunny, easy resort for families who want pools, food handled, and enough comfort for the adults too.',
    tags: ['Family-friendly', 'All-inclusive feel', 'Beach & sun'],
    whyFits: [
      'Excellent for family trips where ease is the main luxury.',
      'Pool and beach setup give kids plenty to do.',
      'Spa and better dining keep it useful for adults.'
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
    image: "https://images.unsplash.com/photo-1550005759-c29015bc2675?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A lakeside luxury villa in Lake Como.',
    description: 'Lakeside terraces, classic Riva boats, and a spa built for doing nothing—beautifully.',
    tags: ['Feel fancy', 'Beach & sun', 'Spa focus'],
    whyFits: [
      'Strong pick when “hotel vibe” is the whole trip.',
      'Spa + lake setup makes recovery effortless.',
      'Quiet luxury without needing a big itinerary.'
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
    image: "https://images.unsplash.com/photo-1620803529346-6085a539ebcb?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A luxury desert camp-style hotel in Spain.',
    description: 'Desert calm with grown-up luxury: sunset dinners, quiet pools, and spa rituals in a unique European semi-desert.',
    tags: ['Recover & be pampered', 'Secluded', 'Feel fancy'],
    whyFits: [
      'Great when you want a reset without “beach resort” energy.',
      'Quiet setting makes it feel like a true escape.',
      'Luxury experience is consistent, service-led, and easy.'
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
    image: "https://images.unsplash.com/photo-1502602898657-3e907fa3a289?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A luxury boutique hotel suite in Paris.',
    description: 'A quietly luxurious city stay: great rooms, Haussmann details, and a lobby that feels like a members club.',
    tags: ['City luxury', 'Design hotel', 'Food & wine'],
    whyFits: [
      'Perfect for a “feel fancy” city weekend.',
      'Design-forward rooms make the hotel part of the plan.',
      'Best for couples or friends who want city energy + comfort.'
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
    image: "https://images.unsplash.com/photo-1621877028974-9b5d3261a8db?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A terraced vineyard hotel in the Douro Valley.',
    description: 'Historic estate with small pools overlooking the river, a strong wine focus, and a slower, greener setting.',
    tags: ['Nature reset', 'Food & wine', 'Romance'],
    whyFits: [
      'Wine-focused without being pretentious.',
      'Estate layout is great for couples time.',
      'Strong match if you want “wine + nature” more than city life.'
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
    image: "https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A glamorous hotel perched on the cliffs of Positano.',
    description: 'Classic Italian glamour with terraces cascading down the cliff to the sea.',
    tags: ['Romance', 'Feel fancy', 'Food & wine'],
    whyFits: [
      'Iconic views and deeply romantic atmosphere.',
      'Exceptional dining and service.',
      'The definition of Mediterranean luxury.'
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
    image: "https://images.unsplash.com/photo-1506057213367-028a17ec52e5?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A misty lodge in the Scottish Highlands.',
    description: 'Cozy fireplaces, single malt whisky, and sweeping views of the dramatic Scottish glens.',
    tags: ['Adventure', 'Nature reset', 'Quiet'],
    whyFits: [
      'Perfect for hiking and returning to a warm fire.',
      'Very atmospheric and peaceful.',
      'World-class landscape photography opportunities.'
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
    image: "https://images.unsplash.com/photo-1549487258-29ab78c3c2aa?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A wellness retreat in the Bavarian Alps.',
    description: 'A pristine alpine wellness hotel with extensive saunas, indoor-outdoor pools, and fresh mountain air.',
    tags: ['Spa focus', 'Nature reset', 'Quiet'],
    whyFits: [
      'Incredible German spa culture.',
      'Beautiful hiking in summer and skiing in winter.',
      'Very high standard of service and cleanliness.'
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
    image: "https://images.unsplash.com/photo-1520625345638-34440c95a2f5?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A secluded beach resort in Corsica.',
    description: 'A chic, laid-back beach property framed by rugged mountains and the crystal-clear Mediterranean.',
    tags: ['Beach & sun', 'Romance', 'Secluded'],
    whyFits: [
      'Perfect mix of French style and wild nature.',
      'Access to hidden coves and beaches.',
      'Excellent seafood and local wine.'
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
    image: "https://images.unsplash.com/photo-1517409241940-d790432a10d9?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A historic castle hotel in Transylvania.',
    description: 'A deeply atmospheric stay in a refurbished historic manor surrounded by the dark forests of the Carpathians.',
    tags: ['Grand heritage', 'Adventure', 'Quiet'],
    whyFits: [
      'Fascinating history and architecture.',
      'Very affordable compared to Western European castles.',
      'Great access to pristine, wild forests.'
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
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80",
    imageAlt: 'A modern resort on the cliffs overlooking the Adriatic Sea.',
    description: 'Sleek modern design built directly into the cliffs, offering private sea access and views of the old town.',
    tags: ['Beach & sun', 'City luxury', 'Feel fancy'],
    whyFits: [
      'Stunning views over the Adriatic.',
      'Easy access to the historic walled city.',
      'Great pool club atmosphere in the summer.'
    ],
    tradeoff: 'Tradeoff: Very crowded in peak summer months.',
    amenities: ['Pool', 'Spa', 'Fine Dining'],
    settings: ['Mountain View']
  }
];`;

const finalContent = content.replace(/export const INITIAL_STAYS: Stay\[\] = \[[\s\S]*?\n\];/, newDataArray);

fs.writeFileSync('./src/data.ts', finalContent, 'utf8');
