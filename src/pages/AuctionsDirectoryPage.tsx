import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  Calendar,
  Filter,
  Gavel,
  Heart,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleAuctionReminder, toggleWatchlistItem } from '../services/auctionService';
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '../types/auction';
import {
  formatCurrencyMinor,
  getEffectiveAuctionStatus,
  toMajorUnits,
} from '../utils/auctionLogic';
import {
  AuctionResultBadge,
  AuctionStatusBadge,
  CountdownBlocks,
  DemoLotBadge,
} from '../components/AuctionBadgesAndTimer';
import { PageSEO } from '../components/PageSEO';
import { SplitHeading } from '../components/MotionPrimitives';

type DirectoryMode = 'all' | 'live' | 'upcoming' | 'completed';

export const AuctionsDirectoryPage: React.FC<{ initialMode?: DirectoryMode }> = ({
  initialMode = 'all',
}) => {
  const navigate = useNavigate();
  const {
    firebaseUser,
    profile,
    publicAuctions,
    auctionsLoaded,
    isDemoPreviewCatalog,
    userReminders,
    serverNowMs,
  } = useAuth();

  const [statusFilter, setStatusFilter] = useState<DirectoryMode>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [gemTypeFilter, setGemTypeFilter] = useState<string>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<SupportedCurrency | 'ALL'>('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'nearest' | 'ending' | 'price_desc' | 'price_asc'>('nearest');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewNotice, setPreviewNotice] = useState('');

  React.useEffect(() => {
    setStatusFilter(initialMode);
  }, [initialMode]);

  const gemTypes = useMemo(() => {
    const set = new Set(publicAuctions.map((a) => a.gemstoneType).filter(Boolean));
    return Array.from(set).sort();
  }, [publicAuctions]);

  const reminderIds = useMemo(
    () => new Set(userReminders.filter((r) => r.active).map((r) => r.auctionId)),
    [userReminders]
  );

  const watchlistIds = useMemo(
    () => new Set(profile?.watchlistAuctionIds || []),
    [profile]
  );

  const filteredAuctions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minVal = minPrice ? Number(minPrice) : null;
    const maxVal = maxPrice ? Number(maxPrice) : null;

    const list = publicAuctions.filter((lot) => {
      const eff = getEffectiveAuctionStatus(lot, serverNowMs);
      if (statusFilter === 'live' && eff !== 'live') return false;
      if (statusFilter === 'upcoming' && eff !== 'upcoming') return false;
      if (statusFilter === 'completed' && eff !== 'completed' && eff !== 'ended') return false;

      if (gemTypeFilter !== 'ALL' && lot.gemstoneType !== gemTypeFilter) return false;
      if (currencyFilter !== 'ALL' && lot.currency !== currencyFilter) return false;

      const refMinor = lot.bidCount > 0 ? lot.currentHighestBidMinor : lot.startingBidMinor;
      const refMajor = toMajorUnits(refMinor, lot.currency);
      if (minVal !== null && Number.isFinite(minVal) && refMajor < minVal) return false;
      if (maxVal !== null && Number.isFinite(maxVal) && refMajor > maxVal) return false;

      if (q) {
        const haystack = `${lot.title} ${lot.lotCode} ${lot.gemstoneType} ${lot.origin} ${lot.certification} ${lot.certificateNumber}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      const refA = a.bidCount > 0 ? a.currentHighestBidMinor : a.startingBidMinor;
      const refB = b.bidCount > 0 ? b.currentHighestBidMinor : b.startingBidMinor;
      if (sortBy === 'price_desc') return refB - refA;
      if (sortBy === 'price_asc') return refA - refB;
      if (sortBy === 'ending') return a.endTimeMs - b.endTimeMs;
      return a.startTimeMs - b.startTimeMs;
    });
  }, [
    publicAuctions,
    serverNowMs,
    statusFilter,
    gemTypeFilter,
    currencyFilter,
    minPrice,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  const handleToggleReminder = async (lotId: string) => {
    if (!firebaseUser) {
      navigate('/login?redirect=/auctions/upcoming');
      return;
    }
    if (!firebaseUser.emailVerified) {
      navigate('/verify-email');
      return;
    }
    if (isDemoPreviewCatalog) {
      setPreviewNotice(
        'Preview showcase catalog: reminders activate once an administrator opens /admin to publish the lots to Firestore.'
      );
      return;
    }
    const target = publicAuctions.find((a) => a.id === lotId);
    if (!target) return;
    setPreviewNotice('');
    setBusyId(lotId);
    try {
      await toggleAuctionReminder({ userId: firebaseUser.uid, auction: target });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleWatch = async (lotId: string) => {
    if (!firebaseUser || !profile) {
      navigate('/login?redirect=/auctions');
      return;
    }
    if (!firebaseUser.emailVerified) {
      navigate('/verify-email');
      return;
    }
    if (isDemoPreviewCatalog) {
      setPreviewNotice(
        'Preview showcase catalog: watchlist saves once an administrator opens /admin to publish the lots to Firestore.'
      );
      return;
    }
    setPreviewNotice('');
    setBusyId(lotId);
    try {
      await toggleWatchlistItem(profile, lotId);
    } finally {
      setBusyId(null);
    }
  };

  const headings: Record<DirectoryMode, { kicker: string; title: string; subtitle: string }> = {
    all: {
      kicker: 'Auction Directory · All Public Lots',
      title: 'Ceylon Gemstone Auctions',
      subtitle: 'Filter live rooms, scheduled releases, and verified past auction results.',
    },
    live: {
      kicker: 'Live Bidding Rooms',
      title: 'Live Gemstone Auctions',
      subtitle: 'Active certified lots accepting real-time bids synchronized to Colombo time.',
    },
    upcoming: {
      kicker: 'Upcoming Vault Releases',
      title: 'Upcoming Auctions',
      subtitle: 'Preview scheduled lots and activate reminders before the hammer opens.',
    },
    completed: {
      kicker: 'Historical Auction Archive',
      title: 'Completed Auction Results',
      subtitle: 'Verified closing figures and sale outcomes across completed Serendib Reserve lots.',
    },
  };

  const activeMeta = headings[statusFilter];

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO title={`${activeMeta.title} — Serendib Reserve`} description={activeMeta.subtitle} />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Header & Status Tabs */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#C9D1DC]/15 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.26em] uppercase text-[#D9AE61]">
              {activeMeta.kicker}
            </p>
            <SplitHeading as="h1" className="mt-2 font-display text-4xl font-light text-white sm:text-6xl">
              {activeMeta.title}
            </SplitHeading>
            <p className="mt-3 max-w-2xl text-sm text-[#C9D1DC]/85">{activeMeta.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'all', label: 'All Lots', to: '/auctions' },
                { id: 'live', label: 'Live', to: '/auctions/live' },
                { id: 'upcoming', label: 'Upcoming', to: '/auctions/upcoming' },
                { id: 'completed', label: 'Completed', to: '/auctions/completed' },
              ] as const
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={tab.to}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`border px-4 py-2 text-xs font-medium tracking-[0.16em] uppercase transition-colors ${
                    active
                      ? 'border-[#D9AE61] bg-[#102D69] text-[#D9AE61]'
                      : 'border-[#C9D1DC]/25 bg-[#0A1226]/60 text-[#C9D1DC] hover:text-white'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 grid grid-cols-1 gap-3 border border-[#C9D1DC]/15 bg-[#07152F]/70 p-4 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#C9D1DC]/60"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, lot code, origin, lab..."
              className="w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 py-2 pl-9 pr-3 text-xs text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <select
              aria-label="Filter by gemstone type"
              value={gemTypeFilter}
              onChange={(e) => setGemTypeFilter(e.target.value)}
              className="w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-xs text-white focus:border-[#D9AE61] focus:outline-none"
            >
              <option value="ALL">All Gemstone Types</option>
              {gemTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              aria-label="Filter by currency"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value as SupportedCurrency | 'ALL')}
              className="w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-xs text-white focus:border-[#D9AE61] focus:outline-none"
            >
              <option value="ALL">All Currencies</option>
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min bid"
              aria-label="Minimum bid price"
              className="w-1/2 border border-[#C9D1DC]/25 bg-[#05070D]/80 px-2.5 py-2 text-xs text-white focus:border-[#D9AE61] focus:outline-none"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max bid"
              aria-label="Maximum bid price"
              className="w-1/2 border border-[#C9D1DC]/25 bg-[#05070D]/80 px-2.5 py-2 text-xs text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <select
              aria-label="Sort lots"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-xs text-white focus:border-[#D9AE61] focus:outline-none"
            >
              <option value="nearest">Nearest Date</option>
              <option value="ending">Ending Soonest</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
            </select>
          </div>
        </div>

        {previewNotice && (
          <div className="mt-4 border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            {previewNotice}
          </div>
        )}

        {/* Grid */}
        {!auctionsLoaded ? (
          <div className="py-20 text-center text-sm text-[#C9D1DC]/70">
            Loading auction lots...
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="mt-8 border border-[#C9D1DC]/15 bg-[#07152F]/45 p-12 text-center">
            <Filter size={26} className="mx-auto text-[#D9AE61]/70" aria-hidden="true" />
            <h2 className="mt-3 font-display text-2xl font-light text-white">
              No Matching Auction Lots
            </h2>
            <p className="mt-2 text-xs text-[#C9D1DC]/75">
              Adjust your filters or explore another auction category.
            </p>
            {(searchQuery || gemTypeFilter !== 'ALL' || currencyFilter !== 'ALL' || minPrice || maxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setGemTypeFilter('ALL');
                  setCurrencyFilter('ALL');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="btn-luxury mt-5 px-5 py-2 text-xs uppercase tracking-widest text-white"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAuctions.map((lot) => {
              const effStatus = getEffectiveAuctionStatus(lot, serverNowMs);
              const isWatched = watchlistIds.has(lot.id);
              const hasReminder = reminderIds.has(lot.id);

              return (
                <div
                  key={lot.id}
                  className="flex flex-col justify-between border border-[#C9D1DC]/18 bg-[#0A1226]/70 transition-colors hover:border-[#D9AE61]/55"
                >
                  <div>
                    <div className="relative flex h-56 items-center justify-center border-b border-[#C9D1DC]/12 bg-gradient-to-b from-[#07152F] to-[#05070D] p-5">
                      <Link to={`/auction/${lot.id}`} className="flex h-full w-full items-center justify-center">
                        <img
                          src={lot.images[0]}
                          alt={lot.title}
                          referrerPolicy="no-referrer"
                          className="max-h-full w-auto object-contain transition-transform duration-500 hover:scale-105"
                        />
                      </Link>
                      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 pr-10">
                        <AuctionStatusBadge status={effStatus} />
                        {(effStatus === 'completed' || effStatus === 'ended') && (
                          <AuctionResultBadge resultStatus={lot.resultStatus} />
                        )}
                        {lot.isDemo && (
                          <DemoLotBadge activeBidding={lot.demoBiddingActive} />
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={busyId === lot.id}
                        onClick={() => void handleToggleWatch(lot.id)}
                        aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                        className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center border transition-colors ${
                          isWatched
                            ? 'border-[#D9AE61] bg-[#D9AE61]/20 text-[#D9AE61]'
                            : 'border-[#C9D1DC]/25 bg-[#05070D]/80 text-[#C9D1DC] hover:text-white'
                        }`}
                      >
                        <Heart size={14} fill={isWatched ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between text-[11px] tracking-[0.16em] uppercase">
                        <span className="text-[#3D7BFF]">{lot.gemstoneType}</span>
                        <span className="font-mono-tabular text-[#C9D1DC]/70">{lot.lotCode}</span>
                      </div>

                      <Link to={`/auction/${lot.id}`}>
                        <h2 className="line-clamp-2 font-display text-2xl font-light text-white hover:text-[#D9AE61]">
                          {lot.title}
                        </h2>
                      </Link>

                      <p className="text-xs text-[#C9D1DC]/80">
                        {lot.caratWeight.toFixed(2)} ct · {lot.cutShape} · {lot.origin} · {lot.certification}
                      </p>

                      <div className="flex items-baseline justify-between border-t border-[#C9D1DC]/12 pt-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#C9D1DC]/70">
                            {lot.bidCount > 0 ? 'Current High Bid' : 'Starting Bid'}
                          </p>
                          <p className="font-mono-tabular text-lg font-medium text-[#D9AE61]">
                            {formatCurrencyMinor(
                              lot.bidCount > 0 ? lot.currentHighestBidMinor : lot.startingBidMinor,
                              lot.currency
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-[#C9D1DC]/70">
                            Activity
                          </p>
                          <p className="font-mono-tabular text-xs text-white">
                            {lot.bidCount} bids · {lot.currency}
                          </p>
                        </div>
                      </div>

                      {effStatus === 'live' && (
                        <CountdownBlocks
                          targetMs={lot.endTimeMs}
                          nowMs={serverNowMs}
                          label="Closes In"
                          compact
                        />
                      )}
                      {effStatus === 'upcoming' && (
                        <CountdownBlocks
                          targetMs={lot.startTimeMs}
                          nowMs={serverNowMs}
                          label="Starts In"
                          compact
                        />
                      )}
                      {(effStatus === 'completed' || effStatus === 'ended') && (
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-xs text-[#C9D1DC]/70">
                            <Calendar size={12} aria-hidden="true" />
                            <span>Closed {new Date(lot.endTimeMs).toLocaleDateString()}</span>
                          </p>
                          {lot.isDemo && (
                            <p className="text-[10px] text-amber-200/80">
                              Illustrative demo result
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-[#C9D1DC]/12 p-4">
                    <Link
                      to={`/auction/${lot.id}`}
                      className="btn-luxury-primary flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-white"
                    >
                      <Gavel size={13} aria-hidden="true" />
                      <span>{effStatus === 'live' ? 'View & Bid' : 'View Lot'}</span>
                    </Link>
                    {effStatus === 'upcoming' && (
                      <button
                        type="button"
                        disabled={busyId === lot.id}
                        onClick={() => void handleToggleReminder(lot.id)}
                        className={`inline-flex items-center justify-center gap-1.5 border px-3.5 py-2.5 text-[11px] tracking-[0.14em] uppercase ${
                          hasReminder
                            ? 'border-[#D9AE61] bg-[#D9AE61]/15 text-[#D9AE61]'
                            : 'border-[#C9D1DC]/25 text-[#E6EAF0] hover:border-[#D9AE61]'
                        }`}
                      >
                        {hasReminder ? <BellRing size={13} /> : <Bell size={13} />}
                        <span>{hasReminder ? 'Set' : 'Remind'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-[#C9D1DC]/12 pt-5 text-xs text-[#C9D1DC]/70">
          <span className="inline-flex items-center gap-1.5">
            <SlidersHorizontal size={13} aria-hidden="true" />
            Showing {filteredAuctions.length} of {publicAuctions.length} public lots
          </span>
          <Link to="/how-it-works" className="text-[#D9AE61] hover:underline">
            Review Auction Terms & Currencies
          </Link>
        </div>
      </div>
    </div>
  );
};
