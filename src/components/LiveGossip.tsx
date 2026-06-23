import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, MapPin, Eye } from 'lucide-react';
import { Stay } from '../types';

interface LiveGossipProps {
  stays: Stay[];
}

interface GossipEvent {
  id: string;
  icon: React.ElementType;
  message: React.ReactNode;
}

export default function LiveGossip({ stays }: LiveGossipProps) {
  const [currentEvent, setCurrentEvent] = useState<GossipEvent | null>(null);

  useEffect(() => {
    if (!stays || stays.length === 0) return;

    const cities = ["Stockholm", "London", "Paris", "New York", "Berlin", "Copenhagen", "Amsterdam", "Oslo"];

    const generateEvent = (): GossipEvent => {
      const hotel = stays[Math.floor(Math.random() * stays.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const type = Math.random();
      const id = Math.random().toString(36).substring(7);

      if (type < 0.33) {
        return {
          id,
          icon: Heart,
          message: <span><strong className="font-medium">{hotel.name}</strong> was just hand-selected for a private shortlist.</span>
        };
      } else if (type < 0.66) {
        const vibe = hotel.tags?.[0] || 'luxury';
        return {
          id,
          icon: Sparkles,
          message: <span>A stunning <strong className="font-medium">{vibe}</strong> stay was just discovered in <strong className="font-medium">{city}</strong>.</span>
        };
      } else {
        return {
          id,
          icon: Eye,
          message: <span>The <strong className="font-medium">{hotel.name}</strong> collection is trending this week.</span>
        };
      }
    };

    // Cycle events
    const triggerNextEvent = () => {
      setCurrentEvent(generateEvent());
      
      // Hide after 8 seconds
      setTimeout(() => {
        setCurrentEvent(null);
      }, 8000);
    };

    // Initial delay before first event
    const initialDelay = setTimeout(triggerNextEvent, 4000);

    // Then every 16 seconds
    const interval = setInterval(triggerNextEvent, 16000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [stays]);

  return (
    <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
      <AnimatePresence mode="wait">
        {currentEvent && (
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white/90 backdrop-blur-md border border-border shadow-sm rounded-full px-4 py-2.5 flex items-center gap-3"
          >
            <div className="bg-primary/5 p-1.5 rounded-full text-primary">
              <currentEvent.icon className="w-3.5 h-3.5" />
            </div>
            <p className="text-[13px] text-foreground tracking-tight max-w-[250px] truncate pr-2">
              {currentEvent.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
