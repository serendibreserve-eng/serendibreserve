export interface MarketDestination {
  name: string;
  lat: number;
  lon: number;
  region: 'Europe' | 'Americas' | 'Middle East' | 'Asia';
  focus: string;
}

export interface MarketRegion {
  id: 'Europe' | 'Americas' | 'Middle East' | 'Asia';
  headline: string;
  countries: string[];
  buyerPreference: string;
  highlightNote?: string;
}

export const COLOMBO_COORDS = { name: 'Colombo, Sri Lanka', lat: 6.9271, lon: 79.8612 };

export const MARKET_DESTINATIONS: MarketDestination[] = [
  { name: 'Switzerland', lat: 46.8182, lon: 8.2275, region: 'Europe', focus: 'Fine unheated sapphires & haute horlogerie calibrated sets' },
  { name: 'Belgium', lat: 50.8503, lon: 4.3517, region: 'Europe', focus: 'Certified loose stones & classic European estate cuts' },
  { name: 'France', lat: 48.8566, lon: 2.3522, region: 'Europe', focus: 'High-jewellery pairs, padparadscha & bespoke centre stones' },
  { name: 'Germany', lat: 50.1109, lon: 8.6821, region: 'Europe', focus: 'Collector rarities, alexandrite & calibrated parcels' },
  { name: 'Italy', lat: 45.4642, lon: 9.19, region: 'Europe', focus: 'Vibrant coloured sapphires & fine jewellery suites' },
  { name: 'United Kingdom', lat: 51.5072, lon: -0.1276, region: 'Europe', focus: 'Cornflower blue sapphires & heirloom engagement stones' },
  { name: 'United States', lat: 40.7128, lon: -74.006, region: 'Americas', focus: 'Investment-grade Ceylon sapphires, padparadscha & collector cuts' },
  { name: 'UAE', lat: 25.2048, lon: 55.2708, region: 'Middle East', focus: 'Important royal blue sapphires, rubies & matched suites' },
  { name: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, region: 'Middle East', focus: 'High-carat certified stones & bridal sapphire suites' },
  { name: 'Israel', lat: 32.0853, lon: 34.7818, region: 'Middle East', focus: 'Precision loose goods & international trade partnerships' },
  { name: 'India', lat: 19.076, lon: 72.8777, region: 'Asia', focus: "Yellow sapphires, blue sapphires, cat's eye & astrological grade stones" },
  { name: 'Thailand', lat: 13.7563, lon: 100.5018, region: 'Asia', focus: 'Major cutting & trading hub; Sri Lankan exports more than doubled in 2025' },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, region: 'Asia', focus: 'Global auction & wholesale distribution centre for fine coloured stones' },
  { name: 'Japan', lat: 35.6762, lon: 139.6503, region: 'Asia', focus: "Star sapphires, padparadscha, cat's eye & pristine small calibrated goods" },
  { name: 'China', lat: 31.2304, lon: 121.4737, region: 'Asia', focus: 'Royal blue sapphires, crimson rubies & certified collector stones' },
];

export const MARKET_REGIONS: MarketRegion[] = [
  {
    id: 'Europe',
    headline: 'Haute Joaillerie & Heritage Ateliers',
    countries: ['Switzerland', 'Belgium', 'France', 'Germany', 'Italy', 'United Kingdom'],
    buyerPreference:
      'European houses and connoisseurs prioritise subtle cornflower-to-royal hues, unheated provenance dossiers, matched earring pairs, and precision calibrated suites.',
  },
  {
    id: 'Americas',
    headline: 'Bespoke Designers & Private Collectors',
    countries: ['United States'],
    buyerPreference:
      'North American jewellers and collectors seek statement Ceylon sapphires, rare padparadscha ovals, colour-change alexandrite, and verified lab certification.',
  },
  {
    id: 'Middle East',
    headline: 'High-Carat Suites & Collector Houses',
    countries: ['UAE', 'Saudi Arabia', 'Israel'],
    buyerPreference:
      'Buyers across Dubai, Riyadh, and Tel Aviv value high-carat royal blue sapphires, vivid rubies, and coordinated suites ready for high-jewellery setting.',
  },
  {
    id: 'Asia',
    headline: 'Global Cutting Hubs & Connoisseur Markets',
    countries: ['India', 'Thailand', 'Hong Kong', 'Japan', 'China'],
    buyerPreference:
      "Asia encompasses both powerhouse cutting/trading hubs in Thailand and Hong Kong and discerning end markets valuing yellow sapphires, star stones, padparadscha, and cat's eye.",
    highlightNote:
      'Thailand and Hong Kong anchor global coloured-stone cutting and distribution — Sri Lanka’s gem exports to Thailand more than doubled in 2025.',
  },
];

export const SHIPPING_STEPS = [
  {
    step: '01',
    title: 'Selection & Grading',
    description: 'High-resolution daylight & incandescent inspection, dimension checks, and parcel matching in Colombo.',
  },
  {
    step: '02',
    title: 'Certification & Clearance',
    description: 'Optional independent gemmological lab reporting and mandatory NGJA export inspection and sealing.',
  },
  {
    step: '03',
    title: 'Insured & Secure Packing',
    description: 'Tamper-evident security pouches with full declared transit insurance via specialist armoured/express couriers.',
  },
  {
    step: '04',
    title: 'Export Clearance & Delivery',
    description: 'Tracked door-to-door international delivery with full customs documentation under buyer-selected Incoterms (FOB / CIF / DDP).',
  },
] as const;

export const TRADE_EVENTS = [
  { name: 'FACETS Sri Lanka', location: 'Colombo, Sri Lanka', note: 'Asia’s premier annual gem & jewellery exhibition' },
  { name: 'Gem Sri Lanka', location: 'Sri Lanka', note: 'Source-country showcase connecting mines and global buyers' },
  { name: 'Bangkok Gems & Jewelry Fair', location: 'Bangkok, Thailand', note: 'Major ASEAN coloured gemstone trading forum' },
  { name: 'Hong Kong Jewellery & Gem Fair', location: 'Hong Kong', note: 'Global loose gemstone & fine jewellery marketplace' },
  { name: 'Tucson Gem Shows', location: 'Tucson, Arizona, USA', note: 'International collector, rough & rare species gathering' },
  { name: 'JCK Las Vegas', location: 'Las Vegas, USA', note: 'North American fine jewellery & trade pavilion' },
  { name: 'Dubai Gem & Jewellery Shows', location: 'Dubai, UAE', note: 'Middle East high-jewellery & loose stone hub' },
] as const;
