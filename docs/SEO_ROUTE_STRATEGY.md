# SEO Route Strategy

This document defines how `myhotelvibe.com` should scale its SEO route system as the hotel database grows.

## Why This Exists

My Hotel Vibe is not trying to become an exhaustive booking directory. The SEO system should support that editorial position, not fight it.

That means:

- we should keep route creation flexible for discovery and internal linking
- we should be selective about which routes deserve heavy editorial and indexing effort
- we should avoid letting a much larger database create hundreds of thin pages that dilute site quality

## Route Types

The current route system has four collection layers plus hotel pages:

- `hotel`
- `country`
- `destination`
- `vibe`
- `backdrop`

Each layer plays a different SEO role.

## Route Roles

### Hotel pages

- These are always important.
- They should remain indexable by default.
- They capture branded intent, direct property intent, and long-tail editorial queries around each stay.

### Country pages

- These are authority pages.
- They should become the strongest non-home collection layer over time.
- They work best when they summarize multiple destinations within one market.

### Destination pages

- These capture direct place-based search intent.
- They are valuable when a destination has enough hotel depth to feel like a real edit rather than a single listing wrapper.

### Vibe pages

- These are editorial discovery pages.
- They are strongest when they span multiple destinations and ideally more than one country.
- They help the brand own mood-led discovery, but they should not become thin taxonomy pages.

### Backdrop pages

- These are setting-first discovery pages.
- They can work well, but only when the hotel mix is broad enough to show a real pattern.

## Scaling Rules

These are the operating thresholds we should follow as the database grows.

### Country

- `Index now` when a country has at least 3 hotels across at least 2 destinations.
- `Build before prioritizing` when a country exists but is still too narrow.

Why:
A country page should feel like a market guide, not a stub.

### Destination

- `Index now` when a destination has 3 or more hotels.
- `Index lightly` when a destination has 2 hotels.
- `Keep accessible, not a growth priority` when a destination only has 1 hotel.

Why:
Single-hotel destinations can still be useful for users and internal linking, but they should not absorb heavy SEO effort unless the destination fills out.

### Vibe

- `Index now` when a vibe has at least 6 hotels, spans at least 3 destinations, and appears in at least 2 countries.
- `Index lightly` when a vibe has at least 4 hotels across at least 2 destinations.
- `Support internally only` when it is thinner than that.

Why:
Vibe pages need breadth to feel editorially credible and not repetitive.

### Backdrop

- `Index now` when a backdrop has at least 6 hotels across at least 3 destinations.
- `Index lightly` when a backdrop has at least 4 hotels across at least 2 destinations.
- `Support internally only` when it is thinner than that.

Why:
Backdrop pages only work when the setting meaningfully shapes the collection.

## Practical Publishing Model

There are three levels of investment for collection routes.

### 1. Index now

These routes should get:

- full indexability
- strong title and meta description logic
- richer editorial intro
- FAQ support where useful
- internal links from home, hotel pages, and related collections

### 2. Index lightly

These routes should get:

- indexability
- concise copy only
- clean internal linking
- no need for heavy manual editorial effort yet

### 3. Support internally only

These routes should:

- remain usable for navigation and discovery
- continue to support internal linking and structured site architecture
- avoid becoming major content investment targets until the catalog grows

Note:
This does not necessarily mean removing the page. It means not treating it as a strategic SEO landing page yet.

## What To Avoid

As the database expands, avoid:

- writing long editorial intros for weak one-hotel routes
- building many thin vibe/backdrop pages just because a tag exists
- treating every taxonomy page as equally important
- letting automated route generation define the SEO strategy by itself

## What Should Grow First

When new hotels are added, the best SEO compounding usually comes from:

1. strengthening country coverage
2. deepening the best destinations
3. expanding the strongest cross-market vibes
4. only then investing in thinner backdrop or single-hotel destination routes

## Reporting

The priority report should be the operating dashboard for this model.

It should answer:

- which routes deserve full SEO investment now
- which routes are valid but still early
- which routes should stay mostly navigational until inventory depth improves

This lets the site grow without turning into a thin-indexed directory.
