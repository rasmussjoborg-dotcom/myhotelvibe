/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bath,
  Baby,
  Building2,
  CalendarClock,
  Loader2,
  MapPin,
  Moon,
  Heart,
  Palmtree,
  Snowflake,
  Sun,
  Search,
  Sparkles,
  Soup,
  Mountain,
  RotateCcw,
  Trees,
  Wine,
  Gem,
  Camera,
  UserRound,
  Users,
  Users2,
  Waves,
  Check,
  X,
  Filter,
  CalendarDays,
  ArrowUp,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer as DrawerPrimitive } from 'vaul';
import { DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '../hooks/use-media-query';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { Preferences, QuickRankType, TRIP_PERSONAS, BACKDROP_OPTIONS, PRICE_TIERS } from '@/src/types';

function Drawer({
  shouldScaleBackground = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} data-slot="drawer" {...props} />
}

const BriefChip = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> & {
    label: string;
    value: string;
    icon?: React.ReactNode;
    selectedIcon?: React.ReactNode;
    filled?: boolean;
    mutedValue?: boolean;
    compact?: boolean;
    menuOpen?: boolean;
  }
>(function BriefChip({ label, value, icon, selectedIcon, filled = false, mutedValue = false, compact = false, menuOpen = false, className, ...props }, ref) {
  
  return (
    <button
      ref={ref}
      type="button"
      title={`Edit ${label.toLowerCase()}`}
      className={cn(
        'group flex flex-col border border-primary/30 bg-white text-left relative',
        compact 
          ? 'rounded-full px-6 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.06),0_1px_3px_rgb(0,0,0,0.04)] md:rounded-full md:shadow-none md:border md:border-primary/30 md:px-7 md:py-2.5'
          : 'rounded-[32px] md:rounded-full px-7 py-3.5',
        'transition-all duration-200 hover:bg-muted/30 hover:border-primary/50 active:border-primary active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
        menuOpen ? 'bg-secondary/10' : '',
        filled ? 'bg-muted/30' : '',
        filled && !compact ? 'border-primary pr-14' : '',
        filled && compact ? 'md:border-primary md:pr-14' : '',
        'snap-start snap-always',
        className,
      )}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {icon && compact ? (
        <>
          {/* Mobile compact: 1 line */}
          <div className="flex md:hidden items-center gap-2 w-full">
            <span className={cn("shrink-0 [&>svg]:w-[16px] [&>svg]:h-[16px]", filled ? "text-primary" : "text-foreground")}>
              {filled && selectedIcon ? selectedIcon : icon}
            </span>
            <span className={cn('block truncate font-semibold text-[13.5px] leading-none text-foreground')}>
              {value}
            </span>
          </div>
          {/* Desktop compact: 2 lines with original styling */}
          <div className="hidden md:block w-full">
            {icon ? <span className="hidden">{icon}</span> : null}
            <span
              className={cn(
                'block text-[13px] font-bold leading-none',
                'mb-1',
                'text-primary',
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                'block truncate font-normal',
                'text-[13.5px] leading-tight',
                filled ? 'font-semibold text-foreground' : mutedValue ? 'text-muted-foreground/70 italic' : 'text-foreground hover:opacity-80',
              )}
            >
              {value}
            </span>
            {filled && selectedIcon ? (
              <span className="absolute right-7 top-1/2 -translate-y-1/2 shrink-0 text-primary [&>svg]:h-[16px] [&>svg]:w-[16px]">
                {selectedIcon}
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {icon ? <span className="hidden">{icon}</span> : null}
            <span
              className={cn(
                'block text-[13px] font-bold leading-none',
                'mb-1',
                'text-primary',
              )}
            >
              {label}
          </span>
          <span
              className={cn(
                'block truncate font-normal',
                'text-[14.5px] leading-[1.55]',
                filled ? 'font-semibold text-foreground' : mutedValue ? 'text-muted-foreground/70 italic' : 'text-foreground hover:opacity-80',
              )}
            >
              {value}
            </span>
            {filled && selectedIcon && !compact ? (
            <span className="absolute right-7 top-1/2 -translate-y-1/2 shrink-0 text-primary [&>svg]:h-[16px] [&>svg]:w-[16px]">
              {selectedIcon}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
});

function FilterMenu({ 
  children, 
  trigger, 
  title,
  label,
  description,
  sideOffset = 24,
  align = 'start'
}: { 
  children: React.ReactNode; 
  trigger: React.ReactNode; 
  title: string;
  label?: string;
  description?: string;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Provide a function to the children to close the menu
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClose: () => setOpen(false) } as any);
    }
    return child;
  });

  const triggerWithProps = React.isValidElement(trigger)
    ? React.cloneElement(trigger, { menuOpen: open } as any)
    : trigger;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <DrawerTrigger asChild>{triggerWithProps}</DrawerTrigger>
        <DrawerContent className="h-[70dvh] max-h-[70dvh] border-t border-primary/30 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
          <div className="relative flex h-full flex-col overflow-y-auto no-scrollbar bg-white px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            <div className="flex items-start justify-between pr-8 mb-2">
              <div>
                {label && <span className="sf-kicker block text-primary mb-1.5 uppercase">{label}</span>}
                <h2 className="font-semibold text-lg text-foreground">{title}</h2>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-white text-primary transition-colors hover:bg-background"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </div>
            {description && <p className="text-sm text-muted-foreground mb-6 pr-6">{description}</p>}
            {childrenWithProps}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerWithProps}</PopoverTrigger>
      <PopoverContent side="bottom" align={align} sideOffset={sideOffset} className="w-[min(520px,calc(100vw-2rem))] rounded-xl bg-white border border-primary p-3.5">
        {label && <span className="sf-kicker block text-primary mb-0.5 uppercase">{label}</span>}
        <div className="font-sans font-semibold text-[15px] text-foreground mb-2.5">
          {title}
        </div>
        {childrenWithProps}
      </PopoverContent>
    </Popover>
  );
}

type ChoiceOption = { label: string; icon?: React.ReactNode };

function ChoicePills({
  options,
  value,
  onSelect,
  onClose,
}: {
  options: ReadonlyArray<ChoiceOption>;
  value: string;
  onSelect: (next: string) => void;
  onClose?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <div className="flex w-full flex-col">
        {options.map((opt) => {
          const selected = value === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                onSelect(selected ? '' : opt.label);
                onClose?.();
              }}
              className={cn(
                'flex w-full items-center gap-3 border-b border-secondary/40/50 py-4 text-[14px] font-medium transition-all duration-200 ease-out last:border-0',
                selected
                  ? 'text-primary'
                  : 'text-foreground hover:bg-muted/30 active:bg-muted/50',
              )}
            >
              {opt.icon ? <span className={selected ? 'text-primary' : 'text-muted-foreground'}>{opt.icon}</span> : null}
              <span className="flex-1 text-left font-semibold">{opt.label}</span>
              {selected && <Check className="h-5 w-5 text-primary" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.label;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => {
              onSelect(selected ? '' : opt.label);
              onClose?.();
            }}
            className={cn(
              'inline-flex items-center justify-center gap-2 border px-4 py-2 text-[13px] font-semibold transition-all duration-200 ease-out',
              'rounded-full',
              selected
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-white border-primary/35 text-foreground hover:border-primary/50 hover:bg-white active:border-primary active:ring-1 active:ring-primary/30 active:bg-primary/5',
            )}
          >
            {opt.icon ? <span className={selected ? 'text-white' : 'text-primary'}>{opt.icon}</span> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoicePills({
  options,
  value,
  onSelect,
  onClose,
}: {
  options: ReadonlyArray<ChoiceOption>;
  value: string[];
  onSelect: (next: string[]) => void;
  onClose?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <div className="flex w-full flex-col">
        {options.map((opt) => {
          const selected = value.includes(opt.label);
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                if (opt.label === 'All tiers') {
                  onSelect(['All tiers']);
                } else {
                  let nextValue = [...value];
                  if (nextValue.includes('All tiers')) {
                    nextValue = nextValue.filter(v => v !== 'All tiers');
                  }
                  if (selected) {
                    nextValue = nextValue.filter(v => v !== opt.label);
                    if (nextValue.length === 0) nextValue = ['All tiers'];
                  } else {
                    nextValue.push(opt.label);
                  }
                  onSelect(nextValue);
                  onClose?.();
                }
              }}
              className={cn(
                'flex w-full items-center gap-3 border-b border-secondary/40/50 px-2 py-4 text-[14px] font-medium transition-all duration-200 ease-out last:border-0',
                selected
                  ? 'text-primary'
                  : 'text-foreground hover:bg-muted/30 active:bg-muted/50',
              )}
            >
              {opt.icon ? <span className={selected ? 'text-primary' : 'text-muted-foreground'}>{opt.icon}</span> : null}
              <span className="flex-1 text-left font-semibold">{opt.label}</span>
              {selected && <Check className="h-5 w-5 text-primary" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt.label);
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => {
              if (opt.label === 'All tiers') {
                onSelect(['All tiers']);
              } else {
                let nextValue = [...value];
                if (nextValue.includes('All tiers')) {
                  nextValue = nextValue.filter(v => v !== 'All tiers');
                }
                if (selected) {
                  nextValue = nextValue.filter(v => v !== opt.label);
                  if (nextValue.length === 0) nextValue = ['All tiers'];
                } else {
                  nextValue.push(opt.label);
                }
                onSelect(nextValue);
              }
            }}
            className={cn(
              'inline-flex items-center justify-center gap-2 border px-4 py-2 text-[13px] font-semibold transition-all duration-200 ease-out',
              'rounded-full',
              selected
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-white border-primary/35 text-foreground hover:border-primary/50 hover:bg-white active:border-primary active:ring-1 active:ring-primary/30 active:bg-primary/5',
            )}
          >
            {opt.icon ? <span className={selected ? 'text-white' : 'text-primary'}>{opt.icon}</span> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

type BriefStickyBarProps = {
  preferences: Preferences;
  onChange: (update: Partial<Preferences>) => void;
  onReset: () => void;
  stickyEnabled: boolean;
  currentRank?: QuickRankType;
  onRankChange?: (rank: QuickRankType) => void;
  variant?: 'page' | 'hero';
  isStuck?: boolean;
  isUpdating?: boolean;
  className?: string;
};

const BriefStickyBar = forwardRef<HTMLDivElement, BriefStickyBarProps>(function BriefStickyBar(
  {
    preferences,
    onChange,
    onReset,
    stickyEnabled,
    currentRank = 'default',
    onRankChange,
    variant = 'page',
    isStuck = true,
    isUpdating = false,
    className,
  },
  ref,
) {
  const chipRailRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | undefined>(undefined);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    if (isStuck && stickyEnabled) {
      setIsAnimatingIn(true);
      const timer = setTimeout(() => setIsAnimatingIn(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingIn(false);
    }
  }, [isStuck, stickyEnabled]);

  useEffect(() => {
    if (!isStuck && innerRef.current) {
      setNaturalHeight(innerRef.current.offsetHeight);
    }
  }, [isStuck, preferences, variant]);

  const briefStarted = Boolean(
    preferences.persona || 
    preferences.backdrop || 
    preferences.priceTier || 
    currentRank !== 'default'
  );
  const persona = preferences.persona || "What's the feeling?";
  const backdrop = preferences.backdrop || "Where are we heading?";
  const priceTier = preferences.priceTier && preferences.priceTier.length > 0 && !preferences.priceTier.includes('All tiers') 
    ? preferences.priceTier.map(t => t.split(' (')[0]).join(', ') 
    : "All tiers";


  const LENSES: { id: QuickRankType; icon: React.ReactNode; label: string; description: string }[] = [
    { id: 'default', icon: <Sparkles className="h-4 w-4" />, label: 'Best match', description: 'Best overall fit for your brief' },
    { id: 'spa', icon: <Bath className="h-4 w-4" />, label: 'Bathrobe mode', description: 'Prioritizes wellness, saunas, and massages' },
    { id: 'food', icon: <Wine className="h-4 w-4" />, label: 'Always eating', description: 'Prioritizes fine dining and culinary experiences' },
    { id: 'aesthetic', icon: <Camera className="h-4 w-4" />, label: 'Magazine material', description: 'Highly visual, design-forward spaces' },
    { id: 'secluded', icon: <Trees className="h-4 w-4" />, label: 'Zero reception', description: 'Total seclusion and privacy' },
    { id: 'luxury', icon: <Gem className="h-4 w-4" />, label: 'Blank check', description: 'Pure, unadulterated luxury' },
  ];

  const activeLens = LENSES.find(l => l.id === currentRank) || LENSES[0];

  useEffect(() => {
    const rail = chipRailRef.current;
    if (!rail) return;

    const raf = window.requestAnimationFrame(() => {
      const el = chipRailRef.current;
      if (!el) return;

      if (el.scrollWidth <= el.clientWidth + 2) {
        el.scrollTo({ left: 0 });
        return;
      }

      const chips = Array.from(el.querySelectorAll<HTMLElement>('[data-sf-brief-chip="true"]'));
      if (chips.length === 0) return;

      const current = el.scrollLeft;
      let closest = chips[0];
      let closestDist = Math.abs(closest.offsetLeft - current);
      for (const chip of chips) {
        const dist = Math.abs(chip.offsetLeft - current);
        if (dist < closestDist) {
          closest = chip;
          closestDist = dist;
        }
      }

      if (closestDist > 2) {
        el.scrollTo({ left: closest.offsetLeft, behavior: 'smooth' });
      }
    });

    return () => window.cancelAnimationFrame(raf);
  }, [preferences.persona, preferences.backdrop, preferences.priceTier]);

  const updatePersona = (next: string) => {
    if (next === preferences.persona) return;
    onChange({ persona: next });
  };

  const updateBackdrop = (next: string) => {
    if (next === preferences.backdrop) return;
    onChange({ backdrop: next });
  };

  const updatePriceTier = (next: string[]) => {
    // If the array is exactly the same, do nothing
    if (next.length === preferences.priceTier.length && next.every(v => preferences.priceTier.includes(v))) return;
    onChange({ priceTier: next });
  };

  const personaOptions: ReadonlyArray<ChoiceOption> = [
    { label: 'The Romantic Reset', icon: <Heart className="h-4 w-4" /> },
    { label: 'The Social Weekender', icon: <Users2 className="h-4 w-4" /> },
    { label: 'The Urban Explorer', icon: <Building2 className="h-4 w-4" /> },
    { label: 'The Creative Retreat', icon: <Sparkles className="h-4 w-4" /> },
    { label: 'The Epicurean Pilgrimage', icon: <Wine className="h-4 w-4" /> },
    { label: 'The Sun-Drenched Escape', icon: <Sun className="h-4 w-4" /> },
  ];

  const backdropOptions: ReadonlyArray<ChoiceOption> = [
    { label: 'Pristine Shores', icon: <Sun className="h-4 w-4" /> },
    { label: 'Iconic Cities', icon: <Building2 className="h-4 w-4" /> },
    { label: 'Alpine & Peaks', icon: <Mountain className="h-4 w-4" /> },
    { label: 'Remote Sanctuaries', icon: <Trees className="h-4 w-4" /> },
    { label: 'Exclusive Islands', icon: <Palmtree className="h-4 w-4" /> },
    { label: 'Lakeside Estates', icon: <Waves className="h-4 w-4" /> },
    { label: 'Desert Oases', icon: <MapPin className="h-4 w-4" /> },
    { label: 'Winter Escapes', icon: <Snowflake className="h-4 w-4" /> },
  ];

  const priceTierOptions: ReadonlyArray<ChoiceOption> = [
    { label: 'All tiers', icon: <Gem className="h-4 w-4" /> },
    ...PRICE_TIERS.map(label => ({
      label,
      icon: <Gem className="h-4 w-4" />
    }))
  ];



  const content = (
        <div 
          ref={innerRef}
          className={cn(
          "w-full transition-all duration-300 flex flex-col items-center justify-start",
          isStuck && stickyEnabled ? "fixed bottom-1 left-0 right-0 w-full z-[90] translate-z-0 pointer-events-none md:bottom-2 md:top-auto md:pointer-events-auto md:pr-[var(--sf-scrollbar-width)]" : "bg-transparent",
          isAnimatingIn ? "animate-in fade-in slide-in-from-bottom-8 duration-300" : "",
          className
        )}
        >
        <div className={cn(
          variant === 'page' && !isStuck ? UI.stitchPageX : 'px-7 md:px-10', 
          isStuck ? 'pt-0 pb-0 pl-0 pr-0 w-full pointer-events-auto md:w-[95%] md:px-[60px] md:max-w-[1330px] md:mx-auto' : 'py-0', 
          'relative w-full'
        )}>
          <div
            className={cn(
              'flex flex-col mx-auto transition-all w-full',
              isStuck
                ? 'md:rounded-full md:bg-white md:px-3 md:py-2 md:shadow-[0_-10px_32px_-10px_rgba(0,0,0,0.18),0_10px_24px_-16px_rgba(24,71,195,0.16)]'
                : 'rounded-[32px] bg-transparent p-0 shadow-none md:rounded-full md:bg-white md:px-4 md:py-3.5 md:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)]',
            )}
          >
            <div className={cn('flex w-full flex-1', isStuck ? 'flex-col md:flex-row md:gap-1' : 'flex-col md:flex-row gap-2')}>
              <div
                ref={chipRailRef}
                className={cn(
                  'min-w-0 flex-1',
                  isStuck 
                    ? 'flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 pb-1 md:pb-0 md:px-0 md:grid md:grid-cols-3 md:gap-1 w-full'
                    : 'grid grid-cols-1 md:grid-cols-3 gap-2'
                )}
              >
              {isStuck && <div className="shrink-0 w-3 md:hidden" aria-hidden />}
              <FilterMenu 
                title="What's the feeling?" 
                label="Vibe"
                description="Tell us your vibe and we'll curate the perfect escape."
                align="start"
                trigger={
                  <BriefChip
                    data-sf-brief-chip="true"
                    className={cn("min-w-[180px] md:min-w-0")}
                    label="Vibe"
                    value={preferences.persona || "What's the feeling?"}
                    icon={<Sparkles className="h-4 w-4" />}
                    selectedIcon={personaOptions.find((o) => o.label === preferences.persona)?.icon}
                    filled={Boolean(preferences.persona)}
                    mutedValue={!preferences.persona}
                    compact={isStuck}
                  />
                }
              >
                <ChoicePills
                  options={personaOptions}
                  value={preferences.persona}
                  onSelect={updatePersona}
                />
              </FilterMenu>

              <FilterMenu 
                title="Where to?" 
                label="Backdrop"
                align="center"
                trigger={
                  <BriefChip
                    data-sf-brief-chip="true"
                    className="min-w-[180px] md:min-w-0"
                    label="Backdrop"
                    value={preferences.backdrop || "What's the backdrop?"}
                    icon={<MapPin className="h-4 w-4" />}
                    selectedIcon={backdropOptions.find((o) => o.label === preferences.backdrop)?.icon}
                    filled={Boolean(preferences.backdrop)}
                    mutedValue={!preferences.backdrop}
                    compact={isStuck}
                  />
                }
              >
                <ChoicePills
                  options={backdropOptions}
                  value={preferences.backdrop}
                  onSelect={updateBackdrop}
                />
              </FilterMenu>

              <FilterMenu 
                title="What's your budget?" 
                label="Price Tier"
                description="We'll show you places that match your price point."
                align="end"
                trigger={
                  <BriefChip
                    data-sf-brief-chip="true"
                    className={cn("min-w-[160px] md:min-w-0", isStuck ? "mr-5 md:mr-0" : "")}
                    label="Price Tier"
                    value={preferences.priceTier.length > 0 ? preferences.priceTier.join(', ') : "What's the budget?"}
                    icon={<Gem className="h-4 w-4" />}
                    selectedIcon={priceTierOptions.find((o) => preferences.priceTier.includes(o.label))?.icon}
                    filled={preferences.priceTier.length > 0}
                    mutedValue={preferences.priceTier.length === 0}
                    compact={isStuck}
                  />
                }
              >
                <MultiChoicePills
                  options={priceTierOptions}
                  value={preferences.priceTier}
                  onSelect={updatePriceTier}
                />
              </FilterMenu>
              </div>
              </div>
          </div>
        </div>
      </div>
  );

  return (
    <section 
      ref={ref} 
      className={cn('mb-4 w-full max-w-full bg-transparent md:mb-8', className)}
      style={{ minHeight: isStuck ? naturalHeight : undefined }}
    >
      {isStuck && stickyEnabled ? createPortal(content, document.body) : content}
    </section>
  );
});

export default BriefStickyBar;
