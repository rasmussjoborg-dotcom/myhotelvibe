/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
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
  CornerRightDown,
  Plane,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer as DrawerPrimitive } from 'vaul';
import { DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '../hooks/use-media-query';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { Preferences, QuickRankType, TRIP_PERSONAS, PRICE_TIERS } from '@/src/types';
import { ORIGIN_AIRPORTS, getAirportByIata, searchOriginAirports } from '@/src/lib/airports';

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

function OriginAirportCombobox({
  value,
  onSelect,
  compact = false,
}: {
  value: string;
  onSelect: (iata: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const currentAirport = useMemo(() => getAirportByIata(value) || ORIGIN_AIRPORTS[0], [value]);
  const results = useMemo(() => searchOriginAirports(query), [query]);

  const displayValue = isFocused ? query : `${currentAirport.city} (${currentAirport.iata})`;

  const handleSelect = (iata: string) => {
    onSelect(iata);
    setQuery('');
    setOpen(false);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[0].iata);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  if (isMobile) {
    const mobileChipElement = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group flex flex-col bg-muted/30 text-left relative cursor-pointer w-full',
          compact
            ? 'rounded-full px-6 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.06),0_1px_3px_rgb(0,0,0,0.04)]'
            : 'rounded-[32px] px-7 py-3.5 border border-primary pr-14',
          'transition-all duration-200 hover:bg-muted/40 active:scale-[0.98]',
          open ? 'bg-secondary/10 border-primary ring-2 ring-primary/20' : '',
          'min-w-[180px] snap-start snap-always'
        )}
      >
        {compact ? (
          <div className="flex items-center gap-2 w-full">
            <span className="shrink-0 text-primary [&>svg]:w-[16px] [&>svg]:h-[16px]">
              <Plane className="h-4 w-4" />
            </span>
            <span className="block truncate font-semibold text-[13.5px] leading-none text-foreground">
              {currentAirport.city} ({currentAirport.iata})
            </span>
          </div>
        ) : (
          <div className="w-full">
            <span className="block text-[13px] font-bold leading-none mb-1 text-primary select-none">
              From
            </span>
            <span className="block truncate font-semibold text-[13.5px] leading-tight text-foreground">
              {currentAirport.city} ({currentAirport.iata})
            </span>
            <span className="absolute right-7 top-1/2 -translate-y-1/2 shrink-0 text-primary [&>svg]:h-[16px] [&>svg]:w-[16px] pointer-events-none">
              <Plane className="h-4 w-4" />
            </span>
          </div>
        )}
      </button>
    );

    return (
      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <DrawerTrigger asChild>
          <div>{mobileChipElement}</div>
        </DrawerTrigger>
        <DrawerContent className="h-[75dvh] max-h-[75dvh] border-t border-primary/30 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
          <div className="relative flex h-full flex-col overflow-y-auto no-scrollbar bg-white px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            <div className="flex items-start justify-between pr-8 mb-3">
              <div>
                <span className="sf-kicker block text-primary mb-1 uppercase">From</span>
                <h2 className="font-semibold text-lg text-foreground">Search departure airport</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-white text-primary transition-colors hover:bg-background"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </div>
            <div className="relative w-full mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70 pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city or airport (e.g. Stockholm, Paris, LHR)..."
                className="w-full h-11 pl-10 pr-8 rounded-xl border border-primary/35 bg-white text-[14px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>
            <div className="flex flex-col flex-1 divide-y divide-border/40 overflow-y-auto">
              {results.map((airport) => {
                const isSelected = value === airport.iata;
                return (
                  <button
                    key={airport.iata}
                    type="button"
                    onClick={() => handleSelect(airport.iata)}
                    className={cn(
                      'flex items-center justify-between py-3 text-left transition-colors min-h-[48px]',
                      isSelected ? 'text-primary font-semibold' : 'text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 text-primary shrink-0">
                        <Plane className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold truncate">{airport.city}</span>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {airport.iata}
                          </span>
                        </div>
                        <span className="text-[12px] text-muted-foreground truncate">{airport.name} • {airport.country}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  const desktopChipElement = (
    <div
      onClick={() => {
        inputRef.current?.focus();
        setOpen(true);
      }}
      className={cn(
        'group flex flex-col bg-muted/30 text-left relative cursor-text',
        compact
          ? 'rounded-full px-6 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.06),0_1px_3px_rgb(0,0,0,0.04)] md:rounded-full md:shadow-none md:border md:border-primary md:px-7 md:py-2.5 md:pr-14'
          : 'rounded-[32px] md:rounded-full px-7 py-3.5 border border-primary pr-14',
        'transition-all duration-200 hover:bg-muted/40 active:scale-[0.98]',
        open || isFocused ? 'bg-secondary/10 border-primary ring-2 ring-primary/20' : '',
        'min-w-[180px] md:min-w-0 snap-start snap-always'
      )}
    >
      <div className="w-full">
        <span className="block text-[13px] font-bold leading-none mb-1 text-primary select-none">
          From
        </span>
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder="Type city or airport..."
          onFocus={() => {
            setIsFocused(true);
            setQuery('');
            setOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
            }, 200);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-0 p-0 text-[13.5px] font-semibold text-foreground placeholder:text-muted-foreground/70 focus:outline-none truncate cursor-text leading-tight"
        />
        <span className="absolute right-7 top-1/2 -translate-y-1/2 shrink-0 text-primary [&>svg]:h-[16px] [&>svg]:w-[16px] pointer-events-none">
          <Plane className="h-4 w-4" />
        </span>
      </div>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>{desktopChipElement}</div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={12}
        avoidCollisions={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(480px,calc(100vw-2rem))] rounded-2xl bg-white border border-primary/30 p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50"
      >
        <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-border/50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            {query ? `${results.length} airports matching "${query}"` : 'Popular airport hubs'}
          </span>
          <span className="text-[11px] text-muted-foreground/70">Select to update routes</span>
        </div>

        <div className="flex flex-col max-h-[300px] overflow-y-auto no-scrollbar rounded-xl divide-y divide-border/40 bg-white">
          {results.length > 0 ? (
            results.map((airport) => {
              const isSelected = value === airport.iata;
              return (
                <button
                  key={airport.iata}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(airport.iata);
                  }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 text-left transition-colors cursor-pointer rounded-lg',
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted/40 active:bg-muted/60 text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 text-primary shrink-0">
                      <Plane className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-foreground truncate">{airport.city}</span>
                        <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                          {airport.iata}
                        </span>
                      </div>
                      <span className="text-[11.5px] text-muted-foreground truncate">{airport.name} • {airport.country}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No airports found matching "{query}".
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
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
    preferences.originAirport || 
    preferences.priceTier || 
    currentRank !== 'default'
  );
  const currentOrigin = getAirportByIata(preferences.originAirport || 'LHR');
  const originLabel = currentOrigin ? `${currentOrigin.city} (${currentOrigin.iata})` : 'Select origin';
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
  }, [preferences.persona, preferences.originAirport, preferences.priceTier]);

  const updatePersona = (next: string) => {
    if (next === preferences.persona) return;
    onChange({ persona: next });
  };

  const updateOrigin = (nextIata: string) => {
    if (nextIata === preferences.originAirport) return;
    onChange({ originAirport: nextIata });
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

  const originOptions: ReadonlyArray<ChoiceOption> = ORIGIN_AIRPORTS.map((airport) => ({
    label: `${airport.flag} ${airport.city} (${airport.iata})`,
    icon: <Plane className="h-4 w-4" />
  }));

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
              'flex flex-col mx-auto transition-all w-full relative',
              isStuck
                ? 'md:rounded-full md:bg-white md:px-3 md:py-2 md:shadow-[0_-10px_32px_-10px_rgba(0,0,0,0.18),0_10px_24px_-16px_rgba(24,71,195,0.16)]'
                : 'rounded-[32px] bg-transparent p-0 shadow-none md:rounded-full md:bg-white md:px-4 md:py-3.5 md:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)]',
            )}
          >
            {!isStuck && (
              <div className="absolute -top-7 left-2 md:left-6 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60 select-none">
                Curate your escape <CornerRightDown className="w-3 h-3 text-muted-foreground/40 translate-y-px" />
              </div>
            )}
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

              <OriginAirportCombobox
                value={preferences.originAirport || 'LHR'}
                onSelect={updateOrigin}
                compact={isStuck}
              />

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
