/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Asterisk, Heart, MapPin, Scale } from 'lucide-react';
import { Stay, StayCardContentMode } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getStayCardBodyCopy } from '../lib/stayCardCopy';

function normalizeTradeoff(text: string | null | undefined) {
  if (!text) return '';
  return text.replace(/^\s*tradeoff:\s*/i, '').trim();
}

function formatSignalLabel(value: string) {
  return value
    .replace(/\b&\b/g, '&')
    .replace(/\bspa focus\b/i, 'Spa')
    .replace(/\bbeach & sun\b/i, 'Beach')
    .replace(/\bfood & wine\b/i, 'Food')
    .replace(/\bfeel fancy\b/i, 'High glam')
    .replace(/\bnature reset\b/i, 'Nature')
    .replace(/\bcity break\b/i, 'City break');
}

function getAroundHereSignal(stay: Stay) {
  const surroundings = stay.surroundings || '';
  const nearbyPatterns = [
    { test: /ski-in\/ski-out|direct slope access|belvédère piste/i, label: 'Ski-in / ski-out' },
    { test: /private beach|beach access|direct access to (the )?(mediterranean|sea|beach)|on the sand/i, label: 'Direct beach access' },
    { test: /old town|historic center|medieval village|cobblestoned village/i, label: 'Old town nearby' },
    { test: /artisan shops|art galleries|galleries|markets|boutiques/i, label: 'Shops and galleries close' },
    { test: /green park|park/i, label: 'Parkside address' },
    { test: /theatres|west end/i, label: 'Theatre district nearby' },
    { test: /vineyards|lavender fields|market towns/i, label: 'Village day trips' },
    { test: /monaco|nice|saint-jean-c[ée]p-ferrat/i, label: 'Riviera day trips' },
    { test: /three valleys/i, label: 'Three Valleys access' },
    { test: /seine|river|waterfront/i, label: 'Waterfront address' },
    { test: /mediterranean|sea views|bay|panoramic views/i, label: 'Front-row sea views' },
  ];

  const matched = nearbyPatterns.find((pattern) => pattern.test.test(surroundings));
  if (matched) return matched.label;

  return formatSignalLabel(stay.settings?.[0] || stay.amenities?.[0] || stay.location.split(',')[0] || 'Well placed');
}

function getSignatureSignal(stay: Stay) {
  const candidates = [
    stay.amenities?.[0],
    stay.settings?.[0],
    stay.priceTier?.split(' (')[0],
    stay.tags?.[0],
    'Strong atmosphere',
  ].filter(Boolean) as string[];

  return formatSignalLabel(candidates[0]);
}

function getCardSignals(stay: Stay) {
  const tags = (stay.tags || []).map(formatSignalLabel);
  const amenities = (stay.amenities || []).map(formatSignalLabel);
  const settings = (stay.settings || []).map(formatSignalLabel);
  return [...new Set([...tags, ...amenities, ...settings])].filter(Boolean).slice(0, 3);
}

function getCardNotes(stay: Stay) {
  const primary = formatSignalLabel(getAroundHereSignal(stay));
  const secondary = formatSignalLabel(getSignatureSignal(stay));

  return [primary, secondary]
    .filter(Boolean)
    .filter((value, index, array) => array.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)
    .slice(0, 2);
}

function cleanHotelName(rawName: string, location: string) {
  let name = rawName;
  const isAdultsOnly = /adults?\s*(only|friendly)/i.test(name);
  
  // Remove "Adults Only" suffixes with hyphens or pipes
  name = name.replace(/\s*[-|]\s*adults?\s*(only|friendly)/i, '');
  // Remove parenthesized "Adults Only"
  name = name.replace(/\s*\(\s*adults?\s*(only|friendly)\s*\)/i, '');
  
  // Remove city if appended
  const cityMatch = location.split(',')[0].trim();
  if (cityMatch) {
    // Escape city name for regex safety
    const safeCity = cityMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cityRegex = new RegExp(`\\s*[-|]\\s*${safeCity}$`, 'i');
    name = name.replace(cityRegex, '');
  }
  
  return { cleanedName: name.trim(), isAdultsOnly };
}

interface StayCardProps {
  key?: string;
  stay: Stay;
  isFavorite: boolean;
  onToggleFavorite: (e: any, id: string) => void;
  onOpenDetails: (stay: Stay) => void;
  featureLayout?: boolean;
  imageShape?: 'wide' | 'tall' | 'square' | 'native';
  compact?: boolean;
  className?: string;
  hideFavoriteButton?: boolean;
  contentMode?: StayCardContentMode;
}

