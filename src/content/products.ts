import { GemCut } from './gems';

export interface ProductCategory {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  cut: GemCut;
  colorHex: string;
  photoUrl: string;
  matteTolerance?: number;
}

export interface SampleStone {
  id: string;
  isSampleData: true;
  name: string;
  species: string;
  category: string;
  cut: GemCut;
  colorHex: string;
  photoUrl: string;
  matteTolerance?: number;
  caratRange: string;
  colourGrade: string;
  clarity: string;
  origin: 'Sri Lanka (Ceylon)';
  treatmentStatus: string;
  lab: string;
  priceLabel: 'Price on Request';
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'certified-loose',
    number: '01',
    title: 'Certified Loose Gemstones',
    subtitle: 'Single Investment-Grade Stones',
    description:
      'Individually selected Ceylon sapphires, rubies, and alexandrites accompanied by independent gemmological dossiers.',
    cut: 'cushion',
    colorHex: '#1B3FD9',
    photoUrl: '/assets/aistudio/Royal_Blue_Sapphire_from_Sri_Lanka__Ceylon__1d3f139f.png',
  },
  {
    id: 'calibrated',
    number: '02',
    title: 'Calibrated Gemstones',
    subtitle: 'Matched Sizes for Jewellery Makers',
    description:
      'Precision-sieved rounds, ovals, and baguettes matched in hue and clarity for fine jewellery houses and ateliers.',
    cut: 'brilliant',
    colorHex: '#3D7BFF',
    photoUrl: '/assets/aistudio/Aquamarine___Fine_Beryl_257c3df3.png',
    matteTolerance: 14,
  },
  {
    id: 'pairs-suites',
    number: '03',
    title: 'Matched Pairs & Suites',
    subtitle: 'Earrings & Necklace Layouts',
    description:
      'Harmonised pairs and graduated layouts balanced for colour, brilliance, and silhouette symmetry.',
    cut: 'pear',
    colorHex: '#FF7B72',
    photoUrl: '/assets/aistudio/Ceylon_Tourmaline_23b94a4d.png',
  },
  {
    id: 'cabochons',
    number: '04',
    title: 'Cabochons',
    subtitle: "Star Sapphires, Cat's Eyes & Moonstones",
    description:
      'Symmetrical domed stones selected for sharp six-ray asterism, crisp chatoyant bands, or luminous blue adularescence.',
    cut: 'cabochon',
    colorHex: '#8CB8FF',
    photoUrl: '/assets/aistudio/Star_Sapphire_64800eb8.png',
  },
  {
    id: 'rough-specimens',
    number: '05',
    title: 'Rough & Collector Specimens',
    subtitle: 'Natural Crystal Formations',
    description:
      'Display mineral crystals and study specimens showcasing natural hexagonal habit. Note: Sri Lankan NGJA export rules apply to rough stones.',
    cut: 'rough',
    colorHex: '#0E4B5A',
    photoUrl: '/assets/aistudio/Serendibite_5a52e44c.png',
  },
  {
    id: 'rare-collector',
    number: '06',
    title: 'Rare & Collector Gems',
    subtitle: 'Padparadscha, Alexandrite, Serendibite & Cobalt Spinel',
    description:
      'Scarce geological rarities sought by private collectors, museums, and connoisseurs of phenomenon stones.',
    cut: 'oval',
    colorHex: '#158467',
    photoUrl: '/assets/aistudio/Ceylon_Alexandrite_ebedf34a.png',
  },
  {
    id: 'fine-jewellery',
    number: '07',
    title: 'Fine Jewellery',
    subtitle: 'Sapphire-Led Silhouettes',
    description:
      'Bespoke rings, pendants, and earrings crafted around centre Ceylon stones in platinum or white gold.',
    cut: 'emerald',
    colorHex: '#C9D1DC',
    photoUrl: '/assets/aistudio/Padparadscha_Sapphire_556bee04.png',
  },
  {
    id: 'custom-cutting',
    number: '08',
    title: 'Custom Cutting, Re-Cutting & Design',
    subtitle: 'Sri Lankan Master Lapidary',
    description:
      'Proportional re-cutting to eliminate windows, custom fantasy faceting, and CAD-to-wax high jewellery design.',
    cut: 'marquise',
    colorHex: '#3D7BFF',
    photoUrl: '/assets/aistudio/Amethyst___Citrine_5464b270.png',
  },
  {
    id: 'certification-assistance',
    number: '09',
    title: 'Gem Certification Assistance',
    subtitle: 'Recognised Laboratory Reporting',
    description:
      'Coordinated submission and verification through established international and Sri Lankan gemmological laboratories.',
    cut: 'brilliant',
    colorHex: '#E6EAF0',
    photoUrl: '/assets/aistudio/Ceylon_White___Imperial-Tone_Topaz_06d5bfc3.png',
    matteTolerance: 18,
  },
];

