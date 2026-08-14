import { useState, useEffect } from 'react';

export interface FlightRateInfo {
  status: 'available' | 'estimated' | 'local';
  available: boolean;
  returnPrice?: number;
  currency: string;
  airline?: string;
  isDirect?: boolean;
  isLocalStay?: boolean;
  source: 'duffel' | 'estimate';
}

const flightRatesCache = new Map<string, FlightRateInfo>();

export function useFlightRates(
  originIata: string,
  destinationIata: string,
  departureDate: string,
  returnDate: string,
  isLocalStay: boolean = false
) {
  const cacheKey = `${originIata}__${destinationIata}__${departureDate}__${returnDate}`;
  const [flightRate, setFlightRate] = useState<FlightRateInfo | null>(() => flightRatesCache.get(cacheKey) || null);
  const [isLoading, setIsLoading] = useState<boolean>(!isLocalStay && !flightRatesCache.has(cacheKey));

  useEffect(() => {
    if (isLocalStay || originIata === destinationIata) {
      setFlightRate({
        status: 'local',
        available: false,
        isLocalStay: true,
        currency: 'EUR',
        source: 'estimate'
      });
      setIsLoading(false);
      return;
    }

    if (!originIata || !destinationIata || !departureDate || !returnDate) return;

    if (flightRatesCache.has(cacheKey)) {
      setFlightRate(flightRatesCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({
          origin: originIata,
          destination: destinationIata,
          departureDate,
          returnDate,
        });

        const res = await fetch(`/api/flight-prices?${query.toString()}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data: FlightRateInfo = await res.json();
          if (isMounted) {
            flightRatesCache.set(cacheKey, data);
            setFlightRate(data);
            setIsLoading(false);
          }
        } else {
          throw new Error('Failed to fetch flight rates');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          const fallback: FlightRateInfo = {
            status: 'estimated',
            available: true,
            returnPrice: 185,
            currency: 'EUR',
            isDirect: true,
            source: 'estimate'
          };
          flightRatesCache.set(cacheKey, fallback);
          setFlightRate(fallback);
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [originIata, destinationIata, departureDate, returnDate, isLocalStay, cacheKey]);

  return { flightRate, isLoading };
}