export default function StayCard({
  stay,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  featureLayout = false,
  imageShape = 'wide',
  compact = false,
  className,
  hideFavoriteButton = false,
  contentMode = 'teaserChips',
}: StayCardProps) {
  const shouldFeature = featureLayout;
  const isCompact = compact || imageShape === 'tall';

  const getThumbnailUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('bstatic.com/xdata/images/hotel/max2000/')) {
      return url.replace('/max2000/', '/max500/');
    }
    if (url.startsWith('/stays/') && !url.includes('-thumb')) {
      const lastDot = url.lastIndexOf('.');
      if (lastDot > -1) {
        return url.substring(0, lastDot) + '-thumb' + url.substring(lastDot);
      }
    }
    return url;
  };
  const tradeoffText = normalizeTradeoff(stay.tradeoff);
  const cardBodyCopy = getStayCardBodyCopy(stay);
  const cardSignals = getCardSignals(stay);
  const cardNotes = getCardNotes(stay);
  const imageAspect =
    imageShape === 'native'
      ? ''
      : imageShape === 'tall'
        ? 'aspect-[4/5] md:aspect-[3/4]'
        : imageShape === 'square'
          ? 'aspect-[4/5] md:aspect-[4/5]'
          : 'aspect-[4/3] md:aspect-[16/9]';

  const carouselImages = stay.images && stay.images.length > 0 ? stay.images : [stay.image];

  const { cleanedName, isAdultsOnly } = cleanHotelName(stay.name, stay.location);

  const renderCardBody = () => {
    const visibleNotes = cardNotes.slice(0, 2);

    if (!cardBodyCopy && visibleNotes.length === 0) return null;

    if (contentMode === 'teaserCues') {
      return (
        <div className="mb-4 w-full shrink-0">
          {visibleNotes.length > 0 ? (
            <div className={cn('text-[12px] text-primary/78 md:text-[13px]', cardBodyCopy ? 'mb-4' : 'mt-1')}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {visibleNotes.map((note) => (
                  <span key={note} className="inline-flex items-center gap-1.5 leading-none">
                    <Asterisk className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <span className="font-medium tracking-[0.01em]">{note}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {cardBodyCopy ? (
            <p className="mx-1 max-w-none text-[14px] italic font-normal leading-[1.7] text-foreground/66 md:mx-1.5 md:text-[15px] line-clamp-3">
              {cardBodyCopy}
            </p>
          ) : null}
        </div>
      );
    }

    if (contentMode === 'teaserNote') {
      return (
        <div className="mb-4 w-full shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-16 w-px shrink-0 bg-primary/25" />
            <p className="max-w-[32ch] text-[15px] leading-[1.68] text-foreground/82 md:text-[16px] line-clamp-3">
              {cardBodyCopy}
            </p>
          </div>
          {tradeoffText ? (
            <div className="mt-4 pt-3 text-[12px] leading-relaxed text-muted-foreground md:text-[13px]">
              <span className="font-semibold text-foreground/70">Reality check:</span> {tradeoffText}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="mb-4 w-full shrink-0 space-y-3">
        <p className="max-w-none text-[15px] font-medium leading-[1.5] text-foreground/82 md:text-[16px] line-clamp-3">
          {cardBodyCopy}
        </p>
        {cardSignals.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {cardSignals.map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-primary/15 bg-background px-3 py-1 text-[11px] font-semibold tracking-tight text-primary"
              >
                {signal}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <article
      title={`View details for ${stay.name}`}
      className={cn(
        'group relative flex cursor-pointer flex-col break-inside-avoid rounded-xl border border-white bg-white',
        shouldFeature ? 'p-4 md:p-6' : 'p-4 md:p-5',
        'transition-all duration-300 hover:border-primary active:border-primary active:ring-1 active:ring-primary/30 active:bg-primary/[0.02]',
        className,
      )}
      onClick={() => onOpenDetails(stay)}
    >
      <div className={cn('relative mb-5 w-full overflow-hidden rounded-lg bg-surface-container-high md:mb-6 group/carousel', shouldFeature ? 'aspect-[4/3] md:aspect-[16/9]' : imageAspect)}>
          <img
            alt={stay.imageAlt}
            src={getThumbnailUrl(carouselImages[0])}
            loading="lazy"
            decoding="async"
            className={cn(
              imageShape === 'native' ? 'h-auto w-full' : 'h-full w-full object-cover',
              'transition-opacity duration-300',
            )}
          />

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end p-4 pt-12 bg-gradient-to-t from-black/80 to-transparent">
             <div className="flex items-center gap-1.5 text-white">
                <MapPin className="h-[15px] w-[15px] stroke-[1.7]" />
                <span className="mt-[2px] truncate text-[11px] font-extrabold uppercase leading-none tracking-[0.15em] drop-shadow-sm">{stay.location}</span>
             </div>
          </div>

          {!hideFavoriteButton ? (
          <Button
            onClick={(e) => onToggleFavorite(e, stay.id)}
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              'absolute right-4 top-4 z-20 h-10 w-10 rounded-full border border-primary bg-white text-primary shadow-sm',
              'transition-all duration-200 delay-[175ms] hover:bg-background active:translate-y-0',
              isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
          >
              <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                isFavorite
                  ? 'text-accent fill-accent' // Red for favorited hearts
                  : 'text-primary hover:text-accent',
              )}
            />
          </Button>
          ) : null}
      </div>

      <div className="flex grow flex-col gap-4">
        <div className="flex-1">

          <div className="flex flex-wrap gap-2 mb-2">
            {isAdultsOnly && (
              <div className="w-fit rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                Adults Only
              </div>
            )}
            {stay.priceTier && (
              <div className="w-fit rounded-full bg-muted/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary transition-colors duration-200 md:group-hover:bg-primary md:group-hover:text-primary-foreground">
                {stay.priceTier.split(' (')[0]}
              </div>
            )}
          </div>
          <h3 className={cn('font-display text-[26px] leading-[1.15] text-foreground md:text-[32px]', isCompact ? 'mb-3' : 'mb-4')}>
            {cleanedName}
          </h3>

          {renderCardBody()}
        </div>
      </div>
    </article>
  );
}
