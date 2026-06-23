/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import {
  ArrowLeft,
  Paintbrush,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { INITIAL_STAYS } from '../data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import StayCard from './StayCard';
import { UI } from '@/lib/ui';
import {
  DEFAULT_THEME,
  MONO_FONT_STACKS,
  SANS_FONT_STACKS,
  setTheme,
  useTheme,
  type MonoFontChoice,
  type SansFontChoice,
  type ThemeTokens,
} from '@/lib/theme';

const COLOR_CONTROLS: Array<{
  key: keyof ThemeTokens;
  label: string;
  helper: string;
}> = [
  { key: 'background', label: 'Background', helper: 'Page shell and large surfaces.' },
  { key: 'foreground', label: 'Foreground', helper: 'Primary text and icons.' },
  { key: 'card', label: 'Card', helper: 'Cards, panels and dialogs.' },
  { key: 'cardForeground', label: 'Card foreground', helper: 'Text inside cards.' },
  { key: 'primary', label: 'Primary', helper: 'The core brand color.' },
  { key: 'primaryForeground', label: 'Primary foreground', helper: 'Text on primary buttons.' },
  { key: 'secondary', label: 'Secondary', helper: 'Soft accents and chips.' },
  { key: 'secondaryForeground', label: 'Secondary foreground', helper: 'Text on secondary buttons.' },
  { key: 'muted', label: 'Muted', helper: 'Quiet surfaces and inputs.' },
  { key: 'mutedForeground', label: 'Muted foreground', helper: 'Secondary copy and helpers.' },
  { key: 'accent', label: 'Accent', helper: 'Highlights and hover surfaces.' },
  { key: 'accentForeground', label: 'Accent foreground', helper: 'Text on accent pills.' },
  { key: 'border', label: 'Border', helper: 'Card lines and dividers.' },
  { key: 'input', label: 'Input', helper: 'Form fields and active controls.' },
  { key: 'ring', label: 'Ring', helper: 'Focus states and outlines.' },
  { key: 'destructive', label: 'Destructive', helper: 'Alerts and danger states.' },
];

const TYPOGRAPHY_CONTROLS: Array<{
  key: keyof ThemeTokens;
  label: string;
  helper: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: 'textH1', label: 'H1', helper: 'Hero and major page titles.', min: 2.75, max: 4.5, step: 0.05 },
  { key: 'textH2', label: 'H2', helper: 'Section headers and big cards.', min: 1.9, max: 3.25, step: 0.05 },
  { key: 'textH3', label: 'H3', helper: 'Card titles and spotlight items.', min: 1.3, max: 2.25, step: 0.05 },
  { key: 'textH4', label: 'H4', helper: 'Eyebrows, dialog titles and labels.', min: 1.0, max: 1.5, step: 0.025 },
  { key: 'textBodyLg', label: 'Body lg', helper: 'Lead paragraph and intro copy.', min: 1.0, max: 1.4, step: 0.025 },
  { key: 'textBody', label: 'Body', helper: 'Everyday copy across the app.', min: 0.9, max: 1.2, step: 0.025 },
  { key: 'textBodySm', label: 'Body sm', helper: 'Helper text and metadata.', min: 0.75, max: 1.0, step: 0.025 },
];

const SAMPLE_BADGES = ['Default', 'Secondary', 'Outline', 'Ghost'] as const;

const DISPLAY_FONT_OPTIONS: Array<{ value: SansFontChoice; label: string; helper: string }> = [
  { value: 'geist', label: 'Geist', helper: 'Our default, balanced and crisp.' },
  { value: 'system', label: 'System', helper: 'Native UI stack with a quieter feel.' },
];

const BODY_FONT_OPTIONS: Array<{ value: SansFontChoice; label: string; helper: string }> = [
  { value: 'geist', label: 'Geist', helper: 'Keeps the body aligned with the brand.' },
  { value: 'system', label: 'System', helper: 'Fast, neutral, and very readable.' },
];

const MONO_FONT_OPTIONS: Array<{ value: MonoFontChoice; label: string; helper: string }> = [
  { value: 'mono', label: 'Mono', helper: 'Code and token styling.' },
  { value: 'system', label: 'Classic', helper: 'Courier-style fallback stack.' },
];

function ColorField({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border/40 bg-background px-3 py-2.5 transition-colors hover:bg-muted/25">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border/40 bg-transparent p-0"
        aria-label={label}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{helper}</div>
      </div>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-32 shrink-0 font-mono text-xs uppercase tracking-wide"
      />
    </label>
  );
}

function RangeField({
  label,
  helper,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  helper: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{helper}</div>
        </div>
        <span className="text-xs font-mono font-semibold text-muted-foreground">{value.toFixed(2)}rem</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[var(--primary)]"
        aria-label={label}
      />
    </div>
  );
}

