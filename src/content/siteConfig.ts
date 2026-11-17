export interface NavItem {
  label: string;
  path: string;
}

/**
 * Editable company-specific placeholders.
 * Replace each bracketed placeholder value with verified Serendib Reserve details.
 */
export const PLACEHOLDERS = {
  yearFounded: '[YEAR FOUNDED]',
  stonesCertified: '[NUMBER OF STONES CERTIFIED]',
  certificationPartner: '[CERTIFICATION PARTNER]',
  certificationPartnerLogos: '[CERTIFICATION PARTNER LOGOS]',
  yearsOfExpertise: '[YEARS]',
  countriesServed: '[COUNTRIES]',
  email: 'info@serendibreserve.com',
  businessHours: '[MON–FRI 9:00–17:30 SLST]',
  formEndpoint: '[FORMSPREE_OR_EMAILJS_ENDPOINT_URL]',
  eventsWeAttend: '[EVENTS WE ATTEND]',
  founderMessage:
    '[FOUNDER MESSAGE PLACEHOLDER — Replace with a personal note from the founder of Serendib Reserve on stewardship, Ceylon heritage, and craftsmanship.]',
  paymentTerms:
    '[PAYMENT TERMS PLACEHOLDER — e.g., International wire transfer (TT) or verified escrow arrangement]',
  returnPolicy:
    '[RETURN POLICY PLACEHOLDER — e.g., Inspection window and return conditions agreed per invoice]',
  socialLinks: {
    instagram: '[INSTAGRAM_URL]',
    linkedin: '[LINKEDIN_URL]',
    facebook: '[FACEBOOK_URL]',
    youtube: '[YOUTUBE_URL]',
  },
} as const;

export const SITE_CONFIG = {
  companyName: 'Serendib Reserve (Pvt) Ltd',
  shortName: 'SERENDIB RESERVE',
  domain: 'serendibreserve.com',
  positioning: 'Most Quality Gems of Sri Lanka',
  taglineHero: 'Born in Ceylon. Cut for Eternity.',
  taglineSecondary: 'The Reserve of Rare Light.',
  taglineTertiary: "Where Every Facet Tells an Island's Story.",
  headquarters: {
    street: '121 Hunupitiya Lake Rd',
    city: 'Colombo 00200',
    country: 'Sri Lanka',
    fullAddress: '121 Hunupitiya Lake Rd, Colombo 00200, Sri Lanka',
    mapsQuery: 'https://www.google.com/maps?q=121+Hunupitiya+Lake+Rd,+Colombo+00200&output=embed',
    directionsUrl: 'https://www.google.com/maps/search/?api=1&query=121+Hunupitiya+Lake+Rd,+Colombo+00200,+Sri+Lanka',
  },
  phone: '+94 71 14 54 935',
  phoneHref: 'tel:+94711454935',
  whatsappHref: 'https://wa.me/94711454935',
  email: PLACEHOLDERS.email,
  emailHref: `mailto:${PLACEHOLDERS.email}`,
  copyright: '© Serendib Reserve (Pvt) Ltd. All rights reserved.',
  legalNote:
    'All natural gemstones are accompanied by transparent treatment disclosure and independent gemmological documentation upon request.',
  nameStory: {
    serendib:
      '"Serendib" is the ancient Arabic name for Sri Lanka — the island whose beauty gave the English language the word "serendipity".',
    reserve:
      '"Reserve" signals curated, held-back, finest-grade stones selected for colour saturation, brilliance, and provenance.',
    mineral:
      'Serendibite, an extraordinarily rare dark blue-green mineral first identified in Sri Lanka in 1902, also carries the island’s ancient name.',
  },
} as const;

export const MAIN_NAV_LINKS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Gem Types', path: '/gem-types' },
  { label: 'Gems of Sri Lanka', path: '/gems-of-sri-lanka' },
  { label: 'Gem Industry', path: '/gem-industry' },
  { label: 'Our Global Market', path: '/global-market' },
  { label: 'Our Products', path: '/products' },
  { label: 'Join Our Team', path: '/careers' },
  { label: 'Inquiries', path: '/inquiries' },
  { label: 'Contact', path: '/contact' },
];

export const FOOTER_NAV_LINKS: NavItem[] = [
  ...MAIN_NAV_LINKS,
  { label: 'Our Story', path: '/about' },
];

export const LIVE_STATS = [
  {
    id: 'varieties',
    numericTarget: 75,
    suffix: '+',
    displayOverride: null,
    label: 'Varieties of Gemstones in Sri Lanka',
    note: 'Across ten principal mineral species',
  },
  {
    id: 'regions',
    numericTarget: 5,
    suffix: '',
    displayOverride: null,
    label: 'Major Gem-Producing Areas',
    note: 'Ratnapura, Elahera, Okkampitiya, Matale/Balangoda, Coastal Belt',
  },
  {
    id: 'expertise',
    numericTarget: null,
    suffix: '',
    displayOverride: PLACEHOLDERS.yearsOfExpertise,
    label: 'Years of Expertise',
    note: 'Replace [YEARS] in siteConfig.ts',
  },
  {
    id: 'countries',
    numericTarget: null,
    suffix: '',
    displayOverride: PLACEHOLDERS.countriesServed,
    label: 'Countries Served',
    note: 'Replace [COUNTRIES] in siteConfig.ts',
  },
] as const;

export const TRUST_PILLARS = [
  {
    id: 'untreated',
    title: 'Natural & Untreated Options',
    caption: 'Unheated Ceylon stones alongside full disclosure.',
  },
  {
    id: 'ethical',
    title: 'Ethical Sourcing',
    caption: 'Licensed family pits and traceable provenance.',
  },
  {
    id: 'certified',
    title: 'Lab-Certified',
    caption: 'Independent gemmological reports on request.',
  },
  {
    id: 'shipping',
    title: 'Secure Worldwide Shipping',
    caption: 'Insured door-to-door logistics from Colombo.',
  },
  {
    id: 'lapidary',
    title: 'Expert Lapidary',
    caption: 'Precision proportioning for maximum return of light.',
  },
] as const;
