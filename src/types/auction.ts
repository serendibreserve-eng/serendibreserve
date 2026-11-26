export type SupportedCurrency = 'USD' | 'LKR' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'CNY';

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  'USD',
  'LKR',
  'EUR',
  'GBP',
  'AED',
  'SGD',
  'CNY',
];

export const CURRENCY_METADATA: Record<
  SupportedCurrency,
  { code: SupportedCurrency; symbol: string; name: string; minorUnitMultiplier: number; decimals: number }
> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', minorUnitMultiplier: 100, decimals: 2 },
  LKR: { code: 'LKR', symbol: 'LKR ', name: 'Sri Lankan Rupee', minorUnitMultiplier: 100, decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', minorUnitMultiplier: 100, decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', minorUnitMultiplier: 100, decimals: 2 },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', minorUnitMultiplier: 100, decimals: 2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', minorUnitMultiplier: 100, decimals: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', minorUnitMultiplier: 100, decimals: 2 },
};

export const BOOTSTRAP_ADMIN_EMAIL = 'serendibreserve@gmail.com';

export const AUCTION_SCHEMA_LIMITS = {
  idPattern: /^[a-zA-Z0-9_-]+$/,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  fullNameMax: 120,
  contactNumberMax: 40,
  nationalityMax: 80,
  companyNameMax: 120,
  lotCodeMax: 40,
  titleMax: 160,
  descriptionMax: 4000,
  auctionRulesMax: 2000,
  liveStreamUrlMax: 400,
  imagesMax: 12,
  watchlistMax: 100,
} as const;

export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'pending_verification' | 'suspended';
export type AuthProviderKind = 'google' | 'password';

export interface NotificationPreferences {
  emailReminders: boolean;
  outbidAlerts: boolean;
  newAuctionAlerts: boolean;
  liveStartAlerts: boolean;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  contactNumber: string;
  nationality: string;
  companyName: string;
  photoURL: string;
  authProvider: AuthProviderKind;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  profileCompleted: boolean;
  watchlistAuctionIds: string[];
  notificationPreferences: NotificationPreferences;
  createdAtMs: number;
  updatedAtMs: number;
}

export type AuctionStatus =
  | 'draft'
  | 'upcoming'
  | 'live'
  | 'paused'
  | 'ended'
  | 'completed'
  | 'cancelled';

export type AuctionResultStatus =
  | 'pending'
  | 'sold'
  | 'unsold'
  | 'reserve_not_met'
  | 'cancelled';

export interface Auction {
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
  startTimeMs: number;
  endTimeMs: number;
  featured: boolean;
  liveStreamUrl: string;
  auctionRules: string;
  images: string[];
  isDemo: boolean;
  demoBiddingActive: boolean;
  createdBy: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export type BidStatus = 'valid' | 'outbid' | 'winning' | 'flagged' | 'invalidated';

export interface BidRecord {
  id: string;
  auctionId: string;
  bidSequence: number;
  bidderId: string;
  bidderAlias: string;
  amountMinor: number;
  currency: SupportedCurrency;
  status: BidStatus;
  flaggedReason: string;
  isDemo?: boolean;
  createdAtMs: number;
}

export type ReminderOffset = '24h' | '1h' | 'live';

export interface AuctionReminder {
  id: string;
  userId: string;
  auctionId: string;
  auctionTitle: string;
  auctionStartTimeMs: number;
  offsets: ReminderOffset[];
  active: boolean;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface SubscriptionRecord {
  id: string;
  email: string;
  consentAccepted: boolean;
  status: 'active' | 'unsubscribed';
  source: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export type NotificationType =
  | 'outbid'
  | 'auction_starting'
  | 'auction_live'
  | 'auction_won'
  | 'auction_ended'
  | 'new_auction'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  auctionId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAtMs: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: 'auction' | 'bid' | 'user' | 'subscription' | 'settings';
  targetId: string;
  details: string;
  createdAtMs: number;
}

export interface PlatformSettings {
  defaultCurrency: SupportedCurrency;
  houseRules: string;
  antiSnipingNote: string;
  demoModeEnabled: boolean;
  updatedBy: string;
  updatedAtMs: number;
}
