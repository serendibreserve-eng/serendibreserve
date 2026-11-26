import type {
  Auction,
  AuctionResultStatus,
  AuctionStatus,
  BidRecord,
  BidStatus,
  SupportedCurrency,
} from '../types/auction';

export const DEMO_SIMULATED_BIDDER_ID = 'demo_system_simulator';

export const DEMO_ILLUSTRATIVE_DISCLAIMER =
  'DEMONSTRATION LOT — Showcase & platform verification record only. Attributes, indicative pricing, and simulated bid figures are illustrative examples rather than independent gemological certification or historical transaction records.';

export interface DemoLotBlueprint {
  id: string;
  lotCode: string;
  title: string;
  gemstoneType: string;
  origin: string;
  caratWeight: number;
  cutShape: string;
  colorGrade: string;
  clarity: string;
  treatment: string;
  certification: string;
  certificateNumber: string;
  dimensions: string;
  description: string;
  currency: SupportedCurrency;
  startingBidMinor: number;
  minimumIncrementMinor: number;
  reservePriceMinor: number;
  showReservePrice: boolean;
  reserveMet: boolean;
  currentHighestBidMinor: number;
  highestBidderId: string;
  highestBidderAlias: string;
  bidCount: number;
  uniqueBiddersCount: number;
  status: AuctionStatus;
  resultStatus: AuctionResultStatus;
  startOffsetMs: number;
  endOffsetMs: number;
  featured: boolean;
  liveStreamUrl: string;
  auctionRules: string;
  images: string[];
  isDemo: true;
  demoBiddingActive: false;
}

export interface DemoBidBlueprint {
  id: string;
  auctionId: string;
  bidSequence: number;
  bidderId: string;
  bidderAlias: string;
  amountMinor: number;
  currency: SupportedCurrency;
  status: BidStatus;
  flaggedReason: string;
  offsetFromNowMs: number;
  isDemo: true;
}

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const MIN_MS = 60_000;

