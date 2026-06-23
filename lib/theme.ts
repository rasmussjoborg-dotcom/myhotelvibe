import { useSyncExternalStore } from 'react';

export type SansFontChoice = 'geist' | 'system';
export type MonoFontChoice = 'mono' | 'system';

export const SANS_FONT_STACKS: Record<SansFontChoice, string> = {
  geist: '"Geist Variable", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  system:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
};

export const MONO_FONT_STACKS: Record<MonoFontChoice, string> = {
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  system: '"Courier New", Courier, monospace',
};

const DISPLAY_SERIF_STACK = '"Instrument Serif", Didot, "Times New Roman", ui-serif, serif';
const LEGACY_SECONDARY = '#B4DCD4';
const REFINED_SECONDARY = '#A8D4CB';

export interface ThemeTokens {
  brandName: string;
  brandTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroMicrocopy: string;
  fontDisplay: SansFontChoice;
  fontBody: SansFontChoice;
  fontMono: MonoFontChoice;
  textH1: number;
  textH2: number;
  textH3: number;
  textH4: number;
  textBodyLg: number;
  textBody: number;
  textBodySm: number;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  radius: number;
}

export const THEME_STORAGE_KEY = 'coco_hotel_theme_v1';

export const DEFAULT_THEME: ThemeTokens = {
  brandName: 'StayFirst',
  brandTagline: 'Stay-first hotel discovery.',
  heroTitle: 'Find the hotel vibe — then pick the place.',
  heroSubtitle: 'A quieter way to find hotels by atmosphere first.',
  heroMicrocopy: 'Vibe-led picks with honest tradeoffs.',
  fontDisplay: 'geist',
  fontBody: 'geist',
  fontMono: 'mono',
  textH1: 1.75,
  textH2: 2.25,
  textH3: 1.05,
  textH4: 1.125,
  textBodyLg: 1.05,
  textBody: 1,
  textBodySm: 0.875,
  background: '#FBF4EF',
  foreground: '#2D2D2D',
  card: '#FFFFFF',
  cardForeground: '#2D2D2D',
  primary: '#002FA8',
  primaryForeground: '#FFFFFF',
  secondary: REFINED_SECONDARY,
  secondaryForeground: '#2D2D2D',
  muted: '#FFDCC1',
  mutedForeground: '#2D2D2D',
  accent: '#E74A40',
  accentForeground: '#FFFFFF',
  destructive: '#E74A40',
  border: 'color-mix(in oklab, #2D2D2D 15%, transparent)',
  input: 'color-mix(in oklab, #2D2D2D 15%, transparent)',
  ring: '#002FA8',
  radius: 0.4,
};

const COLOR_KEYS = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'accent',
  'accentForeground',
  'destructive',
  'border',
  'input',
  'ring',
] as const satisfies ReadonlyArray<keyof ThemeTokens>;

type ColorKey = (typeof COLOR_KEYS)[number];

const TYPOGRAPHY_VAR_MAP: Record<
  'textH1' | 'textH2' | 'textH3' | 'textH4' | 'textBodyLg' | 'textBody' | 'textBodySm',
  string
> = {
  textH1: '--sf-text-h1',
  textH2: '--sf-text-h2',
  textH3: '--sf-text-h3',
  textH4: '--sf-text-h4',
  textBodyLg: '--sf-text-body-lg',
  textBody: '--sf-text-body',
  textBodySm: '--sf-text-body-sm',
};

function safeStorageGet(key: string) {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore file:// and sandboxed storage failures.
  }
}

function isThemeTokens(value: unknown): value is Partial<ThemeTokens> {
  return Boolean(value) && typeof value === 'object';
}

function isSansFontChoice(value: unknown): value is SansFontChoice {
  return value === 'geist' || value === 'system';
}

function isMonoFontChoice(value: unknown): value is MonoFontChoice {
  return value === 'mono' || value === 'system';
}

