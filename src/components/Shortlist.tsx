/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useEffect, useState, useRef } from 'react';
import { SlidersHorizontal, Loader2, Compass } from 'lucide-react';
import { Stay, QuickRankType, Preferences } from '../types';
import StayCard from './StayCard';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';

interface ShortlistProps {
  stays: Stay[];
  favorites: string[];
  onToggleFavorite: (e: any, id: string) => void;
  onOpenDetails: (stay: Stay) => void;
  preferences: Preferences;
  currentRank: QuickRankType;
  onRankChange: (rank: QuickRankType) => void;
  isUpdating?: boolean;
}

export default function Shortlist({
  stays,
  favorites,
  onToggleFavorite,
  onOpenDetails,
  preferences,
  currentRank,
  onRankChange,
  isUpdating,
}: ShortlistProps) {

  // 1. Dynamic Preferences Filtering (Check overlap with selected amenities and settings)
  const matchedStays = useMemo(() => stays.filter((stay) => {
    // If no amenities are filtered on, everything matches
    const matchesAmenities =
      preferences.amenities.length === 0 ||
      preferences.amenities.every((amenity) => stay.amenities.includes(amenity));

    // If no settings are filtered, everything matches
    const matchesSettings =
      preferences.settings.length === 0 ||
      preferences.settings.every((setting) => stay.settings.includes(setting));

    return matchesAmenities && matchesSettings;
  }), [stays, preferences.amenities, preferences.settings]);

  const rankedStays = useMemo(() => {
    const normalize = (value: string) => value.trim().toLowerCase();

    const tagBoostsFor = (pref: Preferences) => {
      const boosts: Array<{ tag: string; points: number }> = [];

      // Persona → tags (soft boosts)
      if (pref.persona) {
        boosts.push({ tag: pref.persona, points: 3 });
        if (pref.persona === 'The Romantic Reset') boosts.push({ tag: 'Romance', points: 4 });
        if (pref.persona === 'The Social Weekender') boosts.push({ tag: 'City break', points: 3 });
        if (pref.persona === 'The Creative Retreat') boosts.push({ tag: 'Design-forward', points: 3 });
        if (pref.persona === 'The Epicurean Pilgrimage') boosts.push({ tag: 'Food & wine', points: 4 });
      }

      // Backdrop → tags (soft boosts)
      if (pref.backdrop) boosts.push({ tag: pref.backdrop, points: 3 });

      // PriceTier → tags
      if (pref.priceTier && !pref.priceTier.includes('All tiers')) {
        pref.priceTier.forEach(tier => boosts.push({ tag: tier, points: 2 }));
      }

      return boosts;
    };

    const boosts = tagBoostsFor(preferences);

    const computeMatchScore = (stay: Stay) => {
      const tags = new Set((stay.tags || []).map(normalize));
      let score = 0;

      for (const { tag, points } of boosts) {
        if (tags.has(normalize(tag))) score += points;
      }

      // Gentle boosts based on the schema-backed fields (never invent).
      if (preferences.persona === 'The Epicurean Pilgrimage') {
        if (stay.amenities.includes('Fine Dining')) score += 2;
      }

      if (preferences.persona === 'The Romantic Reset') {
        if (stay.luxuriousValue >= 4) score += 2;
      }

      if (preferences.backdrop === 'Alpine & Peaks') {
        if (stay.settings.includes('Mountain View')) score += 2;
      }

      if (preferences.backdrop === 'Remote Sanctuaries') {
        if (stay.settings.includes('Forest')) score += 1;
        if (stay.settings.includes('Secluded')) score += 1;
      }

      return score;
    };

    const baseSort = (stay: Stay) => stay.luxuriousValue + stay.spaScore;

    const primarySort = (stay: Stay) => {
      switch (currentRank) {
        case 'spa':
          return stay.spaScore * 10 + baseSort(stay);
        case 'luxury':
          return stay.luxuriousValue * 10 + baseSort(stay);
        case 'secluded':
          return (stay.settings.includes('Secluded') ? 100 : 0) + (stay.settings.includes('Forest') ? 8 : 0) + baseSort(stay);
        case 'food':
          return (stay.amenities.includes('Fine Dining') ? 100 : 0) + baseSort(stay);
        case 'aesthetic':
          // Prioritize high luxurious value and specific aesthetic tags
          return ((stay.tags || []).some(t => t.toLowerCase() === 'design-forward') ? 100 : 0) + stay.luxuriousValue * 10 + baseSort(stay);
        default:
          return baseSort(stay) * 10;
      }
    };

    return [...matchedStays].sort((a, b) => {
      const aPrimary = primarySort(a);
      const bPrimary = primarySort(b);
      if (bPrimary !== aPrimary) return bPrimary - aPrimary;

      const aMatch = computeMatchScore(a);
      const bMatch = computeMatchScore(b);
      if (bMatch !== aMatch) return bMatch - aMatch;

      return baseSort(b) - baseSort(a);
    });
  }, [matchedStays, preferences, currentRank]);

  const loaderRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(18);
  const BATCH_SIZE = 18;
  const hasMore = visibleCount < rankedStays.length;

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [preferences, currentRank]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setVisibleCount((prev) => prev + BATCH_SIZE);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    if (!isLoadingMore) return;
    setIsLoadingMore(false);
  }, [visibleCount, isLoadingMore]);

  const visibleStays = useMemo(() => rankedStays.slice(0, visibleCount), [rankedStays, visibleCount]);

  const editorialColumns = useMemo(() => {
    const columns: { stay: Stay; imageShape?: 'wide' | 'tall' | 'square'; compact?: boolean }[][] = [[], [], []];
    const shapes: ('tall' | 'wide' | 'square')[] = ['tall', 'wide', 'square'];
    
    visibleStays.forEach((stay, idx) => {
      // Deterministic hash based on stay.id to prevent clumps of the same shape
      let hash = 0;
      for (let i = 0; i < stay.id.length; i++) {
        hash = stay.id.charCodeAt(i) + ((hash << 5) - hash);
      }
      const shapeIndex = Math.abs(hash + idx) % 3;

      const colIndex = idx % 3;
      columns[colIndex].push({
        stay,
        imageShape: shapes[shapeIndex],
        compact: idx % 4 === 0,
      });
    });

    return columns;
  }, [visibleStays]);

  const editorialMobileItems = useMemo(() => {
    const maxRows = Math.max(...editorialColumns.map((column) => column.length));
    const items = [];

    for (let rowIndex = 0; rowIndex < maxRows; rowIndex += 1) {
      for (const column of editorialColumns) {
        const item = column[rowIndex];
        if (item) items.push(item);
      }
    }

    return items;
  }, [editorialColumns]);

  return (
    <main className="w-full min-h-full bg-background pb-10 md:pb-14">
      {/* Grid of Stays */}
      {rankedStays.length > 0 ? (
        <>
          {rankedStays.length > 0 && (
            <>
              <div className={cn(UI.stitchPageX, "mb-0 mt-7 md:mb-3 md:mt-12")}>
                <div className="flex flex-col gap-2 pb-0 md:gap-3 md:pb-1 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-1 text-left">
                    <div className="mb-2 flex items-center justify-start gap-2">
                      <Compass className="h-5 w-5 shrink-0 text-primary" />
                      <h2 className="font-sans text-[16px] font-semibold text-foreground">
                        {Boolean(
                          preferences.persona ||
                          preferences.backdrop ||
                          (preferences.priceTier && preferences.priceTier.length > 0 && !preferences.priceTier.includes('All tiers') ? preferences.priceTier.map(t => t.split(' (')[0]).join(', ') : null) ||
                          (preferences.amenities && preferences.amenities.length > 0) ||
                          (preferences.settings && preferences.settings.length > 0)
                        ) ? "Hotels matching your vibe" : "Explore our collection"}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    {(Boolean(
                        preferences.persona ||
                        preferences.backdrop ||
                        (preferences.priceTier && preferences.priceTier.length > 0 && !preferences.priceTier.includes('All tiers') ? preferences.priceTier.map(t => t.split(' (')[0]).join(', ') : null) ||
                        (preferences.amenities && preferences.amenities.length > 0) ||
                        (preferences.settings && preferences.settings.length > 0)
                      ) || isUpdating) ? (
                      <div className="inline-flex items-center gap-2">
                        {isUpdating && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        )}
                        <span className="text-[13px] font-medium italic text-muted-foreground">
                          {rankedStays.length} hotels found
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              
              <section
            className={cn(
              UI.stitchPageX,
              'columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3',
              isUpdating ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100 blur-0',
            )}
          >
            {editorialMobileItems.map((item) => {
              if (!item) return null;
              return (
                <StayCard
                  key={item.stay.id}
                  stay={item.stay}
                  isFavorite={favorites.includes(item.stay.id)}
                  onToggleFavorite={onToggleFavorite}
                  onOpenDetails={onOpenDetails}
                  imageShape={item.imageShape}
                  compact={item.compact}
                  contentMode="teaserCues"
                />
              );
            })}
          </section>
          </>
          )}

          <div ref={loaderRef} className={cn(UI.stitchPageX, 'flex justify-center', (isLoadingMore || hasMore) ? 'mt-12' : '')}>
            {isLoadingMore ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : hasMore ? (
              <div className="h-6" />
            ) : null}
          </div>
        </>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            We haven't curated any hotels matching that exact combination of filters yet. Try widening your search!
          </p>
        </div>
      )}
    </main>
  );
}
