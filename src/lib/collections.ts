import { Stay } from '../types';
import { buildHotelPath, getHotelSlug, slugifyHotelValue } from './site';
import {
  getCanonicalBackdropLabels,
  getCanonicalVibeLabels,
  getCountrySlugFromLocation,
  normalizeLocation,
} from './taxonomy';

export type CollectionRoute =
  | { kind: 'destination'; slug: string; label: string }
  | { kind: 'country'; slug: string; label: string }
  | { kind: 'backdrop'; slug: string; label: string }
  | { kind: 'vibe'; slug: string; label: string };

export type RankedCollectionRoute = CollectionRoute & {
  score: number;
  hotelCount: number;
  destinationCount: number;
  countryCount: number;
};

export type CollectionIndexDecision =
  | 'index-now'
  | 'index-lightly'
  | 'keep-accessible'
  | 'support-internally';

export function getLocationParts(location = '') {
  const normalized = normalizeLocation(location, '');

  return {
    city: normalized.place === 'Unknown' ? '' : normalized.place,
    country: normalized.country === 'Unknown' ? '' : normalized.country,
    label: normalized.location === 'Unknown' ? '' : normalized.location,
  };
}

export function getDestinationSlug(location = '') {
  return slugifyHotelValue(getLocationParts(location).label);
}

export function getCountrySlug(location = '') {
  return getCountrySlugFromLocation(location);
}

export function getBackdropLabels(stay: Stay) {
  return getCanonicalBackdropLabels(stay);
}

export function getVibeLabels(stay: Stay) {
  return getCanonicalVibeLabels(stay);
}

export function getCollectionRouteFromPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  const destinationMatch = normalized.match(/^\/destinations\/([^/]+)$/i);
  if (destinationMatch) {
    return {
      kind: 'destination',
      slug: destinationMatch[1],
      label: destinationMatch[1],
    } satisfies CollectionRoute;
  }

  const countryMatch = normalized.match(/^\/countries\/([^/]+)$/i);
  if (countryMatch) {
    return {
      kind: 'country',
      slug: countryMatch[1],
      label: countryMatch[1],
    } satisfies CollectionRoute;
  }

  const backdropMatch = normalized.match(/^\/backdrops\/([^/]+)$/i);
  if (backdropMatch) {
    return {
      kind: 'backdrop',
      slug: backdropMatch[1],
      label: backdropMatch[1],
    } satisfies CollectionRoute;
  }

  const vibeMatch = normalized.match(/^\/vibes\/([^/]+)$/i);
  if (vibeMatch) {
    return {
      kind: 'vibe',
      slug: vibeMatch[1],
      label: vibeMatch[1],
    } satisfies CollectionRoute;
  }

  return null;
}

export function matchesCollectionRoute(stay: Stay, route: CollectionRoute) {
  if (route.kind === 'destination') {
    return getDestinationSlug(stay.location) === route.slug;
  }

  if (route.kind === 'country') {
    return getCountrySlug(stay.location) === route.slug;
  }

  if (route.kind === 'vibe') {
    return getVibeLabels(stay).some((label) => slugifyHotelValue(label) === route.slug);
  }

  return getBackdropLabels(stay).some((label) => slugifyHotelValue(label) === route.slug);
}

export function getCollectionPath(route: CollectionRoute) {
  if (route.kind === 'destination') return `/destinations/${route.slug}/`;
  if (route.kind === 'country') return `/countries/${route.slug}/`;
  if (route.kind === 'vibe') return `/vibes/${route.slug}/`;
  return `/backdrops/${route.slug}/`;
}

export function getCollectionIndexDecision(route: CollectionRoute, stays: Stay[]): CollectionIndexDecision {
  const hotelCount = stays.length;
  const destinationCount = new Set(stays.map((stay) => getDestinationSlug(stay.location))).size;
  const countryCount = new Set(stays.map((stay) => getCountrySlug(stay.location))).size;

  if (route.kind === 'country') {
    return hotelCount >= 3 && destinationCount >= 2 ? 'index-now' : 'keep-accessible';
  }

  if (route.kind === 'destination') {
    if (hotelCount >= 3) return 'index-now';
    if (hotelCount === 2) return 'index-lightly';
    return 'keep-accessible';
  }

  if (route.kind === 'vibe') {
    if (hotelCount >= 6 && destinationCount >= 3 && countryCount >= 2) return 'index-now';
    if (hotelCount >= 4 && destinationCount >= 2) return 'index-lightly';
    return 'support-internally';
  }

  if (hotelCount >= 6 && destinationCount >= 3) return 'index-now';
  if (hotelCount >= 4 && destinationCount >= 2) return 'index-lightly';
  return 'support-internally';
}

