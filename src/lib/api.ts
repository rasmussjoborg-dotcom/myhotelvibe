import { supabase } from './supabase';
import { Stay } from '../types';
import { IMAGE_MAP } from './imageMap';
import { getDatesFromTimeline } from './dateUtils';
import { calculatePriceMultiplier } from './pricingEngine';
import { normalizeLocation } from './location';
import { inferPrimaryBackdrop, inferPrimaryPersona, inferPriceTier } from './taxonomy';
import { isLocalAdminEnabled } from './runtime';

import audioClassic from '../assets/stitch/theme-songs/The-Classic-European-Cities.m4a';
import audioCountryside from '../assets/stitch/theme-songs/The-Deep-Countryside-Highlands.m4a';
import audioDesert from '../assets/stitch/theme-songs/The-Desert-Arid-Escapes.m4a';
import audioMediterranean from '../assets/stitch/theme-songs/The-Mediterranean-Riviera.m4a';
import audioNordics from '../assets/stitch/theme-songs/The-Nordics-The-Arctic.m4a';

function pickFirstMatch(values: string[] = [], patterns: Array<{ test: RegExp; label: string }>) {
  for (const value of values) {
    for (const pattern of patterns) {
      if (typeof value === 'string' && pattern.test.test(value)) return pattern.label;
    }
  }
  return null;
}

function buildCardTeaser(hotel: any): string {
  const tags = Array.isArray(hotel.tags) ? hotel.tags : [];
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const settings = Array.isArray(hotel.settings) ? hotel.settings : [];
  const persona = hotel.primaryPersona || '';

  const signalA =
    pickFirstMatch([...amenities, ...tags, ...settings], [
      { test: /rooftop.*pool|infinity pool/i, label: 'Rooftop dips' },
      { test: /rooftop/i, label: 'Rooftop energy' },
      { test: /spa|treatment|turkish bath|sauna/i, label: 'Spa hours' },
      { test: /restaurant|fine dining|culinary|nobu/i, label: 'Dinner sorted' },
      { test: /bay views|sea views|waterfront|beachfront|coastal|la concha/i, label: 'Front-row water views' },
      { test: /design|design-led|design hotel|scandinavian chic/i, label: 'Sharp interiors' },
      { test: /historic|historic building|heritage/i, label: 'Old bones' },
      { test: /terrace|private terraces/i, label: 'Terrace time' },
      { test: /cocktail bar|bar/i, label: 'Cocktails downstairs' },
      { test: /wellness/i, label: 'Wellness built in' },
    ]) || 'Good taste throughout';

  const signalB =
    pickFirstMatch([...tags, ...settings, ...amenities], [
      { test: /urban|city break|central/i, label: 'the city at your feet' },
      { test: /coastal|beachfront|bay|sea|waterfront/i, label: 'sea air included' },
      { test: /boutique|intimate/i, label: 'with boutique scale' },
      { test: /historic|heritage/i, label: 'with real character' },
      { test: /design|design-led/i, label: 'done with restraint' },
      { test: /cultural|art/i, label: 'and culture close by' },
    ]) || 'and a reason to linger';

  const personaLine =
    persona === 'The Social Weekender' ? 'Built for stylish weekends.' :
    persona === 'The Urban Explorer' ? 'Built for city curiosity.' :
    persona === 'The Creative Retreat' ? 'Built for clear heads and good taste.' :
    persona === 'The Epicurean Pilgrimage' ? 'Built for people who plan days around dinner.' :
    persona === 'The Romantic Reset' ? 'Built for slipping off-grid together.' :
    persona === 'The Sun-Drenched Escape' ? 'Built for long bright days.' :
    'Built for checking in and switching off.';

  return `${signalA}, ${signalB}. ${personaLine}`;
}

