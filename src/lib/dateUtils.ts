/**
 * dateUtils.ts
 * Parses string-based timelines ("Soon", "This summer") into actual Date ranges for the Duffel API.
 */

export function getDatesFromTimeline(timeline: string): { checkIn: Date; checkOut: Date } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let checkIn = new Date();
  let checkOut = new Date();

  switch (timeline) {
    case 'Soon':
      // 14 days from now, stay for 3 nights
      checkIn.setDate(now.getDate() + 14);
      checkOut.setDate(now.getDate() + 17);
      break;

    case 'This summer':
      // If we are past July, next summer. Otherwise this July.
      const summerYear = currentMonth >= 8 ? currentYear + 1 : currentYear;
      checkIn = new Date(summerYear, 6, 15); // July 15
      checkOut = new Date(summerYear, 6, 22); // July 22
      break;

    case 'This winter':
      // Usually means Jan/Feb of next year
      checkIn = new Date(currentYear + 1, 0, 20); // Jan 20
      checkOut = new Date(currentYear + 1, 0, 27); // Jan 27
      break;

    case 'Flexible':
    default:
      // 1 month from now, stay for 5 nights
      checkIn.setMonth(now.getMonth() + 1);
      checkOut.setMonth(now.getMonth() + 1);
      checkOut.setDate(checkIn.getDate() + 5);
      break;
  }

  return { checkIn, checkOut };
}

/**
 * Format date for Duffel (YYYY-MM-DD)
 */
export function formatDuffelDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
