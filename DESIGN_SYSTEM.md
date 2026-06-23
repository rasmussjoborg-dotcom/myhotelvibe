# StayFirst — Design System (v0)

This project uses **shadcn/ui (Radix + Tailwind v4)** as the foundation for a consistent token + component system.

## Brand guidelines
- High-level brand, voice, and visual rules live in `BRAND_GUIDELINES.md`.

## Source of truth
- **Semantic theme tokens:** `src/index.css`
  - Update colors, radii, and dark mode here.
  - shadcn components (e.g. `components/ui/*`) read from these tokens via Tailwind utilities (`bg-background`, `text-foreground`, `border-border`, etc.).

## Token layers
### 1) Semantic tokens (shadcn)
Defined on `:root` in `src/index.css`:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--border`, `--input`, `--ring`
- `--destructive`
- `--radius`
- `--sf-font-heading`, `--sf-font-display`, `--sf-font-sans`, `--sf-font-mono`
- `--sf-text-h1`, `--sf-text-h2`, `--sf-text-h3`, `--sf-text-h4`, `--sf-text-body-lg`, `--sf-text-body`, `--sf-text-body-sm`

Rule: **components should prefer semantic tokens** so the UI stays consistent if the palette changes.

### 2) Brand tokens (StayFirst)
Also in `src/index.css` (non-shadcn):
- `--shadow-elev-1`, `--shadow-elev-2`, `--shadow-modal` (soft luxury shadows)

Use brand tokens sparingly for “editorial atmosphere” (backgrounds, highlights), not for basic component colors.

### 3) Legacy compatibility tokens (deprecated)
There are still a few legacy color aliases defined in `@theme inline` in `src/index.css` (`--color-surface`, `--color-on-surface`, etc.).
They are kept only for safety, but the UI should **not** use classes like `bg-surface` / `text-on-surface` going forward.

## Component strategy
- Use shadcn primitives from `components/ui/*` for all new UI:
  - `Button`, `Input`, `Card`, `Badge`, `Separator`, `Dialog`, `ScrollArea`, `Toggle`, `ToggleGroup`
- Prefer shadcn semantics (`bg-background`, `bg-card`, `bg-muted`, `border-border`, `text-muted-foreground`) over hard-coded `bg-white/*`.
- Avoid blur on sticky UI; keep surfaces crisp and use `--sf-shadow*` + thin borders for depth.

## Layout consistency
- Spacing/radii helpers live in `@/lib/ui`:
  - Use `UI.pageX` for consistent left/right padding in the middle column.
  - Use `UI.cardRadius` and `UI.pillRadius` for consistent rounding.
  - Use `UI.elev1` / `UI.elev2Hover` / `UI.elevModal` for consistent elevation.

## Live playground
- The app now includes a dedicated design-system view at the app level, backed by `src/components/DesignSystemPage.tsx`.
- The design-system view is meant to be opened directly (`?tab=design`) and kept out of the product navigation.
- Theme values are persisted in localStorage via `src/lib/theme.ts` and applied directly to the CSS variables in `src/index.css`.
- Editing the design-system controls updates the live preview immediately and also updates the main app surfaces that use the same tokens.
- The playground now includes typography controls for H1-H4 and body scale, font-family controls for display/body/mono, plus a shadcn component gallery for the primitives already in the app.