export function getCollectionDisplayLabel(route: CollectionRoute, stays: Stay[]) {
  if (route.kind === 'destination') {
    return stays[0]?.location || route.label;
  }

  if (route.kind === 'country') {
    return getLocationParts(stays[0]?.location || '').country || route.label;
  }

  if (route.kind === 'vibe') {
    return stays.flatMap((stay) => getVibeLabels(stay)).find((label) => slugifyHotelValue(label) === route.slug) || route.label;
  }

  return stays.flatMap((stay) => getBackdropLabels(stay)).find((label) => slugifyHotelValue(label) === route.slug) || route.label;
}

export function getCollectionRelatedLinks(stays: Stay[]) {
  const destinations = new Map<string, { label: string; count: number }>();
  const countries = new Map<string, { label: string; count: number }>();
  const backdrops = new Map<string, { label: string; count: number }>();
  const vibes = new Map<string, { label: string; count: number }>();

  const increment = (
    target: Map<string, { label: string; count: number }>,
    slug: string,
    label: string,
  ) => {
    const current = target.get(slug);
    if (current) {
      current.count += 1;
      return;
    }
    target.set(slug, { label, count: 1 });
  };

  for (const stay of stays) {
    increment(destinations, getDestinationSlug(stay.location), stay.location);
    increment(countries, getCountrySlug(stay.location), getLocationParts(stay.location).country);
    for (const label of getBackdropLabels(stay)) {
      increment(backdrops, slugifyHotelValue(label), label);
    }
    for (const label of getVibeLabels(stay)) {
      increment(vibes, slugifyHotelValue(label), label);
    }
  }

  const decisionRank = (decision: CollectionIndexDecision) => {
    if (decision === 'index-now') return 4;
    if (decision === 'index-lightly') return 3;
    if (decision === 'keep-accessible') return 2;
    return 1;
  };

  const buildLinks = (
    kind: CollectionRoute['kind'],
    entries: Array<[string, { label: string; count: number }]>
  ) =>
    entries
      .map(([slug, value]) => {
        const route = { kind, slug, label: value.label } satisfies CollectionRoute;
        const routeStays = stays.filter((stay) => matchesCollectionRoute(stay, route));
        const decision = getCollectionIndexDecision(route, routeStays);
        return {
          href: getCollectionPath(route),
          label: value.label,
          count: value.count,
          decision,
        };
      })
      .sort((a, b) => {
        const decisionDelta = decisionRank(b.decision) - decisionRank(a.decision);
        if (decisionDelta !== 0) return decisionDelta;
        if (b.count !== a.count) return b.count - a.count;
        return a.label.localeCompare(b.label);
      });

  return {
    destinations: buildLinks('destination', [...destinations.entries()]),
    countries: buildLinks('country', [...countries.entries()]),
    backdrops: buildLinks('backdrop', [...backdrops.entries()]),
    vibes: buildLinks('vibe', [...vibes.entries()]),
  };
}

export function getPriorityCollectionRoutes(stays: Stay[], max = 8) {
  const groups = new Map<
    string,
    {
      route: CollectionRoute;
      hotels: Stay[];
      destinations: Set<string>;
      countries: Set<string>;
    }
  >();

  const addToGroup = (route: CollectionRoute, stay: Stay) => {
    const key = `${route.kind}:${route.slug}`;
    const existing = groups.get(key);
    if (existing) {
      existing.hotels.push(stay);
      existing.destinations.add(getDestinationSlug(stay.location));
      existing.countries.add(getCountrySlug(stay.location));
      return;
    }

    groups.set(key, {
      route,
      hotels: [stay],
      destinations: new Set([getDestinationSlug(stay.location)]),
      countries: new Set([getCountrySlug(stay.location)]),
    });
  };

  for (const stay of stays) {
    const destinationLabel = getLocationParts(stay.location).label;
    const countryLabel = getLocationParts(stay.location).country;

    if (destinationLabel) {
      addToGroup({ kind: 'destination', slug: getDestinationSlug(stay.location), label: destinationLabel }, stay);
    }

    if (countryLabel) {
      addToGroup({ kind: 'country', slug: getCountrySlug(stay.location), label: countryLabel }, stay);
    }

    for (const label of getBackdropLabels(stay)) {
      addToGroup({ kind: 'backdrop', slug: slugifyHotelValue(label), label }, stay);
    }

    for (const label of getVibeLabels(stay)) {
      addToGroup({ kind: 'vibe', slug: slugifyHotelValue(label), label }, stay);
    }
  }

  const ranked = [...groups.values()]
    .map(({ route, hotels, destinations, countries }) => {
      const hotelCount = hotels.length;
      const destinationCount = destinations.size;
      const countryCount = countries.size;

      const score =
        route.kind === 'country'
          ? hotelCount * 5 + destinationCount * 4 + countryCount * 2
          : route.kind === 'vibe'
            ? hotelCount * 4 + destinationCount * 3 + countryCount * 3 + 4
            : route.kind === 'backdrop'
              ? hotelCount * 4 + destinationCount * 3 + countryCount * 2 + 2
              : hotelCount * 4 + countryCount * 2 + 1;

      return {
        ...route,
        score,
        hotelCount,
        destinationCount,
        countryCount,
      } satisfies RankedCollectionRoute;
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.label.localeCompare(b.label);
    });

  return ranked.slice(0, max);
}

