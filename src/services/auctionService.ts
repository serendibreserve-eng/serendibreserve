import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  AUCTION_SCHEMA_LIMITS,
  type AppNotification,
  type Auction,
  type AuctionReminder,
  type AuctionResultStatus,
  type AuctionStatus,
  type AuditLogEntry,
  type BidRecord,
  type BidStatus,
  type PlatformSettings,
  type ReminderOffset,
  type SubscriptionRecord,
  type SupportedCurrency,
  type UserProfile,
} from '../types/auction';
import {
  computeMinimumNextBidMinor,
  formatCurrencyMinor,
  isValidEmailAddress,
  makeBidderAlias,
  normalizeSubscriptionId,
} from '../utils/auctionLogic';
import { getAuthoritativeNowMs } from '../hooks/useServerClock';

const PUBLIC_AUCTION_STATUSES: AuctionStatus[] = [
  'upcoming',
  'live',
  'paused',
  'ended',
  'completed',
  'cancelled',
];

const PUBLIC_BID_STATUSES: BidStatus[] = ['valid', 'outbid', 'winning', 'flagged'];

function tsToMs(value: unknown, fallback = 0): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'object' && value !== null && 'toMillis' in value && typeof (value as { toMillis: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === 'number') return value;
  return fallback;
}

function mapAuctionDoc(id: string, data: Record<string, unknown>): Auction {
  return {
    id,
    lotCode: String(data.lotCode || ''),
    title: String(data.title || ''),
    gemstoneType: String(data.gemstoneType || ''),
    origin: String(data.origin || ''),
    caratWeight: Number(data.caratWeight || 0),
    cutShape: String(data.cutShape || ''),
    colorGrade: String(data.colorGrade || ''),
    clarity: String(data.clarity || ''),
    treatment: String(data.treatment || ''),
    certification: String(data.certification || ''),
    certificateNumber: String(data.certificateNumber || ''),
    dimensions: String(data.dimensions || ''),
    description: String(data.description || ''),
    currency: (data.currency as SupportedCurrency) || 'USD',
    startingBidMinor: Number(data.startingBidMinor || 0),
    minimumIncrementMinor: Number(data.minimumIncrementMinor || 0),
    reservePriceMinor: Number(data.reservePriceMinor || 0),
    showReservePrice: Boolean(data.showReservePrice),
    reserveMet: Boolean(data.reserveMet),
    currentHighestBidMinor: Number(data.currentHighestBidMinor || 0),
    highestBidderId: String(data.highestBidderId || ''),
    highestBidderAlias: String(data.highestBidderAlias || ''),
    bidCount: Number(data.bidCount || 0),
    uniqueBiddersCount: Number(data.uniqueBiddersCount || 0),
    status: (data.status as AuctionStatus) || 'upcoming',
    resultStatus: (data.resultStatus as AuctionResultStatus) || 'pending',
    startTimeMs: tsToMs(data.startTime),
    endTimeMs: tsToMs(data.endTime),
    featured: Boolean(data.featured),
    liveStreamUrl: String(data.liveStreamUrl || ''),
    auctionRules: String(data.auctionRules || ''),
    images: Array.isArray(data.images) ? data.images.map(String) : [],
    isDemo: Boolean(data.isDemo),
    demoBiddingActive: Boolean(data.demoBiddingActive),
    createdBy: String(data.createdBy || ''),
    createdAtMs: tsToMs(data.createdAt),
    updatedAtMs: tsToMs(data.updatedAt),
  };
}

function mapBidDoc(id: string, data: Record<string, unknown>): BidRecord {
  return {
    id,
    auctionId: String(data.auctionId || ''),
    bidSequence: Number(data.bidSequence || 0),
    bidderId: String(data.bidderId || ''),
    bidderAlias: String(data.bidderAlias || ''),
    amountMinor: Number(data.amountMinor || 0),
    currency: (data.currency as SupportedCurrency) || 'USD',
    status: (data.status as BidStatus) || 'valid',
    flaggedReason: String(data.flaggedReason || ''),
    isDemo: Boolean(data.isDemo),
    createdAtMs: tsToMs(data.createdAt),
  };
}

