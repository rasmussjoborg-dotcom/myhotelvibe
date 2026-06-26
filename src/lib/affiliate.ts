export function buildAffiliateUrl(rawUrl: string, hotelName: string, location: string): string {
  // 1. Fallback if no URL is provided
  if (!rawUrl || rawUrl.trim() === '') {
    const fallback = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${hotelName} ${location}`)}`;
    return applyAffiliateTracking(fallback);
  }

  // 2. Ensure URL has protocol
  let url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  // 3. Apply tracking
  return applyAffiliateTracking(url);
}

function applyAffiliateTracking(url: string): string {
  const cjTemplate = import.meta.env.VITE_CJ_AFFILIATE_TEMPLATE; // e.g. "https://www.jdoqocy.com/click-123456-765432?url={url}"
  const directAid = import.meta.env.VITE_BOOKING_AID; // e.g. "123456"

  // If CJ Affiliate template is provided, wrap the URL
  if (cjTemplate && cjTemplate.includes('{url}')) {
    return cjTemplate.replace('{url}', encodeURIComponent(url));
  }

  // If direct Booking.com AID is provided, append it
  if (directAid) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('aid', directAid);
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  return url;
}
