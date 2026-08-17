import { Preferences, Stay } from '../types';
import { fetchHotels } from './api';
import { mapSceneToDestinations } from './dateLocationParser';
import { matchesDestination } from './destinations';

const BUDGET_MAP: Record<string, string[]> = {
  'Save it for the wine': ['€', '€€'],
  'The sweet spot': ['€€', '€€€'],
  'Make it rain': ['€€€', '€€€€']
};

export function filterStays(preferences: Preferences, allHotels: Stay[]): Stay[] {
  // 2. Map Backdrop to Locations
  const validDestinations = mapSceneToDestinations(preferences.backdrop);

  return allHotels.filter(hotel => {
    // --- Safety Filter ---
    // Hide from the consumer site until the admin assigns an image
    if (!hotel.image || hotel.image.includes('placeholder')) return false;

    // --- Destination / Region Filter ("Where to") ---
    if (preferences.destination && !matchesDestination(hotel, preferences.destination)) {
      return false;
    }

    // --- Backdrop Filter ---
    if (preferences.backdrop) {
      const backdropLower = preferences.backdrop.toLowerCase();
      const hasBackdropTag = hotel.primaryBackdrop?.toLowerCase() === backdropLower || hotel.tags?.some(tag => tag.toLowerCase() === backdropLower);
      
      // We do a loose check: e.g. hotel.location = "France - Paris", dest = "Paris, France"
      const matchesLocation = validDestinations.some(dest => {
        const destCity = dest.split(',')[0].trim().toLowerCase();
        const hotelLoc = hotel.location.toLowerCase();
        return hotelLoc.includes(destCity) || destCity.includes(hotelLoc);
      });
      if (!matchesLocation && !hasBackdropTag) return false;
    }

    // --- Price Tier Filter ---
    if (preferences.priceTier && preferences.priceTier.length > 0 && !preferences.priceTier.includes('All tiers')) {
      if (!hotel.priceTier || !preferences.priceTier.includes(hotel.priceTier)) {
        return false;
      }
    }

    // --- Trip Persona Filter ---
    if (preferences.persona) {
      const personaLower = preferences.persona.toLowerCase();
      const hasPersonaMatch = hotel.primaryPersona?.toLowerCase() === personaLower || hotel.tags?.some(tag => tag.toLowerCase() === personaLower);
      if (!hasPersonaMatch) return false;
    }

    // --- Amenities & Settings ---
    if (preferences.amenities && preferences.amenities.length > 0) {
      const hasAllAmenities = preferences.amenities.every(amenity => 
        hotel.amenities?.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }

    if (preferences.settings && preferences.settings.length > 0) {
      const hasAllSettings = preferences.settings.every(setting => 
        hotel.settings?.includes(setting)
      );
      if (!hasAllSettings) return false;
    }

    return true;
  });
}

export async function runWalledGardenSearch(preferences: Preferences, sourceHotels?: Stay[]): Promise<Stay[]> {
  try {
    const allHotels = sourceHotels ?? await fetchHotels();
    return filterStays(preferences, allHotels);
  } catch (error) {
    console.error("Walled Garden search failed:", error);
    return [];
  }
}
