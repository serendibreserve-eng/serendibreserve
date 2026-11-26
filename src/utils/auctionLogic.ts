import {
  AUCTION_SCHEMA_LIMITS,
  CURRENCY_METADATA,
  type Auction,
  type AuctionStatus,
  type SupportedCurrency,
  type UserProfile,
} from '../types/auction';

export function isValidCurrency(value: string): value is SupportedCurrency {
  return Object.prototype.hasOwnProperty.call(CURRENCY_METADATA, value);
}

export function toMinorUnits(majorAmount: number | string, currency: SupportedCurrency): number {
  const num = typeof majorAmount === 'string' ? Number(majorAmount.replace(/,/g, '').trim()) : majorAmount;
  if (!Number.isFinite(num) || num < 0) return 0;
  const { minorUnitMultiplier } = CURRENCY_METADATA[currency];
  return Math.round(num * minorUnitMultiplier);
}

export function toMajorUnits(minorAmount: number, currency: SupportedCurrency): number {
  const { minorUnitMultiplier } = CURRENCY_METADATA[currency];
  return minorAmount / minorUnitMultiplier;
}

export function formatCurrencyMinor(
  minorAmount: number,
  currency: SupportedCurrency,
  options?: { compact?: boolean; includeCode?: boolean }
): string {
  const meta = CURRENCY_METADATA[currency] ?? CURRENCY_METADATA.USD;
  const major = toMajorUnits(Number.isFinite(minorAmount) ? minorAmount : 0, meta.code);
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: major % 1 === 0 ? 0 : meta.decimals,
    maximumFractionDigits: meta.decimals,
    notation: options?.compact ? 'compact' : 'standard',
  }).format(major);

  const prefix = meta.symbol;
  const suffix = options?.includeCode && !meta.symbol.includes(meta.code) ? ` ${meta.code}` : '';
  return `${prefix}${formattedNumber}${suffix}`;
}

export function computeMinimumNextBidMinor(
  auction: Pick<Auction, 'bidCount' | 'startingBidMinor' | 'currentHighestBidMinor' | 'minimumIncrementMinor'>
): number {
  if (auction.bidCount <= 0) {
    return auction.startingBidMinor;
  }
  return auction.currentHighestBidMinor + auction.minimumIncrementMinor;
}

export function getEffectiveAuctionStatus(
  auction: Pick<Auction, 'status' | 'startTimeMs' | 'endTimeMs'>,
  nowMs: number
): AuctionStatus {
  if (
    auction.status === 'draft' ||
    auction.status === 'paused' ||
    auction.status === 'cancelled' ||
    auction.status === 'completed'
  ) {
    return auction.status;
  }

  if (nowMs >= auction.endTimeMs) {
    return 'ended';
  }

  if (auction.status === 'live' && nowMs >= auction.startTimeMs) {
    return 'live';
  }

  if (auction.status === 'upcoming' && nowMs >= auction.startTimeMs && nowMs < auction.endTimeMs) {
    return 'live';
  }

  if (nowMs < auction.startTimeMs) {
    return 'upcoming';
  }

  return auction.status;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  totalSeconds: number;
  formatted: string;
}

