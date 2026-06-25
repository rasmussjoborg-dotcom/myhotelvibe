import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const hotelsPath = path.join(projectRoot, 'hotels.json');
const docsDir = path.join(projectRoot, 'docs');
const outputJsonPath = path.join(docsDir, 'seo-priority-report.json');
const outputMarkdownPath = path.join(docsDir, 'SEO_PRIORITY_MAP.md');
const outputBriefsPath = path.join(docsDir, 'SEO_CONTENT_BRIEFS.md');
const siteUrl = 'https://myhotelvibe.com';

const BACKDROP_OPTIONS = new Set([
  'Pristine Shores',
  'Iconic Cities',
  'Alpine & Peaks',
  'Remote Sanctuaries',
  'Exclusive Islands',
  'Lakeside Estates',
  'Desert Oases',
  'Winter Escapes',
]);

const VIBE_OPTIONS = [
  'The Romantic Reset',
  'The Social Weekender',
  'The Urban Explorer',
  'The Creative Retreat',
  'The Epicurean Pilgrimage',
  'The Sun-Drenched Escape',
];

const VIBE_ALIASES = {
  'The Romantic Reset': ['romance', 'quiet luxury'],
  'The Social Weekender': ['city energy', 'city break', 'riviera lifestyle'],
  'The Urban Explorer': ['iconic cities', 'city break'],
  'The Creative Retreat': ['design-forward', 'quiet luxury', 'remote sanctuaries'],
  'The Epicurean Pilgrimage': ['food & wine', 'culinary excellence'],
  'The Sun-Drenched Escape': ['beach & sun', 'pristine shores', 'riviera lifestyle'],
};

function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getLocationParts(location = '') {
  const parts = String(location)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city: parts[0] || '',
    country: parts.at(-1) || '',
    label: parts.join(', '),
  };
}

function getCountryLabel(country = '') {
  return country === 'UK' ? 'United Kingdom' : country;
}

function getCountryRouteSlug(country = '') {
  return country === 'United Kingdom' ? 'uk' : slugify(country);
}

function getPriceTierLabel(hotel) {
  if (hotel.priceTier) return hotel.priceTier;
  if (hotel.priceCategory === '€€') return 'Boutique (€€)';
  if (hotel.priceCategory === '€€€') return 'Luxe (€€€)';
  if (hotel.priceCategory === '€€€€') return 'Iconic (€€€€)';
  return 'Unknown';
}

function getBackdropLabels(hotel) {
  const labels = new Set();
  if (hotel.primaryBackdrop) labels.add(hotel.primaryBackdrop);

  for (const tag of hotel.tags || []) {
    if (BACKDROP_OPTIONS.has(tag)) labels.add(tag);
  }

  return [...labels];
}

function getVibeLabels(hotel) {
  const labels = new Set();

  if (hotel.primaryPersona && VIBE_OPTIONS.includes(hotel.primaryPersona)) {
    labels.add(hotel.primaryPersona);
  }

  const tagSet = new Set((hotel.tags || []).map((tag) => String(tag).toLowerCase()));
  for (const [vibe, aliases] of Object.entries(VIBE_ALIASES)) {
    if (aliases.some((alias) => tagSet.has(alias))) {
      labels.add(vibe);
    }
  }

  return [...labels];
}

function addToGroup(target, key, label, hotel, kind, href) {
  if (!target.has(key)) {
    target.set(key, {
      kind,
      key,
      slug: key,
      label,
      href,
      hotels: [],
      destinations: new Set(),
      countries: new Set(),
      priceTiers: new Map(),
    });
  }

  const group = target.get(key);
  group.hotels.push(hotel);
  const location = getLocationParts(hotel.location);
  if (location.label) group.destinations.add(location.label);
  if (location.country) group.countries.add(getCountryLabel(location.country));
  const tier = getPriceTierLabel(hotel);
  group.priceTiers.set(tier, (group.priceTiers.get(tier) || 0) + 1);
}

