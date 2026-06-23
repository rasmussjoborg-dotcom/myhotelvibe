import { addDays, format, nextSaturday, setMonth } from 'date-fns';

const VIBE_DESTINATIONS: Record<string, string[]> = {
  // Original Labels
  'Beach & sun': ['Mallorca, Spain', 'Amalfi Coast, Italy', 'Algarve, Portugal', 'Antibes, France', 'Saint-Raphaël, France', 'La Croix-Valmer, France', 'Ramatuelle, France', 'Èze, France'],
  'City pulse': ['London, UK', 'Paris, France', 'Rome, Italy'],
  'Mountains': ['Dolomites, Italy', 'Swiss Alps', 'Tyrol, Austria'],
  'Countryside': ['Tuscany, Italy', 'Provence, France', 'Cotswolds, UK', 'Gordes, France', 'Massignac, France', 'Avignon, France'],
  'Island': ['Santorini, Greece', 'Corsica, France', 'Ibiza, Spain'],
  'Lakeside': ['Lake Como, Italy', 'Lake Annecy, France', 'Lake Bled, Slovenia'],
  'Desert': ['Andalusia, Spain', 'Bardenas Reales, Spain'], // Not many deserts in Europe, using desert-like/arid regions
  'Snow & ski': ['Chamonix, France', 'Zermatt, Switzerland', 'Cortina, Italy', 'Méribel, France'],

  // Updated UI Copy Labels
  'Pristine Shores': ['Mallorca, Spain', 'Amalfi Coast, Italy', 'Algarve, Portugal', 'Antibes, France', 'Saint-Raphaël, France', 'La Croix-Valmer, France', 'Ramatuelle, France', 'Èze, France'],
  'Iconic Cities': ['Paris, France', 'London, UK', 'Berlin, Germany', 'Milan, Italy'],
  'Alpine & Peaks': ['Dolomites, Italy', 'Swiss Alps', 'Tyrol, Austria'],
  'Remote Sanctuaries': ['Scottish Highlands, UK', 'Tuscany, Italy', 'Lapland, Finland', 'Gordes, France', 'Massignac, France', 'Avignon, France'],
  'Exclusive Islands': ['Cyclades, Greece', 'Balearic Islands, Spain', 'Azores, Portugal'],
  'Lakeside Estates': ['Lake Como, Italy', 'Lake Geneva, Switzerland', 'Lake Garda, Italy'],
  'Desert Oases': ['Almeria, Spain', 'Bardenas Reales, Spain'],
  'Winter Escapes': ['Tromso, Norway', 'Lapland, Finland', 'Reykjavik, Iceland', 'Méribel, France']
};

export function mapSceneToDestinations(scene: string): string[] {
  if (!scene) return ['Rome, Italy', 'Paris, France'];
  return VIBE_DESTINATIONS[scene] || [scene];
}

export function parseLooseDates(timeline: string): { checkIn: string, checkOut: string } {
  const today = new Date();
  const t = (timeline || '').toLowerCase();

  let checkIn = addDays(today, 14); // default 2 weeks from now
  let checkOut = addDays(checkIn, 3); // default 3 nights

  if (t.includes('summer')) {
    checkIn = setMonth(today, 6); // July
    if (checkIn < today) checkIn = setMonth(addDays(today, 365), 6);
    checkOut = addDays(checkIn, 4);
  } else if (t.includes('winter')) {
    checkIn = setMonth(today, 11); // December
    if (checkIn < today) checkIn = setMonth(addDays(today, 365), 11);
    checkOut = addDays(checkIn, 4);
  } else if (t.includes('weekend')) {
    checkIn = nextSaturday(today);
    checkOut = addDays(checkIn, 2);
  } else if (t.includes('soon')) {
    checkIn = addDays(today, 7);
    checkOut = addDays(checkIn, 3);
  } else if (t.includes('asap')) {
    checkIn = addDays(today, 2);
    checkOut = addDays(checkIn, 3);
  }

  return {
    checkIn: format(checkIn, 'yyyy-MM-dd'),
    checkOut: format(checkOut, 'yyyy-MM-dd')
  };
}