function mapReminderDoc(id: string, data: Record<string, unknown>): AuctionReminder {
  return {
    id,
    userId: String(data.userId || ''),
    auctionId: String(data.auctionId || ''),
    auctionTitle: String(data.auctionTitle || ''),
    auctionStartTimeMs: tsToMs(data.auctionStartTime),
    offsets: Array.isArray(data.offsets) ? (data.offsets as ReminderOffset[]) : ['live'],
    active: Boolean(data.active),
    createdAtMs: tsToMs(data.createdAt),
    updatedAtMs: tsToMs(data.updatedAt),
  };
}

function mapNotificationDoc(id: string, data: Record<string, unknown>): AppNotification {
  return {
    id,
    userId: String(data.userId || ''),
    auctionId: String(data.auctionId || ''),
    type: (data.type as AppNotification['type']) || 'system',
    title: String(data.title || ''),
    message: String(data.message || ''),
    read: Boolean(data.read),
    createdAtMs: tsToMs(data.createdAt),
  };
}

export function mapUserDoc(data: Record<string, unknown>): UserProfile {
  const prefs = (data.notificationPreferences as Record<string, unknown>) || {};
  return {
    uid: String(data.uid || ''),
    fullName: String(data.fullName || ''),
    email: String(data.email || ''),
    contactNumber: String(data.contactNumber || ''),
    nationality: String(data.nationality || ''),
    companyName: String(data.companyName || ''),
    photoURL: String(data.photoURL || ''),
    authProvider: data.authProvider === 'password' ? 'password' : 'google',
    role: data.role === 'admin' ? 'admin' : 'user',
    accountStatus:
      data.accountStatus === 'suspended'
        ? 'suspended'
        : data.accountStatus === 'pending_verification'
          ? 'pending_verification'
          : 'active',
    emailVerified: Boolean(data.emailVerified),
    profileCompleted: Boolean(data.profileCompleted),
    watchlistAuctionIds: Array.isArray(data.watchlistAuctionIds)
      ? data.watchlistAuctionIds.map(String)
      : [],
    notificationPreferences: {
      emailReminders: prefs.emailReminders !== false,
      outbidAlerts: prefs.outbidAlerts !== false,
      newAuctionAlerts: prefs.newAuctionAlerts !== false,
      liveStartAlerts: prefs.liveStartAlerts !== false,
    },
    createdAtMs: tsToMs(data.createdAt),
    updatedAtMs: tsToMs(data.updatedAt),
  };
}

export function subscribePublicAuctions(
  onUpdate: (auctions: Auction[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, 'auctions'),
    where('status', 'in', PUBLIC_AUCTION_STATUSES)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => mapAuctionDoc(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => a.startTimeMs - b.startTimeMs);
      onUpdate(items);
    },
    (error) => {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'auctions');
    }
  );
}

export function subscribeAllAuctionsAdmin(
  onUpdate: (auctions: Auction[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'auctions'), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => mapAuctionDoc(d.id, d.data() as Record<string, unknown>)));
    },
    (error) => {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'auctions');
    }
  );
}

export function subscribeAuctionById(
  auctionId: string,
  onUpdate: (auction: Auction | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const ref = doc(db, 'auctions', auctionId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      onUpdate(mapAuctionDoc(snap.id, snap.data() as Record<string, unknown>));
    },
    (error) => {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      handleFirestoreError(error, OperationType.GET, `auctions/${auctionId}`);
    }
  );
}

export function subscribeAuctionBids(
  auctionId: string,
  onUpdate: (bids: BidRecord[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'bids'),
    where('auctionId', '==', auctionId),
    where('status', 'in', PUBLIC_BID_STATUSES)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => mapBidDoc(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => b.bidSequence - a.bidSequence);
      onUpdate(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'bids')
  );
}

