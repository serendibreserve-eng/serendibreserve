import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Bell,
  BellRing,
  Calendar,
  CheckCircle2,
  Eye,
  Gavel,
  Globe2,
  Headphones,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToAuctionAlerts, toggleAuctionReminder } from '../services/auctionService';
import {
  computeMinimumNextBidMinor,
  formatCurrencyMinor,
  getEffectiveAuctionStatus,
  isValidEmailAddress,
} from '../utils/auctionLogic';
import {
  AuctionResultBadge,
  AuctionStatusBadge,
  CountdownBlocks,
  DemoLotBadge,
  DemoResultDisclaimer,
} from './AuctionBadgesAndTimer';
import { SplitHeading } from './MotionPrimitives';

const AUCTION_TRUST_FEATURES = [
  {
    title: '100% Authenticity',
    subtitle: 'Laboratory Provenance & Ethical Origin',
    body: 'Every auctioned Ceylon sapphire and collector specimen undergoes verified origin screening, treatment disclosure, and laboratory certification checks.',
    icon: ShieldCheck,
  },
  {
    title: 'Global Participation',
    subtitle: 'Colombo to International Vaults',
    body: 'Verified private collectors, jewelers, and dealers compete synchronously across USD, LKR, EUR, GBP, AED, SGD, and CNY lots.',
    icon: Globe2,
  },
  {
    title: 'Transparent Auctions',
    subtitle: 'Authoritative Server Clock & Audit Trail',
    body: 'Atomic bid validation, chronological ledger visibility, explicit minimum increments, and clearly stated reserve conditions.',
    icon: Gavel,
  },
  {
    title: 'Dedicated Support',
    subtitle: 'Private Viewing & Insured Dispatch',
    body: 'Direct access to Serendib Reserve gemmologists at 121 Hunupitiya Lake Rd, Colombo for bespoke due diligence and insured logistics.',
    icon: Headphones,
  },
];