function getPriorityScore(group) {
  const count = group.hotels.length;
  const destinationSpread = group.destinations.size;
  const countrySpread = group.countries.size;

  if (group.kind === 'country') {
    return count * 5 + destinationSpread * 4 + countrySpread * 2;
  }

  if (group.kind === 'vibe') {
    return count * 4 + destinationSpread * 3 + countrySpread * 3 + 4;
  }

  if (group.kind === 'backdrop') {
    return count * 4 + destinationSpread * 3 + countrySpread * 2 + 2;
  }

  return count * 4 + countrySpread * 2 + 1;
}

function getPriorityTier(score) {
  if (score >= 18) return 'Tier 1';
  if (score >= 11) return 'Tier 2';
  return 'Tier 3';
}

function getIndexabilityDecision(group) {
  const hotels = group.hotels.length;
  const destinations = group.destinations.size;
  const countries = group.countries.size;

  if (group.kind === 'country') {
    if (hotels >= 3 && destinations >= 2) {
      return {
        decision: 'Index now',
        reason: 'Country route has enough hotel depth and destination spread to function as an authority page.',
      };
    }

    return {
      decision: 'Build before prioritizing',
      reason: 'Country route needs broader destination coverage before it becomes a strong SEO landing page.',
    };
  }

  if (group.kind === 'destination') {
    if (hotels >= 3) {
      return {
        decision: 'Index now',
        reason: 'Destination route has enough hotel depth to satisfy direct place-based search intent.',
      };
    }

    if (hotels === 2) {
      return {
        decision: 'Index lightly',
        reason: 'Destination route is viable, but should stay concise until more hotel depth is added.',
      };
    }

    return {
      decision: 'Keep accessible, not a growth priority',
      reason: 'Single-hotel destinations are useful for navigation, but should not absorb heavy SEO effort until the destination fills out.',
    };
  }

  if (group.kind === 'vibe') {
    if (hotels >= 6 && destinations >= 3 && countries >= 2) {
      return {
        decision: 'Index now',
        reason: 'Vibe route has enough cross-market depth to earn a standalone mood-led landing page.',
      };
    }

    if (hotels >= 4 && destinations >= 2) {
      return {
        decision: 'Index lightly',
        reason: 'Vibe route is emerging, but needs broader catalog depth before it deserves heavier editorial investment.',
      };
    }

    return {
      decision: 'Support internally only',
      reason: 'Vibe route is still too thin to become a major search entry point at scale.',
    };
  }

  if (hotels >= 6 && destinations >= 3) {
    return {
      decision: 'Index now',
      reason: 'Backdrop route has enough hotel volume and setting diversity to justify its own collection page.',
    };
  }

  if (hotels >= 4 && destinations >= 2) {
    return {
      decision: 'Index lightly',
      reason: 'Backdrop route is valid, but should stay compact until the setting cluster grows.',
    };
  }

  return {
    decision: 'Support internally only',
    reason: 'Backdrop route is better used as internal linking support than a primary SEO target for now.',
  };
}

function getIntent(group) {
  if (group.kind === 'country') {
    return `Build authority around "${group.label} hotels" and related destination-level searches.`;
  }
  if (group.kind === 'destination') {
    return `Target exact-match destination intent around "${group.label} hotels".`;
  }
  if (group.kind === 'vibe') {
    return `Own editorial mood-led discovery around "${group.label.toLowerCase()} hotels".`;
  }
  return `Capture setting-first searches around "${group.label.toLowerCase()} hotels".`;
}

function getSuggestedTitle(group) {
  if (group.kind === 'country') return `${group.label} Hotel Guide | My Hotel Vibe`;
  return `${group.label} Hotels | My Hotel Vibe`;
}