export function subscribeUserBids(
  uid: string,
  onUpdate: (bids: BidRecord[]) => void
): Unsubscribe {
  const q = query(collection(db, 'bids'), where('bidderId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => mapBidDoc(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => b.createdAtMs - a.createdAtMs);
      onUpdate(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'bids')
  );
}

export function subscribeAllBidsAdmin(onUpdate: (bids: BidRecord[]) => void): Unsubscribe {
  const q = query(collection(db, 'bids'), orderBy('createdAt', 'desc'), limit(250));
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => mapBidDoc(d.id, d.data() as Record<string, unknown>))),
    (error) => handleFirestoreError(error, OperationType.LIST, 'bids')
  );
}

export async function placeAtomicBid(params: {
  auctionId: string;
  user: UserProfile;
  amountMinor: number;
}): Promise<{ newBidSequence: number; reserveMet: boolean }> {
  const { auctionId, user, amountMinor } = params;
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) {
    throw new Error('Verified account authentication is required to place a bid.');
  }

  // Check if bidder has placed a prior bid on this lot to increment uniqueBiddersCount cleanly
  let hasBidBefore = false;
  try {
    const priorSnap = await getDocs(
      query(
        collection(db, 'bids'),
        where('auctionId', '==', auctionId),
        where('bidderId', '==', user.uid),
        limit(1)
      )
    );
    hasBidBefore = !priorSnap.empty;
  } catch {
    hasBidBefore = false;
  }

  const auctionRef = doc(db, 'auctions', auctionId);
  const alias = makeBidderAlias(user.fullName, user.nationality, user.uid);

  let resultSeq = 0;
  let resultReserveMet = false;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(auctionRef);
      if (!snap.exists()) {
        throw new Error('This auction lot no longer exists.');
      }

      const existing = mapAuctionDoc(snap.id, snap.data() as Record<string, unknown>);
      const nowMs = getAuthoritativeNowMs();

      if (existing.status !== 'live') {
        throw new Error(`This auction is currently ${existing.status} and not accepting bids.`);
      }
      if (existing.isDemo && !existing.demoBiddingActive) {
        throw new Error(
          'Demonstration lot only — binding collector bidding requires explicit administrator activation.'
        );
      }
      if (nowMs < existing.startTimeMs) {
        throw new Error('This auction has not started yet.');
      }
      if (nowMs >= existing.endTimeMs) {
        throw new Error('This auction has already ended.');
      }

      const minNext = computeMinimumNextBidMinor(existing);
      if (amountMinor < minNext) {
        throw new Error(
          `Minimum next bid is ${formatCurrencyMinor(minNext, existing.currency)}. Another collector may have bid ahead of you.`
        );
      }

      const nextSeq = existing.bidCount + 1;
      const nextUniqueCount = existing.uniqueBiddersCount + (hasBidBefore ? 0 : 1);
      const reserveMet = existing.reservePriceMinor === 0 || amountMinor >= existing.reservePriceMinor;

      const bidId = `${auctionId}_bid_${nextSeq}`;
      const bidRef = doc(db, 'bids', bidId);

      tx.update(auctionRef, {
        currentHighestBidMinor: amountMinor,
        highestBidderId: user.uid,
        highestBidderAlias: alias,
        bidCount: nextSeq,
        uniqueBiddersCount: nextUniqueCount,
        reserveMet,
        updatedAt: serverTimestamp(),
      });

      tx.set(bidRef, {
        auctionId,
        bidSequence: nextSeq,
        bidderId: user.uid,
        bidderAlias: alias,
        amountMinor,
        currency: existing.currency,
        status: 'winning',
        flaggedReason: '',
        isDemo: false,
        createdAt: serverTimestamp(),
      });

      if (existing.highestBidderId && existing.highestBidderId !== user.uid) {
        const notifId = `outbid_${auctionId}_${nextSeq}`;
        tx.set(doc(db, 'notifications', notifId), {
          userId: existing.highestBidderId,
          auctionId,
          type: 'outbid',
          title: `Outbid on ${existing.title.slice(0, 80)}`,
          message: `A new bid of ${formatCurrencyMinor(amountMinor, existing.currency)} was placed on ${existing.lotCode}.`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      resultSeq = nextSeq;
      resultReserveMet = reserveMet;
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Minimum next bid') ||
        error.message.includes('not accepting bids') ||
        error.message.includes('already ended') ||
        error.message.includes('not started') ||
        error.message.includes('Demonstration lot'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `auctions/${auctionId}`);
  }

  // Record audit trail non-blockingly
  void recordAuditLog({
    actorId: user.uid,
    actorEmail: user.email,
    action: 'BID_PLACED',
    targetType: 'bid',
    targetId: `${auctionId}_bid_${resultSeq}`,
    details: `Bid #${resultSeq} placed at ${amountMinor} minor units on ${auctionId}`,
  });

  return { newBidSequence: resultSeq, reserveMet: resultReserveMet };
}

export async function recordAuditLog(entry: {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: AuditLogEntry['targetType'];
  targetId: string;
  details: string;
}): Promise<void> {
  const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await setDoc(doc(db, 'auditLogs', id), {
      actorId: entry.actorId.slice(0, 128),
      actorEmail: entry.actorEmail.slice(0, 160),
      action: entry.action.slice(0, 80),
      targetType: entry.targetType,
      targetId: entry.targetId.slice(0, 128),
      details: entry.details.slice(0, 1000),
      createdAt: serverTimestamp(),
    });
  } catch {
    // Audit logging must not crash user UI if secondary write fails
  }
}

