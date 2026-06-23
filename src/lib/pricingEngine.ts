/**
 * pricingEngine.ts
 * Procedurally generates realistic pricing multipliers based on dates to simulate a live API.
 */

export function calculatePriceMultiplier(checkIn: Date, checkOut: Date): number {
  let multiplier = 1.0;

  const month = checkIn.getMonth(); // 0 = Jan, 11 = Dec
  const dayOfWeek = checkIn.getDay(); // 0 = Sun, 6 = Sat

  // 1. Seasonal Surges
  // Summer peak (June, July, August)
  if (month >= 5 && month <= 7) {
    multiplier += 0.35; // 35% more expensive
  }
  // Winter holidays (December)
  else if (month === 11) {
    multiplier += 0.25; // 25% surge
  }
  // Off-peak (Jan, Feb, Nov)
  else if (month === 0 || month === 1 || month === 10) {
    multiplier -= 0.15; // 15% discount
  }

  // 2. Weekend Surge (Friday/Saturday check-ins are pricier)
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    multiplier += 0.15;
  }

  // Add a tiny bit of random jitter (between -2% and +2%) so the prices feel perfectly "live"
  // We use the date as a pseudo-seed to ensure the price doesn't jump wildly if they just re-fetch the exact same date
  const seed = checkIn.getDate() + month;
  const pseudoRandom = (Math.sin(seed) * 0.02); // between -0.02 and +0.02
  
  multiplier += pseudoRandom;

  return Math.max(0.5, Number(multiplier.toFixed(2))); // Never go below 50% base price
}