export const DEMO_AUCTION_BLUEPRINTS: DemoLotBlueprint[] = [
  {
    id: 'demo_lot_01_royal_blue_sapphire',
    lotCode: 'SR-DEMO-001',
    title: 'Royal Blue Ceylon Sapphire – Exceptional Collection',
    gemstoneType: 'Blue Sapphire',
    origin: 'Sri Lanka',
    caratWeight: 8.24,
    cutShape: 'Oval',
    colorGrade: 'Royal Blue',
    clarity: 'Eye Clean / Illustrative Specimen',
    treatment: 'Unheated (Illustrative Demo Record)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-001',
    dimensions: '13.4 x 10.6 x 7.1 mm',
    description:
      'Flagship demonstration lot showcasing a deep electric royal-blue oval Ceylon sapphire with crisp crown-pavilion brilliance. Listed solely for platform demonstration and bidding interface verification; binding collector bids remain locked until an administrator explicitly activates live participation.',
    currency: 'USD',
    startingBidMinor: 1_850_000, // $18,500
    minimumIncrementMinor: 10_000, // $100
    reservePriceMinor: 2_500_000, // $25,000
    showReservePrice: true,
    reserveMet: false,
    currentHighestBidMinor: 2_485_000, // $24,850
    highestBidderId: DEMO_SIMULATED_BIDDER_ID,
    highestBidderAlias: 'DEMO / SIMULATED Collector #4',
    bidCount: 7,
    uniqueBiddersCount: 4,
    status: 'live',
    resultStatus: 'pending',
    startOffsetMs: -30 * MIN_MS,
    endOffsetMs: 48 * HOUR_MS,
    featured: true,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION LOT GOVERNANCE: Pre-seeded bid steps ($19,000 to $24,850) represent simulated walkthrough activity. Real collector bids are blocked until explicit administrative activation.',
    images: [
      '/uploads/auctions/demo-royal-blue-sapphire-front.webp',
      '/uploads/auctions/demo-royal-blue-sapphire-side.webp',
      '/uploads/auctions/demo-royal-blue-sapphire-macro.webp',
    ],
    isDemo: true,
    demoBiddingActive: false,
  },
  {
    id: 'demo_lot_02_padparadscha_sapphire',
    lotCode: 'SR-DEMO-002',
    title: 'Rare Ceylon Padparadscha Sapphire',
    gemstoneType: 'Padparadscha Sapphire',
    origin: 'Sri Lanka',
    caratWeight: 3.12,
    cutShape: 'Oval',
    colorGrade: 'Delicate Sunset Pink-Orange',
    clarity: 'VS / Eye Clean (Illustrative)',
    treatment: 'Unheated (Illustrative Demo Record)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-002',
    dimensions: '9.4 x 7.5 x 4.8 mm',
    description:
      'Rare pink-orange oval Padparadscha sapphire demonstration lot displaying delicate peach and lotus sunset saturation. Presented with studio front and macro pavilion views for preview and reminder testing.',
    currency: 'USD',
    startingBidMinor: 750_000, // $7,500
    minimumIncrementMinor: 25_000, // $250
    reservePriceMinor: 900_000,
    showReservePrice: false,
    reserveMet: false,
    currentHighestBidMinor: 0,
    highestBidderId: '',
    highestBidderAlias: '',
    bidCount: 0,
    uniqueBiddersCount: 0,
    status: 'upcoming',
    resultStatus: 'pending',
    startOffsetMs: 1 * DAY_MS,
    endOffsetMs: 4 * DAY_MS,
    featured: false,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION LOT: Scheduled upcoming preview lot. Reminders can be configured prior to demo schedule.',
    images: [
      '/uploads/auctions/demo-padparadscha-sapphire-front.webp',
      '/uploads/auctions/demo-padparadscha-sapphire-macro.webp',
    ],
    isDemo: true,
    demoBiddingActive: false,
  },
  {
    id: 'demo_lot_03_pigeon_blood_ruby',
    lotCode: 'SR-DEMO-003',
    title: 'Exceptional Natural Pigeon Blood Ruby',
    gemstoneType: 'Ruby',
    origin: 'Myanmar',
    caratWeight: 2.45,
    cutShape: 'Cushion',
    colorGrade: 'Vivid Pigeon Blood Red',
    clarity: 'VS1 (Illustrative)',
    treatment: 'Unheated (Illustrative Demo Record)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-003',
    dimensions: '8.3 x 7.1 x 4.4 mm',
    description:
      'Rich vivid-red cushion-cut ruby demonstration lot exhibiting strong crimson internal reflections across balanced cushion facets.',
    currency: 'USD',
    startingBidMinor: 680_000, // $6,800
    minimumIncrementMinor: 20_000, // $200
    reservePriceMinor: 820_000,
    showReservePrice: false,
    reserveMet: false,
    currentHighestBidMinor: 0,
    highestBidderId: '',
    highestBidderAlias: '',
    bidCount: 0,
    uniqueBiddersCount: 0,
    status: 'upcoming',
    resultStatus: 'pending',
    startOffsetMs: 3 * DAY_MS,
    endOffsetMs: 6 * DAY_MS,
    featured: false,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION LOT: Scheduled upcoming preview lot. Real bidding requires admin activation.',
    images: ['/uploads/auctions/demo-pigeon-blood-ruby-front.webp'],
    isDemo: true,
    demoBiddingActive: false,
  },
  {
    id: 'demo_lot_04_colombian_emerald',
    lotCode: 'SR-DEMO-004',
    title: 'Premium Natural Colombian Emerald',
    gemstoneType: 'Emerald',
    origin: 'Colombia',
    caratWeight: 5.68,
    cutShape: 'Emerald Cut',
    colorGrade: 'Vivid Green',
    clarity: 'Natural Jardin Inclusions (Illustrative)',
    treatment: 'Minor Oil Disclosure (Illustrative Demo)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-004',
    dimensions: '11.8 x 9.6 x 6.4 mm',
    description:
      'Deep green octagonal step-cut Colombian emerald demonstration specimen showcasing classic natural crystal jardin texture and crisp step reflections.',
    currency: 'USD',
    startingBidMinor: 420_000, // $4,200
    minimumIncrementMinor: 15_000, // $150
    reservePriceMinor: 520_000,
    showReservePrice: false,
    reserveMet: false,
    currentHighestBidMinor: 0,
    highestBidderId: '',
    highestBidderAlias: '',
    bidCount: 0,
    uniqueBiddersCount: 0,
    status: 'upcoming',
    resultStatus: 'pending',
    startOffsetMs: 5 * DAY_MS,
    endOffsetMs: 8 * DAY_MS,
    featured: false,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION LOT: Scheduled upcoming preview lot for UI & filtering demonstration.',
    images: ['/uploads/auctions/demo-colombian-emerald-front.webp'],
    isDemo: true,
    demoBiddingActive: false,
  },
  {
    id: 'demo_lot_05_yellow_sapphire',
    lotCode: 'SR-DEMO-005',
    title: 'Golden Yellow Ceylon Sapphire',
    gemstoneType: 'Yellow Sapphire',
    origin: 'Sri Lanka',
    caratWeight: 6.45,
    cutShape: 'Cushion',
    colorGrade: 'Vivid Golden Canary',
    clarity: 'Loupe Clean (Illustrative)',
    treatment: 'Natural (Illustrative Demo Record)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-005',
    dimensions: '11.2 x 9.8 x 6.7 mm',
    description:
      'Brilliant golden-yellow cushion-cut Ceylon sapphire demonstration lot featuring warm amber-gold dispersion and precision symmetry.',
    currency: 'USD',
    startingBidMinor: 325_000, // $3,250
    minimumIncrementMinor: 10_000, // $100
    reservePriceMinor: 400_000,
    showReservePrice: false,
    reserveMet: false,
    currentHighestBidMinor: 0,
    highestBidderId: '',
    highestBidderAlias: '',
    bidCount: 0,
    uniqueBiddersCount: 0,
    status: 'upcoming',
    resultStatus: 'pending',
    startOffsetMs: 7 * DAY_MS,
    endOffsetMs: 10 * DAY_MS,
    featured: false,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION LOT: Scheduled upcoming preview lot for UI & countdown demonstration.',
    images: ['/uploads/auctions/demo-yellow-ceylon-sapphire-front.webp'],
    isDemo: true,
    demoBiddingActive: false,
  },
  {
    id: 'demo_lot_06_natural_amethyst',
    lotCode: 'SR-DEMO-006',
    title: 'Royal Purple Natural Amethyst',
    gemstoneType: 'Amethyst',
    origin: 'Brazil',
    caratWeight: 12.2,
    cutShape: 'Oval',
    colorGrade: 'Deep Royal Violet-Purple',
    clarity: 'Eye Clean (Illustrative)',
    treatment: 'Unheated (Illustrative Demo Record)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-006',
    dimensions: '16.8 x 12.9 x 8.4 mm',
    description:
      'Substantial 12.20-carat violet-purple oval amethyst demonstration specimen with fine crimson-violet flashes across precision checkerboard-inspired oval facets.',
    currency: 'USD',
    startingBidMinor: 85_000, // $850
    minimumIncrementMinor: 5_000, // $50
    reservePriceMinor: 0,
    showReservePrice: false,
    reserveMet: true,
    currentHighestBidMinor: 0,
    highestBidderId: '',
    highestBidderAlias: '',
    bidCount: 0,
    uniqueBiddersCount: 0,
    status: 'upcoming',
    resultStatus: 'pending',
    startOffsetMs: 10 * DAY_MS,
    endOffsetMs: 13 * DAY_MS,
    featured: false,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION LOT: No-reserve showcase example scheduled for upcoming demonstration.',
    images: ['/uploads/auctions/demo-natural-amethyst-front.webp'],
    isDemo: true,
    demoBiddingActive: false,
  },
  {
    id: 'demo_lot_07_cats_eye_chrysoberyl',
    lotCode: 'SR-DEMO-007',
    title: "Premium Golden Cat's Eye Chrysoberyl",
    gemstoneType: 'Chrysoberyl',
    origin: 'Sri Lanka',
    caratWeight: 4.8,
    cutShape: 'Oval Cabochon',
    colorGrade: 'Honey Olive-Gold',
    clarity: 'Sharp Milk-and-Honey Chatoyancy (Illustrative)',
    treatment: 'Unheated (Illustrative Demo Record)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-007',
    dimensions: '10.1 x 8.4 x 6.2 mm',
    description:
      "Golden-green Ceylon Cat's Eye chrysoberyl high-dome cabochon demonstration lot exhibiting a centered silver-white chatoyant light band.",
    currency: 'USD',
    startingBidMinor: 290_000, // $2,900
    minimumIncrementMinor: 10_000, // $100
    reservePriceMinor: 350_000,
    showReservePrice: false,
    reserveMet: false,
    currentHighestBidMinor: 0,
    highestBidderId: '',
    highestBidderAlias: '',
    bidCount: 0,
    uniqueBiddersCount: 0,
    status: 'upcoming',
    resultStatus: 'pending',
    startOffsetMs: 14 * DAY_MS,
    endOffsetMs: 17 * DAY_MS,
    featured: false,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION LOT: Scheduled upcoming specimen showcasing cabochon phenomenon photography.',
    images: ['/uploads/auctions/demo-cats-eye-chrysoberyl-front.webp'],
    isDemo: true,
    demoBiddingActive: false,
  },
  {
    id: 'demo_lot_08_completed_blue_sapphire',
    lotCode: 'SR-DEMO-008',
    title: 'Natural Ceylon Blue Sapphire',
    gemstoneType: 'Blue Sapphire',
    origin: 'Sri Lanka',
    caratWeight: 4.18,
    cutShape: 'Oval',
    colorGrade: 'Cornflower-Royal Blue',
    clarity: 'VVS / Illustrative Specimen',
    treatment: 'Unheated (Illustrative Demo Record)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-008',
    dimensions: '10.6 x 8.5 x 5.7 mm',
    description:
      'Completed demonstration archive lot illustrating how closed Ceylon Blue Sapphire auction outcomes appear in the public archive. Closing figure reflects an illustrative demo result, not a historical sale.',
    currency: 'USD',
    startingBidMinor: 950_000, // $9,500
    minimumIncrementMinor: 25_000, // $250
    reservePriceMinor: 1_100_000,
    showReservePrice: false,
    reserveMet: true,
    currentHighestBidMinor: 1_250_000, // $12,500
    highestBidderId: DEMO_SIMULATED_BIDDER_ID,
    highestBidderAlias: 'DEMO / SIMULATED Winning Result',
    bidCount: 5,
    uniqueBiddersCount: 3,
    status: 'completed',
    resultStatus: 'sold',
    startOffsetMs: -10 * DAY_MS,
    endOffsetMs: -7 * DAY_MS,
    featured: false,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION RESULT ARCHIVE: Closed showcase record demonstrating post-auction result presentation.',
    images: ['/uploads/auctions/demo-completed-blue-sapphire-front.webp'],
    isDemo: true,
    demoBiddingActive: false,
  },
  {
    id: 'demo_lot_09_completed_red_spinel',
    lotCode: 'SR-DEMO-009',
    title: 'Natural Red Spinel',
    gemstoneType: 'Red Spinel',
    origin: 'Sri Lanka',
    caratWeight: 3.05,
    cutShape: 'Cushion',
    colorGrade: 'Vivid Crimson-Red',
    clarity: 'Eye Clean (Illustrative)',
    treatment: 'Unheated (Illustrative Demo Record)',
    certification: 'DEMO DOSSIER',
    certificateNumber: 'DEMO-SR-009',
    dimensions: '9.1 x 7.9 x 5.2 mm',
    description:
      'Completed demonstration archive lot showcasing a Sri Lankan Natural Red Spinel outcome card and final illustrative demo hammer figure.',
    currency: 'USD',
    startingBidMinor: 350_000, // $3,500
    minimumIncrementMinor: 10_000, // $100
    reservePriceMinor: 400_000,
    showReservePrice: false,
    reserveMet: true,
    currentHighestBidMinor: 480_000, // $4,800
    highestBidderId: DEMO_SIMULATED_BIDDER_ID,
    highestBidderAlias: 'DEMO / SIMULATED Winning Result',
    bidCount: 4,
    uniqueBiddersCount: 3,
    status: 'completed',
    resultStatus: 'sold',
    startOffsetMs: -16 * DAY_MS,
    endOffsetMs: -13 * DAY_MS,
    featured: false,
    liveStreamUrl: '',
    auctionRules:
      'DEMONSTRATION RESULT ARCHIVE: Closed showcase record demonstrating completed auction layout.',
    images: ['/uploads/auctions/demo-completed-red-spinel-front.webp'],
    isDemo: true,
    demoBiddingActive: false,
  },
];