export function subscribeAuditLogsAdmin(onUpdate: (logs: AuditLogEntry[]) => void): Unsubscribe {
  const q = query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(200));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(
        snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            actorId: String(data.actorId || ''),
            actorEmail: String(data.actorEmail || ''),
            action: String(data.action || ''),
            targetType: (data.targetType as AuditLogEntry['targetType']) || 'auction',
            targetId: String(data.targetId || ''),
            details: String(data.details || ''),
            createdAtMs: tsToMs(data.createdAt),
          };
        })
      );
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'auditLogs')
  );
}

export function subscribeUserReminders(
  uid: string,
  onUpdate: (reminders: AuctionReminder[]) => void
): Unsubscribe {
  const q = query(collection(db, 'auctionReminders'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => mapReminderDoc(d.id, d.data() as Record<string, unknown>)));
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'auctionReminders')
  );
}

export async function toggleAuctionReminder(params: {
  userId: string;
  auction: Auction;
  offsets?: ReminderOffset[];
}): Promise<'created' | 'removed'> {
  const { userId, auction, offsets = ['24h', '1h', 'live'] } = params;
  const reminderId = `${userId}_${auction.id}`;
  const ref = doc(db, 'auctionReminders', reminderId);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await deleteDoc(ref);
      return 'removed';
    }
    await setDoc(ref, {
      userId,
      auctionId: auction.id,
      auctionTitle: auction.title.slice(0, AUCTION_SCHEMA_LIMITS.titleMax),
      auctionStartTime: Timestamp.fromMillis(auction.startTimeMs),
      offsets: offsets.slice(0, 3),
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return 'created';
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `auctionReminders/${reminderId}`);
  }
}

export async function removeReminderById(reminderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'auctionReminders', reminderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `auctionReminders/${reminderId}`);
  }
}

export async function toggleWatchlistItem(user: UserProfile, auctionId: string): Promise<boolean> {
  const exists = user.watchlistAuctionIds.includes(auctionId);
  const nextList = exists
    ? user.watchlistAuctionIds.filter((id) => id !== auctionId)
    : [...user.watchlistAuctionIds, auctionId].slice(0, AUCTION_SCHEMA_LIMITS.watchlistMax);

  try {
    await updateDoc(doc(db, 'users', user.uid), {
      watchlistAuctionIds: nextList,
      updatedAt: serverTimestamp(),
    });
    return !exists;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
  }
}

