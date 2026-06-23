/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { Preferences } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UI } from '@/lib/ui';

type PickerId = 'who' | 'mood' | 'scene' | 'when' | 'extras';

const BUDGET_OPTIONS: Array<{ id: Preferences['budget']; label: string }> = [
  { id: 'Save it for the wine', label: 'Save it for the wine' },
  { id: 'The sweet spot', label: 'The sweet spot' },
  { id: 'Make it rain', label: 'Make it rain' },
];

// Mood: trendier, concise labels (25–45, "aware").
const MOOD_OPTIONS = [
  'Switch off',
  'Spa reset',
  'Quiet luxury',
  'Design stay',
  'Romantic',
  'Beach calm',
  'City energy',
  'Food & wine',
  'Outdoors',
  'Easy with kids',
] as const;

const SCENE_OPTIONS = [
  'Beach & sun',
  'City pulse',
  'Mountains',
  'Countryside',
  'Island',
  'Lakeside',
  'Desert',
  'Snow & ski',
] as const;

const WHEN_OPTIONS = ['Soon', 'This summer', 'This winter', 'Flexible'] as const;

const AMENITY_OPTIONS: Preferences['amenities'] = ['Spa', 'Pool', 'Fine Dining', 'Pet Friendly'];
const SETTING_OPTIONS: Preferences['settings'] = ['Secluded', 'Mountain View', 'Forest'];

function PromptChip({
  label,
  tone = 'default',
  isPlaceholder = false,
  isActive = false,
  onClick,
}: {
  label: string;
  tone?: 'default' | 'primary';
  isPlaceholder?: boolean;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 border px-3 py-1 text-[13px] font-semibold transition-colors duration-150 ease-out",
        UI.pillRadius,
        isActive ? "border-primary/50 bg-primary/10 text-foreground" : "",
        isPlaceholder
          ? "border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/55"
          : tone === 'primary'
            ? "border-border/50 bg-background text-foreground hover:bg-muted/40"
            : "border-border/40 bg-background/70 text-foreground hover:bg-muted/35"
      )}
    >
      {label}
    </button>
  );
}

