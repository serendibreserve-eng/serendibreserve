import { GemCut } from './gems';

export interface JobRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

export const CULTURE_PILLARS: Array<{
  title: string;
  caption: string;
  cut: GemCut;
  colorHex: string;
}> = [
  {
    title: 'Craftsmanship',
    caption: 'Respect for the crystal axis, precision angles, and unhurried lapidary finish.',
    cut: 'cushion',
    colorHex: '#1B3FD9',
  },
  {
    title: 'Integrity',
    caption: 'Uncompromising honesty in origin attribution, grading, and treatment disclosure.',
    cut: 'emerald',
    colorHex: '#C9D1DC',
  },
  {
    title: 'Curiosity',
    caption: 'Continuous study of mineral optics, inclusion science, and rare Sri Lankan finds.',
    cut: 'oval',
    colorHex: '#158467',
  },
  {
    title: 'Global Mindset',
    caption: 'Connecting traditional Ceylon heritage seamlessly with international jewellery ateliers.',
    cut: 'brilliant',
    colorHex: '#3D7BFF',
  },
];

/**
 * Editable role placeholders for Serendib Reserve careers.
 */
export const OPEN_ROLES: JobRole[] = [
  {
    id: 'gemmologist',
    title: 'Gemmologist (FGA / GIA Qualified)',
    department: 'Gemmology & Grading',
    location: 'Colombo, Sri Lanka',
    type: 'Full-Time [PLACEHOLDER]',
    summary: 'Lead stone identification, optical grading, parcel sorting, and laboratory dossier coordination.',
    responsibilities: [
      'Inspect incoming rough and faceted lots for species, colour grade, clarity, and treatment indicators.',
      'Coordinate third-party lab testing and verify certificate accuracy prior to export.',
      'Prepare detailed client inspection notes and macro documentation.',
    ],
    requirements: [
      'Recognised diploma (FGA, GIA GG, or equivalent gemmological credential).',
      'Practical fluency with refractometer, polariscope, dichroscope, and darkfield microscopy.',
    ],
  },
  {
    id: 'lapidary',
    title: 'Lapidary / Gem Cutter',
    department: 'Lapidary Studio',
    location: 'Colombo / Ratnapura [PLACEHOLDER]',
    type: 'Full-Time [PLACEHOLDER]',
    summary: 'Facet and polish fine Ceylon sapphires and collector stones to optimal light return and symmetry.',
    responsibilities: [
      'Orient rough crystals to maximise pleochroic hue and minimise inclusions.',
      'Execute precision faceting, re-cutting, and high-lustre polishing.',
    ],
    requirements: [
      'Demonstrated portfolio of precision-cut corundum and coloured stones.',
      'Deep understanding of critical angles and pavilion proportioning.',
    ],
  },
  {
    id: 'export-logistics',
    title: 'Export & Logistics Executive',
    department: 'Operations & Compliance',
    location: 'Colombo, Sri Lanka',
    type: 'Full-Time [PLACEHOLDER]',
    summary: 'Manage NGJA export clearances, insured international consignments, and customs documentation.',
    responsibilities: [
      'Coordinate NGJA valuation, sealing, and export permit filings.',
      'Liaise with insured specialist couriers for FOB, CIF, and DDP deliveries.',
    ],
    requirements: [
      'Experience in Sri Lankan customs/NGJA export procedures and international airfreight.',
      'Exceptional attention to documentation accuracy.',
    ],
  },
  {
    id: 'international-sales',
    title: 'International Sales Executive',
    department: 'Client Advisory',
    location: 'Colombo + International Travel',
    type: 'Full-Time [PLACEHOLDER]',
    summary: 'Build lasting relationships with fine jewellery houses, wholesalers, and private collectors worldwide.',
    responsibilities: [
      'Respond to bespoke stone inquiries with curated options and transparent specifications.',
      'Represent Serendib Reserve at international trade exhibitions.',
    ],
    requirements: [
      'Proven B2B luxury or gemstone trade experience with fluent English; additional languages valued.',
    ],
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing & Content Creator',
    department: 'Brand & Media',
    location: 'Colombo / Hybrid [PLACEHOLDER]',
    type: 'Full-Time [PLACEHOLDER]',
    summary: 'Produce macro gem photography, short-form motion, and refined editorial storytelling.',
    responsibilities: [
      'Capture true-to-life macro stone imagery and video across controlled lighting setups.',
      'Maintain brand voice across digital channels and trade lookbooks.',
    ],
    requirements: [
      'Strong portfolio in luxury product photography, lighting, or editorial content.',
    ],
  },
  {
    id: 'jewellery-designer',
    title: 'Jewellery Designer',
    department: 'Bespoke Design',
    location: 'Colombo, Sri Lanka',
    type: 'Full-Time [PLACEHOLDER]',
    summary: 'Translate loose Ceylon centre stones into timeless architectural ring, pendant, and earring designs.',
    responsibilities: [
      'Create hand-rendered sketches and precision 3D CAD models for master goldsmiths.',
      'Collaborate with clients on bespoke commissions.',
    ],
    requirements: [
      'Proficiency in jewellery sketching and CAD (RhinoGold / MatrixGold).',
    ],
  },
  {
    id: 'quality-control',
    title: 'Quality Control Officer',
    department: 'Assurance',
    location: 'Colombo, Sri Lanka',
    type: 'Full-Time [PLACEHOLDER]',
    summary: 'Verify calibrated parcel tolerances, polish quality, and parcel-to-invoice accuracy.',
    responsibilities: [
      'Audit calibrated dimensions, girdle symmetry, and finish quality before dispatch.',
      'Maintain secure vault inventory logs.',
    ],
    requirements: [
      'Meticulous visual inspection skills and experience in gemstone sorting.',
    ],
  },
  {
    id: 'accounts-executive',
    title: 'Accounts Executive',
    department: 'Finance',
    location: 'Colombo, Sri Lanka',
    type: 'Full-Time [PLACEHOLDER]',
    summary: 'Oversee multi-currency export invoicing, reconciliation, and statutory compliance.',
    responsibilities: [
      'Manage international bank remittances, export proceeds tracking, and financial reporting.',
    ],
    requirements: [
      'Accounting qualification (CIMA / ACCA / CA finalist or equivalent) and export accounting familiarity.',
    ],
  },
  {
    id: 'internship-gemmology',
    title: 'Internship — Gemmology',
    department: 'Academy & Lab',
    location: 'Colombo, Sri Lanka',
    type: 'Internship [PLACEHOLDER]',
    summary: 'Structured hands-on rotation supporting senior gemmologists in sorting, photography, and documentation.',
    responsibilities: [
      'Assist with stone measurements, refractive index logging, and catalogue archiving.',
    ],
    requirements: [
      'Current student or recent graduate in gemmology, geology, or Earth sciences.',
    ],
  },
];

export const CAREERS_BENEFITS = [
  { title: 'Structured Training', detail: 'Mentorship alongside experienced Sri Lankan gemmologists and lapidaries.' },
  { title: 'Gem Lab Exposure', detail: 'Daily hands-on study of rare Ceylon corundum, chrysoberyl, and collector species.' },
  { title: 'Career Growth', detail: 'Clear progression across technical grading, cutting craft, and international trade.' },
  { title: 'International Exposure', detail: 'Engage with global jewellery ateliers and major international exhibitions.' },
] as const;