export function subscribeUserNotifications(
  uid: string,
  onUpdate: (notifications: AppNotification[]) => void
): Unsubscribe {
  const q = query(collection(db, 'notifications'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => mapNotificationDoc(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => b.createdAtMs - a.createdAtMs);
      onUpdate(list);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'notifications')
  );
}

export async function markNotificationRead(notificationId: string, read = true): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}

export async function subscribeToAuctionAlerts(params: {
  email: string;
  consentAccepted: boolean;
  source?: string;
}): Promise<void> {
  const normalizedEmail = params.email.trim().toLowerCase();
  if (!isValidEmailAddress(normalizedEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!params.consentAccepted) {
    throw new Error('Please confirm consent to receive auction updates.');
  }

  const subId = normalizeSubscriptionId(normalizedEmail);
  const ref = doc(db, 'subscriptions', subId);
  const source = (params.source || 'homepage').slice(0, 60);

  try {
    await setDoc(ref, {
      email: normalizedEmail.slice(0, 160),
      consentAccepted: true,
      status: 'active',
      source,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code === 'permission-denied') {
      try {
        await updateDoc(ref, {
          consentAccepted: true,
          status: 'active',
          source,
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (updateErr) {
        handleFirestoreError(updateErr, OperationType.WRITE, `subscriptions/${subId}`);
      }
    }
    handleFirestoreError(error, OperationType.WRITE, `subscriptions/${subId}`);
  }
}

export function subscribeAllSubscriptionsAdmin(
  onUpdate: (subs: SubscriptionRecord[]) => void
): Unsubscribe {
  const q = query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(
        snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            email: String(data.email || ''),
            consentAccepted: Boolean(data.consentAccepted),
            status: data.status === 'unsubscribed' ? 'unsubscribed' : 'active',
            source: String(data.source || ''),
            createdAtMs: tsToMs(data.createdAt),
            updatedAtMs: tsToMs(data.updatedAt),
          };
        })
      );
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'subscriptions')
  );
}

export async function updateSubscriptionStatusAdmin(
  subscriptionId: string,
  status: 'active' | 'unsubscribed'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `subscriptions/${subscriptionId}`);
  }
}

export function subscribeAllUsersAdmin(onUpdate: (users: UserProfile[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => mapUserDoc(d.data() as Record<string, unknown>))),
    (error) => handleFirestoreError(error, OperationType.LIST, 'users')
  );
}