export function loadTheme(): ThemeTokens {
  const saved = safeStorageGet(THEME_STORAGE_KEY);
  if (!saved) {
    return DEFAULT_THEME;
  }

  try {
    const parsed = JSON.parse(saved) as unknown;
    if (!isThemeTokens(parsed)) {
      return DEFAULT_THEME;
    }

    return {
      ...DEFAULT_THEME,
      ...parsed,
      fontDisplay: isSansFontChoice(parsed.fontDisplay) ? parsed.fontDisplay : DEFAULT_THEME.fontDisplay,
      fontBody: isSansFontChoice(parsed.fontBody) ? parsed.fontBody : DEFAULT_THEME.fontBody,
      fontMono: isMonoFontChoice(parsed.fontMono) ? parsed.fontMono : DEFAULT_THEME.fontMono,
      radius: typeof parsed.radius === 'number' ? parsed.radius : DEFAULT_THEME.radius,
      textH1: typeof parsed.textH1 === 'number' ? parsed.textH1 : DEFAULT_THEME.textH1,
      textH2: typeof parsed.textH2 === 'number' ? parsed.textH2 : DEFAULT_THEME.textH2,
      textH3: typeof parsed.textH3 === 'number' ? parsed.textH3 : DEFAULT_THEME.textH3,
      textH4: typeof parsed.textH4 === 'number' ? parsed.textH4 : DEFAULT_THEME.textH4,
      textBodyLg: typeof parsed.textBodyLg === 'number' ? parsed.textBodyLg : DEFAULT_THEME.textBodyLg,
      textBody: typeof parsed.textBody === 'number' ? parsed.textBody : DEFAULT_THEME.textBody,
      textBodySm: typeof parsed.textBodySm === 'number' ? parsed.textBodySm : DEFAULT_THEME.textBodySm,
      secondary:
        typeof parsed.secondary === 'string' && parsed.secondary !== LEGACY_SECONDARY
          ? parsed.secondary
          : DEFAULT_THEME.secondary,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: ThemeTokens) {
  safeStorageSet(THEME_STORAGE_KEY, JSON.stringify(theme));
}

export function getTheme() {
  return currentTheme;
}

const themeListeners = new Set<() => void>();

function emitThemeChange() {
  themeListeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

export function setTheme(nextTheme: ThemeTokens) {
  currentTheme = nextTheme;
  saveTheme(nextTheme);
  applyTheme(nextTheme);
  emitThemeChange();
}

export function updateTheme(updater: (current: ThemeTokens) => ThemeTokens) {
  setTheme(updater(currentTheme));
}

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, () => currentTheme, () => DEFAULT_THEME);
}

export function applyTheme(theme: ThemeTokens) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const style = root.style;

  const mapping: Record<ColorKey, string> = {
    background: '--background',
    foreground: '--foreground',
    card: '--card',
    cardForeground: '--card-foreground',
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    secondary: '--secondary',
    secondaryForeground: '--secondary-foreground',
    muted: '--muted',
    mutedForeground: '--muted-foreground',
    accent: '--accent',
    accentForeground: '--accent-foreground',
    destructive: '--destructive',
    border: '--border',
    input: '--input',
    ring: '--ring',
  };

  COLOR_KEYS.forEach((key) => {
    style.setProperty(mapping[key], theme[key] as string);
  });

  style.setProperty('--sf-font-heading', DISPLAY_SERIF_STACK);
  style.setProperty('--sf-font-display', DISPLAY_SERIF_STACK);
  style.setProperty('--sf-font-sans', SANS_FONT_STACKS[theme.fontBody]);
  style.setProperty('--sf-font-mono', MONO_FONT_STACKS[theme.fontMono]);

  (Object.keys(TYPOGRAPHY_VAR_MAP) as Array<keyof typeof TYPOGRAPHY_VAR_MAP>).forEach((key) => {
    style.setProperty(TYPOGRAPHY_VAR_MAP[key], `${theme[key]}rem`);
  });

  style.setProperty('--popover', theme.card);
  style.setProperty('--popover-foreground', theme.cardForeground);
  style.setProperty('--sidebar', theme.card);
  style.setProperty('--sidebar-foreground', theme.foreground);
  style.setProperty('--sidebar-primary', theme.primary);
  style.setProperty('--sidebar-primary-foreground', theme.primaryForeground);
  style.setProperty('--sidebar-accent', theme.muted);
  style.setProperty('--sidebar-accent-foreground', theme.foreground);
  style.setProperty('--sidebar-border', theme.border);
  style.setProperty('--sidebar-ring', theme.ring);
  style.setProperty('--chart-1', theme.primary);
  style.setProperty('--chart-2', theme.secondary);
  style.setProperty('--chart-3', theme.accent);
  style.setProperty('--chart-4', theme.mutedForeground);
  style.setProperty('--chart-5', theme.destructive);
  style.setProperty('--radius', `${theme.radius}rem`);
}

let currentTheme = loadTheme();