export const DEMO_LOT_01_BID_BLUEPRINTS: DemoBidBlueprint[] = [
  {
    id: 'demo_lot_01_royal_blue_sapphire_bid_1',
    auctionId: 'demo_lot_01_royal_blue_sapphire',
    bidSequence: 1,
    bidderId: DEMO_SIMULATED_BIDDER_ID,
    bidderAlias: 'DEMO / SIMULATED Collector #1',
    amountMinor: 1_900_000, // $19,000
    currency: 'USD',
    status: 'outbid',
    flaggedReason: '',
    offsetFromNowMs: -28 * MIN_MS,
    isDemo: true,
  },
  {
    id: 'demo_lot_01_royal_blue_sapphire_bid_2',
    auctionId: 'demo_lot_01_royal_blue_sapphire',
    bidSequence: 2,
    bidderId: DEMO_SIMULATED_BIDDER_ID,
    bidderAlias: 'DEMO / SIMULATED Collector #2',
    amountMinor: 2_000_000, // $20,000
    currency: 'USD',
    status: 'outbid',
    flaggedReason: '',
    offsetFromNowMs: -23 * MIN_MS,
    isDemo: true,
  },
  {
    id: 'demo_lot_01_royal_blue_sapphire_bid_3',
    auctionId: 'demo_lot_01_royal_blue_sapphire',
    bidSequence: 3,
    bidderId: DEMO_SIMULATED_BIDDER_ID,
    bidderAlias: 'DEMO / SIMULATED Collector #1',
    amountMinor: 2_150_000, // $21,500
    currency: 'USD',
    status: 'outbid',
    flaggedReason: '',
    offsetFromNowMs: -18 * MIN_MS,
    isDemo: true,
  },
  {
    id: 'demo_lot_01_royal_blue_sapphire_bid_4',
    auctionId: 'demo_lot_01_royal_blue_sapphire',
    bidSequence: 4,
    bidderId: DEMO_SIMULATED_BIDDER_ID,
    bidderAlias: 'DEMO / SIMULATED Collector #3',
    amountMinor: 2_200_000, // $22,000
    currency: 'USD',
    status: 'outbid',
    flaggedReason: '',
    offsetFromNowMs: -14 * MIN_MS,
    isDemo: true,
  },
  {
    id: 'demo_lot_01_royal_blue_sapphire_bid_5',
    auctionId: 'demo_lot_01_royal_blue_sapphire',
    bidSequence: 5,
    bidderId: DEMO_SIMULATED_BIDDER_ID,
    bidderAlias: 'DEMO / SIMULATED Collector #2',
    amountMinor: 2_350_000, // $23,500
    currency: 'USD',
    status: 'outbid',
    flaggedReason: '',
    offsetFromNowMs: -9 * MIN_MS,
    isDemo: true,
  },
  {
    id: 'demo_lot_01_royal_blue_sapphire_bid_6',
    auctionId: 'demo_lot_01_royal_blue_sapphire',
    bidSequence: 6,
    bidderId: DEMO_SIMULATED_BIDDER_ID,
    bidderAlias: 'DEMO / SIMULATED Collector #3',
    amountMinor: 2_400_000, // $24,000
    currency: 'USD',
    status: 'outbid',
    flaggedReason: '',
    offsetFromNowMs: -5 * MIN_MS,
    isDemo: true,
  },
  {
    id: 'demo_lot_01_royal_blue_sapphire_bid_7',
    auctionId: 'demo_lot_01_royal_blue_sapphire',
    bidSequence: 7,
    bidderId: DEMO_SIMULATED_BIDDER_ID,
    bidderAlias: 'DEMO / SIMULATED Collector #4',
    amountMinor: 2_485_000, // $24,850
    currency: 'USD',
    status: 'winning',
    flaggedReason: '',
    offsetFromNowMs: -2 * MIN_MS,
    isDemo: true,
  },
];