function FontField({
  label,
  helper,
  value,
  onChange,
  options,
  kind,
}: {
  label: string;
  helper: string;
  value: SansFontChoice | MonoFontChoice;
  onChange: (next: SansFontChoice | MonoFontChoice) => void;
  options: Array<{ value: SansFontChoice | MonoFontChoice; label: string; helper: string }>;
  kind: 'sans' | 'mono';
}) {
  const previewStack = kind === 'sans'
    ? SANS_FONT_STACKS[value as SansFontChoice]
    : MONO_FONT_STACKS[value as MonoFontChoice];

  return (
    <div className="rounded-xl border border-border/40 bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{helper}</div>
        </div>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next as SansFontChoice | MonoFontChoice);
        }}
        className="mt-3 flex flex-wrap justify-start gap-2"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            variant="outline"
            className="rounded-full bg-background px-3 text-sm font-semibold data-[state=on]:border-primary/30 data-[state=on]:bg-secondary"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="mt-3 rounded-lg border border-border/35 bg-muted/25 px-3 py-2">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">Preview</div>
        <div className="mt-1 text-sm text-foreground/75" style={{ fontFamily: previewStack }}>
          The quick brown fox jumps over the lazy dog.
        </div>
      </div>
    </div>
  );
}

export default function DesignSystemPage({
  onBackToDiscover,
  onBackToSaved,
}: {
  onBackToDiscover: () => void;
  onBackToSaved: () => void;
}) {
  const theme = useTheme();

  const sampleStay = INITIAL_STAYS[0];
  const previewBadgeVariants = useMemo(
    () => [
      { label: SAMPLE_BADGES[0], variant: 'default' as const },
      { label: SAMPLE_BADGES[1], variant: 'secondary' as const },
      { label: SAMPLE_BADGES[2], variant: 'outline' as const },
      { label: SAMPLE_BADGES[3], variant: 'ghost' as const },
    ],
    [],
  );

  const updateToken = <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => {
    setTheme({
      ...theme,
      [key]: value,
    } as ThemeTokens);
  };

  const resetTheme = () => setTheme(DEFAULT_THEME);

  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      <section className="border-b border-border/40 bg-card/75">
        <div className={`mx-auto max-w-7xl ${UI.pageX} ${UI.pageYTopHero} pb-6 md:pb-8`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/45 bg-background px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-foreground" />
                Live design system
              </div>
              <div>
                <h1 className="sf-h1 max-w-3xl text-foreground">{theme.brandName} design system</h1>
                <p className="sf-body-lg mt-3 max-w-3xl text-foreground/80">
                  Edit tokens once. Watch the whole StayFirst experience update.
                </p>
                <p className="sf-body-sm mt-2 max-w-3xl text-muted-foreground">
                  Colors, typography, buttons, badges, inputs, dialogs, and the hotel results view all stay in sync
                  through the same shadcn token set.
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {theme.brandName} · {theme.brandTagline}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={onBackToDiscover} className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
                Back to discover
              </Button>
              <Button variant="secondary" onClick={onBackToSaved} className="rounded-full">
                Open saved
              </Button>
              <Button onClick={resetTheme} className="rounded-full">
                <RotateCcw className="h-4 w-4" />
                Reset theme
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            <Badge variant="outline" className="rounded-full bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
              shadcn tokens
            </Badge>
            <Badge variant="outline" className="rounded-full bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
              live CSS vars
            </Badge>
            <Badge variant="outline" className="rounded-full bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
              typography controls
            </Badge>
            <Badge variant="outline" className="rounded-full bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
              font families
            </Badge>
            <Badge variant="outline" className="rounded-full bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
              shared across the app
            </Badge>
          </div>
        </div>
      </section>

      <div className={`mx-auto max-w-7xl ${UI.pageX} py-6 md:py-8`}>
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:pr-1">
            <Card className="border-border/40 bg-card/85 shadow-[var(--shadow-elev-1)]">
              <CardHeader className="pb-3">
                <CardTitle>Branding</CardTitle>
                <CardDescription>Change the core label and preview copy used in the system explorer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Brand name</span>
                  <Input
                    value={theme.brandName}
                    onChange={(event) => updateToken('brandName', event.target.value)}
                    className="font-semibold"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Tagline</span>
                  <Input
                    value={theme.brandTagline}
                    onChange={(event) => updateToken('brandTagline', event.target.value)}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Hero title</span>
                  <Input
                    value={theme.heroTitle}
                    onChange={(event) => updateToken('heroTitle', event.target.value)}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Hero subtitle</span>
                  <Input
                    value={theme.heroSubtitle}
                    onChange={(event) => updateToken('heroSubtitle', event.target.value)}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Microcopy</span>
                  <Input
                    value={theme.heroMicrocopy}
                    onChange={(event) => updateToken('heroMicrocopy', event.target.value)}
                  />
                </label>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/85 shadow-[var(--shadow-elev-1)]">
              <CardHeader className="pb-3">
                <CardTitle>Fonts</CardTitle>
                <CardDescription>Choose the families that shape headings, body copy, and mono text.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FontField
                  label="Display / headings"
                  helper="Used by the hero title, section headings, and other high-contrast display text."
                  value={theme.fontDisplay}
                  kind="sans"
                  onChange={(next) => updateToken('fontDisplay', next as SansFontChoice)}
                  options={DISPLAY_FONT_OPTIONS}
                />
                <FontField
                  label="Body copy"
                  helper="Used by paragraphs, labels, and the supporting explanation text."
                  value={theme.fontBody}
                  kind="sans"
                  onChange={(next) => updateToken('fontBody', next as SansFontChoice)}
                  options={BODY_FONT_OPTIONS}
                />
                <FontField
                  label="Mono / code"
                  helper="Used by tokens, specs, IDs, and technical labels."
                  value={theme.fontMono}
                  kind="mono"
                  onChange={(next) => updateToken('fontMono', next as MonoFontChoice)}
                  options={MONO_FONT_OPTIONS}
                />
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/85 shadow-[var(--shadow-elev-1)]">
              <CardHeader className="pb-3">
                <CardTitle>Typography</CardTitle>
                <CardDescription>Adjust the heading and body scale used across the page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {TYPOGRAPHY_CONTROLS.map((control) => (
                  <RangeField
                    key={control.key}
                    label={control.label}
                    helper={control.helper}
                    value={theme[control.key] as number}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    onChange={(next) => updateToken(control.key, next as any)}
                  />
                ))}

                <div className="rounded-xl border border-border/40 bg-background p-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Specimen</div>
                  <div className="space-y-2">
                    <div className="sf-h1 text-foreground">{theme.heroTitle}</div>
                    <div className="sf-h2 text-foreground">Section heading</div>
                    <div className="sf-h3 text-foreground">Card heading</div>
                    <div className="sf-h4 text-foreground">Eyebrow and label</div>
                    <p className="sf-body-lg text-muted-foreground">Lead paragraph for a product intro or explanation.</p>
                    <p className="sf-body text-muted-foreground">Default body copy for most content on the page.</p>
                    <p className="sf-body-sm text-muted-foreground">Small helper text for descriptions and metadata.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/85 shadow-[var(--shadow-elev-1)]">
              <CardHeader className="pb-3">
                <CardTitle>Semantic colors</CardTitle>
                <CardDescription>These map directly to the shadcn tokens used by the app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {COLOR_CONTROLS.map((token) => (
                  <ColorField
                    key={token.key}
                    label={token.label}
                    helper={token.helper}
                    value={theme[token.key] as string}
                    onChange={(next) => updateToken(token.key, next)}
                  />
                ))}
                <div className="rounded-xl border border-border/40 bg-background px-3 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Palette className="h-4 w-4 text-foreground" />
                    Token note
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    These values update the main discover view immediately, so the design system acts as the source of
                    truth instead of a separate mock.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            <Card className="overflow-hidden border-border/40 bg-card/85 shadow-[var(--shadow-elev-1)]">
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="sf-h2">Preview hero</CardTitle>
                    <CardDescription>
                      The same tokens and copy the main app uses, but isolated for safe tweaking.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
                      Stable tokens
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
                      Live refresh
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 p-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="p-5 md:p-6">
                  <div className="space-y-3 rounded-[calc(var(--radius)*1.5)] border border-border/40 bg-background p-5 md:p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/45 bg-card px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
                      {theme.brandName}
                    </div>
                    <h2 className="sf-h1 max-w-3xl text-foreground">{theme.heroTitle}</h2>
                    <p className="sf-body-lg max-w-2xl text-foreground/80">{theme.heroSubtitle}</p>
                    <p className="sf-body-sm font-semibold text-muted-foreground">{theme.heroMicrocopy}</p>
                    <Separator className="my-5 bg-border/45" />
                    <div className="flex flex-wrap gap-2">
                      <Button className="rounded-full">Primary action</Button>
                      <Button variant="outline" className="rounded-full">
                        Secondary action
                      </Button>
                      <Button variant="secondary" className="rounded-full">
                        Soft accent
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {previewBadgeVariants.map((badge) => (
                        <Badge key={badge.label} variant={badge.variant} className="rounded-full px-3 py-1">
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/40 bg-muted/20 p-5 md:p-6 lg:border-l lg:border-t-0">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Controls</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button className="rounded-full">Save</Button>
                        <Button variant="outline" className="rounded-full">
                          Edit
                        </Button>
                        <Button variant="ghost" className="rounded-full">
                          Share
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Search</div>
                      <Input className="mt-3" placeholder="Filter stays, tokens, or components..." />
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Chips</div>
                      <ToggleGroup type="single" value="spa" className="mt-3 flex-wrap justify-start">
                        {['Spa', 'Design', 'Luxury', 'Family'].map((label) => (
                          <ToggleGroupItem
                            key={label}
                            value={label.toLowerCase()}
                            className="rounded-full border-border/45 bg-background px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            {label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full rounded-full">
                          Open dialog preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dialog surface</DialogTitle>
                          <DialogDescription>
                            This is the same modal pattern used by the hotel details sheet.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 text-sm text-muted-foreground">
                          <p>The dialog uses the same semantic tokens, radius, and elevation as the rest of the page.</p>
                          <p>Changing the theme controls above will update this instantly too.</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-border/40 bg-card/85 shadow-[var(--shadow-elev-1)]">
                <CardHeader className="pb-3">
                  <CardTitle className="sf-h3">Shadcn component gallery</CardTitle>
                  <CardDescription>
                    Buttons, badges, inputs, toggles, separators, dialogs, and scroll areas all share the same token
                    system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Buttons</div>
                    <div className="flex flex-wrap gap-2">
                      <Button className="rounded-full">Default</Button>
                      <Button variant="outline" className="rounded-full">
                        Outline
                      </Button>
                      <Button variant="secondary" className="rounded-full">
                        Secondary
                      </Button>
                      <Button variant="ghost" className="rounded-full">
                        Ghost
                      </Button>
                      <Button variant="destructive" className="rounded-full">
                        Delete
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Inputs</div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input placeholder="Search something" />
                      <Input placeholder="hotel-vibe-01" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Badges</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Primary</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="ghost">Ghost</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Toggles</div>
                    <div className="flex flex-wrap gap-2">
                      <Toggle defaultPressed className="rounded-full border border-border/45 px-3">
                        Filter on
                      </Toggle>
                      <Toggle className="rounded-full border border-border/45 px-3">Filter off</Toggle>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Toggle group</div>
                    <ToggleGroup type="single" value="spa" className="flex flex-wrap gap-2 justify-start">
                      {['Spa', 'Design', 'Luxury', 'Family'].map((label) => (
                        <ToggleGroupItem
                          key={label}
                          value={label.toLowerCase()}
                          variant="outline"
                          className="rounded-full bg-background px-3 text-sm font-semibold data-[state=on]:border-primary/30 data-[state=on]:bg-secondary"
                        >
                          {label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/85 shadow-[var(--shadow-elev-1)]">
                <CardHeader className="pb-3">
                  <CardTitle className="sf-h3">Surface previews</CardTitle>
                  <CardDescription>
                    The same surfaces used in the hotel cards, dialogs, and supporting UI.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Paintbrush className="h-4 w-4 text-foreground" />
                      Card surface
                    </div>
                    <p className="mt-2 sf-body-sm text-muted-foreground">
                      The card component follows the same radius, border rhythm, and shadow language used by the
                      hotel list.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Dialog</div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="mt-3 rounded-full">
                          Open dialog
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dialog preview</DialogTitle>
                          <DialogDescription>
                            A modal built from the same shadcn primitives as the product details sheet.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="sf-body-sm space-y-2 text-muted-foreground">
                          <p>Use this area to test spacing, borders, and brand colors without touching the main flow.</p>
                          <p>Every change above should reflect here and in the discover view instantly.</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Separator />

                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Scrollable list</div>
                    <ScrollArea className="mt-3 h-52 rounded-xl border border-border/40 bg-background">
                      <div className="space-y-2 p-3">
                        {[
                          'Button',
                          'Badge',
                          'Input',
                          'Toggle',
                          'Toggle group',
                          'Separator',
                          'Dialog',
                          'Card',
                          'ScrollArea',
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-lg border border-border/35 bg-card/60 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="sf-body-sm font-semibold text-foreground">{item}</div>
                              <div className="text-xs text-muted-foreground">shadcn primitive in this prototype</div>
                            </div>
                            <Badge variant="outline" className="rounded-full">
                              Live
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/40 bg-card/85 shadow-[var(--shadow-elev-1)]">
              <CardHeader className="pb-3">
                <CardTitle className="sf-h3">Stay card preview</CardTitle>
                <CardDescription>Uses the actual result card component from the product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StayCard
                  stay={sampleStay}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                  onOpenDetails={() => {}}
                />
                  <div className="rounded-xl border border-border/40 bg-muted/25 p-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-foreground">
                    <SlidersHorizontal className="h-4 w-4 text-foreground" />
                    Brand note
                  </div>
                  <p className="mt-2 leading-relaxed">
                    This page is the live source of truth for StayFirst tokens. Colors, typography, and the shadcn
                    primitives above all feed the main discover experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
