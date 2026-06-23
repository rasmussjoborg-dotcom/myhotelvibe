/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Compass, Heart, Info, Menu, Shield, X } from 'lucide-react';
import { Preferences } from '../types';
import { Drawer, DrawerContent } from '../../components/ui/drawer';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';

const HERO_PROMPTS = [
  "What's your hotel vibe?",
  "I'm in the mood for...",
  "Looking for that...",
  "Currently craving...",
  "Nothing beats..."
];

const HERO_TICKER_LINES = [
  'Italian summer.',
  'Mid-century cabin.',
  '$8 lattes.',
  'Brutalist hideaway.',
  'Doing nothing.',
  'Zero cell service.',
  'Strategic naps.',
  'Slow mornings.',
  'Ignoring emails.',
  'Linen everything.',
  'Pretending to read.',
  'Bougie wilderness.',
  'Natural wine.',
  'Tasteful nudity.',
  'Breakfast in bed.',
  'Marble bathrooms.',
  'Aperitivo hour.',
  'No kids allowed.',
  'Lakeside silence.',
  'Room service fries.',
  'Cathedral ceilings.',
  'Saltwater mornings.',
  'Long lunch energy.',
  'Fireplace season.',
];

export default function SearchSection({
  preferences: _preferences,
  onOpenSaved,
  isSavedOpen,
  isAdminOpen,
  isAboutOpen,
  isAdminAvailable = false,
  onOpenAdmin,
  onOpenAbout,
  onGoHome,
  isScrolled,
}: {
  preferences: Preferences;
  onOpenSaved?: () => void;
  isSavedOpen?: boolean;
  isAdminOpen?: boolean;
  isAboutOpen?: boolean;
  isAdminAvailable?: boolean;
  onOpenAdmin?: () => void;
  onOpenAbout?: () => void;
  onGoHome?: () => void;
  isScrolled?: boolean;
}) {
  const [heroPrompt] = useState(() => HERO_PROMPTS[Math.floor(Math.random() * HERO_PROMPTS.length)]);
  const tickerLoop = [...HERO_TICKER_LINES, HERO_TICKER_LINES[0]];
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);
  const [tickerTransitionEnabled, setTickerTransitionEnabled] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosingMobileMenu, setIsClosingMobileMenu] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTickerIndex((prev) => prev + 1);
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (currentTickerIndex !== HERO_TICKER_LINES.length) return;

    const resetTimer = window.setTimeout(() => {
      setTickerTransitionEnabled(false);
      setCurrentTickerIndex(0);
    }, 700);

    return () => window.clearTimeout(resetTimer);
  }, [currentTickerIndex]);

  useEffect(() => {
    if (tickerTransitionEnabled) return;

    const rafId = window.requestAnimationFrame(() => {
      setTickerTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [tickerTransitionEnabled]);

  const closeMobileMenu = (callback?: () => void) => {
    if (isClosingMobileMenu) return;
    setIsClosingMobileMenu(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosingMobileMenu(false);
      if (callback) callback();
    }, 300);
  };

  const navLinks = ['Home', 'My Hotels', ...(isAdminAvailable ? ['Admin'] : []), 'About'];
  const navItems = [
    { label: 'Home', icon: Compass },
    { label: 'My Hotels', icon: Heart },
    ...(isAdminAvailable ? [{ label: 'Admin', icon: Shield }] : []),
    { label: 'About', icon: Info },
  ];

  return (
    <div className="relative w-full overflow-hidden pb-8">
      <header className="flex w-full items-center justify-between border-none bg-transparent px-5 py-4 transition-colors duration-300 md:px-10 relative z-10">
        <button
          type="button"
          className="font-display absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 text-[24px] md:text-[26px] font-bold leading-none tracking-[-0.04em] text-foreground"
          aria-label="My Hotel Vibe home"
        >
          My Hotel Vibe
        </button>

        <nav className="hidden items-center gap-8 md:flex absolute left-1/2 -translate-x-1/2">
          {navLinks.map((item) => {
            const isActive =
              item === 'My Hotels'
                ? isSavedOpen
                : item === 'Home'
                  ? !isSavedOpen && !isAdminOpen && !isAboutOpen
                  : item === 'Admin'
                    ? isAdminOpen
                    : item === 'About'
                      ? isAboutOpen
                      : false;
            
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  if (item === 'My Hotels' && onOpenSaved) {
                    onOpenSaved();
                  } else if (item === 'Admin' && onOpenAdmin) {
                    onOpenAdmin();
                  } else if (item === 'About' && onOpenAbout) {
                    onOpenAbout();
                  } else if (item === 'Home' && onGoHome) {
                    onGoHome();
                  }
                }}
                className={cn(
                  'relative text-[13px] font-semibold leading-[1.4] transition-colors',
                  isActive ? 'font-bold text-primary' : 'text-on-border hover:text-primary',
                )}
              >
                {item}
                {isActive ? (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                ) : null}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary bg-white text-primary transition-all duration-300 ease-out hover:bg-background hover:scale-105 active:scale-95 cursor-pointer relative z-10"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {isMobileMenuOpen && (
        <Drawer open={isMobileMenuOpen} onOpenChange={(open) => !open && closeMobileMenu()} shouldScaleBackground={false}>
          <DrawerContent className="h-[70dvh] max-h-[70dvh] border-t border-primary/30 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
            <div className="relative flex h-full flex-col overflow-y-auto no-scrollbar bg-white px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
              <div className="relative mb-2 flex items-start justify-between pr-8">
                <div>
                  <span className="sf-kicker block text-primary mb-1.5 uppercase">Menu</span>
                  <h2 className="font-sans text-lg font-semibold text-foreground">My Hotel Vibe</h2>
                </div>
                <button
                  onClick={() => closeMobileMenu()}
                  className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-white text-primary transition-colors hover:bg-background"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>
              </div>

              <nav className="mt-4 flex flex-col">
                {navItems.map(({ label, icon: Icon }) => {
                  const isActive =
                    label === 'My Hotels'
                      ? isSavedOpen
                      : label === 'Home'
                        ? !isSavedOpen && !isAdminOpen && !isAboutOpen
                        : label === 'Admin'
                          ? isAdminOpen
                          : label === 'About'
                            ? isAboutOpen
                            : false;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        if (label === 'My Hotels' && onOpenSaved) {
                          closeMobileMenu(() => onOpenSaved());
                          return;
                        } else if (label === 'Admin' && onOpenAdmin) {
                          closeMobileMenu(() => onOpenAdmin());
                          return;
                        } else if (label === 'About' && onOpenAbout) {
                          closeMobileMenu(() => onOpenAbout());
                          return;
                        } else if (label === 'Home' && onGoHome) {
                          closeMobileMenu(() => onGoHome());
                          return;
                        }
                        closeMobileMenu();
                      }}
                      className={cn(
                        'flex min-h-[54px] items-center gap-3 border-b border-border/60 text-left text-[17px] font-semibold leading-[1.4] transition-colors',
                        isActive ? 'text-primary' : 'text-foreground hover:text-primary'
                      )}
                    >
                      <Icon className={cn('h-[17px] w-[17px] shrink-0', isActive ? 'text-primary' : 'text-foreground/82')} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <section className={cn(UI.stitchPageX, 'flex flex-col items-center justify-center pt-12 md:pt-24 pb-12 md:pb-20 relative z-10')}>
        <div className="flex flex-col items-center w-full max-w-4xl">
          <h1 className="font-display leading-[1.1] text-balance md:tracking-[-0.02em] flex flex-col items-center gap-y-2">
            <span className="text-[16px] md:text-[22px] text-foreground font-sans font-normal tracking-normal">{heroPrompt}</span>
            <span className="inline-block overflow-hidden align-bottom h-[1.2em] relative text-[44px] md:text-[80px] text-primary">
              <span
                className="flex flex-col gap-[0.4em] text-center min-w-max"
                style={{
                  transform: `translateY(calc(${currentTickerIndex} * -1.6em))`,
                  transition: tickerTransitionEnabled ? 'transform 700ms cubic-bezier(0.7, 0, 0.3, 1)' : 'none',
                  willChange: 'transform',
                }}
              >
                {tickerLoop.map((line, index) => (
                  <span key={`${line}-${index}`} className="block h-[1.2em]">
                    {line}
                  </span>
                ))}
              </span>
            </span>
          </h1>
        </div>
      </section>
    </div>
  );
}
