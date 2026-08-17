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
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
    className="group relative flex flex-col rounded-2xl border border-border/60 bg-white/80 p-3.5 md:p-4 shadow-sm pointer-events-none"
  >
    {/* Image Skeleton */}
    <div className="relative mb-4 w-full overflow-hidden rounded-xl bg-muted/60 aspect-[4/3] animate-pulse">
      <div className="absolute top-3 left-3 h-6 w-20 rounded-full bg-white/70" />
      <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/70" />
    </div>

    {/* Text Skeletons */}
    <div className="flex grow flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="h-6 w-3/5 rounded-lg bg-muted/80 animate-pulse" />
        <div className="h-5 w-14 rounded-md bg-muted/60 animate-pulse" />
      </div>
      <div className="h-4 w-2/5 rounded-md bg-muted/50 animate-pulse" />
      <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-3">
        <div className="h-4 w-1/3 rounded-md bg-muted/50 animate-pulse" />
        <div className="h-5 w-1/4 rounded-full bg-muted/70 animate-pulse" />
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
    }, 2000); 
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className={cn("w-full relative pb-20 pt-4", className)}>
      
      {/* Centered Curating Pill Indicator */}
      <div className="sticky top-20 z-30 flex justify-center py-3 pointer-events-none px-4">
        <motion.div 
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md text-foreground shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-full pl-2.5 pr-4 py-1.5 border border-border/80 whitespace-nowrap max-w-[95vw]"
        >
          
          <div className="relative flex items-center justify-center h-7 w-7 shrink-0 rounded-full bg-primary/10">
            {/* Smooth continuous spinner */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_2s_linear_infinite] text-primary" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="50 180" strokeLinecap="round" />
            </svg>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center text-primary"
              >
                {(() => {
                  const Icon = phrases[step].icon;
                  return <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />;
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative h-5 flex items-center overflow-visible">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex items-center text-[13px] font-medium tracking-tight text-foreground/90 whitespace-nowrap"
              >
                {phrases[step].text}...
              </motion.div>
            </AnimatePresence>
          </div>
          
        </motion.div>
      </div>

      {/* Grid of Hotel Skeleton Cards */}
      <div className={cn(UI.stitchPageX, 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-70 transition-all duration-500')}>
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} delay={i * 0.04} />
        ))}
      </div>
      
    </div>
  );
}
