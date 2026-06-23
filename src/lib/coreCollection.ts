import { Stay } from '../types';
import audoImg from '../assets/stays/audo-forest.png';
import ettHemImg from '../assets/stays/ett-hem.png';
import amalfiImg from '../assets/stays/amalfi-cliffside.png';
import tokyoImg from '../assets/stays/tokyo-skyline-ryokan.png';
import tuscanyImg from '../assets/stays/tuscany-vineyard-retreat.png';

export const coreCollection: Stay[] = [
  {
    id: 'core-audo-forest',
    name: 'Audo Forest Retreat',
    description: 'A masterclass in Scandinavian minimalism hidden deep within a centuries-old pine forest. Every detail, from the tactile linen sheets to the locally sourced timber, is designed to ground you. The ultimate sanctuary for a quiet luxury escape.',
    location: 'Swedish Lapland',
    region: 'Sweden',
    amenities: ['Spa', 'Fine Dining', 'Pet Friendly'],
    priceValue: 850,
    image: audoImg,
    images: [audoImg],
    imageAlt: 'Audo Forest Retreat exterior',
    tags: ['Quiet luxury', 'Design-forward', 'Secluded', 'Forest', 'Feel fancy'],
    whyFits: ['Absolute seclusion in a pine forest', 'Impeccable Scandinavian minimalist design'],
    tradeoff: 'Very remote, requires a long journey from the nearest airport.',
    priceCategory: '€€€€',
    luxuriousValue: 5,
    distanceValue: 120,
    spaScore: 4,
    settings: ['Forest', 'Secluded']
  },
  {
    id: 'core-ett-hem',
    name: 'Ett Hem',
    description: 'Translating to "A Home", this private townhouse in Stockholm redefines boutique luxury. With only 12 rooms, world-class design by Ilse Crawford, and an open kitchen where chefs cook bespoke meals for you, it is the pinnacle of intimate city luxury.',
    location: 'Stockholm, Sweden',
    region: 'Sweden',
    amenities: ['Fine Dining', 'Spa'],
    priceValue: 950,
    image: ettHemImg,
    images: [ettHemImg],
    imageAlt: 'Ett Hem interior',
    tags: ['Quiet luxury', 'City break', 'Boutique', 'Design-forward', 'Feel fancy'],
    whyFits: ['World-class Ilse Crawford design', 'Feels like a private residence, not a hotel'],
    tradeoff: 'Very limited room count means it books out months in advance.',
    priceCategory: '€€€€',
    luxuriousValue: 5,
    distanceValue: 2,
    spaScore: 3,
    settings: []
  },
  {
    id: 'core-amalfi-cliff',
    name: 'Casa Privata',
    description: 'An exclusive cliffside villa accessible only by private boat or a winding coastal path. Far from the crowds of Positano, this estate offers private sea access, terraced lemon groves, and an authentic, secluded coastal lifestyle.',
    location: 'Praiano, Italy',
    region: 'Amalfi Coast',
    amenities: ['Pool', 'Fine Dining'],
    priceValue: 1200,
    image: amalfiImg,
    images: [amalfiImg],
    imageAlt: 'Casa Privata cliffside view',
    tags: ['Quiet luxury', 'Beach & sun', 'Secluded', 'Romance', 'Feel fancy'],
    whyFits: ['Private sea access away from the crowds', 'Authentic Italian villa experience'],
    tradeoff: 'Many stairs and steep paths; not suitable for those with mobility issues.',
    priceCategory: '€€€€',
    luxuriousValue: 5,
    distanceValue: 15,
    spaScore: 2,
    settings: ['Secluded']
  },
  {
    id: 'core-tokyo-ryokan',
    name: 'Hoshinoya',
    description: 'A traditional Japanese ryokan brought to the 21st century. Hidden within the bustling heart of Tokyo, this sanctuary offers private hot spring baths, exquisite kaiseki dining, and an unparalleled level of serene, monastic luxury.',
    location: 'Tokyo, Japan',
    region: 'Tokyo',
    amenities: ['Spa', 'Fine Dining'],
    priceValue: 1100,
    image: tokyoImg,
    images: [tokyoImg],
    imageAlt: 'Hoshinoya ryokan interior',
    tags: ['Quiet luxury', 'City break', 'Design-forward', 'Spa focus', 'Feel fancy'],
    whyFits: ['Authentic ryokan experience in the city center', 'Private hot spring baths'],
    tradeoff: 'Strict traditional rules apply, including no shoes indoors.',
    priceCategory: '€€€€',
    luxuriousValue: 5,
    distanceValue: 1,
    spaScore: 5,
    settings: []
  },
  {
    id: 'core-tuscany-vineyard',
    name: 'Castiglion del Bosco',
    description: 'An 800-year-old estate surrounded by rolling hills and private vineyards. This sprawling resort offers truffle hunting, wine tasting, and palatial suites. The absolute peak of romantic, gastronomic travel in the Italian countryside.',
    location: 'Tuscany, Italy',
    region: 'Tuscany',
    amenities: ['Pool', 'Spa', 'Fine Dining', 'Pet Friendly'],
    priceValue: 1400,
    image: tuscanyImg,
    images: [tuscanyImg],
    imageAlt: 'Castiglion del Bosco estate',
    tags: ['Quiet luxury', 'Food & wine', 'Romance', 'Family-friendly', 'Feel fancy'],
    whyFits: ['Private vineyards and world-class wine tasting', 'Historic 800-year-old estate'],
    tradeoff: 'A sprawling estate; getting between amenities often requires a golf cart.',
    priceCategory: '€€€€',
    luxuriousValue: 5,
    distanceValue: 40,
    spaScore: 4,
    settings: ['Secluded']
  }
];

export function getCuratedStays(preferences: any): Stay[] {
  // If no search, return an empty array (or top 3 if we want to show them anyway)
  if (!preferences.mood && !preferences.scene) return [];

  // Simple scoring to find the best matching curated stays
  const scored = coreCollection.map(stay => {
    let score = 0;
    
    // Exact mood tag match
    if (preferences.mood && stay.tags.some(t => t.toLowerCase() === preferences.mood.toLowerCase())) {
      score += 5;
    }
    
    // Special mood mapping
    if (preferences.mood === 'Quiet luxury' && stay.luxuriousValue >= 4) score += 3;
    if (preferences.mood === 'Spa reset' && stay.spaScore >= 4) score += 3;
    if (preferences.mood === 'Food & wine' && stay.amenities.includes('Fine Dining')) score += 3;

    // Scene match
    if (preferences.scene === 'City break' && stay.tags.includes('City break')) score += 5;
    if (preferences.scene === 'Beach & sun' && stay.tags.includes('Beach & sun')) score += 5;
    if (preferences.scene === 'Countryside' && (stay.settings.includes('Secluded') || stay.settings.includes('Forest'))) score += 5;
    if (preferences.scene === 'Mountains' && stay.settings.includes('Mountain View')) score += 5;

    return { stay, score };
  });

  // Filter to only those that actually match something, then sort by score
  const matches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
  
  // Return the top 3 best matching curated stays
  return matches.slice(0, 3).map(m => m.stay);
}
