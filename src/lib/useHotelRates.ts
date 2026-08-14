import { useState, useEffect } from 'react';

export interface HotelRateInfo {
  status: 'available' | 'sold_out' | 'estimated';
  available: boolean;
  nightlyRate?: number;
  totalPrice?: number;
  currency: string;
  roomName?: string;
  nights: number;
  source: 'liteapi' | 'estimate';
}

const ratesCache = new Map<string, HotelRateInfo>();

export function useHotelRates(
  hotelName: string,
  location: string,
  priceTier: string,
  checkinDate: string,
  checkoutDate: string
) {
  const cacheKey = `${hotelName}__${checkinDate}__${checkoutDate}`;
  const [rateInfo, setRateInfo] = useState<HotelRateInfo | null>(() => ratesCache.get(cacheKey) || null);
  const [isLoading, setIsLoading] = useState<boolean>(!ratesCache.has(cacheKey));

  useEffect(() => {
    if (!checkinDate || !checkoutDate || !hotelName) return;

    if (ratesCache.has(cacheKey)) {
      setRateInfo(ratesCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({
          hotelName,
          location,
          priceTier,
          checkin: checkinDate,
          checkout: checkoutDate,
        });

        const res = await fetch(`/api/availability?${query.toString()}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data: HotelRateInfo = await res.json();
          if (isMounted) {
            ratesCache.set(cacheKey, data);
            setRateInfo(data);
            setIsLoading(false);
          }
        } else {
          throw new Error('Failed to fetch rates');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          // Graceful fallback estimate
          const d1 = new Date(checkinDate);
          const d2 = new Date(checkoutDate);
          const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
          const baseRate = priceTier.includes('ULTRA') || priceTier.includes('€€€€') ? 650 : priceTier.includes('LUXE') || priceTier.includes('€€€') ? 380 : 220;
          const hash = (hotelName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const nightlyRate = baseRate + (hash % 80) - 40;

          const fallback: HotelRateInfo = {
            status: 'estimated',
            available: true,
            nightlyRate,
            totalPrice: nightlyRate * nights,
            currency: 'EUR',
            roomName: 'Standard Room / Suite',
            nights,
            source: 'estimate'
          };
          ratesCache.set(cacheKey, fallback);
          setRateInfo(fallback);
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [hotelName, location, priceTier, checkinDate, checkoutDate, cacheKey]);

  return { rateInfo, isLoading };
}