export async function updateUserAccountAdmin(params: {
  adminUser: UserProfile;
  targetUid: string;
  accountStatus: UserProfile['accountStatus'];
  role: UserProfile['role'];
}): Promise<void> {
  const { adminUser, targetUid, accountStatus, role } = params;
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      accountStatus,
      role,
      updatedAt: serverTimestamp(),
    });
    if (role === 'admin') {
      const targetSnap = await getDoc(doc(db, 'users', targetUid));
      const email = String(targetSnap.data()?.email || 'admin@serendibreserve.com');
      await setDoc(doc(db, 'admins', targetUid), {
        uid: targetUid,
        email,
        grantedBy: adminUser.uid,
        createdAt: serverTimestamp(),
      });
    }
    await recordAuditLog({
      actorId: adminUser.uid,
      actorEmail: adminUser.email,
      action: 'USER_UPDATED',
      targetType: 'user',
      targetId: targetUid,
      details: `Updated user status=${accountStatus}, role=${role}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
  }
}

export interface UpsertAuctionPayload {
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
  status: AuctionStatus;
  resultStatus: AuctionResultStatus;
  startTimeMs: number;
  endTimeMs: number;
  featured: boolean;
  liveStreamUrl: string;
  auctionRules: string;
  images: string[];
  isDemo?: boolean;
  demoBiddingActive?: boolean;
}

export async function createAuctionAdmin(
  adminUser: UserProfile,
  payload: UpsertAuctionPayload
): Promise<string> {
  const auctionId = `lot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  try {
    await setDoc(doc(db, 'auctions', auctionId), {
      lotCode: payload.lotCode.trim().slice(0, AUCTION_SCHEMA_LIMITS.lotCodeMax),
      title: payload.title.trim().slice(0, AUCTION_SCHEMA_LIMITS.titleMax),
      gemstoneType: payload.gemstoneType.trim().slice(0, 80),
      origin: payload.origin.trim().slice(0, 80),
      caratWeight: Number(payload.caratWeight),
      cutShape: payload.cutShape.trim().slice(0, 80),
      colorGrade: payload.colorGrade.trim().slice(0, 80),
      clarity: payload.clarity.trim().slice(0, 80),
      treatment: payload.treatment.trim().slice(0, 120),
      certification: payload.certification.trim().slice(0, 120),
      certificateNumber: payload.certificateNumber.trim().slice(0, 80),
      dimensions: payload.dimensions.trim().slice(0, 80),
      description: payload.description.trim().slice(0, AUCTION_SCHEMA_LIMITS.descriptionMax),
      currency: payload.currency,
      startingBidMinor: Math.max(0, Math.round(payload.startingBidMinor)),
      minimumIncrementMinor: Math.max(100, Math.round(payload.minimumIncrementMinor)),
      reservePriceMinor: Math.max(0, Math.round(payload.reservePriceMinor)),
      showReservePrice: payload.showReservePrice,
      reserveMet: payload.reservePriceMinor === 0,
      currentHighestBidMinor: 0,
      highestBidderId: '',
      highestBidderAlias: '',
      bidCount: 0,
      uniqueBiddersCount: 0,
      status: payload.status,
      resultStatus: payload.resultStatus,
      startTime: Timestamp.fromMillis(payload.startTimeMs),
      endTime: Timestamp.fromMillis(payload.endTimeMs),
      featured: payload.featured,
      liveStreamUrl: payload.liveStreamUrl.trim().slice(0, AUCTION_SCHEMA_LIMITS.liveStreamUrlMax),
      auctionRules: payload.auctionRules.trim().slice(0, AUCTION_SCHEMA_LIMITS.auctionRulesMax),
      images: payload.images.slice(0, AUCTION_SCHEMA_LIMITS.imagesMax),
      isDemo: Boolean(payload.isDemo),
      demoBiddingActive: false,
      createdBy: adminUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      actorId: adminUser.uid,
      actorEmail: adminUser.email,
      action: 'AUCTION_CREATED',
      targetType: 'auction',
      targetId: auctionId,
      details: `Created lot ${payload.lotCode} (${payload.status})`,
    });
    return auctionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `auctions/${auctionId}`);
  }
}

