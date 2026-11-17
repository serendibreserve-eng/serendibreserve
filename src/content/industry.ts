export const VALUE_CHAIN_STAGES = [
  {
    step: '01',
    title: 'Mining',
    description:
      'Traditional licensed pits (illama) and small-scale family operations across Ratnapura, Elahera, and Okkampitiya recover water-worn rough by hand.',
  },
  {
    step: '02',
    title: 'Dealing & Exporting',
    description:
      'Licensed merchants sort parcels by hue, clarity, and potential yield, coordinating NGJA clearance and laboratory testing for international buyers.',
  },
  {
    step: '03',
    title: 'Lapidary (Cutting & Polishing)',
    description:
      'Sri Lankan cutters preserve maximum carat weight while orienting crystal axes to unlock pure brilliance and symmetrical silhouette.',
  },
  {
    step: '04',
    title: 'Jewellery Manufacture',
    description:
      'Master goldsmiths and setters craft bespoke platinum and gold settings built around calibrated pairs or singular hero stones.',
  },
  {
    step: '05',
    title: 'Global Retail & Collectors',
    description:
      'Finished loose gems and high jewellery reach ateliers, auction houses, and private collectors across Europe, Asia, the Middle East, and the Americas.',
  },
] as const;

export const INDUSTRY_KEY_FACTS = [
  {
    label: 'Livelihoods Supported',
    value: '~650,000',
    detail: 'Miners, cutters, dealers, designers, craftsmen, and sales professionals across Sri Lanka.',
  },
  {
    label: 'Regulatory Authority',
    value: 'NGJA',
    detail:
      'The National Gem and Jewellery Authority regulates licensing, mining, testing, and export clearance. Only cut and polished stones are generally cleared for export.*',
  },
  {
    label: 'Global Trade Milestone',
    value: 'ICA 1984',
    detail:
      'Sri Lankan gem dealers helped found the International Colored Gemstone Association in 1984.',
  },
  {
    label: 'Flagship Exhibition',
    value: 'FACETS 1991',
    detail:
      'FACETS Sri Lanka, Asia’s leading gem and jewellery exhibition, has been hosted annually in Colombo since 1991.',
  },
] as const;

export const EXPORT_SNAPSHOT_2025 = {
  total2025Millions: 334,
  target2030Millions: 1000,
  breakdown: [
    { label: 'Gemstones', amountMillions: 189, sharePct: 56.6, color: '#3D7BFF' },
    { label: 'Diamonds', amountMillions: 127, sharePct: 38.0, color: '#C9D1DC' },
    { label: 'Jewellery', amountMillions: 17.8, sharePct: 5.4, color: '#1B3FD9' },
  ],
  valueAdditionNote:
    'A significant share of traded rough and stones enters Sri Lanka for precision cutting, polishing, certification, and jewellery setting — value addition drives the majority of export revenue.',
  sourceFootnote:
    'Source: Sri Lanka Export Development Board (EDB); figures approximate. *NGJA export regulations are updated periodically — always verify current guidelines directly with NGJA.',
} as const;

export const SERENDIB_COMMITMENTS = [
  {
    title: 'Ethical Sourcing',
    description:
      'We are committed to working with licensed Sri Lankan mines and trusted suppliers who uphold responsible gravel washing and fair miner compensation.',
  },
  {
    title: 'Transparent Treatment Disclosure',
    description:
      'Every natural stone is presented with honest, clear disclosure regarding unheated status or thermal enhancement.',
  },
  {
    title: 'Independent Lab Certification',
    description:
      'We coordinate testing with recognised gemmological laboratories so buyers receive verifiable documentation of species, origin, and treatment.',
  },
  {
    title: 'Expert Lapidary Partners',
    description:
      'Our cutting partners balance proportion, symmetry, and optical return of light without sacrificing stone integrity.',
  },
  {
    title: 'Export Compliance & Security',
    description:
      'All international consignments follow NGJA export clearance procedures with insured, traceable courier logistics.',
  },
] as const;

export const SUSTAINABILITY_PILLARS = [
  {
    title: 'Responsible Pit Mining',
    text: 'Traditional timbered illama pits leave minimal surface footprint compared with mechanised strip mining.',
  },
  {
    title: 'Fair Pay & Community Care',
    text: 'We are committed to equitable revenue-sharing traditions that sustain multi-generational mining and cutting families.',
  },
  {
    title: 'Land Rehabilitation',
    text: 'After alluvial gravel extraction, licensed sites are refilled and returned to paddy cultivation or natural vegetation.',
  },
  {
    title: 'Mine-to-Market Traceability',
    text: 'We maintain clear provenance records from regional sorting tables in Sri Lanka to final export documentation.',
  },
] as const;
