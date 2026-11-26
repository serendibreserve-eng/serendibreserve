import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BellRing,
  CheckCircle2,
  ExternalLink,
  Gavel,
  Heart,
  Lock,
  Maximize2,
  Radio,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  placeAtomicBid,
  subscribeAuctionBids,
  subscribeAuctionById,
  toggleAuctionReminder,
  toggleWatchlistItem,
} from '../services/auctionService';
import { getDemoPreviewLotAndBids } from '../content/demoSeedAuctions';
import type { Auction, BidRecord } from '../types/auction';
import {
  computeMinimumNextBidMinor,
  formatCurrencyMinor,
  getEffectiveAuctionStatus,
  parseStreamEmbed,
  toMajorUnits,
  toMinorUnits,
  validateBidCandidate,
} from '../utils/auctionLogic';
import {
  AuctionResultBadge,
  AuctionStatusBadge,
  CountdownBlocks,
  DemoLotBadge,
  DemoResultDisclaimer,
  DemoSimulatedBidBadge,
} from '../components/AuctionBadgesAndTimer';
import { PageSEO } from '../components/PageSEO';

export const AuctionDetailPage: React.FC = () => {
  const { auctionId = '' } = useParams();
  const navigate = useNavigate();
  const {
    firebaseUser,
    profile,
    userReminders,
    serverNowMs,
    demoModeEnabled,
    demoPreviewAnchorMs,
  } = useAuth();

  const [firestoreAuction, setFirestoreAuction] = useState<Auction | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [firestoreBids, setFirestoreBids] = useState<BidRecord[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [bidMajorInput, setBidMajorInput] = useState('');
  const [bidBusy, setBidBusy] = useState(false);
  const [bidFeedback, setBidFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!auctionId) return;
    setLoaded(false);
    const unsubAuction = subscribeAuctionById(
      auctionId,
      (item) => {
        setFirestoreAuction(item);
        setLoaded(true);
      },
      () => {
        setFirestoreAuction(null);
        setLoaded(true);
      }
    );
    const unsubBids = subscribeAuctionBids(auctionId, setFirestoreBids);
    return () => {
      unsubAuction();
      unsubBids();
    };
  }, [auctionId]);

  const demoPreviewMatch = useMemo(() => {
    if (!loaded || firestoreAuction || !demoModeEnabled || !auctionId) return null;
    return getDemoPreviewLotAndBids(auctionId, demoPreviewAnchorMs);
  }, [loaded, firestoreAuction, demoModeEnabled, auctionId, demoPreviewAnchorMs]);

  const auction = firestoreAuction || demoPreviewMatch?.auction || null;
  const isPreviewOnly = Boolean(!firestoreAuction && demoPreviewMatch);
  const bids = firestoreAuction ? firestoreBids : demoPreviewMatch?.bids || [];

  const minNextMinor = useMemo(
    () => (auction ? computeMinimumNextBidMinor(auction) : 0),
    [auction]
  );

  // Sync suggested minimum bid input when highest bid rises
  useEffect(() => {
    if (!auction) return;
    const minMajor = toMajorUnits(minNextMinor, auction.currency);
    setBidMajorInput((prev) => {
      const currentNum = Number(prev);
      if (!prev || !Number.isFinite(currentNum) || currentNum < minMajor) {
        return String(minMajor);
      }
      return prev;
    });
  }, [auction, minNextMinor]);

  const effectiveStatus = useMemo(
    () => (auction ? getEffectiveAuctionStatus(auction, serverNowMs) : 'ended'),
    [auction, serverNowMs]
  );

  const isDemoLocked = Boolean(auction?.isDemo && !auction.demoBiddingActive);
  const canSubmitLiveBid = effectiveStatus === 'live' && !isDemoLocked;

  const isWatched = Boolean(auction && profile?.watchlistAuctionIds.includes(auction.id));
  const hasReminder = Boolean(
    auction && userReminders.some((r) => r.auctionId === auction.id && r.active)
  );
  const isLeadingBidder = Boolean(
    auction && firebaseUser && auction.highestBidderId === firebaseUser.uid
  );

  const streamInfo = useMemo(
    () => (auction ? parseStreamEmbed(auction.liveStreamUrl) : { valid: false, provider: null, embedUrl: null, externalUrl: null }),
    [auction]
  );

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    setBidFeedback(null);

    const amountMinor = toMinorUnits(bidMajorInput, auction.currency);
    const check = validateBidCandidate({
      auction,
      user: profile,
      amountMinor,
      nowMs: serverNowMs,
    });

    if (!check.allowed) {
      if (check.code === 'UNAUTHENTICATED') {
        navigate(`/login?redirect=/auction/${auction.id}`);
        return;
      }
      if (check.code === 'EMAIL_UNVERIFIED') {
        navigate('/verify-email');
        return;
      }
      if (check.code === 'PROFILE_INCOMPLETE') {
        navigate(`/complete-profile?redirect=/auction/${auction.id}`);
        return;
      }
      setBidFeedback({ type: 'error', text: check.reason || 'Bid cannot be submitted.' });
      return;
    }

    if (!profile) return;
    setBidBusy(true);
    try {
      const res = await placeAtomicBid({
        auctionId: auction.id,
        user: profile,
        amountMinor,
      });
      setBidFeedback({
        type: 'success',
        text: `Bid #${res.newBidSequence} confirmed at ${formatCurrencyMinor(amountMinor, auction.currency)}. ${
          res.reserveMet ? 'Reserve met — you are the leading bidder.' : 'You are currently the highest bidder (reserve not yet met).'
        }`,
      });
    } catch (err) {
      setBidFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to place bid.',
      });
    } finally {
      setBidBusy(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-[#05070D] pt-20 text-xs tracking-[0.2em] uppercase text-[#C9D1DC]">
        Loading Lot Dossier...
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-[75vh] bg-[#05070D] px-4 pb-20 pt-32 text-center">
        <h1 className="font-display text-3xl font-light text-white">Auction Lot Not Found</h1>
        <p className="mt-2 text-sm text-[#C9D1DC]/75">
          This lot may have been removed or is not yet open to public viewing.
        </p>
        <Link to="/auctions" className="btn-luxury-primary mt-6 inline-block px-6 py-3 text-xs uppercase tracking-widest text-white">
          Return to Auctions
        </Link>
      </div>
    );
  }

  const galleryImages = auction.images.length > 0 ? auction.images : ['/assets/aistudio/Royal_Blue_Sapphire_from_Sri_Lanka__Ceylon__1d3f139f.png'];
  const activeImg = galleryImages[activeImageIdx] || galleryImages[0];

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-24">
      <PageSEO title={`${auction.title} — Serendib Reserve Auction`} description={auction.description.slice(0, 155)} />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/auctions"
            className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Back to Auctions</span>
          </Link>
          <div className="flex items-center gap-2.5">
            {profile && (
              <button
                type="button"
                onClick={() => {
                  if (isPreviewOnly) {
                    setBidFeedback({
                      type: 'error',
                      text: 'Preview showcase lot: watchlist saves once an administrator initializes the catalog in /admin.',
                    });
                    return;
                  }
                  void toggleWatchlistItem(profile, auction.id);
                }}
                className={`inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs tracking-[0.14em] uppercase ${
                  isWatched
                    ? 'border-[#D9AE61] bg-[#D9AE61]/15 text-[#D9AE61]'
                    : 'border-[#C9D1DC]/25 text-[#C9D1DC] hover:text-white'
                }`}
              >
                <Heart size={13} fill={isWatched ? 'currentColor' : 'none'} />
                <span>{isWatched ? 'Saved' : 'Watchlist'}</span>
              </button>
            )}
            {effectiveStatus === 'upcoming' && (
              <button
                type="button"
                onClick={() => {
                  if (!firebaseUser) {
                    navigate(`/login?redirect=/auction/${auction.id}`);
                    return;
                  }
                  if (isPreviewOnly) {
                    setBidFeedback({
                      type: 'error',
                      text: 'Preview showcase lot: reminders activate once an administrator initializes the catalog in /admin.',
                    });
                    return;
                  }
                  void toggleAuctionReminder({ userId: firebaseUser.uid, auction });
                }}
                className={`inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs tracking-[0.14em] uppercase ${
                  hasReminder
                    ? 'border-[#D9AE61] bg-[#D9AE61]/15 text-[#D9AE61]'
                    : 'border-[#3D7BFF]/45 bg-[#102D69]/50 text-white'
                }`}
              >
                {hasReminder ? <BellRing size={13} /> : <Bell size={13} />}
                <span>{hasReminder ? 'Reminder Set' : 'Set Reminder'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Auction Workspace */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: Gallery, Details, Specs, Certification */}
          <div className="space-y-8 lg:col-span-7">
            {/* Main Zoomable Image Gallery */}
            <div className="border border-[#C9D1DC]/18 bg-[#07152F]/70 p-4">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-b from-[#07152F] to-[#05070D]">
                <img
                  src={activeImg}
                  alt={auction.title}
                  referrerPolicy="no-referrer"
                  onClick={() => setZoomOpen(true)}
                  className="max-h-full w-auto cursor-zoom-in object-contain transition-transform duration-500 hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  aria-label="Zoom gemstone photograph"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 border border-[#C9D1DC]/30 bg-[#05070D]/85 px-3 py-1.5 text-[10px] tracking-[0.16em] uppercase text-white hover:border-[#D9AE61]"
                >
                  <Maximize2 size={12} aria-hidden="true" />
                  <span>Zoom</span>
                </button>
              </div>

              {galleryImages.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`aspect-square overflow-hidden border bg-[#05070D] p-1 transition-colors ${
                        idx === activeImageIdx
                          ? 'border-[#D9AE61]'
                          : 'border-[#C9D1DC]/20 hover:border-[#3D7BFF]'
                      }`}
                    >
                      <img src={imgUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gemstone Description & Provenance Specs */}
            <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6 sm:p-8">
              <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-[#D9AE61]">
                Gemmological Dossier
              </p>
              <h2 className="mt-2 font-display text-3xl font-light text-white">
                Specifications & Certification
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#C9D1DC]/90">
                {auction.description}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#C9D1DC]/15 pt-6 sm:grid-cols-3">
                {[
                  ['Lot Code', auction.lotCode],
                  ['Gemstone Type', auction.gemstoneType],
                  ['Origin', auction.origin],
                  ['Carat Weight', `${auction.caratWeight.toFixed(2)} ct`],
                  ['Cut / Shape', auction.cutShape],
                  ['Colour Grade', auction.colorGrade],
                  ['Clarity', auction.clarity],
                  ['Treatment Disclosure', auction.treatment],
                  ['Certification', auction.certification],
                  ['Certificate No.', auction.certificateNumber || 'Provided on settlement'],
                  ['Dimensions', auction.dimensions || 'Upon request'],
                  ['Designated Currency', auction.currency],
                ].map(([label, val]) => (
                  <div key={label} className="border border-[#C9D1DC]/12 bg-[#05070D]/60 p-3.5">
                    <p className="text-[10px] tracking-[0.16em] uppercase text-[#C9D1DC]/65">
                      {label}
                    </p>
                    <p className="mt-1 text-xs font-medium text-white">{val}</p>
                  </div>
                ))}
              </div>

              {auction.auctionRules && (
                <div className="mt-6 border-t border-[#C9D1DC]/15 pt-5">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-[#D9AE61]">
                    Lot Conditions & Auction Rules
                  </p>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#C9D1DC]/80">
                    {auction.auctionRules}
                  </p>
                </div>
              )}

              {auction.isDemo && (
                <div className="mt-5">
                  <DemoResultDisclaimer />
                </div>
              )}
            </div>

            {/* Live Stream Section (When URL Configured) */}
            {streamInfo.externalUrl && (
              <div className="border border-[#D9AE61]/30 bg-[#07152F]/80 p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-[#D9AE61]" aria-hidden="true" />
                    <h2 className="font-display text-2xl font-light text-white">
                      Colombo Vault Live Inspection Stream
                    </h2>
                  </div>
                  <a
                    href={streamInfo.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#D9AE61] hover:underline"
                  >
                    <span>Open External Stream</span>
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>

                {streamInfo.valid && streamInfo.embedUrl ? (
                  <div className="aspect-video w-full overflow-hidden border border-[#C9D1DC]/20 bg-black">
                    <iframe
                      src={streamInfo.embedUrl}
                      title={`${auction.title} Live Stream`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-[#C9D1DC]/80">
                    Stream link configured. Use the external stream button above to watch live gem inspection.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Timer, Bid State, Atomic Place Bid Form, Real-Time History */}
          <div className="space-y-6 lg:col-span-5">
            <div className="border border-[#D9AE61]/35 bg-[#07152F]/85 p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <AuctionStatusBadge status={effectiveStatus} />
                  {(effectiveStatus === 'completed' || effectiveStatus === 'ended') && (
                    <AuctionResultBadge resultStatus={auction.resultStatus} />
                  )}
                  {auction.isDemo && (
                    <DemoLotBadge activeBidding={auction.demoBiddingActive} />
                  )}
                </div>
                <span className="font-mono-tabular text-xs text-[#C9D1DC]/75">
                  LOT {auction.lotCode}
                </span>
              </div>

              <h1 className="mt-4 font-display text-3xl font-light text-white sm:text-4xl">
                {auction.title}
              </h1>

              {isDemoLocked && (
                <div className="mt-4 border border-amber-400/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
                  <strong className="font-semibold uppercase tracking-wider text-amber-200">
                    Demonstration Lot Locked:
                  </strong>{' '}
                  Pre-seeded prices and simulated bids illustrate platform functionality. Real collector bidding remains blocked until explicit administrator activation.
                </div>
              )}

              {/* Countdown */}
              <div className="mt-5">
                {effectiveStatus === 'live' && (
                  <CountdownBlocks
                    targetMs={auction.endTimeMs}
                    nowMs={serverNowMs}
                    label="Live Hammer Countdown"
                  />
                )}
                {effectiveStatus === 'upcoming' && (
                  <CountdownBlocks
                    targetMs={auction.startTimeMs}
                    nowMs={serverNowMs}
                    label="Bidding Opens In"
                  />
                )}
                {(effectiveStatus === 'ended' || effectiveStatus === 'completed') && (
                  <div className="border border-[#C9D1DC]/20 bg-[#05070D]/80 p-3.5 text-xs text-[#C9D1DC]">
                    Bidding closed on {new Date(auction.endTimeMs).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Monetary Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[#C9D1DC]/15 py-5">
                <div>
                  <p className="text-[10px] tracking-[0.18em] uppercase text-[#C9D1DC]/70">
                    {auction.bidCount > 0 ? 'Current Highest Bid' : 'Starting Bid'}
                  </p>
                  <p className="mt-1 font-mono-tabular text-2xl font-semibold text-[#D9AE61]">
                    {formatCurrencyMinor(
                      auction.bidCount > 0 ? auction.currentHighestBidMinor : auction.startingBidMinor,
                      auction.currency
                    )}
                  </p>
                  <p className="text-[11px] text-[#C9D1DC]/70">Currency: {auction.currency}</p>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.18em] uppercase text-[#C9D1DC]/70">
                    Minimum Increment
                  </p>
                  <p className="mt-1 font-mono-tabular text-xl text-white">
                    +{formatCurrencyMinor(auction.minimumIncrementMinor, auction.currency)}
                  </p>
                  <p className="text-[11px] text-[#C9D1DC]/75">
                    {auction.reservePriceMinor === 0
                      ? 'No Reserve'
                      : auction.reserveMet
                        ? 'Reserve Met'
                        : 'Reserve Not Met'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.18em] uppercase text-[#C9D1DC]/70">
                    Starting Bid
                  </p>
                  <p className="mt-1 font-mono-tabular text-sm text-white">
                    {formatCurrencyMinor(auction.startingBidMinor, auction.currency)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.18em] uppercase text-[#C9D1DC]/70">
                    Activity
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-mono-tabular text-sm text-white">
                    <Users size={13} className="text-[#3D7BFF]" aria-hidden="true" />
                    {auction.bidCount} bids · {auction.uniqueBiddersCount} bidders
                  </p>
                </div>
              </div>

              {isLeadingBidder && effectiveStatus === 'live' && (
                <div className="mt-4 flex items-center gap-2 border border-[#D9AE61]/50 bg-[#D9AE61]/15 p-3 text-xs text-[#D9AE61]">
                  <CheckCircle2 size={15} className="shrink-0" aria-hidden="true" />
                  <span>You currently hold the highest bid on this lot.</span>
                </div>
              )}

              {/* Place Bid Form */}
              <form onSubmit={handlePlaceBid} className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#C9D1DC]">Minimum Next Bid</span>
                  <span className="font-mono-tabular font-medium text-[#D9AE61]">
                    {formatCurrencyMinor(minNextMinor, auction.currency)}
                  </span>
                </div>

                {/* Quick step multipliers */}
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((mult) => {
                    const candidateMinor = minNextMinor + mult * auction.minimumIncrementMinor;
                    return (
                      <button
                        key={mult}
                        type="button"
                        disabled={!canSubmitLiveBid}
                        onClick={() => setBidMajorInput(String(toMajorUnits(candidateMinor, auction.currency)))}
                        className="border border-[#C9D1DC]/25 bg-[#05070D]/80 py-2 font-mono-tabular text-xs text-[#E6EAF0] transition-colors hover:border-[#D9AE61] disabled:opacity-45"
                      >
                        {formatCurrencyMinor(candidateMinor, auction.currency)}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label htmlFor="custom-bid-input" className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                    Your Bid ({auction.currency})
                  </label>
                  <input
                    id="custom-bid-input"
                    type="number"
                    step="any"
                    min={toMajorUnits(minNextMinor, auction.currency)}
                    disabled={!canSubmitLiveBid}
                    value={bidMajorInput}
                    onChange={(e) => setBidMajorInput(e.target.value)}
                    className="mt-1.5 w-full border border-[#C9D1DC]/30 bg-[#05070D]/90 px-4 py-3 font-mono-tabular text-base text-white focus:border-[#D9AE61] focus:outline-none disabled:opacity-50"
                  />
                </div>

                {isDemoLocked ? (
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2 border border-amber-400/40 bg-amber-500/12 py-3.5 text-xs font-medium tracking-[0.16em] uppercase text-amber-200 opacity-85"
                  >
                    <Lock size={14} aria-hidden="true" />
                    <span>Binding Bidding Locked (Demo Lot)</span>
                  </button>
                ) : !firebaseUser ? (
                  <Link
                    to={`/login?redirect=/auction/${auction.id}`}
                    className="btn-luxury-primary flex w-full items-center justify-center gap-2 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white"
                  >
                    <Lock size={14} aria-hidden="true" />
                    <span>Sign In to Place Bid</span>
                  </Link>
                ) : !firebaseUser.emailVerified ? (
                  <Link
                    to="/verify-email"
                    className="flex w-full items-center justify-center gap-2 border border-amber-400/50 bg-amber-500/15 py-3.5 text-xs font-medium tracking-[0.16em] uppercase text-amber-200"
                  >
                    <ShieldCheck size={14} aria-hidden="true" />
                    <span>Verify Email to Unlock Bidding</span>
                  </Link>
                ) : !profile?.profileCompleted ? (
                  <Link
                    to={`/complete-profile?redirect=/auction/${auction.id}`}
                    className="flex w-full items-center justify-center gap-2 border border-[#D9AE61]/60 bg-[#D9AE61]/15 py-3.5 text-xs font-medium tracking-[0.16em] uppercase text-[#D9AE61]"
                  >
                    <span>Complete Bidder Profile to Bid</span>
                  </Link>
                ) : (
                  <button
                    type="submit"
                    disabled={bidBusy || !canSubmitLiveBid}
                    className="btn-luxury-primary flex w-full items-center justify-center gap-2 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Gavel size={15} aria-hidden="true" />
                    <span>
                      {bidBusy
                        ? 'Submitting Atomic Bid...'
                        : effectiveStatus === 'live'
                          ? `Place Bid (${auction.currency})`
                          : `Bidding ${effectiveStatus}`}
                    </span>
                  </button>
                )}

                {bidFeedback && (
                  <div
                    role="status"
                    className={`flex items-start gap-2 border p-3 text-xs ${
                      bidFeedback.type === 'success'
                        ? 'border-[#D9AE61]/50 bg-[#D9AE61]/12 text-[#F5F3EF]'
                        : 'border-rose-400/45 bg-rose-950/45 text-rose-200'
                    }`}
                  >
                    {bidFeedback.type === 'success' ? (
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#D9AE61]" />
                    ) : (
                      <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-300" />
                    )}
                    <span>{bidFeedback.text}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Real-Time Bid Ledger */}
            <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/75 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-light text-white">Live Bid History</h2>
                <span className="font-mono-tabular text-xs text-[#3D7BFF]">{bids.length} recorded</span>
              </div>

              {bids.length === 0 ? (
                <p className="mt-4 text-xs text-[#C9D1DC]/70">
                  No bids have been placed on this lot yet. Be the first verified collector to open the ledger.
                </p>
              ) : (
                <ul className="mt-4 max-h-80 space-y-2.5 overflow-y-auto pr-1">
                  {bids.map((b, idx) => {
                    const isMine = firebaseUser && b.bidderId === firebaseUser.uid;
                    return (
                      <li
                        key={b.id}
                        className={`flex items-center justify-between border px-3.5 py-2.5 text-xs ${
                          idx === 0
                            ? 'border-[#D9AE61]/45 bg-[#D9AE61]/10'
                            : 'border-[#C9D1DC]/12 bg-[#05070D]/60'
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-white">
                              #{b.bidSequence} · {isMine ? 'You' : b.bidderAlias}
                            </p>
                            {b.isDemo && <DemoSimulatedBidBadge />}
                          </div>
                          <p className="text-[10px] text-[#C9D1DC]/65">
                            {b.createdAtMs ? new Date(b.createdAtMs).toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono-tabular font-semibold text-[#D9AE61]">
                            {formatCurrencyMinor(b.amountMinor, b.currency)}
                          </p>
                          {idx === 0 && (
                            <span className="text-[9px] tracking-widest uppercase text-[#D9AE61]">
                              {b.isDemo ? 'Leading (Demo)' : 'Leading'}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed Gemstone View"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05070D]/95 p-6"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom preview"
            className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center border border-[#C9D1DC]/30 bg-[#07152F] text-white"
          >
            <X size={20} />
          </button>
          <img
            src={activeImg}
            alt={auction.title}
            referrerPolicy="no-referrer"
            className="max-h-[88vh] max-w-[92vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};
