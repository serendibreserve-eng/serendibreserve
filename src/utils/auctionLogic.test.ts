import assert from 'node:assert/strict';
import test from 'node:test';
import type { Auction, UserProfile } from '../types/auction';
import {
  buildSubscriptionsCsv,
  computeMinimumNextBidMinor,
  formatCountdown,
  formatCurrencyMinor,
  formatFirebaseAuthError,
  getEffectiveAuctionStatus,
  makeBidderAlias,
  normalizeSubscriptionId,
  parseStreamEmbed,
  toMinorUnits,
  validateBidCandidate,
} from './auctionLogic';
import {
  ALL_DEMO_IMAGE_PATHS,
  buildDemoSeedDocuments,
  getDemoPreviewLotAndBids,
} from '../content/demoSeedAuctions';

const baseAuction: Auction = {
  id: 'lot-ceylon-01',
  lotCode: 'SR-2026-001',
  title: 'Unheated Royal Blue Ceylon Sapphire',
  gemstoneType: 'Blue Sapphire',
  origin: 'Ratnapura, Sri Lanka',
  caratWeight: 4.82,
  cutShape: 'Cushion',
  colorGrade: 'Royal Blue',
  clarity: 'VVS1',
  treatment: 'Unheated (No Heat)',
  certification: 'GIA',
  certificateNumber: 'GIA-123456',
  dimensions: '10.4 x 8.8 x 6.1 mm',
  description: 'Museum-grade unheated Ceylon royal blue sapphire.',
  currency: 'USD',
  startingBidMinor: 1_500_000, // $15,000
  minimumIncrementMinor: 50_000, // $500
  reservePriceMinor: 2_500_000, // $25,000
  showReservePrice: true,
  reserveMet: false,
  currentHighestBidMinor: 0,
  highestBidderId: '',
  highestBidderAlias: '',
  bidCount: 0,
  uniqueBiddersCount: 0,
  status: 'live',
  resultStatus: 'pending',
  startTimeMs: 1_000_000,
  endTimeMs: 2_000_000,
  featured: true,
  liveStreamUrl: '',
  auctionRules: 'Standard international wire terms.',
  images: ['/assets/aistudio/Royal_Blue_Sapphire_from_Sri_Lanka__Ceylon__1d3f139f.png'],
  isDemo: false,
  demoBiddingActive: false,
  createdBy: 'admin-1',
  createdAtMs: 900_000,
  updatedAtMs: 900_000,
};

const activeUser: UserProfile = {
  uid: 'user-abc1234',
  fullName: 'Kasun Perera',
  email: 'kasun@example.com',
  contactNumber: '+94711112222',
  nationality: 'Sri Lanka',
  companyName: '',
  photoURL: '',
  authProvider: 'google',
  role: 'user',
  accountStatus: 'active',
  emailVerified: true,
  profileCompleted: true,
  watchlistAuctionIds: [],
  notificationPreferences: {
    emailReminders: true,
    outbidAlerts: true,
    newAuctionAlerts: true,
    liveStartAlerts: true,
  },
  createdAtMs: 800_000,
  updatedAtMs: 800_000,
};

test('currency conversion & formatting works cleanly across all supported currencies', () => {
  assert.equal(toMinorUnits('15000.50', 'USD'), 1_500_050);
  assert.equal(formatCurrencyMinor(1_500_000, 'USD'), '$15,000');
  assert.equal(formatCurrencyMinor(45_000_000, 'LKR'), 'LKR 450,000');
  assert.equal(formatCurrencyMinor(250_050, 'EUR'), '€2,500.50');
  assert.equal(formatCurrencyMinor(100_000, 'GBP'), '£1,000');
  assert.equal(formatCurrencyMinor(367_500, 'AED'), 'AED 3,675');
  assert.equal(formatCurrencyMinor(500_000, 'SGD'), 'S$5,000');
  assert.equal(formatCurrencyMinor(800_000, 'CNY'), '¥8,000');
});

test('minimum next bid equals starting bid when bidCount is 0, else highest + increment', () => {
  assert.equal(computeMinimumNextBidMinor(baseAuction), 1_500_000);
  assert.equal(
    computeMinimumNextBidMinor({
      ...baseAuction,
      bidCount: 2,
      currentHighestBidMinor: 1_800_000,
    }),
    1_850_000
  );
});

