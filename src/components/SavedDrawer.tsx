import React, { useState } from 'react';
import { Asterisk, Heart, MapPin, X } from 'lucide-react';
import { Stay } from '../types';
import { Button } from '@/components/ui/button';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { getStayCardBodyCopy } from '../lib/stayCardCopy';

interface SavedDrawerProps {
  savedStays: Stay[];
  onClose: () => void;
  onToggleFavorite: (e: any, id: string) => void;
  onOpenDetails: (stay: Stay) => void;
}

function formatSignalLabel(value: string) {
  return value
    .replace(/\bspa focus\b/i, 'Spa')
    .replace(/\bbeach & sun\b/i, 'Beach')
    .replace(/\bfood & wine\b/i, 'Food')
    .replace(/\bfeel fancy\b/i, 'High glam')
    .replace(/\bnature reset\b/i, 'Nature')
    .replace(/\bcity break\b/i, 'City break');
}

function getSavedNotes(stay: Stay) {
  const cues = [
    stay.settings?.[0],
    stay.amenities?.[0],
    stay.tags?.[1],
    stay.priceTier?.split(' (')[0],
  ]
    .filter(Boolean)
    .map(formatSignalLabel);

  return [...new Set(cues)].slice(0, 2);
}

function getSavedBodyCopy(stay: Stay) {
  return getStayCardBodyCopy(stay) || 'Saved for a closer look.';
}

function cleanHotelName(rawName: string, location: string) {
  let name = rawName;
  const cityMatch = location.split(',')[0].trim();

  name = name.replace(/\s*[-|]\s*adults?\s*(only|friendly)/i, '');
  name = name.replace(/\s*\(\s*adults?\s*(only|friendly)\s*\)/i, '');

  if (cityMatch) {
    const safeCity = cityMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cityRegex = new RegExp(`\\s*[-|]\\s*${safeCity}$`, 'i');
    name = name.replace(cityRegex, '');
  }

  return name.trim();
}

function SavedHotelCard({
  stay,
  onOpen,
  onToggleFavorite,
}: {
  stay: Stay;
  onOpen: () => void;
  onToggleFavorite: (e: any, id: string) => void;
}) {
  const notes = getSavedNotes(stay);
  const bodyCopy = getSavedBodyCopy(stay);
  const hotelName = cleanHotelName(stay.name, stay.location);

  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer rounded-[20px] border border-primary/15 bg-white p-3 transition-colors duration-200 hover:border-primary/35 hover:bg-primary/[0.02]"
    >
      <div className="grid gap-4 md:grid-cols-[176px_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-2xl bg-muted/30">
          <div className="aspect-[4/5] w-full overflow-hidden">
            <img
              src={stay.image}
              alt={stay.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between">
          <div>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                {stay.priceTier ? (
                  <div className="mb-2 inline-flex rounded-full bg-muted/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    {stay.priceTier.split(' (')[0]}
                  </div>
                ) : null}
                <h3 className="font-display text-[28px] leading-[1.04] text-foreground md:text-[32px]">
                  {hotelName}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/56">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/55" />
                  <span className="truncate">{stay.location}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(e, stay.id);
                }}
                className="shrink-0 h-10 w-10 rounded-full border border-primary bg-white text-accent transition-colors hover:bg-background flex items-center justify-center"
                aria-label="Remove from saved"
              >
                <Heart className="h-5 w-5 fill-current text-accent" />
              </button>
            </div>

            {notes.length > 0 ? (
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-primary/78 md:text-[13px]">
                {notes.map((note) => (
                  <span key={note} className="inline-flex items-center gap-1.5">
                    <Asterisk className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <span className="font-medium">{note}</span>
                  </span>
                ))}
              </div>
            ) : null}

            <p className="max-w-none text-[14px] italic leading-[1.75] text-foreground/66 md:text-[15px]">
              {bodyCopy}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function SavedDrawer({ savedStays, onClose, onToggleFavorite, onOpenDetails }: SavedDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = (callback?: () => void) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      if (callback) callback();
    }, 300);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col md:flex-row fill-mode-forwards',
        isClosing ? 'animate-out fade-out duration-300 ease-out' : 'animate-in fade-in duration-200 ease-out'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Saved Hotels"
    >
      <div
        className="absolute inset-0 bg-transparent backdrop-blur-[4px] [-webkit-backdrop-filter:blur(4px)] md:bg-black/70 md:backdrop-blur-none"
        onClick={() => handleClose()}
      />

        <div
          className={cn(
          'relative w-full md:w-1/2 overflow-hidden flex flex-col z-10 bg-[#F5F0F0] md:bg-white border-t border-primary/20 md:border-t-0',
          'mt-auto h-[92vh] rounded-t-[32px] md:mt-0 md:h-full md:ml-auto md:rounded-none',
          'shadow-[0_-12px_40px_rgba(0,0,0,0.08)] md:shadow-2xl duration-300 ease-out fill-mode-forwards',
          isClosing ? 'animate-out slide-out-to-bottom-[100%] md:slide-out-to-right-[100%] md:slide-out-to-bottom-0' : 'animate-in slide-in-from-bottom-[100%] md:slide-in-from-right-[100%] md:slide-in-from-bottom-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-40">
          <Button
            onClick={() => handleClose()}
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              'bg-white border-primary text-primary hover:bg-background transition-colors duration-150 ease-out',
              UI.pillRadius
            )}
            aria-label="Close saved drawer"
          >
            <X className="w-5 h-5 text-primary" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 bg-white rounded-t-[32px] pb-[100px]">
          <div className="w-full flex flex-col gap-6">
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 pb-5 pt-4 md:px-8 md:pt-12 border-b border-primary/12">
              <div className="mx-auto mb-4 h-1.5 w-[56px] rounded-full bg-foreground/14 md:hidden" />
              <h2 className="font-display text-[36px] md:text-[44px] leading-[1.05] text-foreground tracking-tight mb-3">
                My Hotels
              </h2>
              <p className="max-w-[42ch] text-[15px] font-medium leading-[1.6] text-foreground/72">
                Your saved shortlist for a closer look.
              </p>
            </div>

            <div className="px-6 md:px-8">
              {savedStays.length === 0 ? (
                <div className="py-14 flex flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-primary/12 bg-primary/[0.05]">
                  <Heart className="h-8 w-8 text-primary/55" />
                </div>
                <h3 className="font-display text-[28px] leading-none text-foreground mb-2">Nothing saved yet</h3>
                <p className="max-w-[24ch] text-[15px] font-medium leading-[1.6] text-foreground/68">
                  Tap the heart on any stay you want to revisit later.
                </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-[100px]">
                  {savedStays.map((stay) => (
                    <SavedHotelCard
                      key={stay.id}
                      stay={stay}
                      onOpen={() => handleClose(() => onOpenDetails(stay))}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