export function getCollectionItemList(stays: Stay[]) {
  return stays.map((stay, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: stay.name,
    url: buildHotelPath(getHotelSlug(stay)),
  }));
}

export function getStayCollectionLinks(stay: Stay) {
  const destinationLabel = stay.location;
  const countryLabel = getLocationParts(stay.location).country;
  const backdropLabels = getBackdropLabels(stay);
  const vibeLabels = getVibeLabels(stay);

  return {
    destination: destinationLabel
      ? {
          href: `/destinations/${getDestinationSlug(stay.location)}/`,
          label: destinationLabel,
        }
      : null,
    country: countryLabel
      ? {
          href: `/countries/${getCountrySlug(stay.location)}/`,
          label: countryLabel,
        }
      : null,
    backdrops: backdropLabels.map((label) => ({
      href: `/backdrops/${slugifyHotelValue(label)}/`,
      label,
    })),
    vibes: vibeLabels.map((label) => ({
      href: `/vibes/${slugifyHotelValue(label)}/`,
      label,
    })),
  };
}

export function getPriorityRoutesForStay(stay: Stay, stays: Stay[], max = 4) {
  const destinationSlug = getDestinationSlug(stay.location);
  const countrySlug = getCountrySlug(stay.location);
  const backdropSlugs = new Set(getBackdropLabels(stay).map((label) => slugifyHotelValue(label)));
  const vibeSlugs = new Set(getVibeLabels(stay).map((label) => slugifyHotelValue(label)));

  return getPriorityCollectionRoutes(stays, 100)
    .filter((route) => {
      if (route.kind === 'destination') return route.slug === destinationSlug;
      if (route.kind === 'country') return route.slug === countrySlug;
      if (route.kind === 'backdrop') return backdropSlugs.has(route.slug);
      return vibeSlugs.has(route.slug);
    })
    .slice(0, max);
}

