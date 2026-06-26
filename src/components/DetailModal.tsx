/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Heart, MapPin, Check, TriangleAlert, Sparkles, Scale, Flame, Calendar, Waves, Utensils, UtensilsCrossed, Wine, Coffee, Dog, TreePine, Mountain, Trees, ChevronLeft, ChevronRight, Plane, Clock, CalendarDays, MessageSquareText, Wallet, ArrowUpRight, Play, Pause, Volume2, VolumeX, MessageSquareQuote, List, Map, Images, Eye, Gem, Compass, Link2, Building2 } from 'lucide-react';
import { Stay } from '../types';
import { ALL_STAY_IMAGES } from '../data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculatePriceMultiplier } from "../lib/pricingEngine";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { getRelatedHotels, getStayCollectionLinks } from '../lib/collections';
import { buildHotelPath, getHotelSlug } from '../lib/site';


interface DetailModalProps {
  stay: Stay;
  allStays: Stay[];
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function DetailModal({ stay, allStays, isFavorite, onClose, onToggleFavorite }: DetailModalProps) {
  const theme = useTheme();
  const safeName = typeof stay.name === 'string' ? stay.name : 'Hotel';
  const safeLocation = typeof stay.location === 'string' ? stay.location : 'Unknown location';
  const safeRegion = typeof stay.region === 'string' ? stay.region : 'the area';
  const safeDescription = typeof stay.description === 'string' ? stay.description : '';
  const safeGuestSummary = typeof stay.guestSummary === 'string' ? stay.guestSummary : '';
  const safeTradeoff = typeof stay.tradeoff === 'string' ? stay.tradeoff : '';
  const safeBookingWindow = typeof stay.bookingWindow === 'string' ? stay.bookingWindow : '';
  const safeSurroundings = typeof stay.surroundings === 'string' ? stay.surroundings : '';
  const safeTimeZone = typeof stay.timeZone === 'string' ? stay.timeZone : '';
  const safeBookingUrl = typeof stay.bookingUrl === 'string' ? stay.bookingUrl : '';
  const safeYoutubeUrl = typeof stay.youtubeUrl === 'string' ? stay.youtubeUrl : '';
  const safeDistanceValue = Number.isFinite(stay.distanceValue) ? stay.distanceValue : null;
  const safeVibe = typeof stay.vibe === 'string' ? stay.vibe : 'unique';
  const safePersona = typeof stay.primaryPersona === 'string' ? stay.primaryPersona : 'discerning';
  const safeWhyWeLoveIt = typeof stay.whyWeLoveIt === 'string' ? stay.whyWeLoveIt : safeDescription;
  const [isSlideshowMode, setIsSlideshowMode] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => setIsTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(() => {
    const stored = localStorage.getItem('stitch_audio_muted');
    return stored !== null ? stored === 'true' : true; // default to true
  });
  const contentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('stitch_audio_muted', String(isAudioMuted));
  }, [isAudioMuted]);

  const activeAudioUrl = typeof stay.audioUrl === 'string' ? stay.audioUrl : '';
  
  const youtubeUrls = safeYoutubeUrl ? safeYoutubeUrl.split(',').map(u => u.trim()).filter(Boolean) : [];
  const youtubeIds = youtubeUrls.map(url => url.match(/(?:shorts\/|v=|youtu\.be\/)([\w-]+)/)?.[1]).filter(Boolean);
  const hasVideo = youtubeIds.length > 0;
  const isShort = youtubeUrls.some(url => url.includes('shorts'));
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (!isMobile) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootBackground = root.style.backgroundColor;
    const previousBodyBackground = body.style.backgroundColor;

    root.style.backgroundColor = '#FFFFFF';
    body.style.backgroundColor = '#FFFFFF';

    return () => {
      root.style.backgroundColor = previousRootBackground;
      body.style.backgroundColor = previousBodyBackground;
    };
  }, [isMobile]);

  const galleryImages = useMemo(() => {
    const images = stay.images && stay.images.length > 0 ? stay.images : [stay.image];
    return images.filter(Boolean);
  }, [stay.image, stay.images]);

  const collectionLinks = useMemo(() => getStayCollectionLinks(stay), [stay]);
  const relatedHotels = useMemo(() => getRelatedHotels(stay, allStays, 3), [allStays, stay]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { stiffness: 100, damping: 30 };
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), springConfig);
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);

  useEffect(() => {
    setCurrentImageIndex(0);
    setIsSlideshowMode(true);
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);

    requestAnimationFrame(() => {
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTop = 0;
      }
    });
  }, [stay.id, mouseX, mouseY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSlideshowMode && !isHovered && galleryImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isSlideshowMode, isHovered, galleryImages.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Ultra-subtle background volume max
    const MAX_VOL = 0.05;
    
    const shouldPlay = !isAudioMuted && isSlideshowMode && isTabVisible;

    if (shouldPlay) {
      if (audio.paused) {
        audio.volume = 0; // ensure it starts at 0 if we are fading in from a paused state
      }
      audio.play().catch(() => {
        setIsAudioMuted(true);
      });
      let vol = audio.volume;
      const fade = setInterval(() => {
        vol = Math.min(MAX_VOL, vol + 0.005);
        if (vol >= MAX_VOL) {
          audio.volume = MAX_VOL;
          clearInterval(fade);
        } else {
          audio.volume = vol;
        }
      }, 250); // Very slow fade in
      return () => clearInterval(fade);
    } else {
      // If manually muted or slideshow paused, fade out much faster so the UI feels responsive. 
      const step = 0.02;
      const interval = 50;
      
      let vol = audio.volume;
      const fade = setInterval(() => {
        vol = Math.max(0, vol - step);
        if (vol <= 0) {
          audio.volume = 0;
          audio.pause();
          clearInterval(fade);
        } else {
          audio.volume = vol;
        }
      }, interval);
      return () => clearInterval(fade);
    }
  }, [isAudioMuted, isSlideshowMode, isTabVisible]);

  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.volume = 0;
    }
    onClose();
  };

  const getTimelineLabel = (t?: string) => {
    switch (t) {
      case 'Literally ASAP': return 'Next 30 days';
      case 'This summer': return 'Summer season';
      case 'This winter': return 'Winter season';
      case 'Whenever, honestly': return 'Over a year';
      default: return t;
    }
  };

  const getVibeTag = (type: string) => {
    switch(type.toLowerCase()) {
      case 'couple': return 'ROMANTIC';
      case 'friends': return 'BUZZING';
      case 'solo': return 'FINE DINING';
      case 'family': return 'CROWD PLEASER';
      default: return 'MUST TRY';
    }
  };

  const ctaCopy = "Book now";

  const mobileImageMotion = {
    initial: { x: 0, y: '100%' },
    animate: {
      x: 0,
      y: 0,
      transition: { duration: 0.34, delay: 0.12, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: 0,
      y: 0,
      transition: { duration: 0 },
    },
  } as const;

  const mobileContentMotion = {
    initial: { x: 0, y: '100%' },
    animate: {
      x: 0,
      y: 0,
      transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: 0,
      y: 0,
      transition: { duration: 0 },
    },
  } as const;

  const mobileShellExit = {
    x: 0,
    y: '100%',
    transition: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
  } as const;

  const mobileSlideshowTop = 'calc(env(safe-area-inset-top) + 0.75rem)';
  const mobileSlideshowHeight = '37svh';
  const mobileContentTop = 'calc(env(safe-area-inset-top) + 0.75rem + 37svh - 2rem)';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col md:flex-row"
      role="dialog"
      aria-modal="true"
      aria-label={`${safeName} details`}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-black/18 backdrop-blur-[10px] md:bg-black/70 md:backdrop-blur-none"
        onClick={handleClose} 
      />

      {/* Main Split Container */}
      <motion.div
        initial={false}
        animate={{ x: 0, y: 0 }}
        exit={isMobile ? mobileShellExit : { x: 0, y: 0 }}
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden bg-transparent md:flex md:flex-row md:justify-end"
      >
        <div className="absolute inset-0 bg-white md:hidden" />
        
        {/* Left Side: Images */}
        <motion.div 
          initial={isMobile ? mobileImageMotion.initial : { x: '-100%', y: 0 }}
          animate={isMobile ? mobileImageMotion.animate : { x: 0, y: 0 }}
          exit={isMobile ? mobileImageMotion.exit : { x: '-100%', y: 0 }}
          transition={isMobile ? undefined : { duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
          style={isMobile ? { top: mobileSlideshowTop, height: mobileSlideshowHeight } : undefined}
          className="pointer-events-auto absolute inset-x-0 w-full overflow-hidden rounded-t-[32px] bg-[#F5F0F0] shadow-2xl z-20 group md:relative md:inset-auto md:top-auto md:h-full md:w-1/2 md:rounded-none md:mt-0 md:shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            mouseX.set(0);
            mouseY.set(0);
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Animated Slide / Video */}
          <div className="w-full h-full relative">
            {activeAudioUrl && (
              <audio ref={audioRef} src={activeAudioUrl} loop preload="none" crossOrigin="anonymous" />
            )}
              <div className="w-full h-full relative group/gallery overflow-hidden">
                <AnimatePresence>
                  <motion.img
                    key={currentImageIndex}
                    src={galleryImages[currentImageIndex]}
                    alt={`${stay.imageAlt || safeName} view ${currentImageIndex + 1}`}
                    style={{ x: parallaxX, y: parallaxY }}
                    initial={{ scale: 1.0, opacity: 0 }}
                    animate={{ scale: 1.05, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      scale: { duration: 6, ease: "linear" },
                      opacity: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className={cn(
                      "max-w-none object-cover pointer-events-none absolute",
                      isMobile
                        ? "w-[118%] h-[118%] -left-[9%] -top-[9%]"
                        : "w-[110%] h-[110%] -left-[5%] -top-[5%]"
                    )}
                  />
                </AnimatePresence>
                

                {isMobile && (
                  <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 z-40 flex items-center gap-2 pointer-events-auto">
                    <Button
                      onClick={handleClose}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-9 w-9 bg-white border-primary text-primary backdrop-blur-md hover:bg-background",
                        UI.pillRadius,
                      )}
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-primary" />
                    </Button>
                  </div>
                )}

                {/* Dots indicator */}
                {/* Play/Pause Button Overlay */}
                {galleryImages.length > 1 && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors z-20 cursor-pointer pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); setIsSlideshowMode(!isSlideshowMode); }}
                  >
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button 
                        className="flex items-center justify-center w-14 h-14 rounded-full border border-primary bg-white text-primary shadow-lg backdrop-blur-md transition-transform hover:scale-105 hover:bg-background"
                      >
                        {isSlideshowMode ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Audio Mute Button */}
                {activeAudioUrl && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (!isSlideshowMode) {
                        setIsSlideshowMode(true);
                        setIsAudioMuted(false);
                      } else {
                        setIsAudioMuted(!isAudioMuted); 
                      }
                    }}
                    className={cn(
                      "absolute z-40 h-9 w-9 border shadow-[var(--shadow-elev-1)] flex items-center justify-center transition-all pointer-events-auto",
                      UI.pillRadius,
                      isMobile
                        ? "top-[calc(env(safe-area-inset-top)+1rem)] left-4 bg-white border-primary backdrop-blur-md text-primary hover:bg-background shadow-lg"
                        : "bottom-6 right-6 bg-white hover:bg-background backdrop-blur-md text-primary border-primary shadow-lg"
                    )}
                  >
                    {(!isSlideshowMode || isAudioMuted) ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                )}

                {isMobile && (
                  <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] left-1/2 z-30 -translate-x-1/2 pointer-events-none">
                    <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary bg-white px-3 text-primary shadow-lg backdrop-blur-md">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-[13px] font-semibold leading-none">
                        {safeLocation}
                      </span>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </motion.div>

        {/* Right Side: Content */}
        <motion.div
          initial={isMobile ? mobileContentMotion.initial : { x: '100%', y: 0 }}
          animate={isMobile ? mobileContentMotion.animate : { x: 0, y: 0 }}
          exit={isMobile ? mobileContentMotion.exit : { x: '100%', y: 0 }}
          transition={isMobile ? undefined : { duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          style={isMobile ? { top: mobileContentTop, bottom: 0 } : undefined}
          className="pointer-events-auto absolute inset-x-0 z-30 flex w-full flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl md:relative md:inset-auto md:bottom-auto md:mt-0 md:w-1/2 md:h-full md:shrink-0 md:rounded-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating Actions */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 hidden md:flex items-center gap-2">
            <Button
              onClick={() => onToggleFavorite(stay.id)}
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full border border-primary bg-white text-primary shadow-[var(--shadow-elev-1)] hover:bg-background transition-colors duration-150 ease-out",
                UI.pillRadius,
              )}
              aria-label={isFavorite ? 'Remove from saved' : 'Save this stay'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite
                    ? 'text-accent fill-accent'
                    : 'text-primary hover:text-accent'
                }`}
              />
            </Button>
            <Button
              onClick={handleClose}
              type="button"
              variant="outline"
              size="icon"
              className={cn("rounded-full border border-primary bg-white text-primary hover:bg-background transition-colors duration-150 ease-out", UI.pillRadius)}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-primary" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div ref={contentScrollRef} className="flex-1 relative z-10 bg-white overflow-y-auto overflow-x-hidden touch-pan-y no-scrollbar min-h-0">
            <div className="pb-[98px] md:pb-[180px]">
              {/* Sticky Header */}
              <div className="z-40 bg-white px-5 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4 flex flex-col border-b border-border/60 md:sticky md:top-0 md:bg-white/95 md:backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[26px] md:text-[40px] leading-[1.05] text-foreground tracking-tight mb-1.5 md:mb-2">
                      {safeName}
                    </h3>
                  </div>
                  {isMobile && (
                    <Button
                      onClick={() => onToggleFavorite(stay.id)}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-9 w-9 shrink-0 rounded-full border border-primary bg-white text-primary shadow-[var(--shadow-elev-1)] hover:bg-background transition-colors duration-150 ease-out",
                        UI.pillRadius,
                      )}
                      aria-label={isFavorite ? 'Remove from saved' : 'Save this stay'}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isFavorite
                            ? 'text-accent fill-accent'
                            : 'text-primary hover:text-accent'
                        }`}
                      />
                    </Button>
                  )}
                </div>
                <div className="hidden md:flex items-center justify-between mt-0.5 w-full">
                  <p className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[13px] md:text-[14px]">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> {safeLocation}
                  </p>
                </div>
              </div>

            <div className="w-full p-5 md:p-8 flex flex-col gap-8 md:gap-10 pt-4 md:pt-6">

              {/* The Narrative (Editorial Review) */}
              <div className="w-full shrink-0 flex flex-col gap-6 md:gap-8 transition-all duration-300">
                {/* Pull Quote (The Vibe) */}
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-full opacity-80" />
                  <p className="font-serif text-[18px] md:text-[20px] leading-relaxed italic text-foreground tracking-tight">
                    "{safeDescription || stay.whyFits?.[0] || ''}"
                  </p>
                </div>

                {/* Prose Flow */}
                <div className="w-full shrink-0 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquareQuote className="h-5 w-5 shrink-0 text-primary" />
                    <h4 className="font-sans font-semibold text-[18px] text-foreground">The Verdict</h4>
                  </div>
                  <div className="flex flex-col bg-white rounded-2xl border border-primary/30 divide-y divide-primary/30 relative overflow-hidden">
                    {/* Guest Summary */}
                    <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 text-primary">
                          <MessageSquareText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col pt-0.5">
                          <span className="text-[14px] font-bold text-foreground leading-none mb-1.5">What guests say</span>
                          <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                            {safeGuestSummary || 'Guests consistently praise the location and atmosphere, though some note it can be pricey during peak season.'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reality Check */}
                    {safeTradeoff && (
                      <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 text-primary">
                            <Scale className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col pt-0.5">
                            <span className="text-[14px] font-bold text-foreground leading-none mb-1.5">The reality check</span>
                            <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                              {safeTradeoff.replace(/^\s*tradeoff:\s*/i, '').trim()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>







              {/* Good to know */}
              <div className="w-full shrink-0 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <List className="h-5 w-5 shrink-0 text-primary" />
                  <h4 className="font-sans font-semibold text-[18px] text-foreground">The Details</h4>
                </div>
                
                <div className="flex flex-col bg-white rounded-2xl border border-primary/30 divide-y divide-primary/30 relative overflow-hidden">
                  {/* Booking Window */}
                  <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 text-primary">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <span className="text-[14px] font-bold text-foreground leading-none mb-1.5">Booking window</span>
                        <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                          {safeBookingWindow || 'Typically fully booked 2-3 months in advance during peak seasons. We recommend securing your dates early.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Surroundings */}
                  <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 text-primary">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <span className="text-[14px] font-bold text-foreground leading-none mb-1.5">The surroundings</span>
                        <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                          {safeSurroundings || `Located in the heart of ${safeRegion}. It offers a great balance of seclusion while still being close enough to local restaurants and attractions.`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Getting there */}
                  <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 text-primary">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <span className="text-[14px] font-bold text-foreground leading-none mb-1.5">Getting there</span>
                        <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                          Approximately {safeDistanceValue ?? 'an unknown distance'} km from the nearest major airport. {safeDistanceValue !== null && safeDistanceValue > 50 ? 'A rental car or pre-booked transfer is highly recommended.' : 'A short taxi ride or transfer is usually sufficient.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time zone */}
                  <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 text-primary">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <span className="text-[14px] font-bold text-foreground leading-none mb-1.5">Time zone</span>
                        <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                          {safeTimeZone || (safeLocation.includes('Portugal') || safeLocation.includes('UK') || safeLocation.includes('United Kingdom') ? 'WET (Western European Time)' : safeLocation.includes('Italy') || safeLocation.includes('Spain') || safeLocation.includes('France') || safeLocation.includes('Croatia') ? 'CET (Central European Time)' : 'Local Time')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Map */}
              <div className="w-full shrink-0 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Map className="h-5 w-5 shrink-0 text-primary" />
                  <h4 className="font-sans font-semibold text-[18px] text-foreground">Location</h4>
                </div>
                <div className="w-full aspect-square bg-muted/30 rounded-2xl border border-primary/30 overflow-hidden relative">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(safeName + ', ' + safeLocation)}&output=embed`}
                    allowFullScreen
                    className="w-full h-full object-cover saturate-50 hover:saturate-100 transition-all duration-500"
                  />
              </div>
            </div>

              {(collectionLinks.destination || collectionLinks.country || relatedHotels.length > 0) && (
                <div className="w-full shrink-0 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="h-5 w-5 shrink-0 text-primary" />
                    <h4 className="font-sans font-semibold text-[18px] text-foreground">Keep exploring</h4>
                  </div>

                  <div className="flex flex-col bg-white rounded-2xl border border-primary/30 divide-y divide-primary/30 relative overflow-hidden">
                    {collectionLinks.destination || collectionLinks.country ? (
                      <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 text-primary">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col pt-0.5 min-w-0">
                            <span className="text-[14px] font-bold text-foreground leading-none">Browse this area</span>
                            <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                              {collectionLinks.destination ? (
                                <>
                                  Start with{" "}
                                  <a
                                    href={collectionLinks.destination.href}
                                    className="font-medium text-foreground underline decoration-primary/25 underline-offset-4 transition-colors hover:text-primary"
                                  >
                                    {collectionLinks.destination.label}
                                  </a>
                                </>
                              ) : null}
                              {collectionLinks.destination && collectionLinks.country ? (
                                <>
                                  {" "}
                                  or widen the view to{" "}
                                </>
                              ) : null}
                              {collectionLinks.country ? (
                                <>
                                  {!collectionLinks.destination ? "Widen the view to " : ""}
                                  <a
                                    href={collectionLinks.country.href}
                                    className="font-medium text-foreground underline decoration-primary/25 underline-offset-4 transition-colors hover:text-primary"
                                  >
                                    {collectionLinks.country.label}
                                  </a>
                                </>
                              ) : null}
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {relatedHotels.map((hotel) => (
                      <a
                        key={hotel.id}
                        href={buildHotelPath(getHotelSlug(hotel))}
                        className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 w-6 h-6 flex items-center justify-center shrink-0 text-primary">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col pt-0.5 min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[14px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                {hotel.name}
                              </span>
                              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                            </div>
                            <span className="mt-1 text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                              {hotel.location}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* LLM / AI Crawler Optimization (Hidden from UI) */}
              <div className="sr-only" aria-hidden="false" itemScope itemType="https://schema.org/FAQPage">
                <h2 className="sr-only">{safeName} - Deep Dive & Vibe Analysis</h2>
                
                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name">What is the vibe at {safeName}?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">
                      The vibe at {safeName} can be described as {safeVibe}. It is an excellent choice for {safePersona} travelers.
                    </p>
                  </div>
                </div>

                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name">Where is {safeName} located?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">
                      {safeName} is located in {safeLocation}. {safeSurroundings}
                    </p>
                  </div>
                </div>

                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name">What makes {safeName} special?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">
                      {safeWhyWeLoveIt}
                    </p>
                  </div>
                </div>

                <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <h3 itemProp="name">What do guests say about {safeName}?</h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">
                      {safeGuestSummary || `Guests generally have wonderful things to say about their stay at ${safeName}.`}
                    </p>
                  </div>
                </div>

                {safeTradeoff && (
                  <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                    <h3 itemProp="name">Are there any downsides or things to know about {safeName}?</h3>
                    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p itemProp="text">
                        {safeTradeoff.replace(/^\s*tradeoff:\s*/i, '').trim()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky CTA Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/97 backdrop-blur-md border-t border-border/60 px-4 pt-1 pb-[calc(env(safe-area-inset-bottom)*0.05)] md:px-5 md:py-4 z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center">
          <Button 
            onClick={() => {
              const fallbackUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(safeName + ' ' + safeLocation)}`;
              let targetUrl = fallbackUrl;
              if (safeBookingUrl && safeBookingUrl.trim() !== '') {
                targetUrl = safeBookingUrl.startsWith('http') ? safeBookingUrl : `https://${safeBookingUrl}`;
              }
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            }}
            className="w-full rounded-full font-bold h-[46px] md:h-[52px] text-[15px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            {ctaCopy}
          </Button>
          <span className="mb-0 mt-0.5 text-[10px] md:mb-0 md:mt-2.5 md:text-[11.5px] text-muted-foreground font-medium text-center leading-snug whitespace-nowrap">
            You’ll finish your booking on Booking.com.
          </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