export const HomeAuctionSections: React.FC = () => {
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

  const [reminderBusyId, setReminderBusyId] = useState<string | null>(null);
  const [previewNotice, setPreviewNotice] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subConsent, setSubConsent] = useState(false);
  const [subState, setSubState] = useState<{ status: 'idle' | 'submitting' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  const { featuredLive, upcomingList, completedList } = useMemo(() => {
    const live = publicAuctions.filter((a) => getEffectiveAuctionStatus(a, serverNowMs) === 'live');
    const upcoming = publicAuctions
      .filter((a) => getEffectiveAuctionStatus(a, serverNowMs) === 'upcoming')
      .sort((a, b) => a.startTimeMs - b.startTimeMs);
    const completed = publicAuctions
      .filter((a) => {
        const eff = getEffectiveAuctionStatus(a, serverNowMs);
        return eff === 'completed' || eff === 'ended';
      })
      .sort((a, b) => b.endTimeMs - a.endTimeMs);

    const featured = live.find((a) => a.featured) || live[0] || null;
    return {
      featuredLive: featured,
      upcomingList: upcoming.slice(0, 4),
      completedList: completed.slice(0, 4),
    };
  }, [publicAuctions, serverNowMs]);

  const reminderAuctionIds = useMemo(
    () => new Set(userReminders.filter((r) => r.active).map((r) => r.auctionId)),
    [userReminders]
  );

  const handleToggleReminder = async (auctionId: string) => {
    if (!firebaseUser || !profile) {
      navigate(`/login?redirect=/auctions/upcoming`);
      return;
    }
    if (!firebaseUser.emailVerified) {
      navigate('/verify-email');
      return;
    }
    if (isDemoPreviewCatalog) {
      setPreviewNotice(
        'Preview showcase lot: reminders persist once an administrator publishes the catalog from /admin.'
      );
      return;
    }
    const target = publicAuctions.find((a) => a.id === auctionId);
    if (!target) return;

    setPreviewNotice('');
    setReminderBusyId(auctionId);
    try {
      await toggleAuctionReminder({ userId: firebaseUser.uid, auction: target });
    } finally {
      setReminderBusyId(null);
    }
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmailAddress(subEmail)) {
      setSubState({ status: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!subConsent) {
      setSubState({
        status: 'error',
        message: 'Please accept email notification consent before subscribing.',
      });
      return;
    }

    setSubState({ status: 'submitting', message: '' });
    try {
      await subscribeToAuctionAlerts({
        email: subEmail,
        consentAccepted: subConsent,
        source: 'homepage',
      });
      setSubEmail('');
      setSubConsent(false);
      setSubState({
        status: 'success',
        message: 'Subscribed. You will receive curated alerts for upcoming Serendib Reserve lots.',
      });
    } catch (err) {
      setSubState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Unable to save subscription right now.',
      });
    }
  };

  const fallbackUpcomingHero = !featuredLive ? upcomingList[0] || null : null;

  return (
    <div id="live-auctions-showcase" className="relative bg-[#07152F]">
      {/* SECTION A — FEATURED LIVE AUCTION */}
      <section className="relative overflow-hidden border-t border-[#D9AE61]/20 bg-gradient-to-b from-[#07152F] via-[#0B1C3E] to-[#07152F] py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-[#244DCE]/25 blur-[130px]"
        />
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.26em] uppercase text-[#D9AE61]">
                Curated Auction Room · Featured Lot
              </p>
              <SplitHeading className="mt-2 font-display text-4xl font-light text-[#F5F3EF] sm:text-5xl">
                {featuredLive ? 'Live Bidding Now Open.' : 'Next Vault Showcase.'}
              </SplitHeading>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/auctions/live"
                className="inline-flex items-center gap-2 border border-[#D9AE61]/45 bg-[#102D69]/60 px-5 py-2.5 text-xs tracking-[0.18em] uppercase text-[#F5F3EF] transition-colors hover:border-[#D9AE61]"
              >
                <span>All Live Auctions</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 border border-[#C9D1DC]/25 px-5 py-2.5 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
              >
                How Bidding Works
              </Link>
            </div>
          </div>

          {featuredLive ? (
            <div className="grid grid-cols-1 overflow-hidden border border-[#D9AE61]/30 bg-[#05070D]/80 backdrop-blur-md lg:grid-cols-12">
              {/* Left Visual Spotlight */}
              <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden border-b border-[#C9D1DC]/12 bg-gradient-to-br from-[#07152F] via-[#102D69]/60 to-[#05070D] p-8 lg:col-span-6 lg:border-b-0 lg:border-r">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(36,77,206,0.35),transparent_70%)]"
                />
                <img
                  src={featuredLive.images[0]}
                  alt={featuredLive.title}
                  referrerPolicy="no-referrer"
                  className="relative z-10 max-h-[360px] w-auto object-contain drop-shadow-[0_24px_45px_rgba(36,77,206,0.5)] transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute left-5 top-5 z-20 flex flex-wrap items-center gap-2">
                  <AuctionStatusBadge status="live" />
                  {featuredLive.isDemo && (
                    <DemoLotBadge activeBidding={featuredLive.demoBiddingActive} />
                  )}
                  <span className="border border-[#C9D1DC]/25 bg-[#05070D]/85 px-2.5 py-1 font-mono-tabular text-[10px] tracking-wider uppercase text-[#E6EAF0]">
                    LOT {featuredLive.lotCode}
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-2 border border-[#C9D1DC]/15 bg-[#05070D]/80 px-4 py-2.5 text-xs text-[#C9D1DC]">
                  <span>{featuredLive.certification} · {featuredLive.certificateNumber || 'Certified'}</span>
                  <span className="font-mono-tabular text-white">{featuredLive.caratWeight.toFixed(2)} ct · {featuredLive.cutShape}</span>
                </div>
              </div>

              {/* Right Bidding Panel */}
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6">
                <div className="space-y-5">
                  <div>
                    <p className="text-xs tracking-[0.2em] uppercase text-[#3D7BFF]">
                      {featuredLive.gemstoneType} · {featuredLive.origin}
                    </p>
                    <h3 className="mt-1.5 font-display text-3xl font-light text-white sm:text-4xl">
                      {featuredLive.title}
                    </h3>
                  </div>

                  {featuredLive.isDemo && !featuredLive.demoBiddingActive && (
                    <DemoResultDisclaimer compact />
                  )}

                  <div className="grid grid-cols-2 gap-4 border-y border-[#C9D1DC]/15 py-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] tracking-[0.18em] uppercase text-[#C9D1DC]/70">
                        {featuredLive.bidCount > 0 ? 'Current Highest Bid' : 'Starting Bid'}
                      </p>
                      <p className="mt-1 font-mono-tabular text-2xl font-medium text-[#D9AE61]">
                        {formatCurrencyMinor(
                          featuredLive.bidCount > 0
                            ? featuredLive.currentHighestBidMinor
                            : featuredLive.startingBidMinor,
                          featuredLive.currency
                        )}
                      </p>
                      <p className="text-[11px] text-[#C9D1DC]/65">{featuredLive.currency}</p>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.18em] uppercase text-[#C9D1DC]/70">
                        {featuredLive.showReservePrice && featuredLive.reservePriceMinor > 0
                          ? 'Reserve Price'
                          : 'Next Minimum Bid'}
                      </p>
                      <p className="mt-1 font-mono-tabular text-lg text-white">
                        {featuredLive.showReservePrice && featuredLive.reservePriceMinor > 0
                          ? formatCurrencyMinor(featuredLive.reservePriceMinor, featuredLive.currency)
                          : formatCurrencyMinor(computeMinimumNextBidMinor(featuredLive), featuredLive.currency)}
                      </p>
                      <p className="text-[11px] text-[#C9D1DC]/70">
                        {featuredLive.reservePriceMinor === 0
                          ? 'No Reserve'
                          : featuredLive.reserveMet
                            ? 'Reserve Met'
                            : 'Reserve Not Yet Met'}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[10px] tracking-[0.18em] uppercase text-[#C9D1DC]/70">
                        Participation
                      </p>
                      <p className="mt-1 font-mono-tabular text-lg text-white">
                        {featuredLive.bidCount} bids
                      </p>
                      <p className="inline-flex items-center gap-1 text-[11px] text-[#C9D1DC]/75">
                        <Users size={11} className="text-[#3D7BFF]" aria-hidden="true" />
                        {featuredLive.uniqueBiddersCount} active bidders
                      </p>
                    </div>
                  </div>

                  <CountdownBlocks
                    targetMs={featuredLive.endTimeMs}
                    nowMs={serverNowMs}
                    label="Time Remaining Until Hammer Close"
                  />

                  <div className="flex flex-wrap justify-between gap-2 text-[11px] text-[#C9D1DC]/75">
                    <span>Starts: {new Date(featuredLive.startTimeMs).toLocaleString()}</span>
                    <span>Ends: {new Date(featuredLive.endTimeMs).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/auction/${featuredLive.id}`}
                    className="btn-luxury-primary inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white"
                  >
                    <Gavel size={14} aria-hidden="true" />
                    <span>Place Bid</span>
                  </Link>
                  <Link
                    to={`/auction/${featuredLive.id}`}
                    className="btn-luxury inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-[#E6EAF0]"
                  >
                    <Eye size={14} aria-hidden="true" />
                    <span>View Auction</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : fallbackUpcomingHero ? (
            <div className="grid grid-cols-1 overflow-hidden border border-[#3D7BFF]/35 bg-[#05070D]/80 lg:grid-cols-12">
              <div className="relative flex min-h-[300px] items-center justify-center bg-gradient-to-br from-[#07152F] to-[#102D69]/50 p-8 lg:col-span-5">
                <img
                  src={fallbackUpcomingHero.images[0]}
                  alt={fallbackUpcomingHero.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[280px] object-contain drop-shadow-[0_20px_35px_rgba(36,77,206,0.45)]"
                />
                <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                  <AuctionStatusBadge status="upcoming" />
                  {fallbackUpcomingHero.isDemo && (
                    <DemoLotBadge activeBidding={fallbackUpcomingHero.demoBiddingActive} />
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
                <div className="space-y-4">
                  <p className="text-xs tracking-[0.2em] uppercase text-[#D9AE61]">
                    No Live Auction Active Right Now · Highlighting Next Scheduled Lot
                  </p>
                  <h3 className="font-display text-3xl font-light text-white sm:text-4xl">
                    {fallbackUpcomingHero.title}
                  </h3>
                  <p className="text-sm text-[#C9D1DC]">
                    {fallbackUpcomingHero.gemstoneType} · {fallbackUpcomingHero.caratWeight.toFixed(2)} ct · {fallbackUpcomingHero.origin} · {fallbackUpcomingHero.certification}
                  </p>
                  <p className="font-mono-tabular text-xl text-[#D9AE61]">
                    Opening Bid: {formatCurrencyMinor(fallbackUpcomingHero.startingBidMinor, fallbackUpcomingHero.currency)} ({fallbackUpcomingHero.currency})
                  </p>
                  <CountdownBlocks
                    targetMs={fallbackUpcomingHero.startTimeMs}
                    nowMs={serverNowMs}
                    label="Opens For Bidding In"
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/auction/${fallbackUpcomingHero.id}`}
                    className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
                  >
                    <span>Preview Lot</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    disabled={reminderBusyId === fallbackUpcomingHero.id}
                    onClick={() => void handleToggleReminder(fallbackUpcomingHero.id)}
                    className="btn-luxury inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.18em] uppercase text-[#F5F3EF]"
                  >
                    {reminderAuctionIds.has(fallbackUpcomingHero.id) ? (
                      <>
                        <BellRing size={14} className="text-[#D9AE61]" aria-hidden="true" />
                        <span>Reminder Set</span>
                      </>
                    ) : (
                      <>
                        <Bell size={14} aria-hidden="true" />
                        <span>Set Reminder</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-[#C9D1DC]/20 bg-[#05070D]/75 p-10 text-center">
              <Sparkles size={26} className="mx-auto text-[#D9AE61]" aria-hidden="true" />
              <h3 className="mt-3 font-display text-3xl font-light text-white">
                {auctionsLoaded
                  ? 'Private Vault Curation In Progress'
                  : 'Connecting to Live Auction Vault...'}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[#C9D1DC]/80">
                {auctionsLoaded
                  ? 'Our Colombo gemmologists are preparing the next certified Ceylon gemstone lots for public bidding. Subscribe below to be notified the moment a lot opens.'
                  : 'Synchronizing real-time auction catalog and Colombo authoritative clock.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/auctions"
                  className="btn-luxury inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
                >
                  <span>Browse Auction Directory</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION B — UPCOMING AUCTIONS */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#05070D] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
                Scheduled Releases · Nearest First
              </p>
              <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
                Upcoming Auctions
              </SplitHeading>
            </div>
            <Link
              to="/auctions/upcoming"
              className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
            >
              <span>View All Upcoming Lots</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {previewNotice && (
            <div className="mb-6 border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              {previewNotice}
            </div>
          )}

          {upcomingList.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {upcomingList.map((lot) => {
                const hasReminder = reminderAuctionIds.has(lot.id);
                return (
                  <div
                    key={lot.id}
                    className="group flex flex-col justify-between border border-[#C9D1DC]/18 bg-[#0A1226]/70 transition-all duration-300 hover:border-[#D9AE61]/55"
                  >
                    <div>
                      <Link
                        to={`/auction/${lot.id}`}
                        className="relative flex h-52 items-center justify-center overflow-hidden border-b border-[#C9D1DC]/12 bg-gradient-to-b from-[#07152F] to-[#05070D] p-5"
                      >
                        <img
                          src={lot.images[0]}
                          alt={lot.title}
                          referrerPolicy="no-referrer"
                          className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                          <AuctionStatusBadge status="upcoming" />
                          {lot.isDemo && (
                            <DemoLotBadge activeBidding={lot.demoBiddingActive} />
                          )}
                        </div>
                        <span className="absolute right-3 top-3 border border-[#C9D1DC]/25 bg-[#05070D]/80 px-2 py-0.5 text-[10px] tracking-wider uppercase text-[#C9D1DC]">
                          {lot.certification}
                        </span>
                      </Link>

                      <div className="space-y-3 p-5">
                        <p className="text-[11px] tracking-[0.16em] uppercase text-[#3D7BFF]">
                          {lot.gemstoneType} · {lot.caratWeight.toFixed(2)} ct
                        </p>
                        <h3 className="line-clamp-2 font-display text-2xl font-light text-white">
                          {lot.title}
                        </h3>
                        <div className="flex items-baseline justify-between border-t border-[#C9D1DC]/12 pt-3">
                          <span className="text-[11px] uppercase tracking-wider text-[#C9D1DC]/70">
                            Starting Bid
                          </span>
                          <span className="font-mono-tabular text-base font-medium text-[#D9AE61]">
                            {formatCurrencyMinor(lot.startingBidMinor, lot.currency)}
                          </span>
                        </div>
                        <p className="flex items-center gap-1.5 text-[11px] text-[#C9D1DC]/75">
                          <Calendar size={12} className="text-[#3D7BFF]" aria-hidden="true" />
                          <span>{new Date(lot.startTimeMs).toLocaleString()}</span>
                        </p>
                        <CountdownBlocks
                          targetMs={lot.startTimeMs}
                          nowMs={serverNowMs}
                          label="Starts In"
                          compact
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-[#C9D1DC]/12 p-4">
                      <Link
                        to={`/auction/${lot.id}`}
                        className="border border-[#C9D1DC]/25 px-3 py-2 text-center text-[11px] tracking-[0.14em] uppercase text-white transition-colors hover:border-[#3D7BFF]"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        disabled={reminderBusyId === lot.id}
                        onClick={() => void handleToggleReminder(lot.id)}
                        className={`inline-flex items-center justify-center gap-1.5 border px-3 py-2 text-[11px] tracking-[0.14em] uppercase transition-colors ${
                          hasReminder
                            ? 'border-[#D9AE61] bg-[#D9AE61]/15 text-[#D9AE61]'
                            : 'border-[#3D7BFF]/45 bg-[#102D69]/50 text-[#F5F3EF] hover:border-[#D9AE61]'
                        }`}
                      >
                        {hasReminder ? (
                          <>
                            <BellRing size={12} aria-hidden="true" />
                            <span>Reminder Set</span>
                          </>
                        ) : (
                          <>
                            <Bell size={12} aria-hidden="true" />
                            <span>Set Reminder</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-8 text-center text-sm text-[#C9D1DC]/80">
              No upcoming auction lots are scheduled yet. Subscribe below to receive priority launch announcements.
            </div>
          )}
        </div>
      </section>

      {/* SECTION C — AUCTION TRUST FEATURES */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#07152F] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs tracking-[0.26em] uppercase text-[#D9AE61]">
              House Guarantee · Institutional Standards
            </p>
            <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
              Built for Serious Collectors.
            </SplitHeading>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUCTION_TRUST_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="border border-[#C9D1DC]/18 bg-[#05070D]/70 p-6 transition-colors hover:border-[#D9AE61]/45"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center border border-[#D9AE61]/35 bg-[#102D69]/60 text-[#D9AE61]">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-light text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-1 text-[11px] tracking-[0.14em] uppercase text-[#3D7BFF]">
                    {feat.subtitle}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[#C9D1DC]/85">
                    {feat.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION D — COMPLETED AUCTION RESULTS */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#0A1226] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs tracking-[0.26em] uppercase text-[#C9D1DC]/75">
                Verified Ledger · Past Lots
              </p>
              <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
                Completed Auction Results
              </SplitHeading>
            </div>
            <Link
              to="/auctions/completed"
              className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
            >
              <span>View Full Archive</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {completedList.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {completedList.map((lot) => (
                <Link
                  key={lot.id}
                  to={`/auction/${lot.id}`}
                  className="group flex flex-col justify-between border border-[#C9D1DC]/15 bg-[#05070D]/80 p-5 transition-colors hover:border-[#D9AE61]/45"
                >
                  <div>
                    <div className="relative flex h-44 items-center justify-center border border-[#C9D1DC]/12 bg-[#07152F]/70 p-4">
                      <img
                        src={lot.images[0]}
                        alt={lot.title}
                        referrerPolicy="no-referrer"
                        className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                        <AuctionResultBadge resultStatus={lot.resultStatus} />
                        {lot.isDemo && <DemoLotBadge />}
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/75">
                      {lot.gemstoneType} · {lot.caratWeight.toFixed(2)} ct
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-display text-xl font-light text-white">
                      {lot.title}
                    </h3>
                  </div>

                  <div className="mt-4 border-t border-[#C9D1DC]/12 pt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] uppercase tracking-wider text-[#C9D1DC]/70">
                        {lot.isDemo
                          ? 'Final Demo Bid'
                          : lot.bidCount > 0
                            ? 'Final High Bid'
                            : 'Opening Estimate'}
                      </span>
                      <span className="font-mono-tabular text-base font-medium text-[#D9AE61]">
                        {formatCurrencyMinor(
                          lot.bidCount > 0 ? lot.currentHighestBidMinor : lot.startingBidMinor,
                          lot.currency
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#C9D1DC]/65">
                      Closed {new Date(lot.endTimeMs).toLocaleDateString()} · {lot.currency}
                    </p>
                    {lot.isDemo && (
                      <p className="mt-1 text-[10px] text-amber-200/80">
                        Illustrative demonstration result
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-[#C9D1DC]/15 bg-[#05070D]/60 p-8 text-center">
              <Award size={22} className="mx-auto text-[#C9D1DC]/60" aria-hidden="true" />
              <p className="mt-3 text-sm text-[#C9D1DC]/80">
                Completed auction results will appear here automatically once live lots close.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* HOMEPAGE SUBSCRIPTION SECTION */}
      <section className="border-t border-[#D9AE61]/25 bg-gradient-to-r from-[#07152F] via-[#102D69]/55 to-[#07152F] py-16">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-4 sm:px-8 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-6">
            <p className="text-xs font-medium tracking-[0.24em] uppercase text-[#D9AE61]">
              Private Collector Dispatch
            </p>
            <h2 className="font-display text-3xl font-light text-white sm:text-4xl">
              Never Miss a Rare Gem Auction
            </h2>
            <p className="max-w-xl text-sm text-[#C9D1DC]/85">
              Receive verified lot catalogs, Ceylon sapphire release dates, and live bidding start alerts directly from Colombo.
            </p>
          </div>

          <form onSubmit={handleSubscribeSubmit} className="space-y-3 lg:col-span-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9D1DC]/60"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address for auction alerts"
                  className="w-full border border-[#C9D1DC]/30 bg-[#05070D]/85 py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-[#C9D1DC]/50 focus:border-[#D9AE61] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={subState.status === 'submitting'}
                className="btn-luxury-primary whitespace-nowrap px-7 py-3.5 text-xs font-medium tracking-[0.2em] uppercase text-white disabled:opacity-60"
              >
                {subState.status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#C9D1DC]/80">
              <input
                type="checkbox"
                checked={subConsent}
                onChange={(e) => setSubConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#244DCE]"
              />
              <span>
                I consent to receive rare gemstone auction notifications from Serendib Reserve (Pvt) Ltd and can unsubscribe at any time.
              </span>
            </label>

            {subState.status !== 'idle' && subState.message && (
              <p
                role="status"
                className={`flex items-center gap-2 text-xs ${
                  subState.status === 'success' ? 'text-[#D9AE61]' : 'text-rose-300'
                }`}
              >
                {subState.status === 'success' && <CheckCircle2 size={14} aria-hidden="true" />}
                <span>{subState.message}</span>
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};