function getSuggestedKeywordCluster(group) {
  if (group.kind === 'country') {
    return [`${group.label.toLowerCase()} hotels`, `best hotels in ${group.label.toLowerCase()}`, `boutique hotels ${group.label.toLowerCase()}`];
  }
  if (group.kind === 'destination') {
    return [`${group.label.toLowerCase()} hotels`, `best hotels in ${group.label.toLowerCase()}`, `luxury hotels ${group.label.toLowerCase()}`];
  }
  if (group.kind === 'vibe') {
    return [`${group.label.toLowerCase()} hotels`, `${group.label.toLowerCase()} stays`, `editorial hotel guide ${group.label.toLowerCase()}`];
  }
  return [`${group.label.toLowerCase()} hotels`, `best ${group.label.toLowerCase()} hotels`, `${group.label.toLowerCase()} stay guide`];
}

function getSupportingRoutes(group) {
  const hotelUrls = group.hotels.slice(0, 4).map((hotel) => `/hotels/${slugify(hotel.name || hotel.id)}/`);
  const destinationUrls = [...group.destinations].slice(0, 4).map((label) => `/destinations/${slugify(label)}/`);
  const countryUrls = [...group.countries].slice(0, 3).map((label) => `/countries/${getCountryRouteSlug(label)}/`);
  return [...new Set([...hotelUrls, ...destinationUrls, ...countryUrls])];
}

function getEditorialAngle(group) {
  if (group.kind === 'country') {
    return `Frame ${group.label} as a country-level editorial hotel guide with a clear split between iconic addresses, quieter hideaways, and destination-specific mood.`;
  }
  if (group.kind === 'destination') {
    return `Treat ${group.label} as a tight destination guide for travelers deciding where to stay, what kind of hotel atmosphere they want, and which address best defines the trip.`;
  }
  if (group.kind === 'vibe') {
    return `Lean into the emotional promise of ${group.label.toLowerCase()} and explain what that feeling looks like across different destinations and hotel styles.`;
  }
  return `Make ${group.label.toLowerCase()} the hero and describe why travelers who choose setting first should care about this cluster of hotels.`;
}

function getBriefSections(group) {
  return [
    'Intro: define the point of view of the page in one strong paragraph.',
    'Why this collection works: explain the shared thread between the featured stays.',
    'Where it shows up best: mention the most relevant destinations already in the database.',
    'Who this is for: describe the traveler or trip mood this page serves.',
    'Featured hotels: highlight 3-4 anchor properties with internal links.',
    'FAQ: answer the practical questions that keep the page useful and searchable.',
  ];
}

const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));

const groups = new Map();

for (const hotel of hotels) {
  const location = getLocationParts(hotel.location);
  const destinationSlug = slugify(location.label);
  const countrySlug = slugify(location.country);

  if (location.label) {
    addToGroup(groups, `destination:${destinationSlug}`, location.label, hotel, 'destination', `/destinations/${destinationSlug}/`);
  }

  if (location.country) {
    addToGroup(groups, `country:${countrySlug}`, location.country, hotel, 'country', `/countries/${countrySlug}/`);
  }

  for (const label of getBackdropLabels(hotel)) {
    addToGroup(groups, `backdrop:${slugify(label)}`, label, hotel, 'backdrop', `/backdrops/${slugify(label)}/`);
  }

  for (const label of getVibeLabels(hotel)) {
    addToGroup(groups, `vibe:${slugify(label)}`, label, hotel, 'vibe', `/vibes/${slugify(label)}/`);
  }
}

const rankedGroups = [...groups.values()]
  .map((group) => {
    const score = getPriorityScore(group);
    return {
      kind: group.kind,
      label: group.label,
      href: group.href,
      liveUrl: `${siteUrl}${group.href}`,
      hotelsCount: group.hotels.length,
      destinationsCount: group.destinations.size,
      countriesCount: group.countries.size,
      priceMix: Object.fromEntries(group.priceTiers),
      score,
      tier: getPriorityTier(score),
      ...getIndexabilityDecision(group),
      intent: getIntent(group),
      title: getSuggestedTitle(group),
      keywordCluster: getSuggestedKeywordCluster(group),
      supportingRoutes: getSupportingRoutes(group),
      hotels: group.hotels.map((hotel) => ({
        name: hotel.name,
        location: hotel.location,
        url: `${siteUrl}/hotels/${slugify(hotel.name || hotel.id)}/`,
      })),
    };
  })
  .sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.label.localeCompare(b.label);
  });

