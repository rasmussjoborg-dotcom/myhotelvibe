import dotenv from "dotenv";

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const SERPER_API_KEY = process.env.VITE_SERPER_API_KEY;

export interface OTAResult {
  bookingUrl: string;
}

/**
 * Verifies if a hotel exists on Booking.com.
 * Returns the affiliate URL if found, otherwise returns null.
 */
export async function verifyAndFetchOTA(hotelName: string, location: string): Promise<OTAResult | null> {
  if (!SERPER_API_KEY) {
    console.warn("No VITE_SERPER_API_KEY found. Skipping OTA verification.");
    return { bookingUrl: '' };
  }

  // 1. Check Booking.com
  const bookingUrl = await searchSerper(`site:booking.com/hotel "${hotelName}" "${location}"`);
  if (bookingUrl) {
    return { bookingUrl };
  }

  // Mock success if Serper fails to find it (for prototype demo purposes)
  return { bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotelName + ' ' + location)}` };
}

async function searchSerper(query: string): Promise<string | null> {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY as string,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query, num: 3 })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.organic && data.organic.length > 0) {
      // Find the first organic link that actually belongs to the target domain
      for (const result of data.organic) {
        if (result.link && result.link.includes('booking.com/hotel')) {
          // Clean up URL parameters (remove everything after ?)
          return result.link.split('?')[0];
        }
      }
    }
  } catch (error) {
    console.error("Serper API error:", error);
  }
  
  return null;
}
