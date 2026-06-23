# My Hotel Vibe — Brand Guidelines
## Identity: “Avant‑Garde Studio” (v1 draft)

### 0) What’s locked
- The product UX architecture and 3‑zone layout are locked (utility rail + main column + bottom living brief).
- This document defines the *aesthetic + narrative layer* only (visual identity + copy tone).

---

## 1) Target Users (Primary)
Urban, taste‑aware Europeans (25–45) who arrive with a clear vacation vision.

They want:
- High standards and a premium feel
- Smart value (not “luxury at any price”)
- Confidence and control without spreadsheet energy

Non‑goals:
- Generic “booking engine” vibes
- Snark/judgment or gatekeeping taste

---

## 2) Emotional Outcome (First 10 seconds)
The interface should immediately feel:
- **“This is me.”** (taste validation)
- **“This is sharp.”** (precision + control)

---

## 3) Brand Promise (One line)
**Tell us the vibe — we’ll find the stays that match.**

---

## 4) Personality (How we act)
Dominant lens: **Calm studio assistant**
- Clear, structured, quietly confident
- Helps users make decisions without noise

Accent lenses (used selectively):
- **Editor**: curation, framing, “why this is notable”
- **Well‑traveled friend**: human reassurance, grounded honesty

---

## 5) Tone of Voice (How we speak)
Default mode: **Minimal + confident**
- Short, decisive sentences
- Strong verbs
- Zero UI‑robot phrases

Allowed accents (occasional):
- Warm + friendly (supportive, reassuring)
- Editorial (a little cadence, never purple prose)

Hard anti‑voice:
- Booking‑engine language: “Results found”, “Filters applied”, “Sorting by…”
- Snark/judgment: “Obviously”, “You should”, “Only…”

---

## 6) Copy Patterns & Templates

### 6.0 Default format
Use **short, minimal fragments** by default (UI-like). When needed, add a second line that is warm/editorial.
Keep it concrete and action-oriented.

### 6.1 UI labels
Rule: **editorial microcopy first, numbers second**.
- Do: “Matches your brief” → “Showing 50 of 4,578 stays”
- Don’t: “50 results found”

### 6.2 Tradeoffs (“just a heads up”)
Tradeoffs are honest, calm, and specific.
- Pattern: “Just a heads up: you trade **X** for **Y**.”
- Avoid: red panic language, exclamation points, or fear‑based urgency

### 6.3 Empty states
Tone: constructive, quick recovery.
- Pattern: “Nothing matches that mix.” → 1–2 next steps.

### 6.4 Microcopy checklist (every sentence)
- Does it sound like a calm assistant?
- Is it specific?
- Is it non‑judgmental?
- Does it help the next action?

### 6.5 Do / Don’t (quick rules)
Do:
- “Matches your brief.”
- “Just a heads up: you trade the pool for a private beach.”
- “Try removing one extra.”

Don’t:
- “Results found.”
- “Filters applied.”
- “You should…”
- “Obviously…”

### 6.6 Template library (starter set)
Hero:
- Title: “Find the stay that fits your vibe.”
- Subtitle: “A few quick choices, then a shortlist with reasons and tradeoffs.”

Results toolbar:
- Lead: “Matches your brief”
- Secondary: “Showing {visible} of {total} stays”

Tradeoff:
- “Just a heads up: {tradeoff}.”

Empty state:
- “Nothing matches that mix.”
- “Try removing an extra, or switch back to Best match.”

Error (non-panicky):
- “Couldn’t load that right now.”
- “Try again in a moment.”

---

## 7) Visual System

### 7.1 Overall vibe
“Editorial + workspace precision”:
- Clean canvas (no grid texture, no handwriting layer)
- Strong hierarchy through spacing, type scale, and thin rules
- Balanced boldness (identity accents appear often enough to define the brand, but not everywhere)

