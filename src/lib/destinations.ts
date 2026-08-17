/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stay } from '../types';
import { extractCountryFromText } from './taxonomy';

export interface DestinationCategory {
  id: string;
  label: string;
  sublabel: string;
  keywords: RegExp;
}

export const DESTINATION_CATEGORIES: DestinationCategory[] = [
  {
    id: 'anywhere',
    label: 'Anywhere',
    sublabel: 'All curated stays',
    keywords: /.*/i,
  },
  {
    id: 'italy',
    label: 'Italy',
    sublabel: 'Tuscany, Amalfi, Como, Dolomites, Rome',
    keywords: /\b(italy|italia|tuscany|toscana|dolomites|dolomiti|amalfi|positano|ravello|lake como|como|sicily|sicilia|sardinia|sardegna|puglia|apulia|rome|roma|florence|firenze|venice|venezia|milan|milano)\b/i,
  },
  {
    id: 'spain',
    label: 'Spain & Balearics',
    sublabel: 'Mallorca, Ibiza, Andalusia, Costa Brava',
    keywords: /\b(spain|españa|mallorca|majorca|ibiza|menorca|formentera|balearic|andalusia|andalucía|seville|sevilla|malaga|málaga|marbella|granada|san sebastian|san sebastián|basque|costa brava|barcelona|madrid)\b/i,
  },
  {
    id: 'france',
    label: 'France & Riviera',
    sublabel: 'Paris, Provence, Côte d’Azur, Alps',
    keywords: /\b(france|paris|provence|côte d'azur|cote d'azur|french riviera|riviera|nice|cannes|saint-tropez|st tropez|antibes|monaco|courchevel|chamonix|megeve|megève|bordeaux|normandy|loire)\b/i,
  },
  {
    id: 'greece',
    label: 'Greece & Islands',
    sublabel: 'Santorini, Crete, Peloponnese, Athens',
    keywords: /\b(greece|hellas|santorini|mykonos|crete|kriti|peloponnese|athens|athina|rhodes|corfu|zakynthos|paros|naxos|milos|halkidiki)\b/i,
  },
  {
    id: 'nordics',
    label: 'The Nordics',
    sublabel: 'Sweden, Norway, Denmark, Iceland',
    keywords: /\b(sweden|sverige|stockholm|gotland|lapland|harads|norway|norge|oslo|lofoten|bergen|tromsø|manshausen|denmark|danmark|copenhagen|københavn|iceland|ísland|reykjavik|grindavik|finland|suomi|helsinki)\b/i,
  },
  {
    id: 'portugal',
    label: 'Portugal & Azores',
    sublabel: 'Lisbon, Douro, Algarve, Azores',
    keywords: /\b(portugal|lisbon|lisboa|porto|douro|algarve|faro|lagos|alentejo|comporta|azores|açores|são miguel|madeira)\b/i,
  },
  {
    id: 'uk_ireland',
    label: 'UK & Ireland',
    sublabel: 'London, Scottish Highlands, Cotswolds, Dublin',
    keywords: /\b(united kingdom|uk|england|scotland|scottish highlands|highlands|cotswolds|cornwall|london|edinburgh|wales|ireland|dublin|kerry)\b/i,
  },
  {
    id: 'switzerland',
    label: 'Switzerland & Alps',
    sublabel: 'Zermatt, St. Moritz, Engadin, Vals',
    keywords: /\b(switzerland|schweiz|suisse|swiss|zermatt|st\.?\s*moritz|engadin|graubünden|grisons|vals|interlaken|lucerne|geneva|zurich|alps)\b/i,
  },
  {
    id: 'worldwide',
    label: 'Worldwide Escapes',
    sublabel: 'Morocco, Japan, Costa Rica, Mexico',
    keywords: /\b(morocco|marrakech|marrakesh|japan|tokyo|kyoto|costa rica|manuel antonio|arenal|mexico|tulum|riviera maya|oaxaca|bali|indonesia|thailand|usa|united states|new york|california)\b/i,
  },
];

export function matchesDestination(stay: Stay, selectedDestination?: string | null): boolean {
  if (!selectedDestination || selectedDestination === '' || selectedDestination.toLowerCase() === 'anywhere') {
    return true;
  }

  const category = DESTINATION_CATEGORIES.find(
    (c) => c.label.toLowerCase() === selectedDestination.toLowerCase()
  );

  const searchableText = [
    stay.name,
    stay.location,
    stay.region,
    stay.surroundings,
    extractCountryFromText(stay.location),
    extractCountryFromText(stay.region),
    ...(stay.tags || []),
  ]
    .filter(Boolean)
    .join(' ');

  if (category) {
    return category.keywords.test(searchableText);
  }

  // Fallback direct keyword search
  const regex = new RegExp(`\\b${selectedDestination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return regex.test(searchableText);
}
