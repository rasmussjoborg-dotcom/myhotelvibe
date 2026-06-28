/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Preferences, QuickRankType, Stay } from './types';
import { runWalledGardenSearch } from './lib/walledGardenSearch';
import Shortlist from './components/Shortlist';
import CollectionIntro from './components/CollectionIntro';
import CollectionSeoFooter from './components/CollectionSeoFooter';
import HomeCollectionHub from './components/HomeCollectionHub';
import SearchSection from './components/SearchSection';
import BriefStickyBar from './components/BriefStickyBar';
import SmartLoader from './components/SmartLoader';
import { fetchHotels } from './lib/api';
import { UI } from '@/lib/ui';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from './hooks/use-media-query';
import { applySeo, buildCollectionSeo, buildHomeSeo, buildHotelSeo } from './lib/seo';
import { buildHotelPath, getHotelSlug } from './lib/site';
import { getCollectionRouteFromPath, matchesCollectionRoute } from './lib/collections';
import { isLocalAdminEnabled } from './lib/runtime';

import React from 'react';

type AppTab = 'discover' | 'design' | 'admin';

class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[AdminErrorBoundary] Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8 text-center">
          <div className="text-4xl">⚠️</div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Admin panel crashed</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Something went wrong in the Curation Studio. Your data is safe — the error was contained.
            </p>
            {this.state.error && (
              <pre className="mt-3 text-xs text-left bg-muted/60 rounded-xl p-4 max-w-md overflow-auto text-red-600">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); }}
              className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              Try again
            </button>
            <button
              onClick={this.props.onReset}
              className="px-5 py-2 rounded-full border border-border text-sm font-medium hover:bg-muted"
            >
              Back to discover
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_PREFERENCES: Preferences = {
  persona: '',
  backdrop: '',
  priceTier: ['All tiers'],
  amenities: [],
  settings: [],
};

const PREFERENCES_STORAGE_KEY = 'stayfirst_preferences_stitch_v3';
const RANK_STORAGE_KEY = 'stayfirst_rank_v1';

const safeStorageGet = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (e.g. file:// opaque origin).
  }
};

