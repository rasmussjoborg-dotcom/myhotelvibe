## StayFirst — Prompt Builder (Chips-Only) Design

### Status
- Updated direction (May 29, 2026): move the prompt builder to a **centered start-page section** (no results until the first choice), then keep it at the top of the middle column while browsing. The left panel becomes the persistent “brief editor”.
- This doc is the implementation reference for the prompt UX + placement.

---

## Understanding Summary
- Build a centered “prompt builder” that becomes the primary way a user creates/refines a hotel brief.
- Chips-only: the user builds a first-person sentence using pre-filled choices (no free typing).
- Required flow: `Who → After (two picks: Mood + Scene) → When`, then optional `Extras`.
- The sentence is continuously rewritten (natural language), deterministic, and always includes chosen parts.
- Editing happens in-place: chips are embedded in the sentence; clicking a chip reopens its options.
- Start-page behavior: the middle column shows the prompt section and **no hotels** until the first choice (`Who`).
- Browsing behavior: the prompt section stays at the top of the middle column; after scrolling past it, the user relies on the left panel.
- Left panel behavior: a stacked card editor (Who / After / Setting / When / Extras) that stays editable while browsing.

---

## Assumptions
- Mood list: 10 items. Scene list: 8 items.
- Scenes are location-agnostic.
- Redundant Mood/Scene pairings are prevented in the UI.
- Results re-rank on change with a small debounce (~300–500ms).
- Basic keyboard support is required (tab/focus, enter/space open, arrows move, esc closes).
- Extras are fully optional (no nudging/forced selection).

---

## Decision Log
- Chips-only (no typing) to keep UX fast, consistent, and schema-truthful.
- First-person voice to feel personal and “concierge-like” without assistant chat.
- Continuously rewritten sentence (not slot UI) for premium “prompt” feel.
- Hybrid editor: desktop uses anchored popovers; mobile uses bottom sheet.
- Mood+Scene is a two-part “After” step to express both feeling + context quickly.
- Prompt builder replaces the existing refine UI to keep a single “source of truth”.
- The bottom dock is removed; the persistent editor surface is the left panel.

---

## Core Data Model
- `who`: `Couple | Solo | Friends | Family`
- `mood`: one of Mood (10)
- `scene`: one of Scene (8)
- `when`: `Soon | This summer | This winter | Flexible`
- `extras[]`: 0–4 (multi-select), appended to the sentence

---

## Copy + Taxonomy

### Mood (10) — understated Scandinavian labels
- Switch off
- Spa reset
- Quiet luxury
- Design stay
- Romantic
- Beach calm
- City energy
- Food & wine
- Outdoors
- Easy with kids

### Scene (8)
- Beach & sun
- City pulse
- Mountains
- Countryside
- Island
- Lakeside
- Desert
- Snow & ski

---

## Sentence Rewrite Rules (Deterministic)

### General rules
- Always include: Who, Mood, Scene, When (once selected).
- Maintain a small set of vetted templates and deterministic mappings (no LLM phrasing).
- Chips are rendered inline inside the sentence and are always clickable/focusable.

### Who clause (examples)
- Couple: “We’re traveling as a couple…”
- Solo: “I’m traveling solo…”
- Friends: “We’re traveling with friends…”
- Family: “We’re traveling as a family…”

### Mood + Scene mapping (examples)
- Mood contributes the “kind of stay” phrase (e.g., “a quiet-luxury stay”, “a design-forward stay”, “a spa-first stay”).
- Scene contributes the context phrase (e.g., “with beach vibes”, “with city energy”, “in the mountains”).

### When suffix
- Soon: “…soon.”
- This summer: “…this summer.”
- This winter: “…this winter.”
- Flexible: “…with flexible timing.”

### Extras append
- If extras exist: append “— with {extrasList}.”
- List formatting:
  - 1: “— with a spa.”
  - 2: “— with a spa and a kids’ pool.”
  - 3+: “— with a spa, a kids’ pool, and all-inclusive.”

---

## Picker UX (Hybrid)

### Desktop
- Clicking a chip opens an anchored popover near that chip.
- Single-select pickers close immediately on selection.
- Extras picker (multi-select) stays open until “Done” or click-outside.

### Mobile
- Clicking a chip opens a bottom sheet with the same options.
- Sheet provides a clear “Done” control and scrolls if needed.

---

## Redundancy Prevention (Mood ↔ Scene)
- If Mood implies the same concept as a Scene, disable the redundant counterpart.
  - Mood “Beach calm” disables Scene “Beach & sun” and vice versa.
  - Mood “City energy” disables Scene “City pulse” and vice versa.
- Disabled items show a helper: “Already covered by your other choice.”

---

## States

### Empty / pre-search
- Prompt builder is the hero: centered, editorial framing, invites the first step (Who).
- Main content shows no results until the first choice is made.
- Left panel can show the first card (Who), but the primary interaction is the centered prompt.

### Active brief
- Prompt builder sentence includes all required chips.
- Any change triggers debounced re-rank and subtle “Updating…” state.
 - Left panel cards remain editable while browsing.

### Edited brief
- Edits happen via in-sentence chips; no separate confirmation step.

---

## Non-goals (v1)
- No free typing.
- No assistant “chat”.
- No region input in the core 3 steps.
- No nudging/forcing extras.
