export interface OriginAirport {
  iata: string;
  city: string;
  name: string;
  country: string;
  flag: string;
  region: 'Nordics' | 'UK & Ireland' | 'Western Europe' | 'Central & Southern Europe' | 'North America';
  timezones: string[];
  isPopular?: boolean;
}

export const ORIGIN_AIRPORTS: OriginAirport[] = [
  // Nordics
  { iata: 'ARN', city: 'Stockholm', name: 'Arlanda Airport', country: 'Sweden', flag: '🇸🇪', region: 'Nordics', timezones: ['Europe/Stockholm'], isPopular: true },
  { iata: 'BMA', city: 'Stockholm', name: 'Bromma Airport', country: 'Sweden', flag: '🇸🇪', region: 'Nordics', timezones: [] },
  { iata: 'GOT', city: 'Gothenburg', name: 'Landvetter Airport', country: 'Sweden', flag: '🇸🇪', region: 'Nordics', timezones: [], isPopular: true },
  { iata: 'MMX', city: 'Malmö', name: 'Malmö Airport', country: 'Sweden', flag: '🇸🇪', region: 'Nordics', timezones: [] },
  { iata: 'CPH', city: 'Copenhagen', name: 'Kastrup Airport', country: 'Denmark', flag: '🇩🇰', region: 'Nordics', timezones: ['Europe/Copenhagen'], isPopular: true },
  { iata: 'BLL', city: 'Billund', name: 'Billund Airport', country: 'Denmark', flag: '🇩🇰', region: 'Nordics', timezones: [] },
  { iata: 'OSL', city: 'Oslo', name: 'Gardermoen Airport', country: 'Norway', flag: '🇳🇴', region: 'Nordics', timezones: ['Europe/Oslo'], isPopular: true },
  { iata: 'BGO', city: 'Bergen', name: 'Flesland Airport', country: 'Norway', flag: '🇳🇴', region: 'Nordics', timezones: [] },
  { iata: 'TRD', city: 'Trondheim', name: 'Værnes Airport', country: 'Norway', flag: '🇳🇴', region: 'Nordics', timezones: [] },
  { iata: 'SVG', city: 'Stavanger', name: 'Sola Airport', country: 'Norway', flag: '🇳🇴', region: 'Nordics', timezones: [] },
  { iata: 'HEL', city: 'Helsinki', name: 'Vantaa Airport', country: 'Finland', flag: '🇫🇮', region: 'Nordics', timezones: ['Europe/Helsinki'], isPopular: true },

  // UK & Ireland
  { iata: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: ['Europe/London'], isPopular: true },
  { iata: 'LGW', city: 'London', name: 'Gatwick Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [], isPopular: true },
  { iata: 'STN', city: 'London', name: 'Stansted Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [] },
  { iata: 'MAN', city: 'Manchester', name: 'Manchester Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [], isPopular: true },
  { iata: 'EDI', city: 'Edinburgh', name: 'Edinburgh Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [] },
  { iata: 'DUB', city: 'Dublin', name: 'Dublin Airport', country: 'Ireland', flag: '🇮🇪', region: 'UK & Ireland', timezones: ['Europe/Dublin'], isPopular: true },

  // Western Europe
  { iata: 'AMS', city: 'Amsterdam', name: 'Schiphol Airport', country: 'Netherlands', flag: '🇳🇱', region: 'Western Europe', timezones: ['Europe/Amsterdam'], isPopular: true },
  { iata: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany', flag: '🇩🇪', region: 'Western Europe', timezones: ['Europe/Berlin', 'Europe/Frankfurt'], isPopular: true },
  { iata: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany', flag: '🇩🇪', region: 'Western Europe', timezones: [], isPopular: true },
  { iata: 'BER', city: 'Berlin', name: 'Brandenburg Airport', country: 'Germany', flag: '🇩🇪', region: 'Western Europe', timezones: [], isPopular: true },
  { iata: 'HAM', city: 'Hamburg', name: 'Hamburg Airport', country: 'Germany', flag: '🇩🇪', region: 'Western Europe', timezones: [] },
  { iata: 'DUS', city: 'Düsseldorf', name: 'Düsseldorf Airport', country: 'Germany', flag: '🇩🇪', region: 'Western Europe', timezones: [] },
  { iata: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France', flag: '🇫🇷', region: 'Western Europe', timezones: ['Europe/Paris'], isPopular: true },
  { iata: 'ORY', city: 'Paris', name: 'Orly Airport', country: 'France', flag: '🇫🇷', region: 'Western Europe', timezones: [] },
  { iata: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium', flag: '🇧🇪', region: 'Western Europe', timezones: ['Europe/Brussels'] },
  { iata: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland', flag: '🇨🇭', region: 'Western Europe', timezones: ['Europe/Zurich'], isPopular: true },
  { iata: 'GVA', city: 'Geneva', name: 'Geneva Airport', country: 'Switzerland', flag: '🇨🇭', region: 'Western Europe', timezones: [] },
  { iata: 'VIE', city: 'Vienna', name: 'Vienna International Airport', country: 'Austria', flag: '🇦🇹', region: 'Western Europe', timezones: ['Europe/Vienna'], isPopular: true },

  // Central & Southern Europe
  { iata: 'MXP', city: 'Milan', name: 'Malpensa Airport', country: 'Italy', flag: '🇮🇹', region: 'Central & Southern Europe', timezones: ['Europe/Rome'] },
  { iata: 'FCO', city: 'Rome', name: 'Fiumicino Airport', country: 'Italy', flag: '🇮🇹', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'BCN', city: 'Barcelona', name: 'El Prat Airport', country: 'Spain', flag: '🇪🇸', region: 'Central & Southern Europe', timezones: ['Europe/Madrid'] },
  { iata: 'MAD', city: 'Madrid', name: 'Barajas Airport', country: 'Spain', flag: '🇪🇸', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'LIS', city: 'Lisbon', name: 'Humberto Delgado Airport', country: 'Portugal', flag: '🇵🇹', region: 'Central & Southern Europe', timezones: ['Europe/Lisbon'] },
  { iata: 'WAW', city: 'Warsaw', name: 'Chopin Airport', country: 'Poland', flag: '🇵🇱', region: 'Central & Southern Europe', timezones: ['Europe/Warsaw'] },
  { iata: 'PRG', city: 'Prague', name: 'Václav Havel Airport', country: 'Czechia', flag: '🇨🇿', region: 'Central & Southern Europe', timezones: ['Europe/Prague'] },

  // North America
  { iata: 'JFK', city: 'New York', name: 'John F. Kennedy Airport', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/New_York'], isPopular: true },
  { iata: 'EWR', city: 'New York / Newark', name: 'Newark Liberty', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/Los_Angeles'] },
  { iata: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/Chicago'] },
  { iata: 'BOS', city: 'Boston', name: 'Logan International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'MIA', city: 'Miami', name: 'Miami International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'YYZ', city: 'Toronto', name: 'Pearson International', country: 'Canada', flag: '🇨🇦', region: 'North America', timezones: ['America/Toronto'] }
];

export function detectDefaultOriginAirport(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = ORIGIN_AIRPORTS.find((a) => a.timezones.includes(tz));
    if (match) return match.iata;
  } catch {
    // fallback
  }
  return 'ARN'; // Default to Stockholm
}

export function searchOriginAirports(query: string): OriginAirport[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    // Return popular origins first
    return ORIGIN_AIRPORTS.filter((a) => a.isPopular);
  }

  return ORIGIN_AIRPORTS.filter((airport) => {
    return (
      airport.iata.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      airport.country.toLowerCase().includes(q)
    );
  });
}

export function getAirportByIata(iata: string): OriginAirport | undefined {
  return ORIGIN_AIRPORTS.find((a) => a.iata === iata) || ORIGIN_AIRPORTS[0];
}

export interface DestinationAirport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export interface HotelLogistics {
  originIata: string;
  originCity: string;
  destinationAirport: DestinationAirport;
  flightDurationText: string;
  isDirect: boolean;
  isLocalStay: boolean;
  transferTimeMinutes: number;
  transferDescription: string;
  seasonality: {
    bestMonths: string;
    peakSeason: string;
    summary: string;
  };
}

// Approximate coordinate-based or region-based mapping for hotels
const DESTINATION_AIRPORT_RULES: Array<{
  match: RegExp;
  airport: DestinationAirport;
  defaultTransferMinutes: number;
  transferType: string;
  baseFlightHoursFromARN: number;
  bestMonths: string;
  peakSeason: string;
}> = [
  {
    match: /stockholm|ett hem|villa daggk[aå]pa|\bsweden\b|\bsverige\b/i,
    airport: { iata: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
    defaultTransferMinutes: 25,
    transferType: 'Arlanda Express / taxi',
    baseFlightHoursFromARN: 0,
    bestMonths: 'May – September',
    peakSeason: 'June – August'
  },
  {
    match: /pontresina|kronenhof|st moritz|engadin|swiss alps|zermatt|vals|geneva|zurich|switzerland|schweiz/i,
    airport: { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
    defaultTransferMinutes: 90,
    transferType: 'panoramic Bernina train / drive',
    baseFlightHoursFromARN: 2.3,
    bestMonths: 'Dec – Apr (Ski) & Jun – Sep (Summer)',
    peakSeason: 'Jan – Feb & July – Aug'
  },
  {
    match: /lule[aå]|harads|treehotel|arctic bath|lapland|kiruna|jukkasj[aä]rvi/i,
    airport: { iata: 'LLA', name: 'Luleå Kallax Airport', city: 'Luleå', country: 'Sweden' },
    defaultTransferMinutes: 60,
    transferType: 'scenic Arctic drive',
    baseFlightHoursFromARN: 1.3,
    bestMonths: 'Dec – Mar (Northern Lights) & Jun – Aug (Midnight Sun)',
    peakSeason: 'Jan – Feb & July'
  },
  {
    match: /copenhagen|k[oø]benhavn|denmark|danmark|villa copenhagen|audo/i,
    airport: { iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
    defaultTransferMinutes: 15,
    transferType: 'metro / taxi',
    baseFlightHoursFromARN: 1.1,
    bestMonths: 'May – September',
    peakSeason: 'June – August'
  },
  {
    match: /manshausen|norway|norge|oslo|lofoten|bod[oø]/i,
    airport: { iata: 'BOO', name: 'Bodø Airport', city: 'Bodø', country: 'Norway' },
    defaultTransferMinutes: 90,
    transferType: 'scenic coastal ferry / drive',
    baseFlightHoursFromARN: 2.0,
    bestMonths: 'May – September',
    peakSeason: 'July – August'
  },
  {
    match: /hotel arctic|greenland|ilulissat/i,
    airport: { iata: 'JAV', name: 'Ilulissat Airport', city: 'Ilulissat', country: 'Greenland' },
    defaultTransferMinutes: 10,
    transferType: 'hotel transfer',
    baseFlightHoursFromARN: 5.5,
    bestMonths: 'June – September (Midnight Sun) & Feb – Apr (Icebergs)',
    peakSeason: 'July – August'
  },
  {
    match: /the retreat|blue lagoon|grindav[ií]k|iceland|reykjavik/i,
    airport: { iata: 'KEF', name: 'Keflavík International Airport', city: 'Reykjavik', country: 'Iceland' },
    defaultTransferMinutes: 20,
    transferType: 'direct lava transfer',
    baseFlightHoursFromARN: 3.2,
    bestMonths: 'June – August (Summer) & Nov – Mar (Auroras)',
    peakSeason: 'July – August'
  },
  {
    match: /tokyo|japan/i,
    airport: { iata: 'HND', name: 'Tokyo Haneda / Narita', city: 'Tokyo', country: 'Japan' },
    defaultTransferMinutes: 30,
    transferType: 'monorail / express taxi',
    baseFlightHoursFromARN: 12.5,
    bestMonths: 'March – May & Sept – Nov',
    peakSeason: 'April (Cherry Blossoms) & October'
  },
  {
    match: /ibiza/i,
    airport: { iata: 'IBZ', name: 'Ibiza Airport', city: 'Ibiza', country: 'Spain' },
    defaultTransferMinutes: 20,
    transferType: 'drive / taxi',
    baseFlightHoursFromARN: 3.75,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  },
  {
    match: /mallorca|majorca|palma/i,
    airport: { iata: 'PMI', name: 'Palma de Mallorca Airport', city: 'Mallorca', country: 'Spain' },
    defaultTransferMinutes: 30,
    transferType: 'drive / taxi',
    baseFlightHoursFromARN: 3.5,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  },
  {
    match: /menorca|minorca/i,
    airport: { iata: 'MAH', name: 'Menorca Airport', city: 'Menorca', country: 'Spain' },
    defaultTransferMinutes: 25,
    transferType: 'drive / taxi',
    baseFlightHoursFromARN: 3.7,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  },
  {
    match: /marbella|malaga|costa del sol|andaluc/i,
    airport: { iata: 'AGP', name: 'Málaga-Costa del Sol Airport', city: 'Málaga', country: 'Spain' },
    defaultTransferMinutes: 40,
    transferType: 'scenic highway drive',
    baseFlightHoursFromARN: 4.0,
    bestMonths: 'April – October',
    peakSeason: 'July – August'
  },
  {
    match: /barcelona|costa brava|girona/i,
    airport: { iata: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain' },
    defaultTransferMinutes: 25,
    transferType: 'taxi / express rail',
    baseFlightHoursFromARN: 3.5,
    bestMonths: 'April – November',
    peakSeason: 'June – September'
  },
  {
    match: /madrid/i,
    airport: { iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
    defaultTransferMinutes: 25,
    transferType: 'metro / taxi',
    baseFlightHoursFromARN: 3.8,
    bestMonths: 'April – June & Sept – Nov',
    peakSeason: 'May & October'
  },
  {
    match: /amalfi|positano|capri|sorrento|naples|napoli|ravello/i,
    airport: { iata: 'NAP', name: 'Naples International Airport', city: 'Naples', country: 'Italy' },
    defaultTransferMinutes: 60,
    transferType: 'coastal drive / ferry',
    baseFlightHoursFromARN: 3.5,
    bestMonths: 'May – October',
    peakSeason: 'June – August'
  },
  {
    match: /tuscany|florence|firenze|siena|chianti|lucca/i,
    airport: { iata: 'FLR', name: 'Florence Airport', city: 'Florence', country: 'Italy' },
    defaultTransferMinutes: 45,
    transferType: 'countryside drive',
    baseFlightHoursFromARN: 3.2,
    bestMonths: 'April – October',
    peakSeason: 'June – September'
  },
  {
    match: /dolomites|bolzano|val gardena|cortina|sudtirol/i,
    airport: { iata: 'VCE', name: 'Venice Marco Polo / Innsbruck', city: 'Venice / Innsbruck', country: 'Italy' },
    defaultTransferMinutes: 90,
    transferType: 'scenic alpine drive',
    baseFlightHoursFromARN: 2.7,
    bestMonths: 'Dec – Mar (Ski) & Jun – Sep (Hiking)',
    peakSeason: 'August & February'
  },
  {
    match: /lake como|como|bellagio|milan|milano/i,
    airport: { iata: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
    defaultTransferMinutes: 50,
    transferType: 'lake road drive',
    baseFlightHoursFromARN: 2.8,
    bestMonths: 'April – October',
    peakSeason: 'June – August'
  },
  {
    match: /rome|roma/i,
    airport: { iata: 'FCO', name: 'Rome Fiumicino Airport', city: 'Rome', country: 'Italy' },
    defaultTransferMinutes: 35,
    transferType: 'express train / taxi',
    baseFlightHoursFromARN: 3.2,
    bestMonths: 'April – June & Sept – Oct',
    peakSeason: 'May & September'
  },
  {
    match: /sicily|taormina|palermo|catania/i,
    airport: { iata: 'CTA', name: 'Catania-Fontanarossa Airport', city: 'Catania', country: 'Italy' },
    defaultTransferMinutes: 45,
    transferType: 'coastal drive',
    baseFlightHoursFromARN: 3.8,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  },
  {
    match: /french riviera|nice|cannes|monaco|st tropez|cote d'azur/i,
    airport: { iata: 'NCE', name: 'Nice Côte d’Azur Airport', city: 'Nice', country: 'France' },
    defaultTransferMinutes: 35,
    transferType: 'coastal highway',
    baseFlightHoursFromARN: 3.0,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  },
  {
    match: /paris/i,
    airport: { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
    defaultTransferMinutes: 35,
    transferType: 'RER / taxi',
    baseFlightHoursFromARN: 2.6,
    bestMonths: 'April – October',
    peakSeason: 'June – September'
  },
  {
    match: /algarve|faro/i,
    airport: { iata: 'FAO', name: 'Faro Airport', city: 'Faro', country: 'Portugal' },
    defaultTransferMinutes: 35,
    transferType: 'coastal drive',
    baseFlightHoursFromARN: 4.2,
    bestMonths: 'April – October',
    peakSeason: 'July – August'
  },
  {
    match: /lisbon|lisboa|sintra|cascais/i,
    airport: { iata: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal' },
    defaultTransferMinutes: 25,
    transferType: 'metro / taxi',
    baseFlightHoursFromARN: 4.3,
    bestMonths: 'March – November',
    peakSeason: 'June – September'
  },
  {
    match: /santorini/i,
    airport: { iata: 'JTR', name: 'Santorini Airport', city: 'Santorini', country: 'Greece' },
    defaultTransferMinutes: 20,
    transferType: 'island taxi',
    baseFlightHoursFromARN: 4.0,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  },
  {
    match: /mykonos/i,
    airport: { iata: 'JMK', name: 'Mykonos Island National Airport', city: 'Mykonos', country: 'Greece' },
    defaultTransferMinutes: 15,
    transferType: 'transfer service',
    baseFlightHoursFromARN: 3.9,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  },
  {
    match: /crete|chania|heraklion/i,
    airport: { iata: 'HER', name: 'Heraklion International Airport', city: 'Crete', country: 'Greece' },
    defaultTransferMinutes: 30,
    transferType: 'coastal highway',
    baseFlightHoursFromARN: 4.1,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  },
  {
    match: /athens/i,
    airport: { iata: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
    defaultTransferMinutes: 35,
    transferType: 'metro / taxi',
    baseFlightHoursFromARN: 3.6,
    bestMonths: 'April – June & Sept – Nov',
    peakSeason: 'May & September'
  },
  {
    match: /marrakech|morocco/i,
    airport: { iata: 'RAK', name: 'Marrakesh Menara Airport', city: 'Marrakech', country: 'Morocco' },
    defaultTransferMinutes: 20,
    transferType: 'medina transfer',
    baseFlightHoursFromARN: 4.8,
    bestMonths: 'October – May',
    peakSeason: 'March – April & October'
  },
  {
    match: /swiss alps|zermatt|st moritz|geneva|zurich|switzerland/i,
    airport: { iata: 'GVA', name: 'Geneva / Zurich Airport', city: 'Geneva / Zurich', country: 'Switzerland' },
    defaultTransferMinutes: 75,
    transferType: 'panoramic train / drive',
    baseFlightHoursFromARN: 2.6,
    bestMonths: 'Dec – Apr (Ski) & Jun – Sep (Summer)',
    peakSeason: 'Jan – Feb & July – Aug'
  },
  {
    match: /london|cotswolds|uk|united kingdom/i,
    airport: { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
    defaultTransferMinutes: 30,
    transferType: 'express train / taxi',
    baseFlightHoursFromARN: 2.5,
    bestMonths: 'May – September',
    peakSeason: 'June – August'
  }
];

export function getHotelLogistics(
  hotel: { name: string; location: string; region?: string; surroundings?: string },
  originIata: string = 'ARN'
): HotelLogistics {
  const fullText = `${hotel.name} ${hotel.location} ${hotel.region || ''} ${hotel.surroundings || ''}`;
  
  const matchedRule = DESTINATION_AIRPORT_RULES.find((rule) => rule.match.test(fullText)) || {
    airport: { iata: 'FCO', name: 'Major International Airport', city: hotel.location.split(',')[0], country: 'Europe' },
    defaultTransferMinutes: 30,
    transferType: 'taxi / transfer',
    baseFlightHoursFromARN: 3.2,
    bestMonths: 'May – October',
    peakSeason: 'July – August'
  };

  const origin = getAirportByIata(originIata) || ORIGIN_AIRPORTS[0];

  const isSameAirport = origin.iata === matchedRule.airport.iata;
  const isSameCity = origin.city.toLowerCase() === matchedRule.airport.city.toLowerCase() ||
                     (origin.iata === 'ARN' && /stockholm/i.test(fullText)) ||
                     (origin.iata === 'LHR' && /london/i.test(fullText)) ||
                     (origin.iata === 'CDG' && /paris/i.test(fullText)) ||
                     (origin.iata === 'CPH' && /copenhagen|københavn/i.test(fullText));

  const isLocalStay = isSameAirport || isSameCity;

  let flightDurationText: string;
  if (isLocalStay) {
    flightDurationText = 'Local staycation';
  } else {
    // Adjust duration based on origin region
    let durationMultiplier = 1.0;
    if (origin.iata === 'LHR' || origin.iata === 'LGW') durationMultiplier = 0.85;
    if (origin.iata === 'CPH') durationMultiplier = 0.95;
    if (origin.iata === 'AMS' || origin.iata === 'FRA' || origin.iata === 'CDG') durationMultiplier = 0.8;
    if (origin.iata === 'JFK') durationMultiplier = 2.4;

    const totalHours = Math.max(0.8, matchedRule.baseFlightHoursFromARN * durationMultiplier);
    const hours = Math.floor(totalHours);
    const mins = Math.round(((totalHours - hours) * 60) / 5) * 5; // round to nearest 5 mins
    flightDurationText = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return {
    originIata: origin.iata,
    originCity: origin.city,
    destinationAirport: matchedRule.airport,
    flightDurationText,
    isDirect: isLocalStay ? true : origin.region !== 'North America', // Most intra-Europe holidays are direct
    isLocalStay,
    transferTimeMinutes: matchedRule.defaultTransferMinutes,
    transferDescription: isLocalStay
      ? `${matchedRule.defaultTransferMinutes}m ${matchedRule.transferType} from city center`
      : `${matchedRule.defaultTransferMinutes}m ${matchedRule.transferType}`,
    seasonality: {
      bestMonths: matchedRule.bestMonths,
      peakSeason: matchedRule.peakSeason,
      summary: `Best: ${matchedRule.bestMonths} (Peak: ${matchedRule.peakSeason})`
    }
  };
}

/**
 * Calculates realistic future departure & return dates for flight deep-links.
 * - 'weekend': Next upcoming Thursday -> Sunday (3 nights) ~3-4 weeks out
 * - 'week': Next upcoming Saturday -> Saturday (7 nights) ~4 weeks out
 */
export function getRecommendedFlightDates(
  durationType: 'weekend' | 'week' = 'weekend'
): { departureDate: string; returnDate: string; durationLabel: string } {
  const now = new Date();
  const departure = new Date();
  
  if (durationType === 'weekend') {
    // Move ~21 days into the future
    departure.setDate(now.getDate() + 21);
    // Find next Thursday (Day 4: 0 = Sun, 1 = Mon, ..., 4 = Thu)
    const day = departure.getDay();
    const daysUntilThursday = (4 - day + 7) % 7;
    departure.setDate(departure.getDate() + daysUntilThursday);

    const returnD = new Date(departure);
    returnD.setDate(departure.getDate() + 3); // Thursday to Sunday (3 nights)

    return {
      departureDate: departure.toISOString().split('T')[0],
      returnDate: returnD.toISOString().split('T')[0],
      durationLabel: '3-night Long Weekend (Thu–Sun)'
    };
  } else {
    // Move ~28 days into the future
    departure.setDate(now.getDate() + 28);
    // Find next Saturday (Day 6: 0 = Sun, 1 = Mon, ..., 6 = Sat)
    const day = departure.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    departure.setDate(departure.getDate() + daysUntilSaturday);

    const returnD = new Date(departure);
    returnD.setDate(departure.getDate() + 7); // Saturday to Saturday (7 nights)

    return {
      departureDate: departure.toISOString().split('T')[0],
      returnDate: returnD.toISOString().split('T')[0],
      durationLabel: '7-day Vacation (Sat–Sat)'
    };
  }
}