const loadPreferences = () => {
  const raw = safeStorageGet(PREFERENCES_STORAGE_KEY);
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PREFERENCES;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      amenities: Array.isArray(parsed.amenities) ? (parsed.amenities as any) : [],
      settings: Array.isArray(parsed.settings) ? (parsed.settings as any) : [],
      persona: typeof parsed.persona === 'string' ? parsed.persona : '',
      backdrop: typeof parsed.backdrop === 'string' ? parsed.backdrop : '',
      priceTier: Array.isArray(parsed.priceTier) ? parsed.priceTier : ['All tiers'],
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const getHotelSlugFromPath = (pathname?: string) => {
  if (typeof window === 'undefined' && !pathname) return null;
  const targetPath = pathname || window.location.pathname;
  const match = targetPath.match(/^\/hotels\/([^/]+)\/?$/i);
  return match?.[1] ?? null;
};

const SavedDrawer = lazy(() => import('./components/SavedDrawer'));
const AboutDrawer = lazy(() => import('./components/AboutDrawer'));
const DetailModal = lazy(() => import('./components/DetailModal'));
const HotelDetailBoundary = lazy(() => import('./components/HotelDetailBoundary'));
const DesignSystemPage = lazy(() => import('./components/DesignSystemPage'));
const CurationStudio = lazy(() => import('./components/CurationStudio'));

export default function App() {
  const localAdminEnabled = isLocalAdminEnabled();
  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    return (safeStorageGet('stayfirst_current_tab') as AppTab) || 'discover';
  });
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isAboutDrawerOpen, setIsAboutDrawerOpen] = useState(false);
  const discoverScrollRef = useRef<HTMLDivElement | null>(null);
  const [discoverScrollEl, setDiscoverScrollEl] = useState<HTMLDivElement | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = safeStorageGet('stayfirst_favorites');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stays, setStays] = useState<Stay[]>([]);
  const [allStays, setAllStays] = useState<Stay[]>([]);
  const [isLoadingStays, setIsLoadingStays] = useState(true);
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const initialHotelSlugRef = useRef<string | null>(getHotelSlugFromPath(pathname));

  useEffect(() => {
    fetchHotels().then(data => setAllStays(data));
  }, []);

  const [activeStay, setActiveStay] = useState<Stay | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());
  const [appliedPreferences, setAppliedPreferences] = useState<Preferences>(() => loadPreferences());

  const activeCollectionRoute = useMemo(() => getCollectionRouteFromPath(pathname), [pathname]);
  const routeScopedStays = useMemo(() => {
    if (!activeCollectionRoute) return allStays;
    return allStays.filter((stay) => matchesCollectionRoute(stay, activeCollectionRoute));
  }, [activeCollectionRoute, allStays]);

  useEffect(() => {
    async function load() {
      // If NO exact brief options are applied, return top stays
      if (!appliedPreferences.backdrop && !appliedPreferences.persona && appliedPreferences.priceTier.includes('All tiers')) {
        setStays(routeScopedStays);
        setIsLoadingStays(routeScopedStays.length === 0 && allStays.length === 0);
        return;
      }
      setIsLoadingStays(true);
      const data = await runWalledGardenSearch(appliedPreferences, routeScopedStays);
      setStays(data);
      setIsLoadingStays(false);
    }
    load();
  }, [appliedPreferences, allStays, routeScopedStays]);

  const handleTrendSelect = (backdrop: string, persona: string) => {
    const newPrefs = { ...preferences, backdrop, persona };
    setPreferences(newPrefs);
    setAppliedPreferences(newPrefs);

    
    // Scroll to results
    if (discoverScrollRef.current) {
      discoverScrollRef.current.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const [currentRank, setCurrentRank] = useState<QuickRankType>(() => {
    const saved = safeStorageGet(RANK_STORAGE_KEY);
    if (
      saved === 'spa' ||
      saved === 'luxury' ||
      saved === 'secluded' ||
      saved === 'food' ||
      saved === 'aesthetic' ||
      saved === 'default'
    ) {
      return saved;
    }
    return 'default';
  });

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimerRef = useRef<number | null>(null);
  const [briefBarStuck, setBriefBarStuck] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const briefBarRef = useRef<HTMLDivElement | null>(null);
  const briefBarStuckRef = useRef(false);
  const isScrolledRef = useRef(false);
  const showBackToTopRef = useRef(false);
  useEffect(() => {
    safeStorageSet('stayfirst_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    safeStorageSet(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    safeStorageSet(RANK_STORAGE_KEY, currentRank);
  }, [currentRank]);

  useEffect(() => {
    const hasSearchStarted = Boolean(preferences.backdrop && preferences.persona);

    if (!hasSearchStarted) {
      if (updateTimerRef.current) window.clearTimeout(updateTimerRef.current);
      updateTimerRef.current = null;
      setIsUpdating(false);
      setAppliedPreferences(preferences);
      return;
    }

    setIsUpdating(true);
    if (updateTimerRef.current) window.clearTimeout(updateTimerRef.current);

    const nextPreferences = preferences;
    updateTimerRef.current = window.setTimeout(() => {
      setAppliedPreferences(nextPreferences);
      setIsUpdating(false);
    }, 520);

    return () => {
      if (updateTimerRef.current) window.clearTimeout(updateTimerRef.current);
      updateTimerRef.current = null;
    };
  }, [
    preferences.persona,
    preferences.backdrop,
    preferences.priceTier,
    preferences.amenities,
    preferences.settings,
  ]);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        // Use window scroll on mobile, discoverScrollEl on desktop
        const isDesktop = window.innerWidth >= 768;
        const scrollTop = isDesktop && discoverScrollEl ? discoverScrollEl.scrollTop : window.scrollY;
        
        if (briefBarRef.current) {
          const bar = briefBarRef.current;
          const rootTop = isDesktop && discoverScrollEl ? discoverScrollEl.getBoundingClientRect().top : 0;
          const barBottom = bar.getBoundingClientRect().bottom;
          const nextBriefBarStuck = barBottom <= rootTop + 0.5;
          if (briefBarStuckRef.current !== nextBriefBarStuck) {
            briefBarStuckRef.current = nextBriefBarStuck;
            setBriefBarStuck(nextBriefBarStuck);
          }
        }
        const nextIsScrolled = scrollTop > 50;
        if (isScrolledRef.current !== nextIsScrolled) {
          isScrolledRef.current = nextIsScrolled;
          setIsScrolled(nextIsScrolled);
        }

        const nextShowBackToTop = scrollTop > 400;
        if (showBackToTopRef.current !== nextShowBackToTop) {
          showBackToTopRef.current = nextShowBackToTop;
          setShowBackToTop(nextShowBackToTop);
        }
      });
    };

    const targetEl = window.innerWidth >= 768 && discoverScrollEl ? discoverScrollEl : window;
    targetEl.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      targetEl.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [discoverScrollEl]);

  const handlePreferencesChange = (update: Partial<Preferences>) => {
    setPreferences((prev) => ({ ...prev, ...update }));
  };

  const resetBrief = () => {
    if (updateTimerRef.current) window.clearTimeout(updateTimerRef.current);
    updateTimerRef.current = null;
    setPreferences(DEFAULT_PREFERENCES);
    setAppliedPreferences(DEFAULT_PREFERENCES);
    setCurrentRank('default');
    setIsUpdating(false);
  };

  const setTab = (nextTab: AppTab) => {
    if (nextTab === 'admin' && !localAdminEnabled) {
      setCurrentTab('discover');
      safeStorageSet('stayfirst_current_tab', 'discover');
      return;
    }

    setCurrentTab(nextTab);

    if (nextTab === 'design') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'design');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    safeStorageSet('stayfirst_current_tab', nextTab);
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);

    if (nextTab === 'discover') {
      discoverScrollEl?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!localAdminEnabled && currentTab === 'admin') {
      setCurrentTab('discover');
      safeStorageSet('stayfirst_current_tab', 'discover');
    }
  }, [currentTab, localAdminEnabled]);

  useEffect(() => {
    if (!discoverScrollEl) return;
    const updateScrollbarWidth = () => {
      const clientW = discoverScrollEl.clientWidth;
      const sw = window.innerWidth - clientW;
      document.body.style.setProperty('--sf-scrollbar-width', `${sw}px`);
      
      if (clientW > 1400) {
        document.body.style.setProperty('--sf-exact-margin', `${Math.floor((clientW - 1400) / 2)}px`);
      } else {
        document.body.style.setProperty('--sf-exact-margin', '0px');
      }
    };
    updateScrollbarWidth();
    const observer = new ResizeObserver(updateScrollbarWidth);
    observer.observe(discoverScrollEl);
    return () => observer.disconnect();
  }, [discoverScrollEl]);

  const handleToggleFavorite = (e: any, id: string) => {
    if (typeof e !== 'string') e.stopPropagation();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
  };

  const closeActiveStay = () => {
    setActiveStay(null);

    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/hotels/')) {
      window.history.pushState({}, '', '/');
    }
    setPathname('/');
  };

  const savedStays = useMemo(
    () => stays.filter((stay) => favorites.includes(stay.id)),
    [favorites, stays],
  );

  useEffect(() => {
    applySeo(buildHomeSeo(allStays));
  }, [allStays]);

  useEffect(() => {
    if (!allStays.length) return;
    const slug = initialHotelSlugRef.current;
    if (!slug) return;

    const matchedStay = allStays.find((stay) => getHotelSlug(stay) === slug);
    if (matchedStay) {
      setActiveStay(matchedStay);
    }
    initialHotelSlugRef.current = null;
  }, [allStays]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const nextPathname = window.location.pathname;
      setPathname(nextPathname);

      if (!getHotelSlugFromPath(nextPathname)) {
        setActiveStay(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!allStays.length) return;

    const slug = getHotelSlugFromPath(pathname);
    if (!slug) {
      return;
    }

    const matchedStay = allStays.find((stay) => getHotelSlug(stay) === slug) || null;
    if (matchedStay?.id !== activeStay?.id) {
      setActiveStay(matchedStay);
    }
  }, [activeStay, allStays, pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (activeStay) {
      const nextPath = buildHotelPath(getHotelSlug(activeStay));
      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath);
        setPathname(nextPath);
      }
      applySeo(buildHotelSeo(activeStay));
      return;
    }

    if (activeCollectionRoute) {
      applySeo(buildCollectionSeo(activeCollectionRoute, routeScopedStays));
      return;
    }

    if (pathname.startsWith('/hotels/')) {
      window.history.pushState({}, '', '/');
      setPathname('/');
    }
    applySeo(buildHomeSeo(allStays));
  }, [activeCollectionRoute, activeStay, allStays, pathname, routeScopedStays]);

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden text-foreground flex flex-col relative md:h-[100dvh] md:overflow-hidden">
      {currentTab === 'design' ? (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <DesignSystemPage
            onBackToDiscover={() => setTab('discover')}
            onBackToSaved={() => setTab('saved' as AppTab)} // Hack to avoid type error, saved is just a drawer in discover
          />
        </Suspense>
      ) : currentTab === 'admin' && localAdminEnabled ? (
        <AdminErrorBoundary onReset={() => setTab('discover')}>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <CurationStudio onClose={() => setTab('discover')} />
          </Suspense>
        </AdminErrorBoundary>
      ) : (
        <>

          <main className="flex-1 w-full relative z-0">
            <div className="w-full">
              {currentTab === 'discover' && (
                <div className="sf-shell min-w-0 md:min-h-screen">
                  <div className="min-h-0 min-w-0 flex flex-col md:h-[100dvh]">
                    <div
                      ref={(el) => {
                        discoverScrollRef.current = el;
                        setDiscoverScrollEl(el);
                      }}
                      data-sf-scroll="discover"
                      className="sf-middle-scroll relative z-0 min-h-0 min-w-0 flex-1 md:overflow-y-auto"
                    >
                      <SearchSection
                        preferences={preferences}
                        onOpenSaved={() => setIsSavedDrawerOpen(true)}
                        isSavedOpen={isSavedDrawerOpen}
                        isAdminOpen={currentTab === 'admin' && localAdminEnabled}
                        isAboutOpen={isAboutDrawerOpen}
                        isAdminAvailable={localAdminEnabled}
                        onOpenAdmin={() => setTab('admin')}
                        onOpenAbout={() => setIsAboutDrawerOpen(true)}
                        onGoHome={() => {
                          setIsSavedDrawerOpen(false);
                          setIsAboutDrawerOpen(false);
                          setActiveStay(null);
                          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                            window.history.pushState({}, '', '/');
                            setPathname('/');
                          }
                        }}
                        isScrolled={isScrolled}
                      />
                      <BriefStickyBar
                        ref={briefBarRef}
                        preferences={preferences}
                        onChange={handlePreferencesChange}
                        onReset={resetBrief}
                        stickyEnabled={!isMobile && !activeStay}
                        currentRank={currentRank}
                        onRankChange={setCurrentRank}
                        isStuck={briefBarStuck}
                        isUpdating={isUpdating}
                        className=""
                      />

                      <div className="relative min-h-[50vh]">
                        <AnimatePresence mode="wait">
                          {isLoadingStays || isUpdating ? (
                            <motion.div
                              key="loader"
                              initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                              className="w-full flex justify-center absolute inset-x-0"
                            >
                              <SmartLoader preferences={appliedPreferences} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="list"
                              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, y: -40, filter: 'blur(4px)' }}
                              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                              className={cn("w-full", isUpdating ? 'pointer-events-none select-none' : '')}
                            >
                              {activeCollectionRoute && routeScopedStays.length > 0 ? (
                                <CollectionIntro
                                  route={activeCollectionRoute}
                                  stays={routeScopedStays}
                                  onClose={() => {
                                    window.history.pushState({}, '', '/');
                                    setPathname('/');
                                  }}
                                />
                              ) : null}
                              <Shortlist
                                stays={stays}
                                favorites={favorites}
                                onToggleFavorite={handleToggleFavorite}
                                onOpenDetails={setActiveStay}
                                preferences={appliedPreferences}
                                currentRank={currentRank}
                                onRankChange={setCurrentRank}
                                isUpdating={isUpdating}
                              />
                              {activeCollectionRoute && routeScopedStays.length > 0 ? (
                                <CollectionSeoFooter route={activeCollectionRoute} stays={routeScopedStays} />
                              ) : null}
                              {!activeCollectionRoute && allStays.length > 0 ? (
                                <HomeCollectionHub stays={allStays} />
                              ) : null}
                              <footer className="w-full pt-3 md:pt-4">
                                <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 border-t border-border/70 bg-white px-5 pb-8 pt-4 text-left md:px-10 md:pb-28 md:pt-4">
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-foreground/80">
                                    <button
                                      type="button"
                                      onClick={() => setIsAboutDrawerOpen(true)}
                                      className="transition-colors hover:text-primary"
                                    >
                                      About
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setIsAboutDrawerOpen(true)}
                                      className="transition-colors hover:text-primary"
                                    >
                                      Privacy & notes
                                    </button>
                                    <a
                                      href="mailto:contact@myhotelvibe.com"
                                      className="transition-colors hover:text-primary"
                                    >
                                      Contact
                                    </a>
                                  </div>
                                  <p className="max-w-[780px] text-[12px] leading-relaxed text-muted-foreground md:max-w-[1200px] md:text-[13px]">
                                    All hotel links on My Hotel Vibe are affiliate links. If you book through them, My
                                    Hotel Vibe may earn a commission at no extra cost to you.
                                  </p>
                                </div>
                              </footer>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (window.innerWidth >= 768 && discoverScrollEl) {
                          discoverScrollEl.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={cn(
                        "fixed bottom-3 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary border border-primary shadow-lg transition-all duration-300 ease-out hover:bg-background hover:scale-105 active:scale-95 cursor-pointer md:hidden",
                        showBackToTop ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                      )}
                      aria-label="Back to search"
                    >
                      <Search className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {isSavedDrawerOpen && (
        <Suspense fallback={null}>
          <SavedDrawer
            savedStays={savedStays}
            onClose={() => setIsSavedDrawerOpen(false)}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetails={(stay) => setActiveStay(stay)}
          />
        </Suspense>
      )}

      {isAboutDrawerOpen && (
        <Suspense fallback={null}>
          <AboutDrawer onClose={() => setIsAboutDrawerOpen(false)} />
        </Suspense>
      )}

      <AnimatePresence>
        {activeStay && (
          <Suspense fallback={null}>
            <HotelDetailBoundary stay={activeStay} onClose={closeActiveStay}>
              <DetailModal
                key={activeStay.id}
                stay={activeStay}
                allStays={allStays}
                isFavorite={favorites.includes(activeStay.id)}
                onClose={closeActiveStay}
                onToggleFavorite={(id) => handleToggleFavorite('internal', id)}
              />
            </HotelDetailBoundary>
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