export const ALL_DEMO_IMAGE_PATHS: string[] = Array.from(
  new Set(DEMO_AUCTION_BLUEPRINTS.flatMap((lot) => lot.images))
);

export function buildDemoSeedDocuments(nowMs: number, adminUid: string): {
  auctions: Auction[];
  bids: BidRecord[];
} {
  const auctions: Auction[] = DEMO_AUCTION_BLUEPRINTS.map((bp) => ({
    id: bp.id,
    lotCode: bp.lotCode,
    title: bp.title,
    gemstoneType: bp.gemstoneType,
    origin: bp.origin,
    caratWeight: bp.caratWeight,
    cutShape: bp.cutShape,
    colorGrade: bp.colorGrade,
    clarity: bp.clarity,
    treatment: bp.treatment,
    certification: bp.certification,
    certificateNumber: bp.certificateNumber,
    dimensions: bp.dimensions,
    description: bp.description,
    currency: bp.currency,
    startingBidMinor: bp.startingBidMinor,
    minimumIncrementMinor: bp.minimumIncrementMinor,
    reservePriceMinor: bp.reservePriceMinor,
    showReservePrice: bp.showReservePrice,
    reserveMet: bp.reserveMet,
    currentHighestBidMinor: bp.currentHighestBidMinor,
    highestBidderId: bp.highestBidderId,
    highestBidderAlias: bp.highestBidderAlias,
    bidCount: bp.bidCount,
    uniqueBiddersCount: bp.uniqueBiddersCount,
    status: bp.status,
    resultStatus: bp.resultStatus,
    startTimeMs: nowMs + bp.startOffsetMs,
    endTimeMs: nowMs + bp.endOffsetMs,
    featured: bp.featured,
    liveStreamUrl: bp.liveStreamUrl,
    auctionRules: bp.auctionRules,
    images: [...bp.images],
    isDemo: true,
    demoBiddingActive: false,
    createdBy: adminUid,
    createdAtMs: nowMs,
    updatedAtMs: nowMs,
  }));

  const bids: BidRecord[] = DEMO_LOT_01_BID_BLUEPRINTS.map((bp) => ({
    id: bp.id,
    auctionId: bp.auctionId,
    bidSequence: bp.bidSequence,
    bidderId: bp.bidderId,
    bidderAlias: bp.bidderAlias,
    amountMinor: bp.amountMinor,
    currency: bp.currency,
    status: bp.status,
    flaggedReason: bp.flaggedReason,
    isDemo: true,
    createdAtMs: nowMs + bp.offsetFromNowMs,
  }));

  return { auctions, bids };
}

export function getDemoPreviewLotAndBids(
  auctionId: string,
  anchorMs: number
): { auction: Auction; bids: BidRecord[] } | null {
  const { auctions, bids } = buildDemoSeedDocuments(anchorMs, 'demo_catalog_preview');
  const auction = auctions.find((a) => a.id === auctionId);
  if (!auction) return null;
  const lotBids = bids
    .filter((b) => b.auctionId === auctionId)
    .sort((a, b) => b.bidSequence - a.bidSequence);
  return { auction, bids: lotBids };
}
