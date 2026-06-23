import { cn } from "./utils";

/**
 * Centralized "design tokens as classnames" for consistent layout.
 * Keep these small + opinionated: spacing, radii, elevations.
 */
export const UI = {
  pageX: "w-full max-w-[1400px] mx-auto px-4 sm:px-5 md:px-8 lg:px-10",
  stitchPageX: "w-full max-w-[1400px] mx-auto px-5 md:px-10",
  briefBarX: "w-full max-w-[1716px] mx-auto px-4 sm:px-5 lg:px-0",
  pageYTopHero: "pt-5 md:pt-6",
  pageYTopSlim: "pt-4 md:pt-5",
  gridGap: "gap-3 md:gap-6",
  cardRadius: "rounded-xl",
  pillRadius: "rounded-full",
  elev1: "shadow-[var(--shadow-elev-1)]",
  elev2: "shadow-[var(--shadow-elev-2)]",
  elev2Hover: "hover:shadow-[var(--shadow-elev-2)]",
  elevModal: "shadow-[var(--shadow-modal)]",
} as const;

export const ui = {
  pageSection: (className?: string) => cn(UI.pageX, className),
} as const;