function OptionChip({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center border px-3 py-1 text-[13px] font-semibold transition-all duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed",
        UI.pillRadius,
        selected
          ? "bg-primary text-primary-foreground border-primary/60 shadow-[var(--shadow-elev-1)]"
          : "bg-background border-border/40 text-muted-foreground hover:border-secondary/50 active:border-secondary active:ring-1 active:ring-secondary/30 active:bg-secondary/5 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function isRedundantPair(mood: string, scene: string) {
  if (!mood || !scene) return false;
  const map: Record<string, string[]> = {
    'City energy': ['City pulse'],
    'Beach calm': ['Beach & sun'],
  };
  return Boolean(map[mood]?.includes(scene));
}

function joinWithOr(items: string[]) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, or ${items[items.length - 1]}`;
}

function formatExtras(preferences: Preferences) {
  const amenities = preferences.amenities.map((a) => `a ${a.toLowerCase()}`);
  const settings = preferences.settings.map((s) => {
    const normalized = s.toLowerCase();
    if (normalized === 'mountain view') return 'a mountain view';
    return `a ${normalized}`;
  });

  const all = [...amenities, ...settings];
  return joinWithOr(all);
}

function budgetPrefix(budget: Preferences['budget'] | '') {
  if (!budget) return "My budget is";
  return "My budget is";
}

function budgetLabel(budget: Preferences['budget'] | '') {
  if (!budget) return 'Price?';
  if (budget === 'Save it for the wine') return 'tight';
  if (budget === 'The sweet spot') return 'flexible';
  if (budget === 'Make it rain') return 'unlimited';
  return 'Price?';
}

function moodPrefix(mood: Preferences['mood'] | '') {
  if (!mood) return 'and want';
  if (mood === 'Quiet luxury') return 'and want some';
  if (mood === 'City energy') return 'and want some';
  if (mood === 'Beach calm') return 'and want some';
  return 'and want a';
}

function moodToPhrase(mood: Preferences['mood'] | '') {
  if (!mood) return 'What mood?';
  if (mood === 'Spa reset') return 'spa reset';
  if (mood === 'Design stay') return 'design stay';
  if (mood === 'Food & wine') return 'food & wine stay';
  if (mood === 'Easy with kids') return 'easy-with-kids stay';
  if (mood === 'Switch off') return 'switch-off stay';
  if (mood === 'Quiet luxury') return 'quiet luxury';
  if (mood === 'Beach calm') return 'beach calm';
  if (mood === 'City energy') return 'city energy';
  if (mood === 'Outdoors') return 'outdoorsy stay';
  return mood.toLowerCase();
}

function sceneToPhrase(scene: Preferences['scene'] | '') {
  if (!scene) return 'What setting?';
  if (scene === 'City pulse') return 'city pulse';
  return scene.toLowerCase();
}

function whenToPhrase(when: Preferences['timeline'] | '') {
  if (!when) return 'Roughly when?';
  if (when === 'Soon') return 'pretty soon';
  if (when === 'Flexible') return 'with flexible timing';
  return when.toLowerCase();
}

export default function PromptBuilder({
  preferences,
  onChange,
  onReset,
  variant = 'compact',
}: {
  preferences: Preferences;
  onChange: (update: Partial<Preferences>) => void;
  onReset: () => void;
  variant?: 'hero' | 'compact';
}) {
  const isHero = variant === 'hero';
  const getCurrentPicker = (prefs: Preferences): PickerId => {
    if (!prefs.budget) return 'who';
    if (!prefs.mood) return 'mood';
    if (!prefs.scene) return 'scene';
    if (!prefs.timeline) return 'when';
    return 'extras';
  };

  const currentPicker = useMemo(() => getCurrentPicker(preferences), [
    preferences.budget,
    preferences.mood,
    preferences.scene,
    preferences.timeline,
  ]);

  const [activePicker, setActivePicker] = useState<PickerId>(() => currentPicker);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const didMountRef = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerCollapsed(true);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setIsUpdating(true);
    const t = window.setTimeout(() => setIsUpdating(false), 700);
    return () => window.clearTimeout(t);
  }, [
    preferences.budget,
    preferences.mood,
    preferences.scene,
    preferences.timeline,
    preferences.amenities.join('|'),
    preferences.settings.join('|'),
  ]);

  const extrasCount = preferences.amenities.length + preferences.settings.length;
  const requiredComplete = Boolean(
    preferences.budget && preferences.mood && preferences.scene && preferences.timeline,
  );

  const applyUpdate = (update: Partial<Preferences>) => {
    onChange(update);
    setDrawerCollapsed(false);
    setActivePicker(getCurrentPicker({ ...preferences, ...update }));
  };

  const sentence = useMemo(() => {
    const who = preferences.budget ? preferences.budget : null;
    const mood = preferences.mood || null;
    const scene = preferences.scene || null;
    const when = preferences.timeline || null;
    const hasWho = Boolean(who);
    const hasMood = Boolean(mood);
    const hasScene = Boolean(scene);
    const hasWhen = Boolean(when);

    const whoChip = (
      <PromptChip
        label={budgetLabel(who ?? '')}
        isPlaceholder={!who}
        isActive={!drawerCollapsed && activePicker === 'who'}
        onClick={() => {
          setActivePicker('who');
          setDrawerCollapsed(false);
        }}
      />
    );

    const moodChip = (
      <PromptChip
        label={moodToPhrase(mood ?? '')}
        isPlaceholder={!mood}
        isActive={!drawerCollapsed && activePicker === 'mood'}
        onClick={() => {
          setActivePicker('mood');
          setDrawerCollapsed(false);
        }}
      />
    );

    const sceneChip = (
      <PromptChip
        label={sceneToPhrase(scene ?? '')}
        isPlaceholder={!scene}
        isActive={!drawerCollapsed && activePicker === 'scene'}
        onClick={() => {
          setActivePicker('scene');
          setDrawerCollapsed(false);
        }}
      />
    );

    const whenChip = (
      <PromptChip
        label={whenToPhrase(when ?? '')}
        isPlaceholder={!when}
        isActive={!drawerCollapsed && activePicker === 'when'}
        onClick={() => {
          setActivePicker('when');
          setDrawerCollapsed(false);
        }}
      />
    );

    const extrasChip = (
      <PromptChip
        label={extrasCount > 0 ? `Extras (${extrasCount})` : 'Add extras (optional)'}
        isPlaceholder={extrasCount === 0}
        isActive={!drawerCollapsed && activePicker === 'extras'}
        onClick={() => {
          setActivePicker('extras');
          setDrawerCollapsed(false);
        }}
      />
    );

    const showMoodSceneConnector = Boolean(mood && scene);
    const extrasText = extrasCount > 0 ? formatExtras(preferences) : '';

    const Story = ({ children }: { children: ReactNode }) => (
      <div className="sf-hide-scrollbar flex items-center gap-2 whitespace-nowrap overflow-x-auto">
        {children}
      </div>
    );

    if (!hasWho) {
      return (
        <Story>
          <span className="text-sm font-semibold text-muted-foreground/80">Start with</span>
          {whoChip}
        </Story>
      );
    }

    if (!hasMood) {
      return (
        <Story>
          <span className="text-sm font-semibold text-muted-foreground/80">{budgetPrefix(who ?? '')}</span>
          {whoChip}
          <span className="text-sm font-semibold text-muted-foreground/80">{moodPrefix(mood ?? '')}</span>
          {moodChip}
        </Story>
      );
    }

    if (!hasScene) {
      return (
        <Story>
          <span className="text-sm font-semibold text-muted-foreground/80">{budgetPrefix(who ?? '')}</span>
          {whoChip}
          <span className="text-sm font-semibold text-muted-foreground/80">{moodPrefix(mood ?? '')}</span>
          {moodChip}
          <span className="text-sm font-semibold text-muted-foreground/80">in</span>
          {sceneChip}
        </Story>
      );
    }

    if (!hasWhen) {
      return (
        <Story>
          <span className="text-sm font-semibold text-muted-foreground/80">{budgetPrefix(who ?? '')}</span>
          {whoChip}
          <span className="text-sm font-semibold text-muted-foreground/80">{moodPrefix(mood ?? '')}</span>
          {moodChip}
          {showMoodSceneConnector ? (
            <span className="text-sm font-semibold text-muted-foreground/80">but with some</span>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground/80">in</span>
          )}
          {sceneChip}
          <span className="text-sm font-semibold text-muted-foreground/80">.</span>
          <span className="text-sm font-semibold text-muted-foreground/80">Looking to travel</span>
          {whenChip}
        </Story>
      );
    }

    return (
      <div className="sf-hide-scrollbar flex items-center gap-2 whitespace-nowrap overflow-x-auto">
        <span className="text-sm font-semibold text-muted-foreground/80">{budgetPrefix(who ?? '')}</span>
        {whoChip}

        <span className="text-sm font-semibold text-muted-foreground/80">{moodPrefix(mood ?? '')}</span>
        {moodChip}

        {showMoodSceneConnector ? (
          <span className="text-sm font-semibold text-muted-foreground/80">but with some</span>
        ) : (
          <span className="text-sm font-semibold text-muted-foreground/80">in</span>
        )}
        {sceneChip}

        <span className="text-sm font-semibold text-muted-foreground/80">.</span>
        <span className="text-sm font-semibold text-muted-foreground/80">Looking to travel</span>
        {whenChip}

        <span className="text-sm font-semibold text-muted-foreground/80">,</span>
        <span className="text-sm font-semibold text-muted-foreground/80">and it’d be nice with</span>
        {extrasCount > 0 ? (
          <span className="text-sm font-semibold text-foreground/90">{extrasText}</span>
        ) : null}
        {extrasChip}
        <span className="text-sm font-semibold text-muted-foreground/80">.</span>
      </div>
    );
  }, [
    preferences.budget,
    preferences.mood,
    preferences.scene,
    preferences.timeline,
    preferences.amenities,
    preferences.settings,
    extrasCount,
    activePicker,
    drawerCollapsed,
  ]);

  const PickerPanel = ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
            {title}
          </div>
        </div>
      </div>
      {children}
    </div>
  );

  const renderPickerContent = (id: PickerId) => {
    if (id === 'who') {
      return (
        <PickerPanel title="What's the budget?">
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_OPTIONS.map((opt) => (
              <OptionChip
                key={opt.id}
                label={opt.label}
                selected={preferences.budget === opt.id}
                onClick={() => {
                  applyUpdate({ budget: opt.id });
                }}
              />
            ))}
          </div>
        </PickerPanel>
      );
    }

    if (id === 'mood') {
      return (
        <PickerPanel title="What are you after?">
          <div className="flex flex-wrap gap-1.5">
            {MOOD_OPTIONS.map((opt) => (
              <OptionChip
                key={opt}
                label={opt}
                selected={preferences.mood === opt}
                disabled={Boolean(preferences.scene && isRedundantPair(opt, preferences.scene))}
                onClick={() => {
                  const nextMood = opt;
                  const next: Partial<Preferences> = { mood: nextMood };
                  if (preferences.scene && isRedundantPair(nextMood, preferences.scene)) {
                    next.scene = '';
                  }
                  applyUpdate(next);
                }}
              />
            ))}
          </div>
        </PickerPanel>
      );
    }

    if (id === 'scene') {
      return (
        <PickerPanel title="Where should it feel like?">
          <div className="flex flex-wrap gap-1.5">
            {SCENE_OPTIONS.map((opt) => (
              <OptionChip
                key={opt}
                label={opt}
                selected={preferences.scene === opt}
                disabled={Boolean(preferences.mood && isRedundantPair(preferences.mood, opt))}
                onClick={() => {
                  applyUpdate({ scene: opt });
                }}
              />
            ))}
          </div>
        </PickerPanel>
      );
    }

    if (id === 'when') {
      return (
        <PickerPanel title="Roughly when?">
          <div className="flex flex-wrap gap-1.5">
            {WHEN_OPTIONS.map((opt) => (
              <OptionChip
                key={opt}
                label={opt}
                selected={preferences.timeline === opt}
                onClick={() => {
                  applyUpdate({ timeline: opt });
                }}
              />
            ))}
          </div>
        </PickerPanel>
      );
    }

    return (
      <div className="space-y-3">
        <PickerPanel title="Extras (optional)">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
                Amenities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AMENITY_OPTIONS.map((opt) => {
                  const selected = preferences.amenities.includes(opt);
                  return (
                    <OptionChip
                      key={opt}
                      label={opt}
                      selected={selected}
                      onClick={() => {
                        const next = selected
                          ? preferences.amenities.filter((a) => a !== opt)
                          : [...preferences.amenities, opt];
                        applyUpdate({ amenities: next });
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
                Setting
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SETTING_OPTIONS.map((opt) => {
                  const selected = preferences.settings.includes(opt);
                  return (
                    <OptionChip
                      key={opt}
                      label={opt}
                      selected={selected}
                      onClick={() => {
                        const next = selected
                          ? preferences.settings.filter((s) => s !== opt)
                          : [...preferences.settings, opt];
                        applyUpdate({ settings: next });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </PickerPanel>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            className={cn("rounded-full", extrasCount === 0 ? "opacity-60" : "")}
            onClick={() => {
              applyUpdate({ amenities: [], settings: [] });
            }}
            disabled={extrasCount === 0}
          >
            Clear extras
          </Button>
          <div className="flex items-center gap-2">
            {extrasCount === 0 ? (
              <Button
                type="button"
                variant="secondary"
                className="rounded-full"
                onClick={() => setDrawerCollapsed(true)}
              >
                Skip for now
              </Button>
            ) : null}
            <Button type="button" className="rounded-full" onClick={() => setDrawerCollapsed(true)}>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const bar = (
    <div className="w-full">
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1 overflow-hidden">{sentence}</div>
        {!drawerCollapsed ? (
          <div className="hidden md:flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
            {isUpdating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating
              </>
            ) : requiredComplete ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Curated
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Building
              </>
            )}
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => setDrawerCollapsed((v) => !v)}
          aria-label={drawerCollapsed ? "Expand options" : "Collapse options"}
          title={drawerCollapsed ? "Expand options" : "Collapse options"}
        >
          {drawerCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => {
            onReset();
            setDrawerCollapsed(false);
            setActivePicker('who');
          }}
          aria-label="Reset brief"
          title="Reset brief"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (isHero && !preferences.budget) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-muted-foreground">
              Start here
            </div>
            <div className="mt-0.5 text-sm font-bold text-foreground">What's the budget?</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-lg"
            onClick={() => {
              onReset();
              setDrawerCollapsed(false);
              setActivePicker('who');
            }}
            aria-label="Reset"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3">{renderPickerContent('who')}</div>

        <div className="mt-4 rounded-xl border border-border/70 bg-background/60 px-4 py-3">
          <div className="text-xs font-semibold text-muted-foreground">
            Pick one to begin — results appear immediately, and you can refine as you go.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {!drawerCollapsed ? (
          <div className="overflow-hidden border-b border-border/70">
            <div className="flex items-start justify-between gap-3 py-2">
              <div className="min-w-0 flex-1 max-h-40 md:max-h-44 overflow-y-auto pr-1">
                {renderPickerContent(activePicker)}
              </div>
            </div>
          </div>
        ) : null}

        {bar}

        {!drawerCollapsed && requiredComplete ? (
          <div className="sr-only" aria-live="polite">
            Extras are optional. Use the Done button to collapse.
          </div>
        ) : null}
      </div>
    </>
  );
}