export function formatCountdown(targetMs: number, nowMs: number): CountdownParts {
  const diffMs = targetMs - nowMs;
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
      totalSeconds: 0,
      formatted: '00d : 00h : 00m : 00s',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted =
    days > 0
      ? `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`
      : `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;

  return {
    days,
    hours,
    minutes,
    seconds,
    expired: false,
    totalSeconds,
    formatted,
  };
}

export interface BidValidationResult {
  allowed: boolean;
  code?:
    | 'UNAUTHENTICATED'
    | 'EMAIL_UNVERIFIED'
    | 'PROFILE_INCOMPLETE'
    | 'ACCOUNT_SUSPENDED'
    | 'AUCTION_NOT_LIVE'
    | 'AUCTION_DEMO_LOCKED'
    | 'BID_TOO_LOW'
    | 'INVALID_AMOUNT';
  reason?: string;
  minimumRequiredMinor?: number;
}

export function validateBidCandidate(params: {
  auction: Auction;
  user: UserProfile | null;
  amountMinor: number;
  nowMs: number;
}): BidValidationResult {
  const { auction, user, amountMinor, nowMs } = params;

  if (!user) {
    return {
      allowed: false,
      code: 'UNAUTHENTICATED',
      reason: 'Please sign in or register an account to place a bid.',
    };
  }

  if (!user.emailVerified) {
    return {
      allowed: false,
      code: 'EMAIL_UNVERIFIED',
      reason: 'Verify your email address before placing live bids.',
    };
  }

  if (user.accountStatus === 'suspended') {
    return {
      allowed: false,
      code: 'ACCOUNT_SUSPENDED',
      reason: 'Your bidding privileges are currently suspended. Please contact our Colombo office.',
    };
  }

  if (!user.profileCompleted || user.accountStatus !== 'active') {
    return {
      allowed: false,
      code: 'PROFILE_INCOMPLETE',
      reason: 'Complete your bidder profile (name, contact number, and nationality) before bidding.',
    };
  }

  const effectiveStatus = getEffectiveAuctionStatus(auction, nowMs);
  if (effectiveStatus !== 'live' || auction.status !== 'live') {
    return {
      allowed: false,
      code: 'AUCTION_NOT_LIVE',
      reason:
        effectiveStatus === 'upcoming'
          ? 'This auction has not started yet.'
          : 'Bidding is closed for this lot.',
    };
  }

  if (auction.isDemo && !auction.demoBiddingActive) {
    return {
      allowed: false,
      code: 'AUCTION_DEMO_LOCKED',
      reason:
        'Demonstration lot only — binding collector bidding requires explicit administrator activation.',
    };
  }

  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    return {
      allowed: false,
      code: 'INVALID_AMOUNT',
      reason: 'Enter a valid bid amount.',
    };
  }

  const minNext = computeMinimumNextBidMinor(auction);
  if (amountMinor < minNext) {
    return {
      allowed: false,
      code: 'BID_TOO_LOW',
      minimumRequiredMinor: minNext,
      reason: `Minimum valid bid is ${formatCurrencyMinor(minNext, auction.currency)}.`,
    };
  }

  return {
    allowed: true,
    minimumRequiredMinor: minNext,
  };
}

export function makeBidderAlias(fullName: string, nationality: string, uid: string): string {
  const cleaned = fullName.trim().replace(/\s+/g, ' ');
  const parts = cleaned.split(' ').filter(Boolean);
  let initials = 'Collector';
  if (parts.length >= 2) {
    initials = `${parts[0][0].toUpperCase()}. ${parts[parts.length - 1].slice(0, 1).toUpperCase()}.`;
  } else if (parts.length === 1 && parts[0].length > 0) {
    initials = `${parts[0][0].toUpperCase()}.`;
  }
  const nat = nationality.trim().slice(0, 12);
  const tag = uid.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '0000';
  return nat ? `${initials} (${nat}) • ${tag}` : `${initials} • ${tag}`;
}

export function parseStreamEmbed(rawUrl: string): {
  valid: boolean;
  provider: 'youtube' | 'vimeo' | null;
  embedUrl: string | null;
  externalUrl: string | null;
} {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, provider: null, embedUrl: null, externalUrl: null };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, provider: null, embedUrl: null, externalUrl: null };
    }

    const host = parsed.hostname.toLowerCase();
    if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      let videoId = '';
      if (host === 'youtu.be') {
        videoId = parsed.pathname.replace(/^\/+/, '').split('/')[0] || '';
      } else if (parsed.pathname.startsWith('/watch')) {
        videoId = parsed.searchParams.get('v') || '';
      } else if (parsed.pathname.startsWith('/live/') || parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2] || '';
      }

      if (/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) {
        return {
          valid: true,
          provider: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
          externalUrl: trimmed,
        };
      }
    }

    if (host === 'vimeo.com' || host.endsWith('vimeo.com')) {
      const segments = parsed.pathname.split('/').filter(Boolean);
      const id = segments[segments.length - 1] || '';
      if (/^\d{5,15}$/.test(id)) {
        return {
          valid: true,
          provider: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${id}`,
          externalUrl: trimmed,
        };
      }
    }

    return { valid: false, provider: null, embedUrl: null, externalUrl: trimmed };
  } catch {
    return { valid: false, provider: null, embedUrl: null, externalUrl: null };
  }
}

