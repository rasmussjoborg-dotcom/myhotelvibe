/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const TRIP_PERSONAS = [
  'The Romantic Reset',
  'The Social Weekender',
  'The Urban Explorer',
  'The Creative Retreat',
  'The Epicurean Pilgrimage',
  'The Sun-Drenched Escape'
] as const;

export const PRICE_TIERS = [
  'Boutique (€€)',
  'Luxe (€€€)',
  'Iconic (€€€€)'
] as const;

export const BACKDROP_OPTIONS = [
  'Pristine Shores',
  'Iconic Cities',
  'Alpine & Peaks',
  'Remote Sanctuaries',
  'Exclusive Islands',
  'Lakeside Estates',
  'Desert Oases',
  'Winter Escapes'
] as const;

export interface Stay {
  id: string;
  name: string;
  location: string;
  region: string;
  priceCategory: '€' | '€€' | '€€€' | '€€€€';
  priceTier?: string;
  primaryPersona?: string;
  primaryBackdrop?: string;
  priceValue: number; // For "Cheaper" re-ranking
  luxuriousValue: number; // For "More luxurious" re-ranking: 1 (cozy) to 5 (top-tier grandeur)
  distanceValue: number; // For "Closer" sorting (distance in km from main transport)
  spaScore: number; // For "More spa" ranking
  image: string;
  image2?: string;
  image3?: string;
  imageAlt: string;
  images?: string[];
  description?: string;
  cardTeaser?: string;
  tags: string[];
  whyFits: string[];
  tradeoff: string;
  amenities: ('Spa' | 'Pool' | 'Fine Dining' | 'Pet Friendly')[];
  settings: ('Secluded' | 'Mountain View' | 'Forest')[];
  isAdultsOnly?: boolean;
  surroundings?: string;
  timeZone?: string;
  bookingWindow?: string;
  guestSummary?: string;
  bookingUrl?: string;
  updated_at?: string;
  is_locked?: boolean;
  youtubeUrl?: string;
  audioUrl?: string;
  localGems?: Record<string, { title: string, description: string, affiliateLink?: string }>;
  seasonalPrices?: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
}

export interface Preferences {
  persona: '' | string;
  backdrop: '' | string;
  priceTier: string[];
  amenities: ('Spa' | 'Pool' | 'Fine Dining' | 'Pet Friendly')[];
  settings: ('Secluded' | 'Mountain View' | 'Forest')[];
}

export type QuickRankType = 'default' | 'spa' | 'food' | 'aesthetic' | 'secluded' | 'luxury';
export type StayCardContentMode = 'teaserChips' | 'teaserCues' | 'teaserNote';

export type EditorialBlock = 
  | { type: 'text'; content: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'image'; url: string; caption?: string; layout?: 'full' | 'inline' }
  | { type: 'hotel'; hotelId: string; description?: string };

export interface EditorialArticle {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  image: string;
  blocks: EditorialBlock[];
}