function getThemeSong(hotel: any): string {
  if (hotel.audioUrl && hotel.audioUrl.trim() !== '') return hotel.audioUrl;

  const r = (hotel.region || '').toLowerCase();
  const l = (hotel.location || '').toLowerCase();
  const t = (hotel.tags || []).join(' ').toLowerCase();
  const searchStr = `${r} ${l} ${t}`;

  if (['sweden', 'norway', 'iceland', 'greenland', 'lapland', 'arctic', 'nordic'].some(k => searchStr.includes(k))) return audioNordics;
  if (['amalfi', 'como', 'corsica', 'santorini', 'mallorca', 'mediterranean', 'riviera', 'greece', 'tuscany coast', 'andalusia', 'algarve', 'italy', 'spain'].some(k => searchStr.includes(k))) return audioMediterranean;
  if (['paris', 'rome', 'london', 'lisbon', 'copenhagen', 'madrid', 'berlin', 'amsterdam', 'vienna', 'city'].some(k => searchStr.includes(k))) return audioClassic;
  if (['tuscany', 'highlands', 'douro', 'bavaria', 'countryside', 'provence', 'lake district', 'cotswolds', 'transylvania', 'scotland', 'uk', 'ireland', 'germany', 'alps'].some(k => searchStr.includes(k))) return audioCountryside;
  if (['desert', 'bardenas', 'marrakech', 'sahara', 'arid', 'morocco', 'morroco'].some(k => searchStr.includes(k))) return audioDesert;

  // Fallback to a neutral, universally pleasant option if no keywords hit
  return audioMediterranean;
}

export async function fetchHotels(timeline: string = 'Flexible'): Promise<Stay[]> {
  const { data, error } = await supabase
    .from('hotels')
    .select('*');

  if (error) {
    console.error('Error fetching hotels:', error);
    return [];
  }

  const { checkIn, checkOut } = getDatesFromTimeline(timeline);
  const multiplier = calculatePriceMultiplier(checkIn, checkOut);

  return (data || []).map((hotel: any) => {
    const normalizedLocation = normalizeLocation(hotel.location, hotel.region);
    let parsedImages = [
      hotel.image,
      hotel.image2,
      hotel.image3
    ].filter(Boolean);
    
    // Legacy support for IMAGE_MAP if needed
    if (parsedImages.length === 1 && IMAGE_MAP[parsedImages[0]]) {
      parsedImages = [IMAGE_MAP[parsedImages[0]]];
    }

    try {
      if (hotel.image && hotel.image.startsWith('[')) {
        const parsed = JSON.parse(hotel.image);
        if (Array.isArray(parsed)) parsedImages = parsed;
      }
    } catch {
      // Legacy format
    }

    const enrichedHotel = {
      ...hotel,
      location: normalizedLocation.location,
      primaryPersona: hotel.primaryPersona || inferPrimaryPersona({ ...hotel, location: normalizedLocation.location }),
      primaryBackdrop: hotel.primaryBackdrop || inferPrimaryBackdrop({ ...hotel, location: normalizedLocation.location }),
      priceTier: inferPriceTier(hotel.priceTier, hotel.priceCategory),
    };

    return {
      ...enrichedHotel,
      cardTeaser: hotel.cardTeaser || buildCardTeaser(enrichedHotel),
      image: parsedImages[0], // fallback for old code
      images: parsedImages,
      basePrice: hotel.priceValue,
      priceValue: Math.round(hotel.priceValue * multiplier),
      audioUrl: getThemeSong(hotel)
    };
  });
}

export async function insertHotel(hotel: Omit<Stay, 'id'> | Stay) {
  if (!isLocalAdminEnabled()) {
    throw new Error('Hotel writes are disabled outside local admin mode.');
  }

  const { data, error } = await supabase
    .from('hotels')
    .upsert([hotel])
    .select();

  if (error) {
    console.error('Error inserting hotel:', error);
    throw error;
  }
  return data?.[0];
}

export async function updateHotel(id: string, updates: Partial<Stay>) {
  if (!isLocalAdminEnabled()) {
    throw new Error('Hotel writes are disabled outside local admin mode.');
  }

  const payload: any = {};
  if (updates.images) {
    payload.image = JSON.stringify(updates.images);
  } else if (updates.image) {
    payload.image = JSON.stringify([updates.image]);
  }
  if (updates.bookingUrl !== undefined) payload.bookingUrl = updates.bookingUrl;
  if (updates.youtubeUrl !== undefined) payload.youtubeUrl = updates.youtubeUrl;
  if (updates.localGems !== undefined) payload.localGems = updates.localGems;
  if (updates.updated_at !== undefined) payload.updated_at = updates.updated_at;
  if (updates.is_locked !== undefined) payload.is_locked = updates.is_locked;
  const { data, error } = await supabase
    .from('hotels')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating hotel:', error);
    throw error;
  }
  return data?.[0];
}

export async function deleteHotel(id: string) {
  if (!isLocalAdminEnabled()) {
    throw new Error('Hotel writes are disabled outside local admin mode.');
  }

  const { error } = await supabase
    .from('hotels')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting hotel:', error);
    throw error;
  }
}
