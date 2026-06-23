# StayFirst — Start/Search Section (v1)

Last updated: **May 29, 2026**

This document specifies the **start-page prompt slab** and the **initial search flow** for Discover.

## What’s locked
- The 3-zone architecture stays: **left panel** (brief editor + utility), **middle** (prompt + results), **detail modal**.
- Chips-only brief schema stays: `Who → Mood → Setting → When → Extras (optional)`.
- Results are **hidden until the first choice** (`Who`) is made.
- After search starts, the **left panel** is the persistent editor (stacked cards).

## Goal
Make the start page feel like a premium, calm “studio tool”:
- obvious first action
- minimal cognitive load
- clear progression without wizard-y chrome

## Primary concept: “Prompt Slab + Step Rail”

### Start state (no selections)
- Middle column shows a **single centered slab** (no hotels visible).
- Slab contains:
  - Tiny label (tracked, uppercase): e.g. “Start with”
  - Large soft-pill chips for **Who’s traveling?** (the only actionable controls)
  - A subtle one-line helper: “Pick one to begin — results appear immediately.”
- No sentence row yet (avoid duplicating “Start with” + placeholder sentence).

### After `Who` is selected
- Slab **keeps the same height** but swaps the chip row to the **next step** (Mood).
- A **step rail** appears (or becomes active) inside the slab:
  - `Who · Mood · Setting · When`
  - Current step is highlighted (subtle: text-foreground + thin indicator), others muted.
- Results appear **below** the slab with a gentle reveal (fade/slide).
- Slab becomes “sticky for a bit”:
  - It pins to the top of the middle scroll area while the slab container is in view.
  - After the user scrolls past the slab container, it releases; the user relies on the left panel.
- Results toolbar behavior:
  - The results toolbar sits **below the slab** in normal flow.
  - It becomes sticky **only after** the slab has released (i.e., once the toolbar reaches the top of the scroll area).

### After required steps complete
- Slab can switch from “step chips” to the compact sentence editor (existing `PromptBuilder` compact mode),
  but should still honor the step rail concept (i.e., the current chip is clearly “active”).

## Editorial block (pre-search only)
- Visible only when no selections have been made.
- Purpose: add brand “soul” and inspiration without competing with the first action.
- Content mix:
  - **Destination inspiration** (regions, moods, seasonal angles)
  - **Stay stories** (single-stay spotlights)
- Layout:
  - One featured card + 2–3 supporting cards is preferred.
  - Always secondary to the prompt slab.

## Copy / tone
- Calm, minimal, non-marketing.
- Avoid: “Results found”, “Filters applied”, “Search”.
- Prefer: “Start with”, “Matches your brief”, “Just a heads up”.

## Motion
- Results reveal: 200–300ms opacity + slight translate, `ease-out`.
- Respect `prefers-reduced-motion` (disable transforms, keep instant opacity).

## Accessibility
- All chips are real `button`s with visible focus states.
- Step rail is informative only (no required interaction).
- No information is color-only; active step uses both color and subtle indicator.

## Non-functional requirements (assumptions)
- Local-only prototype: no network requirements.
- Re-ranking is debounced (300–500ms) with a small “Updating…” indicator.

## Decision log (May 29, 2026)
- Start page is **prompt-first**, centered slab.
- Only `Who` is actionable on first render (strict progression).
- Chips are **soft pills**, not segmented controls.
- After `Who`, slab height stays constant and swaps to the next step.
- Results reveal is **gentle**.
- Editorial stays on start page; content is **Destination + Stay stories**.

## Key risks / watchouts
- Sticky slab must not fight the middle scroll container (ensure correct stacking/z-index and no content jump).
- Avoid duplicated guidance (“Start with” appearing twice) by using a dedicated start state.
- Keep the editorial block visually secondary so it doesn’t steal the first action.
