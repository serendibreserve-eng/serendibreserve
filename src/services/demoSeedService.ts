import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { DEFAULT_PLATFORM_SETTINGS, recordAuditLog } from './auctionService';
import { buildDemoSeedDocuments } from '../content/demoSeedAuctions';
import { getAuthoritativeNowMs } from '../hooks/useServerClock';
import type { UserProfile } from '../types/auction';

export interface SeedDemoResult {
  auctionsCreated: number;
  auctionsSkipped: number;
  bidsCreated: number;
  bidsSkipped: number;
  settingsInitialized: boolean;
  serverNowMs: number;
}

export interface DemoManifestDiagnostics {
  serverTimeMs: number;
  lotCount: number;
  liveCount: number;
  upcomingCount: number;
  completedCount: number;
  lot01DemoBidCount: number;
  imageCount: number;
  allAssetsReady: boolean;
  assets: Array<{
    filename: string;
    url: string;
    exists: boolean;
    sizeBytes: number;
  }>;
}

export async function fetchDemoSeedDiagnostics(): Promise<DemoManifestDiagnostics | null> {
  try {
    const resp = await fetch('/api/auctions/demo-manifest', { cache: 'no-store' });
    if (!resp.ok) return null;
    return (await resp.json()) as DemoManifestDiagnostics;
  } catch {
    return null;
  }
}

export async function seedDemoAuctionCatalogAdmin(
  adminUser: UserProfile
): Promise<SeedDemoResult> {
  let nowMs = getAuthoritativeNowMs();
  try {
    const timeResp = await fetch('/api/time', { cache: 'no-store' });
    if (timeResp.ok) {
      const timeData = (await timeResp.json()) as { serverTimeMs?: number };
      if (typeof timeData.serverTimeMs === 'number' && Number.isFinite(timeData.serverTimeMs)) {
        nowMs = timeData.serverTimeMs;
      }
    }
  } catch {
    // Fallback to synced authoritative clock helper
  }

  const { auctions, bids } = buildDemoSeedDocuments(nowMs, adminUser.uid);

  let auctionsCreated = 0;
  let auctionsSkipped = 0;
  let bidsCreated = 0;
  let bidsSkipped = 0;
  let settingsInitialized = false;

  // Idempotently initialize platform settings if not yet created
  const settingsRef = doc(db, 'settings', 'platform');
  let settingsSnap;
  try {
    settingsSnap = await getDoc(settingsRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/platform');
  }
  if (settingsSnap && !settingsSnap.exists()) {
    try {
      await setDoc(settingsRef, {
        defaultCurrency: DEFAULT_PLATFORM_SETTINGS.defaultCurrency,
        houseRules: DEFAULT_PLATFORM_SETTINGS.houseRules,
        antiSnipingNote: DEFAULT_PLATFORM_SETTINGS.antiSnipingNote,
        demoModeEnabled: true,
        updatedBy: adminUser.uid,
        updatedAt: serverTimestamp(),
      });
      settingsInitialized = true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'settings/platform');
    }
  }

  for (const lot of auctions) {
    const lotRef = doc(db, 'auctions', lot.id);
    let existing;
    try {
      existing = await getDoc(lotRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `auctions/${lot.id}`);
    }

    if (existing?.exists()) {
      auctionsSkipped += 1;
      continue;
    }

    try {
      await setDoc(lotRef, {
        lotCode: lot.lotCode,
        title: lot.title,
        gemstoneType: lot.gemstoneType,
        origin: lot.origin,
        caratWeight: lot.caratWeight,
        cutShape: lot.cutShape,
        colorGrade: lot.colorGrade,
        clarity: lot.clarity,
        treatment: lot.treatment,
        certification: lot.certification,
        certificateNumber: lot.certificateNumber,
        dimensions: lot.dimensions,
        description: lot.description,
        currency: lot.currency,
        startingBidMinor: lot.startingBidMinor,
        minimumIncrementMinor: lot.minimumIncrementMinor,
        reservePriceMinor: lot.reservePriceMinor,
        showReservePrice: lot.showReservePrice,
        reserveMet: lot.reserveMet,
        currentHighestBidMinor: lot.currentHighestBidMinor,
        highestBidderId: lot.highestBidderId,
        highestBidderAlias: lot.highestBidderAlias,
        bidCount: lot.bidCount,
        uniqueBiddersCount: lot.uniqueBiddersCount,
        status: lot.status,
        resultStatus: lot.resultStatus,
        startTime: Timestamp.fromMillis(lot.startTimeMs),
        endTime: Timestamp.fromMillis(lot.endTimeMs),
        featured: lot.featured,
        liveStreamUrl: lot.liveStreamUrl,
        auctionRules: lot.auctionRules,
        images: lot.images,
        isDemo: true,
        demoBiddingActive: false,
        createdBy: adminUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      auctionsCreated += 1;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `auctions/${lot.id}`);
    }
  }

  for (const bid of bids) {
    const bidRef = doc(db, 'bids', bid.id);
    let existing;
    try {
      existing = await getDoc(bidRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `bids/${bid.id}`);
    }

    if (existing?.exists()) {
      bidsSkipped += 1;
      continue;
    }

    try {
      await setDoc(bidRef, {
        auctionId: bid.auctionId,
        bidSequence: bid.bidSequence,
        bidderId: bid.bidderId,
        bidderAlias: bid.bidderAlias,
        amountMinor: bid.amountMinor,
        currency: bid.currency,
        status: bid.status,
        flaggedReason: bid.flaggedReason,
        isDemo: true,
        createdAt: Timestamp.fromMillis(bid.createdAtMs),
      });
      bidsCreated += 1;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `bids/${bid.id}`);
    }
  }

  await recordAuditLog({
    actorId: adminUser.uid,
    actorEmail: adminUser.email,
    action: 'DEMO_CATALOG_SEEDED',
    targetType: 'auction',
    targetId: 'demo_catalog',
    details: `Idempotent seed complete: ${auctionsCreated} lots created (${auctionsSkipped} existing skipped), ${bidsCreated} demo bids created (${bidsSkipped} skipped).`,
  });

  return {
    auctionsCreated,
    auctionsSkipped,
    bidsCreated,
    bidsSkipped,
    settingsInitialized,
    serverNowMs: nowMs,
  };
}

export async function toggleDemoRealBiddingAdmin(
  adminUser: UserProfile,
  auctionId: string,
  active: boolean
): Promise<void> {
  try {
    await updateDoc(doc(db, 'auctions', auctionId), {
      demoBiddingActive: active,
      updatedAt: serverTimestamp(),
    });
    await recordAuditLog({
      actorId: adminUser.uid,
      actorEmail: adminUser.email,
      action: active ? 'DEMO_BIDDING_ACTIVATED' : 'DEMO_BIDDING_LOCKED',
      targetType: 'auction',
      targetId: auctionId,
      details: active
        ? `Enabled real collector bidding on demo lot ${auctionId}`
        : `Locked real collector bidding on demo lot ${auctionId}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `auctions/${auctionId}`);
  }
}