export function isValidEmailAddress(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.length >= 5 && normalized.length <= 160 && AUCTION_SCHEMA_LIMITS.emailPattern.test(normalized);
}

export function normalizeSubscriptionId(email: string): string {
  const normalized = email.trim().toLowerCase();
  // Deterministic safe hex/alphanumeric hash matching ^[a-zA-Z0-9_-]+$
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const partA = (h1 >>> 0).toString(16).padStart(8, '0');
  const partB = (h2 >>> 0).toString(16).padStart(8, '0');
  return `sub_${partA}${partB}`;
}

export function escapeCsvCell(value: string | number | boolean): string {
  const raw = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function buildSubscriptionsCsv(
  records: Array<{ email: string; status: string; source: string; createdAtMs: number }>
): string {
  const header = ['Email', 'Status', 'Source', 'Subscribed At (UTC)'].join(',');
  const rows = records.map((r) =>
    [
      escapeCsvCell(r.email),
      escapeCsvCell(r.status),
      escapeCsvCell(r.source),
      escapeCsvCell(new Date(r.createdAtMs).toISOString()),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export interface FormattedAuthError {
  message: string;
  isOperationNotAllowed: boolean;
  code: string | null;
}

export function formatFirebaseAuthError(
  err: unknown,
  fallbackMessage = 'Authentication could not be completed. Please try again.'
): FormattedAuthError {
  const rawCode =
    typeof err === 'object' && err !== null && 'code' in err && typeof (err as { code?: unknown }).code === 'string'
      ? (err as { code: string }).code
      : null;

  const rawMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const codeMatch = rawCode || rawMessage.match(/auth\/[a-z0-9-]+/i)?.[0]?.toLowerCase() || null;

  switch (codeMatch) {
    case 'auth/operation-not-allowed':
      return {
        code: codeMatch,
        isOperationNotAllowed: true,
        message:
          'Email & password authentication is currently disabled in Firebase Console for this project. Please continue with Google Sign-In below, or enable the Email/Password provider under Firebase Console → Authentication → Sign-in method.',
      };
    case 'auth/email-already-in-use':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'An account with this email address already exists. Please sign in or reset your password.',
      };
    case 'auth/invalid-email':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'Please enter a valid email address.',
      };
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'Incorrect email address or password. Please verify your credentials or continue with Google.',
      };
    case 'auth/weak-password':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'Password is too weak. Please choose at least 8 characters with letters and numbers.',
      };
    case 'auth/too-many-requests':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'Too many authentication attempts. Please wait a few minutes before trying again.',
      };
    case 'auth/popup-closed-by-user':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'Google sign-in window was closed before completing authentication.',
      };
    case 'auth/popup-blocked':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'Your browser blocked the sign-in pop-up. Please allow pop-ups for this site and try again.',
      };
    case 'auth/unauthorized-domain':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'This domain is not authorized in Firebase Authentication settings.',
      };
    case 'auth/network-request-failed':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'Network error while contacting authentication servers. Check your connection and try again.',
      };
    case 'auth/user-disabled':
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: 'This account has been disabled. Please contact Serendib Reserve support.',
      };
    default:
      return {
        code: codeMatch,
        isOperationNotAllowed: false,
        message: rawMessage.trim() || fallbackMessage,
      };
  }
}
