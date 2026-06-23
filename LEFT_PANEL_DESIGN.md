# StayFirst — Left Panel (Brief Editor + Utilities) (v1)

Last updated: **May 29, 2026**

This document specifies the **left panel** behavior and UI once the new prompt-first search flow is in place.

## What’s locked
- The left panel is the persistent place to **edit the brief while browsing results**.
- Results controls (count/sort/view) are **not** in the left panel.

## Left panel layout
Top → bottom:
1) **Brief cards** (stacked)
2) **Utility nav** (Past searches / Saved hotels / Settings) pinned at the bottom of the panel

## Brief cards
Cards (always visible after search starts):
- Who
- Mood
- Setting
- When
- Extras

### Visual treatment
- Small stacked cards with a thin border, subtle shadow, and tight spacing.
- Each card shows:
  - Step label (tiny, uppercase, tracked)
  - Selected value (or a placeholder)
  - An icon that **varies by selected value**

### Behavior
- Clicking a card expands it **in place**.
- Expanded content shows the available option pills inside the same card (below the selected value).
- Default: **all cards collapsed** while browsing (no auto-expanded card).
- After search starts: show all cards (even unanswered) with placeholders; user can jump to any.

### Extras card
- Collapsed: show a single summary line (e.g., “Pool + Spa” or “Optional add-ons”).
- Expanded: multi-select pills (Amenities + Setting).

### Updates
- Any change updates results instantly (debounced), with a subtle “Updating…” state consistent with the prompt slab.

## Utility nav
- Always visible as a **simple list** (no accordion).
- Items:
  - Past searches
  - Saved hotels
  - Settings

### Interactions
- Clicking a Past search item loads that brief in the **middle column** (left panel stays visible).
- Clicking Saved hotels opens the saved list in the **middle column** (left panel stays visible).

## Persistence
- Persist:
  - current brief
  - last used utility section
…via localStorage.

## Non-goals
- Left panel does not show hotels/results.
- No modal/drawer utilities for v1.

## Decision log (May 29, 2026)
- Inline expand-to-edit per card.
- Value-based icons.
- No results controls in the left panel.
- Utility features live at the bottom and do not collapse.
- Past/Saved actions update the middle column, not full navigation.