export function getRelatedHotels(stay: Stay, stays: Stay[], max = 4) {
  const stayDestination = getDestinationSlug(stay.location);
  const stayCountry = getCountrySlug(stay.location);
  const stayBackdropSet = new Set(getBackdropLabels(stay).map((label) => slugifyHotelValue(label)));
  const stayVibeSet = new Set(getVibeLabels(stay).map((label) => slugifyHotelValue(label)));

  return stays
    .filter((candidate) => candidate.id !== stay.id)
    .map((candidate) => {
      let score = 0;

      if (getDestinationSlug(candidate.location) === stayDestination) score += 6;
      if (getCountrySlug(candidate.location) === stayCountry) score += 2;

      const candidateBackdropSet = new Set(getBackdropLabels(candidate).map((label) => slugifyHotelValue(label)));
      const candidateVibeSet = new Set(getVibeLabels(candidate).map((label) => slugifyHotelValue(label)));

      for (const backdrop of candidateBackdropSet) {
        if (stayBackdropSet.has(backdrop)) score += 3;
      }

      for (const vibe of candidateVibeSet) {
        if (stayVibeSet.has(vibe)) score += 3;
      }

      score += (candidate.luxuriousValue || 0) * 0.2;
      score += (candidate.spaScore || 0) * 0.1;

      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((entry) => entry.candidate);
}

export function getCollectionEditorialContent(route: CollectionRoute, stays: Stay[]) {
  const label = getCollectionDisplayLabel(route, stays);
  const count = stays.length;
  const routeKey = `${route.kind}:${slugifyHotelValue(label)}`;

  const editorialOverrides: Record<string, { eyebrow: string; title: string; description: string; seoDescription: string }> = {
    'country:france': {
      eyebrow: 'Country guide',
      title: 'France hotels',
      description:
        'A sharper view of France through hotels with real pull: grand Paris addresses, Provençal retreats, Riviera icons, and countryside stays that feel worth crossing a border for.',
      seoDescription:
        'Explore an editorial guide to France hotels, from Paris icons and Riviera legends to Provençal hideaways and country estates chosen for mood, setting, and standout character.',
    },
    'vibe:the-creative-retreat': {
      eyebrow: 'Vibe guide',
      title: 'The Creative Retreat hotels',
      description:
        'Hotels for travelers who want the trip to feel visually clarifying: quieter palettes, stronger architecture, and the kind of atmosphere that sharpens your eye instead of fighting for attention.',
      seoDescription:
        'Explore hotels for The Creative Retreat, an editorial collection of design-led, mood-rich stays chosen for architecture, restraint, and visual calm.',
    },
    'vibe:the-romantic-reset': {
      eyebrow: 'Vibe guide',
      title: 'The Romantic Reset hotels',
      description:
        'A more grown-up edit of romantic hotels, built around privacy, beautiful rooms, softer pacing, and the feeling that the stay itself is doing half the seduction.',
      seoDescription:
        'Explore hotels for The Romantic Reset, an editorial collection of private, mood-rich stays chosen for romance, atmosphere, and memorable design.',
    },
    'vibe:the-urban-explorer': {
      eyebrow: 'Vibe guide',
      title: 'The Urban Explorer hotels',
      description:
        'City hotels for travelers who want culture, restaurants, and great addresses within reach, but still care how the room feels when the city finally goes quiet.',
      seoDescription:
        'Explore hotels for The Urban Explorer, an editorial collection of city stays chosen for strong location, cultural access, and rooms with real atmosphere.',
    },
    'vibe:the-social-weekender': {
      eyebrow: 'Vibe guide',
      title: 'The Social Weekender hotels',
      description:
        'A tighter edit for weekends with momentum: glamorous coastal hotels, better lunch energy, aperitivo hours that drift into dinner, and stays that know how to host a scene without feeling chaotic.',
      seoDescription:
        'Explore hotels for The Social Weekender, an editorial collection of lively, design-aware stays chosen for long lunches, aperitivo energy, and weekend glamour.',
    },
    'vibe:the-sun-drenched-escape': {
      eyebrow: 'Vibe guide',
      title: 'The Sun-Drenched Escape hotels',
      description:
        'Hotels for people chasing brightness first: sea-facing rooms, terraces, saltwater afternoons, and the kind of stay that makes every hour between breakfast and sunset feel unusually easy.',
      seoDescription:
        'Explore hotels for The Sun-Drenched Escape, an editorial collection of coastal and sun-soaked stays chosen for sea views, warmth, and laid-back glamour.',
    },
    'backdrop:iconic-cities': {
      eyebrow: 'Backdrop guide',
      title: 'Iconic Cities hotels',
      description:
        'A city-first edit for travelers who want the cultural gravity of a major address without giving up intimacy, taste, or the feeling of staying somewhere with actual personality.',
      seoDescription:
        'Explore Iconic Cities hotels, an editorial collection of standout urban stays chosen for strong addresses, cultural proximity, and memorable interiors.',
    },
    'backdrop:pristine-shores': {
      eyebrow: 'Backdrop guide',
      title: 'Pristine Shores hotels',
      description:
        'Hotels where the coastline does a lot of the storytelling: cliff edges, sea access, brighter rooms, and the particular luxury of feeling close to the water from the moment you wake up.',
      seoDescription:
        'Explore Pristine Shores hotels, an editorial collection of coastal stays chosen for sea views, shoreline access, and a stronger sense of place.',
    },
  };

  const override = editorialOverrides[routeKey];
  if (override) {
    return override;
  }

  if (route.kind === 'destination') {
    return {
      eyebrow: 'Destination guide',
      title: `${label} hotels`,
      description: `Start with the stays in ${label} that feel most worth your time: the strongest addresses, the clearest point of view, and the hotels that can shape the whole trip.`,
      seoDescription: `Explore a curated edit of ${label} hotels, chosen for standout location, distinctive atmosphere, and stays worth planning a trip around.`,
    };
  }

  if (route.kind === 'country') {
    return {
      eyebrow: 'Country guide',
      title: `${label} hotels`,
      description: `A country-level view of ${label} through hotels with presence: city icons, moodier hideaways, and stays that feel chosen rather than merely booked.`,
      seoDescription: `Explore ${count} editorial hotel picks across ${label}, chosen for mood, setting, and the kind of stay that lingers after checkout.`,
    };
  }

  if (route.kind === 'vibe') {
    return {
      eyebrow: 'Vibe guide',
      title: `${label} hotels`,
      description: `A sharper edit of stays for ${label.toLowerCase()}, built around how the trip should feel rather than how a booking site happens to sort it.`,
      seoDescription: `Explore ${count} editorial hotel picks for ${label.toLowerCase()}, chosen for travelers following a stronger mood than a generic star rating.`,
    };
  }

  return {
    eyebrow: 'Backdrop guide',
    title: `${label} hotels`,
    description: `A mood-led edit for travelers drawn to ${label.toLowerCase()}, where the setting does as much work as the room itself.`,
    seoDescription: `Explore ${count} editorial hotel picks for ${label.toLowerCase()}, selected for travelers who choose atmosphere first.`,
  };
}

export function getCollectionHeadline(route: CollectionRoute, stays: Stay[]) {
  return getCollectionEditorialContent(route, stays).title;
}

export function getCollectionSummary(route: CollectionRoute, stays: Stay[]) {
  const destinations = new Set(stays.map((stay) => getDestinationSlug(stay.location))).size;
  const countries = new Set(stays.map((stay) => getCountrySlug(stay.location))).size;
  const luxeCount = stays.filter((stay) => (stay.priceTier || '').toLowerCase().includes('luxe')).length;
  const iconicCount = stays.filter((stay) => (stay.priceTier || '').toLowerCase().includes('iconic')).length;
  const boutiqueCount = stays.filter((stay) => (stay.priceTier || '').toLowerCase().includes('boutique')).length;

  const focusLine =
    route.kind === 'destination'
      ? `${stays.length} hotels in this destination edit`
      : route.kind === 'country'
        ? `${stays.length} hotels across ${destinations} destinations`
        : route.kind === 'vibe'
          ? `${stays.length} hotels shaped around one travel mood`
          : `${stays.length} hotels grouped by setting first`;

  return {
    focusLine,
    destinations,
    countries,
    boutiqueCount,
    luxeCount,
    iconicCount,
  };
}

export function getCollectionFaq(route: CollectionRoute, stays: Stay[]) {
  const label = getCollectionDisplayLabel(route, stays);
  const summary = getCollectionSummary(route, stays);
  const routeKey = `${route.kind}:${slugifyHotelValue(label)}`;

  const faqOverrides: Record<string, Array<{ question: string; answer: string }>> = {
    'country:france': [
      {
        question: 'What kind of France hotels are featured here?',
        answer:
          'This France guide focuses on hotels with strong point of view: Riviera legends, polished Paris addresses, Provençal retreats, and country estates with enough atmosphere to justify the trip on their own.',
      },
      {
        question: 'Why start with France as a hotel guide instead of one city?',
        answer:
          `Because the current France edit already spans ${summary.destinations} distinct destinations, it works as a useful country-level view of how different moods show up across Paris, Provence, the Riviera, and beyond.`,
      },
    ],
    'vibe:the-creative-retreat': [
      {
        question: 'What makes a hotel fit The Creative Retreat?',
        answer:
          'These hotels share a certain visual intelligence: stronger architecture, calmer rooms, better materiality, and a pace that leaves room to think, look, and reset.',
      },
      {
        question: 'Is The Creative Retreat about remote hotels only?',
        answer:
          `No. This collection includes ${stays.length} hotels across ${summary.countries} countries, and the common thread is not remoteness alone but aesthetic clarity and a more thoughtful atmosphere.`,
      },
    ],
    'vibe:the-romantic-reset': [
      {
        question: 'What kind of romance does The Romantic Reset aim for?',
        answer:
          'Less obvious honeymoon cliche, more privacy, mood, and beautiful stillness. The best hotels in this collection feel seductive because they are calm, polished, and slightly removed from the noise around them.',
      },
      {
        question: 'Are these hotels only for couples?',
        answer:
          'Not strictly, but they are especially strong for trips where pace, intimacy, and atmosphere matter more than packed itineraries or high-energy social scenes.',
      },
    ],
    'vibe:the-urban-explorer': [
      {
        question: 'What defines an Urban Explorer hotel here?',
        answer:
          'A strong city base with cultural access, restaurant gravity, and enough design or service quality that coming back to the hotel still feels like part of the trip rather than just recovery time.',
      },
      {
        question: 'Is this collection about location only?',
        answer:
          'Location matters, but the edit is also about how the hotel holds the city: whether the atmosphere feels elevated, the rooms feel restorative, and the address adds something to the overall trip.',
      },
    ],
    'vibe:the-social-weekender': [
      {
        question: 'What makes a hotel fit The Social Weekender?',
        answer:
          'These are hotels with outward pull: stronger lunch energy, aperitivo momentum, glamorous shared spaces, and locations that naturally support a better weekend rhythm.',
      },
      {
        question: 'Are these party hotels?',
        answer:
          'Not necessarily. The goal is social ease and momentum, not chaos. The best picks here still feel design-led and controlled, just more outward-looking than a quiet retreat.',
      },
    ],
    'vibe:the-sun-drenched-escape': [
      {
        question: 'What kind of trip suits The Sun-Drenched Escape?',
        answer:
          'Trips built around brightness, water, outdoor meals, and long slow afternoons. The collection favors hotels where the climate and coastline genuinely shape the experience.',
      },
      {
        question: 'Is this just a beach hotels page?',
        answer:
          'It overlaps with coastal travel, but the real filter is emotional: these are hotels chosen for warmth, ease, and the kind of daylight-rich atmosphere that changes how the whole trip feels.',
      },
    ],
    'backdrop:iconic-cities': [
      {
        question: 'What counts as an Iconic Cities hotel on My Hotel Vibe?',
        answer:
          'Hotels in culturally weighty cities where the surrounding neighborhood, architecture, and urban energy matter as much as the room itself. The edit favors addresses with presence, not just convenience.',
      },
      {
        question: 'Why group these hotels by backdrop rather than country?',
        answer:
          'Because some travelers start with city atmosphere first. This page is for people who want urban intensity, landmark proximity, and a hotel that can hold its own inside a major destination.',
      },
    ],
    'backdrop:pristine-shores': [
      {
        question: 'What defines a Pristine Shores hotel here?',
        answer:
          'A stronger relationship to the water: direct sea access, elevated coastal views, brighter pacing, and a setting where the shoreline is central to the mood of the stay.',
      },
      {
        question: 'Are all Pristine Shores hotels interchangeable beach resorts?',
        answer:
          'No. The common thread is coastline quality and atmosphere, but the individual hotels still vary from Riviera institutions to more design-led seaside stays.',
      },
    ],
  };

  const override = faqOverrides[routeKey];
  if (override) {
    return override;
  }

  if (route.kind === 'destination') {
    return [
      {
        question: `What kind of hotels are included in ${label}?`,
        answer: `${label} is presented as an editorial hotel edit, not an exhaustive booking directory. The focus is on atmosphere, design signal, and hotels that feel worth planning a trip around.`,
      },
      {
        question: `How many hotels are featured in this ${label} guide?`,
        answer: `This guide currently includes ${stays.length} hotels, chosen to give a tighter view of the destination rather than a generic long list.`,
      },
    ];
  }

  if (route.kind === 'country') {
    return [
      {
        question: `How is this ${label} hotel guide organized?`,
        answer: `The ${label} guide groups hotels through mood, setting, and destination quality rather than star rating alone. It currently spans ${summary.destinations} destinations and ${stays.length} stays.`,
      },
      {
        question: `Are these all the hotels in ${label}?`,
        answer: `No. This is a curated shortlist designed to highlight standout stays in ${label}, from city addresses with presence to more atmospheric hideaways.`,
      },
    ];
  }

  if (route.kind === 'vibe') {
    return [
      {
        question: `What does ${label} mean in hotel terms?`,
        answer: `${label} is used here as an editorial travel lens. The hotels in this guide are grouped by shared feeling, aesthetic pull, and trip energy rather than by price or geography alone.`,
      },
      {
        question: `How broad is this ${label} hotel collection?`,
        answer: `This collection currently includes ${stays.length} hotels across ${summary.countries} countries, giving the mood enough range without losing its point of view.`,
      },
    ];
  }

  return [
    {
      question: `What defines the ${label} hotel backdrop?`,
      answer: `${label} is treated as a setting-led collection. The hotels here are grouped because the landscape, atmosphere, and wider environment shape the trip as much as the property itself.`,
    },
    {
      question: `How many hotels are featured in this ${label} guide?`,
      answer: `This guide currently includes ${stays.length} hotels chosen for travelers who start with atmosphere first and narrow from there.`,
    },
  ];
}