### 7.2 Geometry
- Corner radius: **8–12px** for cards, panels, sheets, and inputs
- Pills/tags: rounded full is fine (keep consistent)

### 7.3 Borders & separators
- Prefer 1px rules and low‑contrast separators
- Surfaces should not feel boxed‑in; structure should feel *drawn*, not *panelized*

### 7.4 Shadows
Use gallery‑light shadows only:
- `0px 4px 24px rgba(30, 28, 26, 0.03)`

### 7.5 Motion
Motion should be **snappy + subtle**:
- Quick transitions, no theatrical easing
- Use motion to clarify state changes (rank changes, focus, open/close), not to decorate

---

## 8) Color System (Role‑Based)
We use a small accent system with strict semantic roles:

### Base neutrals (proposed defaults — validate)
We’ll finalize the exact neutral tones in-context. The intent:
- Canvas: warm, clean, print-like off-white
- Surface/container: soft cream for depth
- Ink text: espresso charcoal (never pure black)
- Separator/border: faint low-contrast rule

### Accent roles (no hex here — choose in-context)
**Accents are rare.** If something is colored, it should *mean something*.

- **Primary Action Accent (Studio Marker)**:
  - Meaning: “do / go / commit”
  - Used for: primary buttons, the single most important action in a view
  - Not used for: headings, general decoration, “everything clickable”

- **Tradeoff / Caution Accent** (distinct from primary):
  - Meaning: “heads up / you’re trading X for Y”
  - Used for: tradeoff callouts, caution chips, “note” badges when there is a real downside
  - Not used for: errors everywhere (avoid panic UX)

- **Fit / Recommended Accent (Moss/Olive family)**:
  - Meaning: “good fit / recommended”
  - Used for: match confirmations, recommended markers, positive signals
  - Not used for: generic success green everywhere

Accent budget guidance:
- Primary action accent: **one dominant action per view**
- Tradeoff accent: **only when a real tradeoff exists**
- Fit accent: **only for explicit “recommended/fit” moments**

---

## 9) Typography (Sans‑Only Editorial)
Editorial feel comes from hierarchy, not serif.

### Typeface strategy
- Use a geometric/system sans stack everywhere.
- Avoid ultra‑thin weights (readability + print‑like calm).

### Scale & hierarchy
- UI meta/labels: **13–14px**, dense, tracked for all‑caps section labels
- Editorial body: **16px** with relaxed leading for tradeoffs and explanations
- Headlines: larger scale with tight tracking; keep short lines

### Layout boundary labels
All‑caps, tracked, tiny:
- `text-xs uppercase tracking-widest`

---

## 10) Dark Mode
Dark mode is required.

Art direction: **“Inky studio”**
- Charcoal canvas with a subtle warm undertone
- Accents remain legible and intentional (avoid neon glow everywhere)

Accessibility stance:
- Aesthetics first
- Ensure WCAG AA primarily for **critical controls and essential text**

---

## 11) Rollout Checklist (Codebase)
This is the order to update the system safely:
1) Define semantic tokens (background/foreground/card/border + radii + shadows + focus states).
2) Define accent roles as named tokens (action / tradeoff / fit), then map to shadcn tokens where appropriate.
3) Update foundational components (Button, Badge, Toggle, ToggleGroup) to reflect role semantics.
4) Audit the three zones (rail / main / brief) for separator rhythm, spacing, and label hierarchy.
5) Copy sweep: hero, toolbar, tradeoffs, empty states, errors (remove booking-engine language).
6) Dark mode pass (critical contrast, focus outlines, surface depth).
7) Create a “brand QA checklist” for every new UI change (copy + contrast + accent budget).

---

## 12) Open Items (Need decisions)
1) Choose exact hex values for:
   - Primary Action Accent (in-context)
   - Tradeoff/Caution Accent (in-context)
   - Fit/Recommended Moss/Olive Accent (in-context)
2) Confirm the neutral base palette (canvas/surface/ink/border) in-context.