test('validateBidCandidate blocks unauthenticated, unverified, incomplete, suspended, closed, and low bids', () => {
  assert.equal(
    validateBidCandidate({ auction: baseAuction, user: null, amountMinor: 1_500_000, nowMs: 1_500_000 }).code,
    'UNAUTHENTICATED'
  );
  assert.equal(
    validateBidCandidate({
      auction: baseAuction,
      user: { ...activeUser, emailVerified: false },
      amountMinor: 1_500_000,
      nowMs: 1_500_000,
    }).code,
    'EMAIL_UNVERIFIED'
  );
  assert.equal(
    validateBidCandidate({
      auction: baseAuction,
      user: { ...activeUser, profileCompleted: false },
      amountMinor: 1_500_000,
      nowMs: 1_500_000,
    }).code,
    'PROFILE_INCOMPLETE'
  );
  assert.equal(
    validateBidCandidate({
      auction: baseAuction,
      user: { ...activeUser, accountStatus: 'suspended' },
      amountMinor: 1_500_000,
      nowMs: 1_500_000,
    }).code,
    'ACCOUNT_SUSPENDED'
  );
  assert.equal(
    validateBidCandidate({
      auction: baseAuction,
      user: activeUser,
      amountMinor: 1_400_000,
      nowMs: 1_500_000,
    }).code,
    'BID_TOO_LOW'
  );
  assert.equal(
    validateBidCandidate({
      auction: baseAuction,
      user: activeUser,
      amountMinor: 1_500_000,
      nowMs: 2_500_000, // expired
    }).code,
    'AUCTION_NOT_LIVE'
  );
  assert.equal(
    validateBidCandidate({
      auction: baseAuction,
      user: activeUser,
      amountMinor: 1_500_000,
      nowMs: 1_500_000,
    }).allowed,
    true
  );
});

test('getEffectiveAuctionStatus and formatCountdown compute accurate server-relative windows', () => {
  assert.equal(getEffectiveAuctionStatus({ status: 'upcoming', startTimeMs: 1000, endTimeMs: 2000 }, 500), 'upcoming');
  assert.equal(getEffectiveAuctionStatus({ status: 'live', startTimeMs: 1000, endTimeMs: 2000 }, 1500), 'live');
  assert.equal(getEffectiveAuctionStatus({ status: 'live', startTimeMs: 1000, endTimeMs: 2000 }, 2000), 'ended');
  assert.equal(getEffectiveAuctionStatus({ status: 'paused', startTimeMs: 1000, endTimeMs: 2000 }, 1500), 'paused');

  const cd = formatCountdown(90_061_000, 0);
  assert.equal(cd.days, 1);
  assert.equal(cd.hours, 1);
  assert.equal(cd.minutes, 1);
  assert.equal(cd.seconds, 1);
  assert.equal(cd.expired, false);
});

test('stream embed parser, bidder alias masking, subscription hash, and CSV formula protection work safely', () => {
  const yt = parseStreamEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(yt.valid, true);
  assert.equal(yt.provider, 'youtube');
  assert.match(yt.embedUrl || '', /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);

  const bad = parseStreamEmbed('javascript:alert(1)');
  assert.equal(bad.valid, false);
  assert.equal(bad.embedUrl, null);

  const alias = makeBidderAlias('Kasun Perera', 'Sri Lanka', 'uid987654');
  assert.equal(alias.includes('Kasun'), false);
  assert.match(alias, /^K\. P\./);

  assert.equal(normalizeSubscriptionId('Test@Example.com'), normalizeSubscriptionId(' test@example.com '));

  const csv = buildSubscriptionsCsv([
    { email: '=CMD()@evil.com', status: 'active', source: 'homepage', createdAtMs: 1700000000000 },
  ]);
  assert.match(csv, /'=CMD\(\)@evil\.com/);
});

test('validateBidCandidate blocks unactivated demo lots and permits admin-activated demo lots', () => {
  const lockedDemoLot: Auction = {
    ...baseAuction,
    id: 'demo_lot_01_royal_blue_sapphire',
    isDemo: true,
    demoBiddingActive: false,
  };
  const blocked = validateBidCandidate({
    auction: lockedDemoLot,
    user: activeUser,
    amountMinor: 1_500_000,
    nowMs: 1_500_000,
  });
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.code, 'AUCTION_DEMO_LOCKED');

  const unlockedDemoLot: Auction = { ...lockedDemoLot, demoBiddingActive: true };
  const allowed = validateBidCandidate({
    auction: unlockedDemoLot,
    user: activeUser,
    amountMinor: 1_500_000,
    nowMs: 1_500_000,
  });
  assert.equal(allowed.allowed, true);
});