const groupedByTier = {
  tier1: rankedGroups.filter((group) => group.tier === 'Tier 1'),
  tier2: rankedGroups.filter((group) => group.tier === 'Tier 2'),
  tier3: rankedGroups.filter((group) => group.tier === 'Tier 3'),
};

const report = {
  generatedAt: new Date().toISOString(),
  siteUrl,
  totalHotels: hotels.length,
  totalOpportunities: rankedGroups.length,
  priorities: groupedByTier,
};

function renderSection(title, groupsInTier) {
  if (!groupsInTier.length) return `## ${title}\n\nNo routes in this tier yet.\n`;

  return `## ${title}\n\n${groupsInTier
    .map(
      (group, index) =>
        `### ${index + 1}. ${group.label} (${group.kind})\n` +
        `- Score: ${group.score}\n` +
        `- Route: \`${group.href}\`\n` +
        `- Live URL: ${group.liveUrl}\n` +
        `- Hotels: ${group.hotelsCount}\n` +
        `- Destination spread: ${group.destinationsCount}\n` +
        `- Country spread: ${group.countriesCount}\n` +
        `- Recommended action: ${group.decision}\n` +
        `- Why: ${group.reason}\n` +
        `- Intent: ${group.intent}\n` +
        `- Suggested title: ${group.title}\n` +
        `- Keyword cluster: ${group.keywordCluster.join(' | ')}\n` +
        `- Supporting routes: ${group.supportingRoutes.join(', ')}\n`
    )
    .join('\n')}\n`;
}

const markdown = `# SEO Priority Map

Generated from the live hotel database for [myhotelvibe.com](${siteUrl}) on ${new Date(report.generatedAt).toLocaleString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})}.

## Snapshot

- Total hotels in database: ${report.totalHotels}
- Total indexable collection opportunities: ${report.totalOpportunities}
- Tier 1 opportunities: ${groupedByTier.tier1.length}
- Tier 2 opportunities: ${groupedByTier.tier2.length}
- Tier 3 opportunities: ${groupedByTier.tier3.length}

## How to use this

- Start with Tier 1 routes for deeper editorial copy and stronger internal linking.
- Use Tier 2 routes as the next wave once hotel count or route depth improves.
- Leave Tier 3 routes indexable, but avoid spending heavy copy effort there until the database grows.

${renderSection('Tier 1', groupedByTier.tier1)}
${renderSection('Tier 2', groupedByTier.tier2)}
${renderSection('Tier 3', groupedByTier.tier3)}
`;

const topBriefGroups = rankedGroups.slice(0, 8);
const briefsMarkdown = `# SEO Content Briefs

These are the first collection pages to deepen on [myhotelvibe.com](${siteUrl}) based on current hotel inventory and internal-linking potential.

${topBriefGroups
  .map((group, index) => {
    const sampleHotels = group.hotels.slice(0, 4).map((hotel) => hotel.name).join(', ');
    return `## ${index + 1}. ${group.label} (${group.kind})

- Route: \`${group.href}\`
- Priority tier: ${group.tier}
- Score: ${group.score}
- Primary title: ${group.title}
- Keyword cluster: ${group.keywordCluster.join(' | ')}
- Editorial angle: ${getEditorialAngle(group)}
- Anchor hotels: ${sampleHotels}
- Internal links to emphasize: ${group.supportingRoutes.join(', ')}

### Recommended sections

${getBriefSections(group).map((section) => `- ${section}`).join('\n')}
`;
  })
  .join('\n')}
`;

fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(outputJsonPath, JSON.stringify(report, null, 2));
fs.writeFileSync(outputMarkdownPath, markdown);
fs.writeFileSync(outputBriefsPath, briefsMarkdown);

console.log(`Wrote ${path.relative(projectRoot, outputJsonPath)}`);
console.log(`Wrote ${path.relative(projectRoot, outputMarkdownPath)}`);
console.log(`Wrote ${path.relative(projectRoot, outputBriefsPath)}`);
