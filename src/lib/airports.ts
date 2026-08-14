export interface OriginAirport {
  iata: string;
  city: string;
  name: string;
  country: string;
  flag: string;
  region: 'Nordics' | 'UK & Ireland' | 'Western Europe' | 'Central & Southern Europe' | 'North America' | 'Asia & Oceania' | 'Middle East';
  timezones: string[];
  isPopular?: boolean;
}

export const ORIGIN_AIRPORTS: OriginAirport[] = [
  // United States & North America (Expanded for ~50% US traffic)
  { iata: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/New_York'], isPopular: true },
  { iata: 'EWR', city: 'New York / Newark', name: 'Newark Liberty International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'LGA', city: 'New York', name: 'LaGuardia Airport', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/Los_Angeles'], isPopular: true },
  { iata: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/Chicago'], isPopular: true },
  { iata: 'MIA', city: 'Miami', name: 'Miami International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'BOS', city: 'Boston', name: 'Logan International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'AUS', city: 'Austin', name: 'Austin-Bergstrom International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'DFW', city: 'Dallas / Fort Worth', name: 'Dallas/Fort Worth International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'DEN', city: 'Denver', name: 'Denver International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/Denver'], isPopular: true },
  { iata: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'IAD', city: 'Washington D.C.', name: 'Washington Dulles International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [], isPopular: true },
  { iata: 'DCA', city: 'Washington D.C.', name: 'Ronald Reagan National', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'PHX', city: 'Phoenix', name: 'Sky Harbor International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/Phoenix'] },
  { iata: 'SAN', city: 'San Diego', name: 'San Diego International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'LAS', city: 'Las Vegas', name: 'Harry Reid International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'IAH', city: 'Houston', name: 'George Bush Intercontinental', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'PHL', city: 'Philadelphia', name: 'Philadelphia International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'MSP', city: 'Minneapolis', name: 'Minneapolis-Saint Paul International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'DTW', city: 'Detroit', name: 'Detroit Metropolitan Airport', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['America/Detroit'] },
  { iata: 'CLT', city: 'Charlotte', name: 'Charlotte Douglas International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'BNA', city: 'Nashville', name: 'Nashville International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'SLC', city: 'Salt Lake City', name: 'Salt Lake City International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'PDX', city: 'Portland', name: 'Portland International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'TPA', city: 'Tampa', name: 'Tampa International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'MCO', city: 'Orlando', name: 'Orlando International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'FLL', city: 'Fort Lauderdale', name: 'Fort Lauderdale-Hollywood International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: [] },
  { iata: 'HNL', city: 'Honolulu', name: 'Daniel K. Inouye International', country: 'USA', flag: '🇺🇸', region: 'North America', timezones: ['Pacific/Honolulu'] },
  { iata: 'YYZ', city: 'Toronto', name: 'Pearson International', country: 'Canada', flag: '🇨🇦', region: 'North America', timezones: ['America/Toronto'], isPopular: true },
  { iata: 'YVR', city: 'Vancouver', name: 'Vancouver International', country: 'Canada', flag: '🇨🇦', region: 'North America', timezones: ['America/Vancouver'] },
  { iata: 'YUL', city: 'Montreal', name: 'Pierre Elliott Trudeau International', country: 'Canada', flag: '🇨🇦', region: 'North America', timezones: ['America/Montreal'] },

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
  { iata: 'TOS', city: 'Tromsø', name: 'Langnes Airport', country: 'Norway', flag: '🇳🇴', region: 'Nordics', timezones: [] },
  { iata: 'HEL', city: 'Helsinki', name: 'Vantaa Airport', country: 'Finland', flag: '🇫🇮', region: 'Nordics', timezones: ['Europe/Helsinki'], isPopular: true },
  { iata: 'KEF', city: 'Reykjavik', name: 'Keflavík International', country: 'Iceland', flag: '🇮🇸', region: 'Nordics', timezones: ['Atlantic/Reykjavik'] },

  // UK & Ireland
  { iata: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: ['Europe/London'], isPopular: true },
  { iata: 'LGW', city: 'London', name: 'Gatwick Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [], isPopular: true },
  { iata: 'STN', city: 'London', name: 'Stansted Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [] },
  { iata: 'LCY', city: 'London', name: 'London City Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [] },
  { iata: 'MAN', city: 'Manchester', name: 'Manchester Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [], isPopular: true },
  { iata: 'EDI', city: 'Edinburgh', name: 'Edinburgh Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [] },
  { iata: 'BHX', city: 'Birmingham', name: 'Birmingham Airport', country: 'UK', flag: '🇬🇧', region: 'UK & Ireland', timezones: [] },
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
  { iata: 'BSL', city: 'Basel', name: 'EuroAirport Basel Mulhouse', country: 'Switzerland', flag: '🇨🇭', region: 'Western Europe', timezones: [] },
  { iata: 'VIE', city: 'Vienna', name: 'Vienna International Airport', country: 'Austria', flag: '🇦🇹', region: 'Western Europe', timezones: ['Europe/Vienna'], isPopular: true },

  // Central & Southern Europe
  { iata: 'MXP', city: 'Milan', name: 'Malpensa Airport', country: 'Italy', flag: '🇮🇹', region: 'Central & Southern Europe', timezones: ['Europe/Rome'], isPopular: true },
  { iata: 'FCO', city: 'Rome', name: 'Fiumicino Airport', country: 'Italy', flag: '🇮🇹', region: 'Central & Southern Europe', timezones: [], isPopular: true },
  { iata: 'FLR', city: 'Florence', name: 'Peretola Airport', country: 'Italy', flag: '🇮🇹', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'VCE', city: 'Venice', name: 'Marco Polo Airport', country: 'Italy', flag: '🇮🇹', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'NAP', city: 'Naples', name: 'Capodichino Airport', country: 'Italy', flag: '🇮🇹', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'BCN', city: 'Barcelona', name: 'El Prat Airport', country: 'Spain', flag: '🇪🇸', region: 'Central & Southern Europe', timezones: ['Europe/Madrid'], isPopular: true },
  { iata: 'MAD', city: 'Madrid', name: 'Barajas Airport', country: 'Spain', flag: '🇪🇸', region: 'Central & Southern Europe', timezones: [], isPopular: true },
  { iata: 'AGP', city: 'Malaga', name: 'Costa del Sol Airport', country: 'Spain', flag: '🇪🇸', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'PMI', city: 'Palma de Mallorca', name: 'Palma Airport', country: 'Spain', flag: '🇪🇸', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'IBZ', city: 'Ibiza', name: 'Ibiza Airport', country: 'Spain', flag: '🇪🇸', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'LIS', city: 'Lisbon', name: 'Humberto Delgado Airport', country: 'Portugal', flag: '🇵🇹', region: 'Central & Southern Europe', timezones: ['Europe/Lisbon'], isPopular: true },
  { iata: 'OPO', city: 'Porto', name: 'Francisco Sá Carneiro Airport', country: 'Portugal', flag: '🇵🇹', region: 'Central & Southern Europe', timezones: [] },
  { iata: 'ATH', city: 'Athens', name: 'Eleftherios Venizelos', country: 'Greece', flag: '🇬🇷', region: 'Central & Southern Europe', timezones: ['Europe/Athens'], isPopular: true },
  { iata: 'WAW', city: 'Warsaw', name: 'Chopin Airport', country: 'Poland', flag: '🇵🇱', region: 'Central & Southern Europe', timezones: ['Europe/Warsaw'] },
  { iata: 'PRG', city: 'Prague', name: 'Václav Havel Airport', country: 'Czechia', flag: '🇨🇿', region: 'Central & Southern Europe', timezones: ['Europe/Prague'] },
  { iata: 'BUD', city: 'Budapest', name: 'Ferenc Liszt International', country: 'Hungary', flag: '🇭🇺', region: 'Central & Southern Europe', timezones: ['Europe/Budapest'] },

  // Asia & Oceania
  { iata: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia', flag: '🇦🇺', region: 'Asia & Oceania', timezones: ['Australia/Sydney'], isPopular: true },
  { iata: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia', flag: '🇦🇺', region: 'Asia & Oceania', timezones: ['Australia/Melbourne'] },
  { iata: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore', flag: '🇸🇬', region: 'Asia & Oceania', timezones: ['Asia/Singapore'], isPopular: true },
  { iata: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan', flag: '🇯🇵', region: 'Asia & Oceania', timezones: ['Asia/Tokyo'], isPopular: true },
  { iata: 'NRT', city: 'Tokyo', name: 'Narita International', country: 'Japan', flag: '🇯🇵', region: 'Asia & Oceania', timezones: [] },
  { iata: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'UAE', flag: '🇦🇪', region: 'Middle East', timezones: ['Asia/Dubai'], isPopular: true },
  { iata: 'DOH', city: 'Doha', name: 'Hamad International', country: 'Qatar', flag: '🇶🇦', region: 'Middle East', timezones: ['Asia/Qatar'] }
];

export function detectDefaultOriginAirport(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = ORIGIN_AIRPORTS.find((a) => a.timezones.includes(tz));
    if (match) return match.iata;

    // Region / timezone prefix heuristics
    if (tz.startsWith('America/')) {
      if (tz.includes('Los_Angeles') || tz.includes('Vancouver') || tz.includes('Tijuana')) return 'LAX';
      if (tz.includes('Chicago') || tz.includes('Winnipeg')) return 'ORD';
      if (tz.includes('Denver') || tz.includes('Phoenix') || tz.includes('Edmonton')) return 'DEN';
      return 'JFK'; // Default US/Americas to JFK
    }
    if (tz.startsWith('Europe/')) {
      if (tz.includes('London')) return 'LHR';
      if (tz.includes('Paris')) return 'CDG';
      if (tz.includes('Berlin') || tz.includes('Frankfurt')) return 'FRA';
      if (tz.includes('Amsterdam')) return 'AMS';
      if (tz.includes('Rome')) return 'FCO';
      if (tz.includes('Madrid')) return 'MAD';
      if (tz.includes('Zurich')) return 'ZRH';
      if (tz.includes('Copenhagen')) return 'CPH';
      if (tz.includes('Oslo')) return 'OSL';
      if (tz.includes('Helsinki')) return 'HEL';
      return 'ARN';
    }
    if (tz.startsWith('Australia/')) return 'SYD';
    if (tz.startsWith('Asia/Tokyo')) return 'HND';
    if (tz.startsWith('Asia/Dubai')) return 'DXB';
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
    let totalHours = matchedRule.baseFlightHoursFromARN;

    if (origin.region === 'North America') {
      // Transatlantic flights to Europe
      if (['JFK', 'EWR', 'BOS', 'PHL', 'IAD', 'MIA', 'YUL', 'YYZ'].includes(origin.iata)) {
        totalHours = 7.5 + (matchedRule.baseFlightHoursFromARN - 2.5) * 0.4;
      } else if (['ORD', 'DTW', 'MSP', 'ATL', 'CLT', 'BNA', 'DFW', 'IAH', 'AUS'].includes(origin.iata)) {
        totalHours = 9.0 + (matchedRule.baseFlightHoursFromARN - 2.5) * 0.4;
      } else {
        // West Coast & Mountain (LAX, SFO, SEA, SAN, PDX, PHX, DEN, SLC, YVR)
        totalHours = 11.0 + (matchedRule.baseFlightHoursFromARN - 2.5) * 0.4;
      }
    } else if (origin.region === 'Asia & Oceania') {
      totalHours = 13.5 + matchedRule.baseFlightHoursFromARN * 0.3;
    } else if (origin.region === 'Middle East') {
      totalHours = 5.5 + (matchedRule.baseFlightHoursFromARN - 2.5) * 0.5;
    } else {
      // European origins
      let durationMultiplier = 1.0;
      if (['LHR', 'LGW', 'STN', 'LCY', 'MAN', 'EDI', 'DUB'].includes(origin.iata)) durationMultiplier = 0.85;
      if (['CPH', 'BLL'].includes(origin.iata)) durationMultiplier = 0.95;
      if (['AMS', 'FRA', 'CDG', 'BRU', 'BER', 'MUC', 'HAM', 'DUS'].includes(origin.iata)) durationMultiplier = 0.8;
      if (['MXP', 'FCO', 'BCN', 'MAD', 'LIS', 'ZRH', 'VIE', 'ATH'].includes(origin.iata)) durationMultiplier = 0.75;
      totalHours = Math.max(0.8, matchedRule.baseFlightHoursFromARN * durationMultiplier);
    }

    const hours = Math.floor(totalHours);
    const mins = Math.round(((totalHours - hours) * 60) / 5) * 5;
    flightDurationText = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  const isMajorEuropeanHub = ['LHR', 'CDG', 'FCO', 'MAD', 'BCN', 'ZRH', 'AMS', 'FRA', 'DUB', 'LIS', 'MXP', 'MUC', 'VIE', 'ATH', 'CPH', 'ARN'].includes(matchedRule.airport.iata);
  const isDirect = isLocalStay
    ? true
    : origin.region === 'North America'
      ? isMajorEuropeanHub && ['JFK', 'EWR', 'BOS', 'ORD', 'LAX', 'SFO', 'IAD', 'ATL', 'MIA', 'YYZ'].includes(origin.iata)
      : true;

  return {
    originIata: origin.iata,
    originCity: origin.city,
    destinationAirport: matchedRule.airport,
    flightDurationText,
    isDirect,
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