test('buildDemoSeedDocuments generates 9 deterministic lots, 7 Lot-01 bids, exact pricing, and 12 WebP assets', () => {
  const nowMs = 1_764_140_000_000;
  const { auctions, bids } = buildDemoSeedDocuments(nowMs, 'admin-uid-01');

  assert.equal(auctions.length, 9);
  assert.equal(bids.length, 7);
  assert.equal(ALL_DEMO_IMAGE_PATHS.length, 12);
  for (const img of ALL_DEMO_IMAGE_PATHS) {
    assert.match(img, /^\/uploads\/auctions\/demo-[a-z0-9-]+\.webp$/);
  }

  const lot1 = auctions[0];
  assert.equal(lot1.id, 'demo_lot_01_royal_blue_sapphire');
  assert.equal(lot1.title, 'Royal Blue Ceylon Sapphire – Exceptional Collection');
  assert.equal(lot1.caratWeight, 8.24);
  assert.equal(lot1.startingBidMinor, 1_850_000);
  assert.equal(lot1.currentHighestBidMinor, 2_485_000);
  assert.equal(lot1.reservePriceMinor, 2_500_000);
  assert.equal(lot1.minimumIncrementMinor, 10_000);
  assert.equal(lot1.bidCount, 7);
  assert.equal(lot1.status, 'live');
  assert.equal(lot1.isDemo, true);
  assert.equal(lot1.demoBiddingActive, false);
  assert.equal(lot1.images.length, 3);
  assert.equal(lot1.startTimeMs, nowMs - 30 * 60_000);
  assert.equal(lot1.endTimeMs, nowMs + 48 * 3_600_000);

  // Verify 7 sequential Lot 01 bid steps ending at $24,850
  assert.deepEqual(
    bids.map((b) => b.amountMinor),
    [1_900_000, 2_000_000, 2_150_000, 2_200_000, 2_350_000, 2_400_000, 2_485_000]
  );
  for (const b of bids) {
    assert.equal(b.isDemo, true);
    assert.ok(b.bidderAlias.startsWith('DEMO / '));
  }

  // Verify Lot 02-07 upcoming & Lot 08-09 completed
  const upcoming = auctions.filter((a) => a.status === 'upcoming');
  assert.equal(upcoming.length, 6);
  assert.equal(auctions[1].startingBidMinor, 750_000);
  assert.equal(auctions[1].images.length, 2);

  const completed = auctions.filter((a) => a.status === 'completed');
  assert.equal(completed.length, 2);
  assert.equal(completed[0].currentHighestBidMinor, 1_250_000);
  assert.equal(completed[1].currentHighestBidMinor, 480_000);

  // Verify every lot uses strictly unique images (zero cross-lot reuse)
  const seenImages = new Set<string>();
  for (const lot of auctions) {
    assert.ok(lot.images.length >= 1, `${lot.id} must have at least 1 image`);
    for (const img of lot.images) {
      assert.equal(seenImages.has(img), false, `Duplicate image across lots: ${img}`);
      seenImages.add(img);
    }
  }
  assert.equal(seenImages.size, 12);

  const preview01 = getDemoPreviewLotAndBids('demo_lot_01_royal_blue_sapphire', nowMs);
  assert.ok(preview01);
  assert.equal(preview01.auction.lotCode, 'SR-DEMO-001');
  assert.equal(preview01.bids.length, 7);
  assert.equal(preview01.bids[0].bidSequence, 7);
  assert.equal(preview01.bids[0].amountMinor, 2_485_000);
  assert.equal(getDemoPreviewLotAndBids('non_existent_lot', nowMs), null);
});

test('formatFirebaseAuthError maps auth/operation-not-allowed and common Firebase auth codes cleanly', () => {
  const opNotAllowedFromCode = formatFirebaseAuthError({
    code: 'auth/operation-not-allowed',
    message: 'Firebase: Error (auth/operation-not-allowed).',
  });
  assert.equal(opNotAllowedFromCode.code, 'auth/operation-not-allowed');
  assert.equal(opNotAllowedFromCode.isOperationNotAllowed, true);
  assert.match(opNotAllowedFromCode.message, /Google Sign-In/i);
  assert.match(opNotAllowedFromCode.message, /Sign-in method/i);

  const opNotAllowedFromMessage = formatFirebaseAuthError(
    new Error('Firebase: Error (auth/operation-not-allowed).')
  );
  assert.equal(opNotAllowedFromMessage.isOperationNotAllowed, true);
  assert.equal(opNotAllowedFromMessage.code, 'auth/operation-not-allowed');

  const alreadyInUse = formatFirebaseAuthError({ code: 'auth/email-already-in-use' });
  assert.equal(alreadyInUse.isOperationNotAllowed, false);
  assert.match(alreadyInUse.message, /already exists/i);

  const generic = formatFirebaseAuthError(new Error('Custom network failure'));
  assert.equal(generic.isOperationNotAllowed, false);
  assert.equal(generic.code, null);
  assert.equal(generic.message, 'Custom network failure');
});