export async function updateAuctionAdmin(
  adminUser: UserProfile,
  auctionId: string,
  payload: UpsertAuctionPayload
): Promise<void> {
  try {
    const snap = await getDoc(doc(db, 'auctions', auctionId));
    if (!snap.exists()) throw new Error('Auction not found.');
    const cur = mapAuctionDoc(snap.id, snap.data() as Record<string, unknown>);
    const reserveMet =
      payload.reservePriceMinor === 0 ||
      cur.currentHighestBidMinor >= payload.reservePriceMinor;

    await updateDoc(doc(db, 'auctions', auctionId), {
      lotCode: payload.lotCode.trim().slice(0, AUCTION_SCHEMA_LIMITS.lotCodeMax),
      title: payload.title.trim().slice(0, AUCTION_SCHEMA_LIMITS.titleMax),
      gemstoneType: payload.gemstoneType.trim().slice(0, 80),
      origin: payload.origin.trim().slice(0, 80),
      caratWeight: Number(payload.caratWeight),
      cutShape: payload.cutShape.trim().slice(0, 80),
      colorGrade: payload.colorGrade.trim().slice(0, 80),
      clarity: payload.clarity.trim().slice(0, 80),
      treatment: payload.treatment.trim().slice(0, 120),
      certification: payload.certification.trim().slice(0, 120),
      certificateNumber: payload.certificateNumber.trim().slice(0, 80),
      dimensions: payload.dimensions.trim().slice(0, 80),
      description: payload.description.trim().slice(0, AUCTION_SCHEMA_LIMITS.descriptionMax),
      currency: payload.currency,
      startingBidMinor: Math.max(0, Math.round(payload.startingBidMinor)),
      minimumIncrementMinor: Math.max(100, Math.round(payload.minimumIncrementMinor)),
      reservePriceMinor: Math.max(0, Math.round(payload.reservePriceMinor)),
      showReservePrice: payload.showReservePrice,
      reserveMet,
      status: payload.status,
      resultStatus: payload.resultStatus,
      startTime: Timestamp.fromMillis(payload.startTimeMs),
      endTime: Timestamp.fromMillis(payload.endTimeMs),
      featured: payload.featured,
      liveStreamUrl: payload.liveStreamUrl.trim().slice(0, AUCTION_SCHEMA_LIMITS.liveStreamUrlMax),
      auctionRules: payload.auctionRules.trim().slice(0, AUCTION_SCHEMA_LIMITS.auctionRulesMax),
      images: payload.images.slice(0, AUCTION_SCHEMA_LIMITS.imagesMax),
      isDemo: payload.isDemo !== undefined ? Boolean(payload.isDemo) : cur.isDemo,
      demoBiddingActive:
        payload.demoBiddingActive !== undefined
          ? Boolean(payload.demoBiddingActive)
          : cur.demoBiddingActive,
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      actorId: adminUser.uid,
      actorEmail: adminUser.email,
      action: 'AUCTION_UPDATED',
      targetType: 'auction',
      targetId: auctionId,
      details: `Updated lot ${payload.lotCode} (${payload.status})`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `auctions/${auctionId}`);
  }
}

export async function updateAuctionStatusAdmin(params: {
  adminUser: UserProfile;
  auctionId: string;
  status: AuctionStatus;
  resultStatus?: AuctionResultStatus;
}): Promise<void> {
  const { adminUser, auctionId, status, resultStatus } = params;
  try {
    const snap = await getDoc(doc(db, 'auctions', auctionId));
    if (!snap.exists()) throw new Error('Auction not found.');
    const cur = mapAuctionDoc(snap.id, snap.data() as Record<string, unknown>);

    const nextResultStatus: AuctionResultStatus =
      resultStatus ||
      (status === 'completed'
        ? cur.bidCount > 0 && (cur.reservePriceMinor === 0 || cur.currentHighestBidMinor >= cur.reservePriceMinor)
          ? 'sold'
          : cur.bidCount > 0
            ? 'reserve_not_met'
            : 'unsold'
        : status === 'cancelled'
          ? 'cancelled'
          : cur.resultStatus);

    await updateDoc(doc(db, 'auctions', auctionId), {
      status,
      resultStatus: nextResultStatus,
      updatedAt: serverTimestamp(),
    });

    // Notify highest bidder when completed as sold
    if (status === 'completed' && nextResultStatus === 'sold' && cur.highestBidderId) {
      await setDoc(doc(db, 'notifications', `won_${auctionId}_${cur.bidCount}`), {
        userId: cur.highestBidderId,
        auctionId,
        type: 'auction_won',
        title: `Lot Won: ${cur.title.slice(0, 80)}`,
        message: `Congratulations! Your winning bid of ${formatCurrencyMinor(cur.currentHighestBidMinor, cur.currency)} secured lot ${cur.lotCode}. Our Colombo concierge will coordinate certification and settlement.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    await recordAuditLog({
      actorId: adminUser.uid,
      actorEmail: adminUser.email,
      action: 'AUCTION_STATUS_CHANGED',
      targetType: 'auction',
      targetId: auctionId,
      details: `Set status=${status}, resultStatus=${nextResultStatus}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `auctions/${auctionId}`);
  }
}

export async function deleteAuctionAdmin(adminUser: UserProfile, auctionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'auctions', auctionId));
    await recordAuditLog({
      actorId: adminUser.uid,
      actorEmail: adminUser.email,
      action: 'AUCTION_DELETED',
      targetType: 'auction',
      targetId: auctionId,
      details: `Deleted draft/unbid lot ${auctionId}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `auctions/${auctionId}`);
  }
}

export async function flagBidAdmin(params: {
  adminUser: UserProfile;
  bidId: string;
  status: BidStatus;
  flaggedReason: string;
}): Promise<void> {
  const { adminUser, bidId, status, flaggedReason } = params;
  try {
    await updateDoc(doc(db, 'bids', bidId), {
      status,
      flaggedReason: flaggedReason.slice(0, 300),
    });
    await recordAuditLog({
      actorId: adminUser.uid,
      actorEmail: adminUser.email,
      action: 'BID_REVIEWED',
      targetType: 'bid',
      targetId: bidId,
      details: `Marked bid ${status}: ${flaggedReason}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bids/${bidId}`);
  }
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  defaultCurrency: 'USD',
  houseRules:
    'All bids placed on Serendib Reserve are binding contractual commitments. Each stone is accompanied by provenance documentation and independent laboratory verification where specified. International settlement via verified wire transfer within 5 business days of hammer close.',
  antiSnipingNote:
    'Bids are stamped against our authoritative Colombo server clock. Ensure bids are submitted prior to countdown expiry.',
  demoModeEnabled: true,
  updatedBy: 'system',
  updatedAtMs: 0,
};

function mapSettingsDoc(data: Record<string, unknown>): PlatformSettings {
  return {
    defaultCurrency: (data.defaultCurrency as SupportedCurrency) || 'USD',
    houseRules: String(data.houseRules || DEFAULT_PLATFORM_SETTINGS.houseRules),
    antiSnipingNote: String(data.antiSnipingNote || DEFAULT_PLATFORM_SETTINGS.antiSnipingNote),
    demoModeEnabled: data.demoModeEnabled !== false,
    updatedBy: String(data.updatedBy || 'system'),
    updatedAtMs: tsToMs(data.updatedAt),
  };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'platform'));
    if (!snap.exists()) return { ...DEFAULT_PLATFORM_SETTINGS, updatedAtMs: Date.now() };
    return mapSettingsDoc(snap.data() as Record<string, unknown>);
  } catch {
    return { ...DEFAULT_PLATFORM_SETTINGS, updatedAtMs: Date.now() };
  }
}

export function subscribePlatformSettings(
  onUpdate: (settings: PlatformSettings) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, 'settings', 'platform'),
    (snap) => {
      if (!snap.exists()) {
        onUpdate({ ...DEFAULT_PLATFORM_SETTINGS, updatedAtMs: Date.now() });
        return;
      }
      onUpdate(mapSettingsDoc(snap.data() as Record<string, unknown>));
    },
    () => {
      onUpdate({ ...DEFAULT_PLATFORM_SETTINGS, updatedAtMs: Date.now() });
    }
  );
}

export async function savePlatformSettingsAdmin(
  adminUser: UserProfile,
  settings: Pick<PlatformSettings, 'defaultCurrency' | 'houseRules' | 'antiSnipingNote' | 'demoModeEnabled'>
): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'platform'), {
      defaultCurrency: settings.defaultCurrency,
      houseRules: settings.houseRules.slice(0, 4000),
      antiSnipingNote: settings.antiSnipingNote.slice(0, 500),
      demoModeEnabled: Boolean(settings.demoModeEnabled),
      updatedBy: adminUser.uid,
      updatedAt: serverTimestamp(),
    });
    await recordAuditLog({
      actorId: adminUser.uid,
      actorEmail: adminUser.email,
      action: 'SETTINGS_UPDATED',
      targetType: 'settings',
      targetId: 'platform',
      details: `Updated defaultCurrency=${settings.defaultCurrency}, demoModeEnabled=${settings.demoModeEnabled}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/platform');
  }
}

export async function uploadAuctionImageFile(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in as an administrator to upload images.');
  const token = await user.getIdToken();

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });

  const resp = await fetch('/api/uploads/gem-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dataUrl }),
  });

  const body = (await resp.json()) as { url?: string; error?: string };
  if (!resp.ok || !body.url) {
    throw new Error(body.error || 'Image upload failed.');
  }
  return body.url;
}