/**
 * SAMPLE DATA — Replace with live Serendib Reserve inventory when ready.
 */
export const SAMPLE_CATALOGUE: SampleStone[] = [
  {
    id: 'SR-SAMPLE-01',
    isSampleData: true,
    name: 'Royal Ceylon Blue Sapphire',
    species: 'Natural Corundum',
    category: 'Certified Loose Gemstones',
    cut: 'cushion',
    colorHex: '#1B3FD9',
    photoUrl: '/assets/aistudio/Royal_Blue_Sapphire_from_Sri_Lanka__Ceylon__1d3f139f.png',
    caratRange: '3.42 ct (Sample)',
    colourGrade: 'Vivid Royal Blue',
    clarity: 'Eye-Clean',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'No indication of heating',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-02',
    isSampleData: true,
    name: 'Lotus Padparadscha Sapphire',
    species: 'Natural Corundum',
    category: 'Rare & Collector Gems',
    cut: 'oval',
    colorHex: '#FF7B72',
    photoUrl: '/assets/aistudio/Padparadscha_Sapphire_556bee04.png',
    caratRange: '2.18 ct (Sample)',
    colourGrade: 'Pinkish-Orange Lotus',
    clarity: 'Eye-Clean',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'No indication of heating',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-03',
    isSampleData: true,
    name: 'Cornflower Star Sapphire',
    species: 'Natural Star Corundum',
    category: 'Cabochons',
    cut: 'cabochon',
    colorHex: '#2045C8',
    photoUrl: '/assets/aistudio/Star_Sapphire_64800eb8.png',
    caratRange: '6.85 ct (Sample)',
    colourGrade: 'Cornflower Blue · Sharp 6-Ray Star',
    clarity: 'Translucent Silk',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'No indication of heating',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-04',
    isSampleData: true,
    name: 'Ceylon Colour-Change Alexandrite',
    species: 'Natural Chrysoberyl',
    category: 'Rare & Collector Gems',
    cut: 'cushion',
    colorHex: '#158467',
    photoUrl: '/assets/aistudio/Ceylon_Alexandrite_ebedf34a.png',
    caratRange: '1.64 ct (Sample)',
    colourGrade: 'Green to Plum-Red Shift',
    clarity: 'Eye-Clean',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'Untreated',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-05',
    isSampleData: true,
    name: "Honey Cat's Eye Chrysoberyl",
    species: 'Natural Chrysoberyl',
    category: 'Cabochons',
    cut: 'cabochon',
    colorHex: '#D99B26',
    photoUrl: '/assets/aistudio/Cat_s_Eye_Chrysoberyl_e0d77568.png',
    caratRange: '4.12 ct (Sample)',
    colourGrade: 'Milk & Honey Gold',
    clarity: 'Translucent Chatoyant',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'Untreated',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-06',
    isSampleData: true,
    name: 'Ceylon Crimson Ruby',
    species: 'Natural Corundum',
    category: 'Certified Loose Gemstones',
    cut: 'oval',
    colorHex: '#C2102E',
    photoUrl: '/assets/aistudio/Ceylon_Ruby_3abdaceb.png',
    caratRange: '1.95 ct (Sample)',
    colourGrade: 'Vivid Red',
    clarity: 'Slightly Included',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'Heated (Disclosed)',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-07',
    isSampleData: true,
    name: 'Elahera Rose & Cobalt Spinel',
    species: 'Natural Spinel',
    category: 'Rare & Collector Gems',
    cut: 'brilliant',
    colorHex: '#C95276',
    photoUrl: '/assets/aistudio/Ceylon_Spinel_a5fd65e6.png',
    caratRange: '1.48 ct (Sample)',
    colourGrade: 'Imperial Rose & Cobalt Hue',
    clarity: 'Eye-Clean',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'Untreated',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-08',
    isSampleData: true,
    name: 'Blue Sheen Ceylon Moonstone',
    species: 'Natural Orthoclase Feldspar',
    category: 'Cabochons',
    cut: 'cabochon',
    colorHex: '#8CB8FF',
    photoUrl: '/assets/aistudio/Ceylon_Blue_Moonstone_27dccc4d.png',
    matteTolerance: 22,
    caratRange: '5.30 ct (Sample)',
    colourGrade: 'Electric Blue Adularescence',
    clarity: 'Transparent',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'Untreated',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-09',
    isSampleData: true,
    name: 'Matched Rose Tourmaline',
    species: 'Natural Tourmaline',
    category: 'Matched Pairs & Suites',
    cut: 'oval',
    colorHex: '#E04D7A',
    photoUrl: '/assets/aistudio/Ceylon_Tourmaline_23b94a4d.png',
    caratRange: '2.90 ct (Sample)',
    colourGrade: 'Rubellite Pink-Rose',
    clarity: 'Eye-Clean',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'Untreated',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-10',
    isSampleData: true,
    name: 'Colour-Change & Imperial Sapphire',
    species: 'Natural Corundum',
    category: 'Certified Loose Gemstones',
    cut: 'oval',
    colorHex: '#E5A128',
    photoUrl: '/assets/aistudio/Yellow__Pink__White___Colour-Change_Sapphire_432bce40.png',
    matteTolerance: 36,
    caratRange: '4.05 ct (Sample)',
    colourGrade: 'Golden-Blue Pleochroic',
    clarity: 'Loupe-Clean',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'No indication of heating',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-11',
    isSampleData: true,
    name: 'Calibrated Aquamarine Emerald-Cut',
    species: 'Natural Beryl',
    category: 'Calibrated Gemstones',
    cut: 'emerald',
    colorHex: '#48A9D6',
    photoUrl: '/assets/aistudio/Aquamarine___Fine_Beryl_257c3df3.png',
    matteTolerance: 14,
    caratRange: '3.20 ct · Matched Suite (Sample)',
    colourGrade: 'Glacial Sky Blue',
    clarity: 'Eye-Clean',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'Untreated',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
  {
    id: 'SR-SAMPLE-12',
    isSampleData: true,
    name: 'Serendibite Collector Specimen',
    species: 'Natural Serendibite',
    category: 'Rare & Collector Gems',
    cut: 'rough',
    colorHex: '#0E4B5A',
    photoUrl: '/assets/aistudio/Serendibite_5a52e44c.png',
    caratRange: '0.78 ct (Sample)',
    colourGrade: 'Deep Blue-Green / Obsidian Teal',
    clarity: 'Translucent-Transparent',
    origin: 'Sri Lanka (Ceylon)',
    treatmentStatus: 'Untreated',
    lab: '[CERTIFICATION PARTNER]',
    priceLabel: 'Price on Request',
  },
];

export const CHOOSE_STONE_STEPS = [
  {
    step: '01',
    title: 'Define the Purpose & Light',
    detail:
      'Daily-wear rings favour Mohs 8.5–9 stones (sapphire, ruby, chrysoberyl), while earrings and pendants welcome zircon, moonstone, and tourmaline.',
  },
  {
    step: '02',
    title: 'Prioritise Natural Hue Over Weight Alone',
    detail:
      'A richly saturated, well-proportioned 2-carat stone radiates stronger visual presence than an over-deep or windowed 3-carat cut.',
  },
  {
    step: '03',
    title: 'Review Origin & Treatment Disclosure',
    detail:
      'Request an independent laboratory dossier confirming natural origin and whether the stone is unheated or thermally enhanced.',
  },
];

export const CARE_CLEANING_GUIDE = [
  {
    title: 'Warm Mild Soap & Soft Brush',
    detail: 'Most corundum, spinel, and beryl pieces clean safely in lukewarm water with gentle dish soap and a soft sable brush.',
  },
  {
    title: 'Avoid Ultrasonic for Phenomenon & Soft Stones',
    detail: 'Keep moonstone, emerald, zircon, apatite, and fracture-filled stones away from ultrasonic cleaners and steam jets.',
  },
  {
    title: 'Separate Pouch Storage',
    detail: 'Store each gemstone individually in soft acid-free paper or velvet slots so harder Mohs 9 sapphires never abrade softer gems.',
  },
];
