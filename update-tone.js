import fs from 'fs';

const updates = {
  'audo-forest': [
    'You are seeking a sanctuary where quiet minimalism and raw nature seamlessly merge.',
    'Ideal for those who appreciate architectural precision set against a backdrop of deep, ancient woods.'
  ],
  'villa-vals': [
    'You value total seclusion and the architectural marvel of living seamlessly within the earth.',
    'A masterful choice for finding profound stillness away from the noise of modern life.'
  ],
  'manshausen-island': [
    'You are drawn to raw, elemental landscapes viewed from the comfort of striking, glass-fronted design.',
    'Perfect for those who find ultimate relaxation at the edge of the world.'
  ],
  'ett-hem': [
    'You appreciate the intimate atmosphere of a private townhouse infused with impeccable Scandinavian taste.',
    'A sophisticated choice for those seeking a highly curated refuge in the heart of the city.'
  ],
  'the-retreat': [
    'You are seeking a sanctuary where wellness and thermal waters are the main event.',
    'Ideal for those who appreciate letting the volcanic landscape and understated design take center stage.'
  ],
  'villa-copenhagen': [
    'You thrive on vibrant urban energy but demand a beautifully designed, historic setting to return to.',
    'A splendid match for those who enjoy world-class dining just steps from their suite.'
  ],
  'treehotel': [
    'You desire an unconventional escape that elevates you—literally—into the canopy of nature.',
    'Perfect for rediscovering a sense of wonder without sacrificing the comforts of luxury design.'
  ],
  'hotel-arctic': [
    'You want to witness the stark, breathtaking beauty of the ice fjords from a place of supreme warmth.',
    'Ideal for those who view travel as an opportunity for profound, once-in-a-lifetime encounters.'
  ],
  'mallorca-family-resort': [
    'You refuse to compromise on aesthetics or culinary excellence while traveling with loved ones.',
    'A beautiful balance of Mediterranean serenity and thoughtful, engaging spaces for all ages.'
  ],
  'rome-palazzo': [
    'You are captivated by the grandeur of history, reimagined with flawless contemporary luxury.',
    'The definitive choice for experiencing the Eternal City like modern royalty.'
  ],
  'palacio-andaluz': [
    'You long to immerse yourself in Moorish architecture and the deeply romantic rhythms of Andalusia.',
    'Perfect for those who favor ornate, palatial elegance and sun-drenched courtyards.'
  ],
  'greek-island-hideaway': [
    'You seek the quintessential Aegean dream: stark white lines, brilliant blue water, and effortless elegance.',
    'Ideal for days spent tracing the sun’s arc from a private, cliffside plunge pool.'
  ],
  'lisbon-design-house': [
    'You are inspired by rich textures, artisanal craftsmanship, and the soulful charm of an ancient neighborhood.',
    'A quiet, creatively inspiring haven hidden amidst winding, cobbled streets.'
  ],
  'azores-eco-lodge': [
    'You want to be entirely enveloped by lush, dramatic landscapes in a setting that honors the earth.',
    'A pristine hideaway for those whose ultimate luxury is untouched nature.'
  ],
  'tuscany-vineyard-retreat': [
    'You believe that the finest things in life are slow mornings, rolling hills, and exceptional vintage wines.',
    'A deeply romantic estate designed for savoring the true essence of the Italian countryside.'
  ],
  'london-shard-suites': [
    'You want the city laid out at your feet from an unparalleled, sky-high vantage point.',
    'Perfect for those who require seamless service and sleek modernity in the center of a metropolis.'
  ],
  'algarve-family-resort': [
    'You desire a sophisticated coastal escape where the Atlantic breeze meets manicured perfection.',
    'An effortless blend of high-end leisure and vibrant, sun-soaked relaxation.'
  ],
  'lake-como-villa': [
    'You appreciate the timeless, aristocratic allure of one of the world’s most romantic lakes.',
    'The quintessential setting for those seeking cinematic beauty and classic Italian hospitality.'
  ],
  'bardenas-desert-camp': [
    'You are captivated by stark, lunar landscapes and the stark beauty of a semi-desert environment.',
    'A surreal, highly curated escape for those who find clarity in wide open spaces.'
  ],
  'paris-boutique-suite': [
    'You wish to experience the Marais not just as a visitor, but from within a flawlessly designed private residence.',
    'Ideal for those who value intimate luxury and walking access to the city’s finest galleries and cafes.'
  ],
  'douro-valley-wine': [
    'You are drawn to the poetic rhythm of terraced vineyards and the quiet flow of the river below.',
    'A sanctuary for those who wish to indulge in fine wine and the slow passage of time.'
  ],
  'amalfi-cliffside': [
    'You dream of classic Italian glamour, where terraces cascade dramatically toward the Tyrrhenian Sea.',
    'The ultimate destination for witnessing the breathtaking, sun-drenched theater of the coast.'
  ],
  'scottish-highlands-lodge': [
    'You are seeking the brooding romance of misty glens, roaring fires, and single malt whisky.',
    'A warm, highly atmospheric refuge designed for returning to after exploring wild landscapes.'
  ],
  'bavarian-alps-retreat': [
    'You consider a restorative, world-class spa experience to be the cornerstone of a perfect trip.',
    'Ideal for breathing crisp alpine air and experiencing unparalleled wellness traditions.'
  ],
  'corsican-beach-hideaway': [
    'You prefer your Mediterranean beaches rugged, exclusive, and framed by dramatic mountains.',
    'A chic, barefoot-luxury retreat for those who wish to disappear into a private cove.'
  ],
  'transylvanian-castle-stay': [
    'You are intrigued by deep history, atmospheric architecture, and the dark romance of ancient forests.',
    'A rare opportunity to inhabit a living legend in a truly dramatic, secluded setting.'
  ],
  'dalmatian-coast-resort': [
    'You want the crystalline Adriatic at your fingertips, paired with sleek, contemporary coastal design.',
    'Perfect for balancing serene seaside days with the vibrant history of a nearby walled city.'
  ]
};

let content = fs.readFileSync('src/data.ts', 'utf8');

for (const [id, reasons] of Object.entries(updates)) {
  const whyFitsFormatted = 'whyFits: [\n      ' + reasons.map(r => `'${r.replace(/'/g, "\\'")}'`).join(',\n      ') + '\n    ],';
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?)whyFits:\\s*\\[[\\s\\S]*?\\],`, 'g');
  content = content.replace(regex, `$1${whyFitsFormatted}`);
}

fs.writeFileSync('src/data.ts', content);
