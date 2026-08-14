export function buildAffiliateUrl(
  rawUrl: string,
  hotelName: string,
  location: string,
  checkinDate?: string,
  checkoutDate?: string
): string {
  let targetUrl: string;

  // 1. Fallback if no URL is provided
  if (!rawUrl || rawUrl.trim() === '') {
    targetUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${hotelName} ${location}`)}`;
  } else {
    targetUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  }

  // 2. Append check-in & check-out dates if provided
  if (checkinDate && checkoutDate) {
    try {
      const urlObj = new URL(targetUrl);
      urlObj.searchParams.set('checkin', checkinDate);
      urlObj.searchParams.set('checkout', checkoutDate);
      targetUrl = urlObj.toString();
    } catch {
      // fallback
    }
  }

  // 3. Apply tracking
  return applyAffiliateTracking(targetUrl);
}

export function buildKayakFlightUrl(
  originIata: string,
  destinationIata: string,
  departureDate?: string,
  returnDate?: string
): string {
  // If dates are provided: https://www.kayak.com/flights/ARN-IBZ/2026-09-10/2026-09-17
  // If dates are omitted: https://www.kayak.com/flights/ARN-IBZ
  let rawUrl = `https://www.kayak.com/flights/${originIata.toUpperCase()}-${destinationIata.toUpperCase()}`;
  if (departureDate && returnDate) {
    rawUrl += `/${departureDate}/${returnDate}`;
  }
  return applyAffiliateTracking(rawUrl, 'flights');
}

const DEFAULT_CJ_TEMPLATE = 'https://www.dpbolvw.net/links/101775158/type/dlg/sid/myhotelvibe/{url}';

function applyAffiliateTracking(url: string, sid: string = 'myhotelvibe'): string {
  const kayakTemplate = import.meta.env.VITE_KAYAK_CJ_TEMPLATE;
  let cjTemplate = import.meta.env.VITE_CJ_AFFILIATE_TEMPLATE || DEFAULT_CJ_TEMPLATE;
  const directAid = import.meta.env.VITE_BOOKING_AID;

  // Auto-correct any legacy Company ID to Property ID 101775158
  if (cjTemplate.includes('7984144')) {
    cjTemplate = cjTemplate.replace('7984144', '101775158');
  }
  if (cjTemplate.includes('anrdoezrs.net')) {
    cjTemplate = cjTemplate.replace('anrdoezrs.net', 'dpbolvw.net');
  }

  // 1. KAYAK specific CJ link template
  if (url.includes('kayak.com') && kayakTemplate && kayakTemplate.includes('{url}')) {
    let customKayak = kayakTemplate;
    if (sid && kayakTemplate.includes('/sid/myhotelvibe/')) {
      customKayak = kayakTemplate.replace('/sid/myhotelvibe/', `/sid/${sid}/`);
    } else if (sid && kayakTemplate.includes('/sid/simployer/')) {
      customKayak = kayakTemplate.replace('/sid/simployer/', `/sid/${sid}/`);
    }
    const isQueryParam = customKayak.includes('?url={url}') || customKayak.includes('&url={url}');
    return customKayak.replace('{url}', isQueryParam ? encodeURIComponent(url) : url);
  }

  // 2. Generic / Booking CJ Affiliate template
  if (cjTemplate && cjTemplate.includes('{url}')) {
    let customizedTemplate = cjTemplate;
    if (sid !== 'myhotelvibe' && cjTemplate.includes('/sid/myhotelvibe/')) {
      customizedTemplate = cjTemplate.replace('/sid/myhotelvibe/', `/sid/${sid}/`);
    } else if (sid !== 'simployer' && cjTemplate.includes('/sid/simployer/')) {
      customizedTemplate = cjTemplate.replace('/sid/simployer/', `/sid/${sid}/`);
    }

    const isQueryParam = customizedTemplate.includes('?url={url}') || customizedTemplate.includes('&url={url}');
    const processedUrl = isQueryParam ? encodeURIComponent(url) : url;
    return customizedTemplate.replace('{url}', processedUrl);
  }

  // 3. Direct Booking.com AID fallback
  if (directAid && url.includes('booking.com')) {
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

