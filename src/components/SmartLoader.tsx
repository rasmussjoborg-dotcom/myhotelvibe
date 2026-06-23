import { useEffect, useState } from 'react';
import { Preferences } from '../types';
import { cn } from '@/lib/utils';
import { Sparkles, Compass, Search, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UI } from '@/lib/ui';

interface SmartLoaderProps {
  preferences: Preferences;
  className?: string;
}

const SkeletonCard = ({ delay }: { delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    className="group relative flex flex-col break-inside-avoid rounded-xl border border-border/40 bg-white/50 p-4 md:p-5 pointer-events-none"
  >
    {/* Image Skeleton */}
    <div className="relative mb-5 w-full overflow-hidden rounded-lg bg-surface-container-high aspect-[4/3] md:aspect-[16/9] animate-pulse" />

    {/* Text Skeletons */}
    <div className="flex grow flex-col gap-4">
      <div className="flex-1">
        <div className="mb-4 h-7 w-3/4 rounded-full bg-surface-container-high animate-pulse" />
        <div className="h-4 w-1/2 rounded-full bg-surface-container animate-pulse" />
      </div>
      <div className="flex items-center justify-between pt-4">
        <div className="h-5 w-1/3 rounded-full bg-surface-container animate-pulse" />
        <div className="h-5 w-1/4 rounded-full bg-surface-container animate-pulse" />
      </div>
    </div>
  </motion.div>
);

export default function SmartLoader({ preferences, className }: SmartLoaderProps) {
  const [step, setStep] = useState(0);

  const mood = preferences.persona ? preferences.persona.toLowerCase() : 'the perfect';
  const scene = preferences.backdrop ? preferences.backdrop.toLowerCase() : 'destinations';

  const phrases = [
    { text: `Curating ${mood} stays`, icon: Sparkles },
    { text: `Matching the ${scene} backdrop`, icon: Compass },
    { text: 'Reading through reviews', icon: Search },
    { text: 'Filtering out tourist traps', icon: SlidersHorizontal },
    { text: 'Preparing your shortlist', icon: CheckCircle2 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % phrases.length);
    }, 2400); 
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className={cn("w-full relative pb-[120px] pt-8", className)}>
      
      {/* Floating Pill Overlay */}
      <div className="fixed top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div className="flex items-center gap-4 bg-white text-foreground shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] rounded-full pl-5 pr-7 py-3 overflow-hidden border border-border/60">
          
          <div className="relative flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-primary/5">
            {/* Smooth continuous spinner */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_2.5s_linear_infinite] text-primary/30" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="60 200" strokeLinecap="round" />
            </svg>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 45 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center text-primary"
              >
                {(() => {
                  const Icon = phrases[step].icon;
                  return <Icon className="h-5 w-5" strokeWidth={2.5} />;
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative h-6 min-w-[240px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: 0.1 }}
                className="absolute inset-x-0 flex items-center text-[15px] font-semibold tracking-tight text-foreground/90"
              >
                {phrases[step].text}...
              </motion.div>
            </AnimatePresence>
          </div>
          
        </div>
      </div>

      {/* Grid of Hotel Skeleton Cards */}
      <div className={cn(UI.stitchPageX, 'columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 opacity-30 blur-[2px] transition-all duration-1000')}>
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} delay={i * 0.05} />
        ))}
      </div>
      
    </div>
  );
}
