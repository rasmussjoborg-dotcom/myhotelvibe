
-- Create the hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT,
  "priceCategory" TEXT,
  "priceValue" INTEGER,
  "luxuriousValue" INTEGER,
  "distanceValue" INTEGER,
  "spaScore" INTEGER,
  image TEXT,
  "imageAlt" TEXT,
  description TEXT,
  tags TEXT[],
  "whyFits" TEXT[],
  tradeoff TEXT,
  amenities TEXT[],
  settings TEXT[]
);

-- Enable RLS and add a policy for public read access
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to hotels"
  ON public.hotels
  FOR SELECT
  TO public
  USING (true);

-- Insert data

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'audo-forest',
  'The Audo Forest',
  'Swedish Lapland',
  'Lapland',
  '€€€',
  300,
  4,
  120,
  5,
  'audoForest',
  'A modern forest retreat in Swedish Lapland.',
  NULL,
  ARRAY['Nature reset', 'Spa focus'],
  ARRAY['You are seeking a sanctuary where quiet minimalism and raw nature seamlessly merge.', 'Ideal for those who appreciate architectural precision set against a backdrop of deep, ancient woods.'],
  'Tradeoff: Longer transfer — around 2 hours from the airport.',
  ARRAY['Spa', 'Pool'],
  ARRAY['Forest', 'Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'villa-vals',
  'Villa Vals',
  'Swiss Alps',
  'Alps',
  '€€€€',
  650,
  5,
  15,
  4,
  'villaVals',
  'An architectural alpine villa with mountain views in Switzerland.',
  NULL,
  ARRAY['Feel fancy', 'Mountain View'],
  ARRAY['You value total seclusion and the architectural marvel of living seamlessly within the earth.', 'A masterful choice for finding profound stillness away from the noise of modern life.'],
  'Tradeoff: Top-tier pricing — this is a “go big” stay.',
  ARRAY['Spa', 'Pool', 'Fine Dining'],
  ARRAY['Mountain View', 'Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'manshausen-island',
  'Manshausen Island',
  'Northern Norway',
  'Norway',
  '€€',
  180,
  4,
  90,
  3,
  'manshausenIsland',
  'A secluded coastal cabin stay in Northern Norway.',
  NULL,
  ARRAY['Nature reset', 'Secluded'],
  ARRAY['You are drawn to raw, elemental landscapes viewed from the comfort of striking, glass-fronted design.', 'Perfect for those who find ultimate relaxation at the edge of the world.'],
  'Tradeoff: Limited dining choice — mostly on-site options.',
  ARRAY['Fine Dining', 'Pool'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'ett-hem',
  'Ett Hem',
  'Stockholm, Sweden',
  'Sweden',
  '€€€',
  350,
  5,
  5,
  5,
  'ettHem',
  'A boutique townhouse hotel in Stockholm.',
  'A townhouse hotel that feels like a beautifully designed home — calm, intimate, and quietly luxurious.',
  ARRAY['Nature reset', 'Design-forward', 'Sauna'],
  ARRAY['You appreciate the intimate atmosphere of a private townhouse infused with impeccable Scandinavian taste.', 'A sophisticated choice for those seeking a highly curated refuge in the heart of the city.'],
  'Tradeoff: Books out fast — you often need to plan ahead.',
  ARRAY['Spa', 'Fine Dining', 'Pet Friendly'],
  ARRAY['Forest']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'the-retreat',
  'The Retreat',
  'Blue Lagoon, Iceland',
  'Iceland',
  '€€€€',
  800,
  5,
  45,
  5,
  'theRetreat',
  'A minimalist spa hotel by the Blue Lagoon in Iceland.',
  'Minimalist suites with immediate access to mineral-rich waters — built for recovery and deep relaxation.',
  ARRAY['Spa focus', 'Nature reset', 'Secluded'],
  ARRAY['You are seeking a sanctuary where wellness and thermal waters are the main event.', 'Ideal for those who appreciate letting the volcanic landscape and understated design take center stage.'],
  'Tradeoff: You’ll mostly eat on-site due to the location.',
  ARRAY['Spa', 'Pool', 'Fine Dining'],
  ARRAY['Secluded', 'Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'villa-copenhagen',
  'Villa Copenhagen',
  'Copenhagen, Denmark',
  'Copenhagen',
  '€€€',
  290,
  4,
  2,
  4,
  'villaCopenhagen',
  'A grand yet modern hotel in central Copenhagen.',
  NULL,
  ARRAY['Grand heritage', 'Rooftop pool', 'Sustainable luxury'],
  ARRAY['You thrive on vibrant urban energy but demand a beautifully designed, historic setting to return to.', 'A splendid match for those who enjoy world-class dining just steps from their suite.'],
  'Tradeoff: More city buzz than a quiet retreat.',
  ARRAY['Pool', 'Fine Dining', 'Spa'],
  ARRAY['Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'treehotel',
  'Treehotel',
  'Harads, Sweden',
  'Sweden',
  '€€€€',
  550,
  5,
  100,
  4,
  'treehotel',
  'A design-forward cabin hotel in the Swedish forest.',
  NULL,
  ARRAY['Nature reset', 'Secluded', 'Architectural icon'],
  ARRAY['You desire an unconventional escape that elevates you—literally—into the canopy of nature.', 'Perfect for rediscovering a sense of wonder without sacrificing the comforts of luxury design.'],
  'Tradeoff: Remote — expect a longer journey to get there.',
  ARRAY['Spa', 'Pet Friendly'],
  ARRAY['Forest', 'Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'hotel-arctic',
  'Hotel Arctic',
  'Ilulissat, Greenland',
  'Greenland',
  '€€€',
  380,
  4,
  180,
  3,
  'hotelArctic',
  'An arctic hotel with iceberg views in Greenland.',
  NULL,
  ARRAY['Adventure luxury', 'Arctic views'],
  ARRAY['You want to witness the stark, breathtaking beauty of the ice fjords from a place of supreme warmth.', 'Ideal for those who view travel as an opportunity for profound, once-in-a-lifetime encounters.'],
  'Tradeoff: Getting here takes time — usually multiple flights.',
  ARRAY['Fine Dining', 'Spa'],
  ARRAY['Secluded', 'Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'mallorca-family-resort',
  'Can Sol Family Estate',
  'Mallorca, Spain',
  'Balearic Islands',
  '€€€',
  420,
  4,
  35,
  3,
  'mallorcaFamilyResort',
  'A refined family-friendly beach resort in Mallorca.',
  'A polished Mediterranean resort with enough space for kids, but still elegant enough for adults.',
  ARRAY['Family-friendly', 'Beach & sun', 'Kids pool'],
  ARRAY['You refuse to compromise on aesthetics or culinary excellence while traveling with loved ones.', 'A beautiful balance of Mediterranean serenity and thoughtful, engaging spaces for all ages.'],
  'Tradeoff: Less secluded in peak summer; best for people who want resort energy.',
  ARRAY['Pool', 'Spa', 'Fine Dining'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'rome-palazzo',
  'Palazzo Aurelia',
  'Rome, Italy',
  'Rome',
  '€€€€',
  720,
  5,
  8,
  3,
  'romePalazzo',
  'A restored palazzo hotel in Rome.',
  'A romantic city hotel for people who want old-world rooms, proper service, and a rooftop aperitivo.',
  ARRAY['Romance', 'City luxury', 'Grand heritage'],
  ARRAY['You are captivated by the grandeur of history, reimagined with flawless contemporary luxury.', 'The definitive choice for experiencing the Eternal City like modern royalty.'],
  'Tradeoff: Not a quiet escape; you are very much in the middle of the city.',
  ARRAY['Fine Dining', 'Spa'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'palacio-andaluz',
  'Palacio Andaluz',
  'Granada, Spain',
  'Andalusia',
  '€€',
  260,
  4,
  20,
  4,
  'palacioAndaluz',
  'A boutique Moorish palace hotel in Granada.',
  'An intimate courtyard stay with Moorish tiled details, a small pool, and a slower rhythm behind the city walls.',
  ARRAY['Boutique', 'Romance', 'Design hotel'],
  ARRAY['You long to immerse yourself in Moorish architecture and the deeply romantic rhythms of Andalusia.', 'Perfect for those who favor ornate, palatial elegance and sun-drenched courtyards.'],
  'Tradeoff: The city can feel busy once you leave the property.',
  ARRAY['Spa', 'Pool', 'Fine Dining'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'greek-island-hideaway',
  'Asteri Cliff House',
  'Santorini, Greece',
  'Cyclades',
  '€€€€',
  680,
  5,
  25,
  3,
  'greekIslandHideaway',
  'A whitewashed boutique hotel on a Greek island.',
  'A cliffside island hotel built for slow breakfasts, sea views, and doing very little beautifully.',
  ARRAY['Romance', 'Sea views', 'Feel fancy'],
  ARRAY['You seek the quintessential Aegean dream: stark white lines, brilliant blue water, and effortless elegance.', 'Ideal for days spent tracing the sun’s arc from a private, cliffside plunge pool.'],
  'Tradeoff: Expensive and not ideal for families with small kids.',
  ARRAY['Pool', 'Fine Dining', 'Spa'],
  ARRAY['Secluded', 'Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'lisbon-design-house',
  'Casa do Azulejo',
  'Lisbon, Portugal',
  'Lisbon',
  '€€',
  240,
  4,
  12,
  2,
  'lisbonDesignHouse',
  'A design boutique hotel in Lisbon.',
  'A compact design hotel for a stylish city break: tiles, good lighting, and easy neighborhood wandering.',
  ARRAY['Design hotel', 'City break', 'Boutique'],
  ARRAY['You are inspired by rich textures, artisanal craftsmanship, and the soulful charm of an ancient neighborhood.', 'A quiet, creatively inspiring haven hidden amidst winding, cobbled streets.'],
  'Tradeoff: Light on resort amenities; this is more city base than retreat.',
  ARRAY['Fine Dining', 'Pet Friendly'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'azores-eco-lodge',
  'Azores Eco Lodge',
  'São Miguel, Portugal',
  'Azores',
  '€€€',
  390,
  4,
  160,
  4,
  'azoresEcoLodge',
  'A lush eco-lodge in the Azores.',
  'An open-air nature lodge for travelers who want wellness, volcanic hikes, and a little adventure without roughing it.',
  ARRAY['Adventure', 'Nature reset', 'Eco-luxury'],
  ARRAY['You want to be entirely enveloped by lush, dramatic landscapes in a setting that honors the earth.', 'A pristine hideaway for those whose ultimate luxury is untouched nature.'],
  'Tradeoff: Weather can be highly unpredictable.',
  ARRAY['Spa', 'Pool', 'Fine Dining'],
  ARRAY['Forest', 'Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'tuscany-vineyard-retreat',
  'Tenuta Val d Oro',
  'Tuscany, Italy',
  'Tuscany',
  '€€€',
  360,
  4,
  75,
  3,
  'tuscanyVineyardRetreat',
  'A Tuscany vineyard hotel with pool and terrace.',
  'A vineyard retreat for long lunches, pool afternoons, and staying somewhere that feels like the destination.',
  ARRAY['Food & wine', 'Countryside', 'Romance'],
  ARRAY['You believe that the finest things in life are slow mornings, rolling hills, and exceptional vintage wines.', 'A deeply romantic estate designed for savoring the true essence of the Italian countryside.'],
  'Tradeoff: You will want a car to get the best out of the area.',
  ARRAY['Pool', 'Fine Dining', 'Spa'],
  ARRAY['Secluded', 'Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'london-shard-suites',
  'The Shard Suites',
  'London, UK',
  'London',
  '€€€€',
  620,
  5,
  6,
  4,
  'londonShardSuites',
  'A calm luxury hotel room overlooking the London skyline.',
  'A serene high-rise stay for city travelers who still want quiet, high tea rituals, and refined service.',
  ARRAY['City luxury', 'Quiet', 'Business-friendly'],
  ARRAY['You want the city laid out at your feet from an unparalleled, sky-high vantage point.', 'Perfect for those who require seamless service and sleek modernity in the center of a metropolis.'],
  'Tradeoff: Premium pricing and less resort-like than a country estate.',
  ARRAY['Spa', 'Fine Dining'],
  ARRAY['Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'algarve-family-resort',
  'Algarve Sun Resort',
  'Algarve, Portugal',
  'Algarve',
  '€€€',
  330,
  4,
  55,
  4,
  'algarveFamilyResort',
  'A premium family beach resort in the Algarve.',
  'A sunny, easy resort for families who want pools, food handled, and enough comfort for the adults too.',
  ARRAY['Family-friendly', 'All-inclusive feel', 'Beach & sun'],
  ARRAY['You desire a sophisticated coastal escape where the Atlantic breeze meets manicured perfection.', 'An effortless blend of high-end leisure and vibrant, sun-soaked relaxation.'],
  'Tradeoff: Less boutique and more resort-scale.',
  ARRAY['Pool', 'Spa', 'Fine Dining'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'lake-como-villa',
  'Villa Lario',
  'Lake Como, Italy',
  'Lombardy',
  '€€€€',
  950,
  5,
  75,
  5,
  'lakeComoVilla',
  'A lakeside luxury villa in Lake Como.',
  'Lakeside terraces, classic Riva boats, and a spa built for doing nothing—beautifully.',
  ARRAY['Feel fancy', 'Beach & sun', 'Spa focus'],
  ARRAY['You appreciate the timeless, aristocratic allure of one of the world’s most romantic lakes.', 'The quintessential setting for those seeking cinematic beauty and classic Italian hospitality.'],
  'Tradeoff: Very expensive, and requires advance booking in summer.',
  ARRAY['Spa', 'Pool', 'Fine Dining'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'bardenas-desert-camp',
  'Bardenas Desert Camp',
  'Navarre, Spain',
  'Navarre',
  '€€€€',
  780,
  5,
  55,
  4,
  'bardenasDesertCamp',
  'A luxury desert camp-style hotel in Spain.',
  'Desert calm with grown-up luxury: sunset dinners, quiet pools, and spa rituals in a unique European semi-desert.',
  ARRAY['Recover & be pampered', 'Secluded', 'Feel fancy'],
  ARRAY['You are captivated by stark, lunar landscapes and the stark beauty of a semi-desert environment.', 'A surreal, highly curated escape for those who find clarity in wide open spaces.'],
  'Tradeoff: More about atmosphere than exploring a vibrant town.',
  ARRAY['Spa', 'Pool', 'Fine Dining'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'paris-boutique-suite',
  'Le Marais Boutique',
  'Paris, France',
  'Ile-de-France',
  '€€€€',
  690,
  5,
  10,
  2,
  'parisBoutiqueSuite',
  'A luxury boutique hotel suite in Paris.',
  'A quietly luxurious city stay: great rooms, Haussmann details, and a lobby that feels like a members club.',
  ARRAY['City luxury', 'Design hotel', 'Food & wine'],
  ARRAY['You wish to experience the Marais not just as a visitor, but from within a flawlessly designed private residence.', 'Ideal for those who value intimate luxury and walking access to the city’s finest galleries and cafes.'],
  'Tradeoff: Limited resort amenities; it’s a city-first stay.',
  ARRAY['Fine Dining', 'Pet Friendly'],
  ARRAY['Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'douro-valley-wine',
  'Douro Wine Estate',
  'Douro Valley, Portugal',
  'Douro',
  '€€€',
  420,
  4,
  95,
  5,
  'douroValleyWine',
  'A terraced vineyard hotel in the Douro Valley.',
  'Historic estate with small pools overlooking the river, a strong wine focus, and a slower, greener setting.',
  ARRAY['Nature reset', 'Food & wine', 'Romance'],
  ARRAY['You are drawn to the poetic rhythm of terraced vineyards and the quiet flow of the river below.', 'A sanctuary for those who wish to indulge in fine wine and the slow passage of time.'],
  'Tradeoff: Winding mountain roads to get there.',
  ARRAY['Spa', 'Pool', 'Fine Dining'],
  ARRAY['Forest', 'Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'amalfi-cliffside',
  'Amalfi Cliffside',
  'Positano, Italy',
  'Amalfi Coast',
  '€€€€',
  950,
  5,
  60,
  4,
  'amalfiCliffside',
  'A glamorous hotel perched on the cliffs of Positano.',
  'Classic Italian glamour with terraces cascading down the cliff to the sea.',
  ARRAY['Romance', 'Feel fancy', 'Food & wine'],
  ARRAY['You dream of classic Italian glamour, where terraces cascade dramatically toward the Tyrrhenian Sea.', 'The ultimate destination for witnessing the breathtaking, sun-drenched theater of the coast.'],
  'Tradeoff: Very crowded in peak summer, and prices are steep.',
  ARRAY['Pool', 'Spa', 'Fine Dining'],
  ARRAY['Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'scottish-highlands-lodge',
  'Glencoe Lodge',
  'Glencoe, Scotland',
  'Highlands',
  '€€€',
  450,
  4,
  120,
  3,
  'scottishHighlandsLodge',
  'A misty lodge in the Scottish Highlands.',
  'Cozy fireplaces, single malt whisky, and sweeping views of the dramatic Scottish glens.',
  ARRAY['Adventure', 'Nature reset', 'Quiet'],
  ARRAY['You are seeking the brooding romance of misty glens, roaring fires, and single malt whisky.', 'A warm, highly atmospheric refuge designed for returning to after exploring wild landscapes.'],
  'Tradeoff: Weather is famously unpredictable.',
  ARRAY['Fine Dining', 'Pet Friendly'],
  ARRAY['Mountain View', 'Secluded']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'bavarian-alps-retreat',
  'Bavarian Alps Retreat',
  'Bavaria, Germany',
  'Bavaria',
  '€€€',
  320,
  4,
  80,
  5,
  'bavarianAlpsRetreat',
  'A wellness retreat in the Bavarian Alps.',
  'A pristine alpine wellness hotel with extensive saunas, indoor-outdoor pools, and fresh mountain air.',
  ARRAY['Spa focus', 'Nature reset', 'Quiet'],
  ARRAY['You consider a restorative, world-class spa experience to be the cornerstone of a perfect trip.', 'Ideal for breathing crisp alpine air and experiencing unparalleled wellness traditions.'],
  'Tradeoff: Traditional decor in some areas might feel a bit old-fashioned to some.',
  ARRAY['Spa', 'Pool', 'Fine Dining'],
  ARRAY['Mountain View', 'Forest']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'corsican-beach-hideaway',
  'Corsican Hideaway',
  'Corsica, France',
  'Corsica',
  '€€€',
  380,
  4,
  45,
  3,
  'corsicanBeachHideaway',
  'A secluded beach resort in Corsica.',
  'A chic, laid-back beach property framed by rugged mountains and the crystal-clear Mediterranean.',
  ARRAY['Beach & sun', 'Romance', 'Secluded'],
  ARRAY['You prefer your Mediterranean beaches rugged, exclusive, and framed by dramatic mountains.', 'A chic, barefoot-luxury retreat for those who wish to disappear into a private cove.'],
  'Tradeoff: High season is busy, and driving the coastal roads can be challenging.',
  ARRAY['Pool', 'Fine Dining'],
  ARRAY['Secluded', 'Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'transylvanian-castle-stay',
  'Bran Castle Estate',
  'Brasov, Romania',
  'Transylvania',
  '€€',
  180,
  3,
  160,
  1,
  'transylvanianCastleStay',
  'A historic castle hotel in Transylvania.',
  'A deeply atmospheric stay in a refurbished historic manor surrounded by the dark forests of the Carpathians.',
  ARRAY['Grand heritage', 'Adventure', 'Quiet'],
  ARRAY['You are intrigued by deep history, atmospheric architecture, and the dark romance of ancient forests.', 'A rare opportunity to inhabit a living legend in a truly dramatic, secluded setting.'],
  'Tradeoff: Less luxurious amenities; focus is on the heritage experience.',
  ARRAY['Pet Friendly'],
  ARRAY['Forest', 'Mountain View']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotels (id, name, location, region, "priceCategory", "priceValue", "luxuriousValue", "distanceValue", "spaScore", image, "imageAlt", description, tags, "whyFits", tradeoff, amenities, settings)
VALUES (
  'dalmatian-coast-resort',
  'Dubrovnik Cliff Resort',
  'Dubrovnik, Croatia',
  'Dalmatia',
  '€€€',
  410,
  4,
  20,
  4,
  'dalmatianCoastResort',
  'A modern resort on the cliffs overlooking the Adriatic Sea.',
  'Sleek modern design built directly into the cliffs, offering private sea access and views of the old town.',
  ARRAY['Beach & sun', 'City luxury', 'Feel fancy'],
  ARRAY['You want the crystalline Adriatic at your fingertips, paired with sleek, contemporary coastal design.', 'Perfect for balancing serene seaside days with the vibrant history of a nearby walled city.'],
  'Tradeoff: Very crowded in peak summer months.',
  ARRAY['Pool', 'Spa', 'Fine Dining'],
  ARRAY['Mountain View']
) ON CONFLICT (id) DO NOTHING;
