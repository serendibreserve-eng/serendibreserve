import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  Award,
  Bell,
  CheckCircle2,
  Database,
  Download,
  Edit3,
  Eye,
  Flag,
  Gavel,
  ImagePlus,
  LayoutDashboard,
  Lock,
  Plus,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import {
  createAuctionAdmin,
  deleteAuctionAdmin,
  flagBidAdmin,
  getPlatformSettings,
  savePlatformSettingsAdmin,
  subscribeAllAuctionsAdmin,
  subscribeAllBidsAdmin,
  subscribeAllSubscriptionsAdmin,
  subscribeAllUsersAdmin,
  subscribeAuditLogsAdmin,
  updateAuctionAdmin,
  updateAuctionStatusAdmin,
  updateSubscriptionStatusAdmin,
  updateUserAccountAdmin,
  uploadAuctionImageFile,
} from '../services/auctionService';
import {
  fetchDemoSeedDiagnostics,
  seedDemoAuctionCatalogAdmin,
  toggleDemoRealBiddingAdmin,
  type DemoManifestDiagnostics,
} from '../services/demoSeedService';
import {
  SUPPORTED_CURRENCIES,
  type Auction,
  type AuctionResultStatus,
  type AuctionStatus,
  type AuditLogEntry,
  type BidRecord,
  type PlatformSettings,
  type SubscriptionRecord,
  type SupportedCurrency,
  type UserProfile,
} from '../types/auction';
import {
  buildSubscriptionsCsv,
  formatCurrencyMinor,
  toMajorUnits,
  toMinorUnits,
} from '../utils/auctionLogic';
import {
  AuctionResultBadge,
  AuctionStatusBadge,
  DemoLotBadge,
  DemoSimulatedBidBadge,
} from '../components/AuctionBadgesAndTimer';
import { DEMO_AUCTION_BLUEPRINTS, DEMO_LOT_01_BID_BLUEPRINTS } from '../content/demoSeedAuctions';
import { PageSEO } from '../components/PageSEO';
import { GEMS_DATA } from '../content/gems';

type AdminSection =
  | 'overview'
  | 'auctions'
  | 'create'
  | 'edit'
  | 'bids'
  | 'users'
  | 'subscribers'
  | 'results'
  | 'notifications'
  | 'settings';

function resolveAdminSection(pathname: string): AdminSection {
  if (pathname.includes('/admin/auctions/create')) return 'create';
  if (pathname.includes('/admin/auctions/edit/')) return 'edit';
  if (pathname.endsWith('/admin/auctions')) return 'auctions';
  if (pathname.endsWith('/admin/bids')) return 'bids';
  if (pathname.endsWith('/admin/users')) return 'users';
  if (pathname.endsWith('/admin/subscribers')) return 'subscribers';
  if (pathname.endsWith('/admin/results')) return 'results';
  if (pathname.endsWith('/admin/notifications')) return 'notifications';
  if (pathname.endsWith('/admin/settings')) return 'settings';
  return 'overview';
}

function toDatetimeLocalValue(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const AdminDashboardPage: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auctionId: editAuctionId } = useParams();
  const section = resolveAdminSection(pathname);

  const { authReady, firebaseUser, profile, isAdmin } = useAuth();

  const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
  const [adminAuctionsLoaded, setAdminAuctionsLoaded] = useState(false);
  const autoSeedTriggeredRef = useRef(false);
  const [allBids, setAllBids] = useState<BidRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allSubs, setAllSubs] = useState<SubscriptionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [demoDiagnostics, setDemoDiagnostics] = useState<DemoManifestDiagnostics | null>(null);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  // Filters
  const [subSearch, setSubSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Notification Broadcast Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifAuctionId, setNotifAuctionId] = useState('');
  const [notifSending, setNotifSending] = useState(false);

  useEffect(() => {
    if (!authReady || !isAdmin) return;
    const u1 = subscribeAllAuctionsAdmin((items) => {
      setAllAuctions(items);
      setAdminAuctionsLoaded(true);
    });
    const u2 = subscribeAllBidsAdmin(setAllBids);
    const u3 = subscribeAllUsersAdmin(setAllUsers);
    const u4 = subscribeAllSubscriptionsAdmin(setAllSubs);
    const u5 = subscribeAuditLogsAdmin(setAuditLogs);
    void getPlatformSettings().then(setSettings);
    void fetchDemoSeedDiagnostics().then(setDemoDiagnostics);
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, [authReady, isAdmin]);

  useEffect(() => {
    if (
      !authReady ||
      !isAdmin ||
      !profile ||
      !adminAuctionsLoaded ||
      allAuctions.length > 0 ||
      autoSeedTriggeredRef.current
    ) {
      return;
    }
    autoSeedTriggeredRef.current = true;
    setSeedingDemo(true);
    void seedDemoAuctionCatalogAdmin(profile)
      .then((res) => {
        if (res.auctionsCreated > 0 || res.bidsCreated > 0) {
          setFeedback(
            `Initial demonstration catalog seeded idempotently: ${res.auctionsCreated} lots and ${res.bidsCreated} simulated bids created.`
          );
        }
      })
      .catch((err) => {
        setFeedback(err instanceof Error ? err.message : 'Unable to initialize demonstration lots.');
      })
      .finally(() => {
        setSeedingDemo(false);
      });
  }, [authReady, isAdmin, profile, adminAuctionsLoaded, allAuctions.length]);

  if (!authReady) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-[#05070D] pt-20 text-xs uppercase tracking-widest text-[#C9D1DC]">
        Verifying Administrative Clearance...
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(pathname)}`} replace />;
  }

  if (!isAdmin || !profile) {
    return (
      <div className="min-h-[75vh] bg-[#07152F] px-4 pb-20 pt-32 text-center">
        <div className="mx-auto max-w-md border border-rose-400/40 bg-[#05070D]/90 p-8">
          <ShieldAlert size={32} className="mx-auto text-rose-300" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl font-light text-white">
            Administrator Access Required
          </h1>
          <p className="mt-2 text-xs text-[#C9D1DC]/80">
            This console is strictly restricted to verified Serendib Reserve administrators.
          </p>
          <Link to="/" className="btn-luxury mt-6 inline-block px-6 py-2.5 text-xs uppercase tracking-widest text-white">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: AdminSection; label: string; to: string; icon: React.FC<{ size?: number }> }> = [
    { id: 'overview', label: 'Overview', to: '/admin', icon: LayoutDashboard },
    { id: 'auctions', label: 'Auctions', to: '/admin/auctions', icon: Gavel },
    { id: 'create', label: 'Create Lot', to: '/admin/auctions/create', icon: Plus },
    { id: 'bids', label: 'Bids & Audit', to: '/admin/bids', icon: Activity },
    { id: 'users', label: 'Users', to: '/admin/users', icon: Users },
    { id: 'subscribers', label: 'Subscribers', to: '/admin/subscribers', icon: Download },
    { id: 'results', label: 'Results', to: '/admin/results', icon: Award },
    { id: 'notifications', label: 'Notifications', to: '/admin/notifications', icon: Bell },
    { id: 'settings', label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const handleExportCsv = () => {
    const csv = buildSubscriptionsCsv(allSubs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serendib-reserve-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMsg.trim()) return;
    setNotifSending(true);
    setFeedback('');
    try {
      const verifiedUsers = allUsers.filter((u) => u.emailVerified && u.accountStatus === 'active');
      await Promise.all(
        verifiedUsers.map((u) => {
          const ref = doc(collection(db, 'notifications'));
          return setDoc(ref, {
            userId: u.uid,
            auctionId: notifAuctionId.trim(),
            type: 'new_auction',
            title: notifTitle.trim().slice(0, 160),
            message: notifMsg.trim().slice(0, 600),
            read: false,
            createdAt: serverTimestamp(),
          });
        })
      );

      // Trigger optional server transactional email relay for subscribers
      const token = await auth.currentUser?.getIdToken();
      if (token && allSubs.some((s) => s.status === 'active')) {
        await fetch('/api/notify/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to: profile.email,
            subject: `[Dispatch Preview] ${notifTitle.trim()}`,
            text: notifMsg.trim(),
          }),
        }).catch(() => undefined);
      }

      setNotifTitle('');
      setNotifMsg('');
      setNotifAuctionId('');
      setFeedback(`Dispatched in-app notification to ${verifiedUsers.length} active collector accounts.`);
    } finally {
      setNotifSending(false);
    }
  };

  const liveCount = allAuctions.filter((a) => a.status === 'live').length;
  const upcomingCount = allAuctions.filter((a) => a.status === 'upcoming').length;
  const completedCount = allAuctions.filter((a) => a.status === 'completed' || a.status === 'ended').length;

  const demoAuctionIds = useMemo(
    () => new Set(DEMO_AUCTION_BLUEPRINTS.map((bp) => bp.id)),
    []
  );
  const seededDemoAuctionsCount = useMemo(
    () => allAuctions.filter((a) => demoAuctionIds.has(a.id)).length,
    [allAuctions, demoAuctionIds]
  );
  const demoBidIds = useMemo(
    () => new Set(DEMO_LOT_01_BID_BLUEPRINTS.map((bp) => bp.id)),
    []
  );
  const seededDemoBidsCount = useMemo(
    () => allBids.filter((b) => demoBidIds.has(b.id)).length,
    [allBids, demoBidIds]
  );

  const handleSeedDemoCatalog = async () => {
    if (!profile) return;
    setSeedingDemo(true);
    setFeedback('');
    try {
      const res = await seedDemoAuctionCatalogAdmin(profile);
      setFeedback(
        `Idempotent demo seed complete: created ${res.auctionsCreated} lots (${res.auctionsSkipped} already present skipped) and ${res.bidsCreated} simulated Lot-01 bids (${res.bidsSkipped} skipped).`
      );
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to seed demonstration lots.');
    } finally {
      setSeedingDemo(false);
    }
  };

  const editingAuction =
    section === 'edit' && editAuctionId
      ? allAuctions.find((a) => a.id === editAuctionId) || null
      : null;

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-24">
      <PageSEO title="Admin Control Panel — Serendib Reserve" description="Manage Serendib Reserve auctions, bids, users, subscribers, and completed results." />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9AE61]/25 pb-6">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-[#D9AE61]">
              <Shield size={13} aria-hidden="true" />
              Serendib Reserve · Admin Control Room
            </p>
            <h1 className="mt-1 font-display text-3xl font-light text-white sm:text-4xl">
              Auction House Operations
            </h1>
          </div>
          <Link
            to="/admin/auctions/create"
            className="btn-luxury-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-[0.18em] uppercase text-white"
          >
            <Plus size={14} aria-hidden="true" />
            <span>New Auction Lot</span>
          </Link>
        </div>

        {/* Admin Subnav */}
        <div className="mt-5 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`inline-flex items-center gap-2 border px-3.5 py-2 text-xs tracking-[0.12em] uppercase transition-colors ${
                  active
                    ? 'border-[#D9AE61] bg-[#102D69] text-[#D9AE61]'
                    : 'border-[#C9D1DC]/20 bg-[#07152F]/60 text-[#C9D1DC] hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {feedback && (
          <div className="mt-5 flex items-center justify-between border border-[#D9AE61]/50 bg-[#D9AE61]/12 px-4 py-3 text-xs text-[#F5F3EF]">
            <span>{feedback}</span>
            <button type="button" onClick={() => setFeedback('')} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        )}

        {/* OVERVIEW */}
        {section === 'overview' && (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ['Live Auctions', liveCount],
                ['Upcoming Lots', upcomingCount],
                ['Completed Lots', completedCount],
                ['Total Recorded Bids', allBids.length],
                ['Registered Collectors', allUsers.length],
                ['Verified Active Users', allUsers.filter((u) => u.emailVerified && u.accountStatus === 'active').length],
                ['Alert Subscribers', allSubs.filter((s) => s.status === 'active').length],
                ['Draft Lots', allAuctions.filter((a) => a.status === 'draft').length],
              ].map(([label, val]) => (
                <div key={String(label)} className="border border-[#C9D1DC]/18 bg-[#07152F]/70 p-5">
                  <p className="text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/70">{label}</p>
                  <p className="mt-2 font-mono-tabular text-3xl font-light text-[#D9AE61]">{val}</p>
                </div>
              ))}
            </div>

            {/* Demonstration Catalog & Idempotent Database Seeding */}
            <div className="border border-amber-400/35 bg-[#07152F]/75 p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-200">
                    <Sparkles size={13} aria-hidden="true" />
                    Demonstration Catalog & Governance
                  </p>
                  <h2 className="font-display text-2xl font-light text-white">
                    Sample Gemstone Lots & Multi-Angle WebP Media
                  </h2>
                  <p className="max-w-3xl text-xs leading-relaxed text-[#C9D1DC]/80">
                    Safely seed all 9 demonstration auction lots (1 Live flagship Sapphire with 7 simulated bids, 6 Upcoming releases, 2 Completed results) anchored to the Colombo server clock. Idempotent: existing production or previously seeded lots are never overwritten or deleted, and binding user bidding remains locked per demo lot until explicitly activated.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2 text-[11px] font-mono-tabular">
                    <span className="border border-[#C9D1DC]/20 bg-[#05070D]/75 px-3 py-1 text-[#E6EAF0]">
                      Demo Lots in DB: <strong className="text-[#D9AE61]">{seededDemoAuctionsCount} / 9</strong>
                    </span>
                    <span className="border border-[#C9D1DC]/20 bg-[#05070D]/75 px-3 py-1 text-[#E6EAF0]">
                      Lot-01 Demo Bids: <strong className="text-[#D9AE61]">{seededDemoBidsCount} / 7</strong>
                    </span>
                    <span className="border border-[#C9D1DC]/20 bg-[#05070D]/75 px-3 py-1 text-[#E6EAF0]">
                      Studio WebP Assets:{' '}
                      <strong className={demoDiagnostics?.allAssetsReady ? 'text-emerald-300' : 'text-amber-200'}>
                        {demoDiagnostics ? `${demoDiagnostics.assets.filter((a) => a.exists).length} / ${demoDiagnostics.imageCount}` : '12 / 12'}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={seedingDemo}
                    onClick={() => void handleSeedDemoCatalog()}
                    className="btn-luxury-primary inline-flex items-center gap-2 px-5 py-3 text-xs font-medium tracking-[0.16em] uppercase text-white disabled:opacity-60"
                  >
                    <Database size={14} aria-hidden="true" />
                    <span>
                      {seedingDemo
                        ? 'Seeding Demo Lots...'
                        : seededDemoAuctionsCount >= 9
                          ? 'Verify / Sync Missing Demo Lots'
                          : 'Seed 9 Demo Auctions & 7 Bids'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
                <h2 className="font-display text-2xl font-light text-white">Recent Bids</h2>
                <div className="mt-4 space-y-2.5">
                  {allBids.slice(0, 6).map((b) => (
                    <div key={b.id} className="flex items-center justify-between border border-[#C9D1DC]/12 bg-[#05070D]/60 px-3 py-2 text-xs">
                      <span className="flex flex-wrap items-center gap-2">
                        <span>{b.bidderAlias}</span>
                        <span className="text-[#C9D1DC]/70">· {b.auctionId}</span>
                        {b.isDemo && <DemoSimulatedBidBadge />}
                      </span>
                      <span className="font-mono-tabular text-[#D9AE61]">
                        {formatCurrencyMinor(b.amountMinor, b.currency)}
                      </span>
                    </div>
                  ))}
                  {allBids.length === 0 && (
                    <p className="text-xs text-[#C9D1DC]/70">No bids recorded yet.</p>
                  )}
                </div>
              </div>

              <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
                <h2 className="font-display text-2xl font-light text-white">Audit Trail</h2>
                <div className="mt-4 space-y-2.5">
                  {auditLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="border border-[#C9D1DC]/12 bg-[#05070D]/60 px-3 py-2 text-xs">
                      <p className="font-medium text-white">
                        {log.action} · <span className="text-[#D9AE61]">{log.targetId}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#C9D1DC]/75">{log.details}</p>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-xs text-[#C9D1DC]/70">Administrative actions will log here automatically.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUCTIONS CRUD LIST */}
        {section === 'auctions' && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-amber-400/25 bg-[#07152F]/60 px-5 py-3.5 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-[#C9D1DC]">
                <Database size={14} className="text-amber-200" aria-hidden="true" />
                <span>
                  Demo Catalog Status:{' '}
                  <strong className="text-white">{seededDemoAuctionsCount} / 9 lots</strong> ·{' '}
                  <strong className="text-white">{seededDemoBidsCount} / 7 simulated bids</strong>
                </span>
              </div>
              <button
                type="button"
                disabled={seedingDemo}
                onClick={() => void handleSeedDemoCatalog()}
                className="border border-amber-400/50 bg-amber-500/15 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-amber-200 hover:bg-amber-500/25 disabled:opacity-50"
              >
                {seedingDemo ? 'Seeding...' : 'Seed Demo Auctions & Bids (Idempotent)'}
              </button>
            </div>

            {allAuctions.length === 0 ? (
              <div className="border border-[#C9D1DC]/15 bg-[#07152F]/60 p-10 text-center">
                <p className="text-sm text-[#C9D1DC]">No auction lots created yet.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    disabled={seedingDemo}
                    onClick={() => void handleSeedDemoCatalog()}
                    className="btn-luxury px-5 py-2.5 text-xs uppercase tracking-widest text-amber-200"
                  >
                    {seedingDemo ? 'Seeding...' : 'Seed 9 Demo Auctions'}
                  </button>
                  <Link to="/admin/auctions/create" className="btn-luxury-primary inline-block px-5 py-2.5 text-xs uppercase tracking-widest text-white">
                    Create First Auction Lot
                  </Link>
                </div>
              </div>
            ) : (
              allAuctions.map((lot) => (
                <div
                  key={lot.id}
                  className="flex flex-col justify-between gap-4 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-5 lg:flex-row lg:items-center"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={lot.images[0]}
                      alt={lot.title}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 border border-[#C9D1DC]/20 bg-[#05070D] object-contain p-1"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <AuctionStatusBadge status={lot.status} />
                        {lot.isDemo && (
                          <DemoLotBadge activeBidding={lot.demoBiddingActive} />
                        )}
                        <span className="font-mono-tabular text-xs text-[#C9D1DC]/75">{lot.lotCode}</span>
                        {lot.featured && (
                          <span className="border border-[#D9AE61]/45 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#D9AE61]">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-display text-2xl font-light text-white">{lot.title}</h3>
                      <p className="text-xs text-[#C9D1DC]/75">
                        {lot.gemstoneType} · {lot.caratWeight.toFixed(2)} ct · Current:{' '}
                        <span className="font-mono-tabular text-[#D9AE61]">
                          {formatCurrencyMinor(
                            lot.bidCount > 0 ? lot.currentHighestBidMinor : lot.startingBidMinor,
                            lot.currency
                          )}
                        </span>{' '}
                        ({lot.bidCount} bids)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/auction/${lot.id}`}
                      className="inline-flex items-center gap-1 border border-[#C9D1DC]/25 px-3 py-1.5 text-[11px] uppercase tracking-wider text-white"
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </Link>
                    <Link
                      to={`/admin/auctions/edit/${lot.id}`}
                      className="inline-flex items-center gap-1 border border-[#3D7BFF]/45 bg-[#102D69]/60 px-3 py-1.5 text-[11px] uppercase tracking-wider text-white"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </Link>
                    {lot.status !== 'live' && lot.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() =>
                          void updateAuctionStatusAdmin({
                            adminUser: profile,
                            auctionId: lot.id,
                            status: 'live',
                          }).then(() => setFeedback(`Lot ${lot.lotCode} is now LIVE.`))
                        }
                        className="border border-[#D9AE61] bg-[#D9AE61]/15 px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#D9AE61]"
                      >
                        Start Live
                      </button>
                    )}
                    {lot.status === 'live' && (
                      <button
                        type="button"
                        onClick={() =>
                          void updateAuctionStatusAdmin({
                            adminUser: profile,
                            auctionId: lot.id,
                            status: 'paused',
                          }).then(() => setFeedback(`Lot ${lot.lotCode} paused.`))
                        }
                        className="border border-amber-400/50 px-3 py-1.5 text-[11px] uppercase tracking-wider text-amber-200"
                      >
                        Pause
                      </button>
                    )}
                    {(lot.status === 'live' || lot.status === 'paused' || lot.status === 'ended') && (
                      <button
                        type="button"
                        onClick={() =>
                          void updateAuctionStatusAdmin({
                            adminUser: profile,
                            auctionId: lot.id,
                            status: 'completed',
                          }).then(() => setFeedback(`Lot ${lot.lotCode} closed & published to Results.`))
                        }
                        className="border border-[#3D7BFF] px-3 py-1.5 text-[11px] uppercase tracking-wider text-white"
                      >
                        Close & Publish
                      </button>
                    )}
                    {lot.isDemo && lot.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() =>
                          void toggleDemoRealBiddingAdmin(
                            profile,
                            lot.id,
                            !lot.demoBiddingActive
                          ).then(() =>
                            setFeedback(
                              !lot.demoBiddingActive
                                ? `Activated binding collector bidding on demo lot ${lot.lotCode}.`
                                : `Locked demo lot ${lot.lotCode} (showcase mode).`
                            )
                          )
                        }
                        className={`inline-flex items-center gap-1 border px-3 py-1.5 text-[11px] uppercase tracking-wider ${
                          lot.demoBiddingActive
                            ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                            : 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200'
                        }`}
                      >
                        {lot.demoBiddingActive ? <Lock size={11} /> : <Unlock size={11} />}
                        <span>
                          {lot.demoBiddingActive ? 'Lock Demo Bidding' : 'Activate Real Bidding'}
                        </span>
                      </button>
                    )}
                    {lot.bidCount === 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          void deleteAuctionAdmin(profile, lot.id).then(() =>
                            setFeedback(`Deleted lot ${lot.lotCode}.`)
                          )
                        }
                        className="inline-flex items-center gap-1 border border-rose-400/40 px-3 py-1.5 text-[11px] uppercase tracking-wider text-rose-200"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CREATE OR EDIT AUCTION FORM */}
        {(section === 'create' || section === 'edit') && (
          <AuctionEditorForm
            adminUser={profile}
            initialAuction={editingAuction}
            onSaved={(id) => {
              setFeedback(
                section === 'create'
                  ? `Auction lot created successfully.`
                  : `Auction lot updated.`
              );
              navigate(`/admin/auctions`);
              void id;
            }}
          />
        )}

        {/* BIDS & AUDIT */}
        {section === 'bids' && (
          <div className="mt-8 space-y-6">
            <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
              <h2 className="font-display text-2xl font-light text-white">Real-Time Bid Monitor</h2>
              <div className="mt-4 space-y-2.5">
                {allBids.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-3 border border-[#C9D1DC]/15 bg-[#05070D]/75 px-4 py-3 text-xs"
                  >
                    <div>
                      <p className="flex flex-wrap items-center gap-2 font-medium text-white">
                        <span>{b.auctionId} · Bid #{b.bidSequence} · {b.bidderAlias}</span>
                        {b.isDemo && <DemoSimulatedBidBadge />}
                      </p>
                      <p className="text-[11px] text-[#C9D1DC]/70">
                        Status: <span className="uppercase text-[#D9AE61]">{b.status}</span>
                        {b.flaggedReason ? ` — ${b.flaggedReason}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-tabular text-sm font-semibold text-[#D9AE61]">
                        {formatCurrencyMinor(b.amountMinor, b.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void flagBidAdmin({
                            adminUser: profile,
                            bidId: b.id,
                            status: b.status === 'flagged' ? 'valid' : 'flagged',
                            flaggedReason: b.status === 'flagged' ? '' : 'Flagged for admin compliance review',
                          })
                        }
                        className="inline-flex items-center gap-1 border border-amber-400/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-amber-200"
                      >
                        <Flag size={11} />
                        <span>{b.status === 'flagged' ? 'Clear Flag' : 'Flag'}</span>
                      </button>
                    </div>
                  </div>
                ))}
                {allBids.length === 0 && (
                  <p className="text-xs text-[#C9D1DC]/70">No bids recorded across any lots.</p>
                )}
              </div>
            </div>

            <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
              <h2 className="font-display text-2xl font-light text-white">Audit Log</h2>
              <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border border-[#C9D1DC]/12 bg-[#05070D]/70 px-3 py-2 text-xs">
                    <span className="font-mono-tabular text-[#D9AE61]">{log.action}</span> ·{' '}
                    <span className="text-white">{log.actorEmail}</span> ·{' '}
                    <span className="text-[#C9D1DC]/80">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS MANAGEMENT */}
        {section === 'users' && (
          <div className="mt-8 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-light text-white">Registered Collectors</h2>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name, email, nationality..."
                className="border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3.5 py-2 text-xs text-white focus:border-[#D9AE61] focus:outline-none"
              />
            </div>

            <div className="mt-5 space-y-3">
              {allUsers
                .filter((u) => {
                  const q = userSearch.trim().toLowerCase();
                  if (!q) return true;
                  return `${u.fullName} ${u.email} ${u.nationality} ${u.companyName}`.toLowerCase().includes(q);
                })
                .map((u) => (
                  <div
                    key={u.uid}
                    className="flex flex-col justify-between gap-3 border border-[#C9D1DC]/15 bg-[#05070D]/75 p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {u.fullName}{' '}
                        <span className="ml-2 border border-[#D9AE61]/40 px-2 py-0.5 text-[10px] uppercase text-[#D9AE61]">
                          {u.role}
                        </span>
                      </p>
                      <p className="text-xs text-[#C9D1DC]/80">
                        {u.email} · {u.contactNumber || 'No phone'} · {u.nationality || 'No country'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#C9D1DC]/65">
                        Email Verified: {u.emailVerified ? 'Yes' : 'No'} · Status: {u.accountStatus}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {u.accountStatus !== 'active' && (
                        <button
                          type="button"
                          onClick={() =>
                            void updateUserAccountAdmin({
                              adminUser: profile,
                              targetUid: u.uid,
                              accountStatus: 'active',
                              role: u.role,
                            })
                          }
                          className="border border-[#D9AE61]/55 px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#D9AE61]"
                        >
                          Activate
                        </button>
                      )}
                      {u.accountStatus !== 'suspended' && u.uid !== profile.uid && (
                        <button
                          type="button"
                          onClick={() =>
                            void updateUserAccountAdmin({
                              adminUser: profile,
                              targetUid: u.uid,
                              accountStatus: 'suspended',
                              role: u.role,
                            })
                          }
                          className="border border-rose-400/45 px-3 py-1.5 text-[11px] uppercase tracking-wider text-rose-200"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SUBSCRIBERS */}
        {section === 'subscribers' && (
          <div className="mt-8 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-light text-white">
                Auction Alert Subscribers ({allSubs.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  placeholder="Filter by email..."
                  className="border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-xs text-white focus:border-[#D9AE61] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="btn-luxury-primary inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider text-white"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {allSubs
                .filter((s) => s.email.toLowerCase().includes(subSearch.trim().toLowerCase()))
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 border border-[#C9D1DC]/15 bg-[#05070D]/75 px-4 py-3 text-xs"
                  >
                    <div>
                      <p className="font-medium text-white">{s.email}</p>
                      <p className="text-[11px] text-[#C9D1DC]/65">
                        Source: {s.source} · {new Date(s.createdAtMs).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void updateSubscriptionStatusAdmin(
                          s.id,
                          s.status === 'active' ? 'unsubscribed' : 'active'
                        )
                      }
                      className={`border px-3 py-1 text-[10px] uppercase tracking-wider ${
                        s.status === 'active'
                          ? 'border-[#D9AE61]/50 text-[#D9AE61]'
                          : 'border-[#C9D1DC]/25 text-[#C9D1DC]/70'
                      }`}
                    >
                      {s.status}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* COMPLETED RESULTS */}
        {section === 'results' && (
          <div className="mt-8 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
            <h2 className="font-display text-2xl font-light text-white">
              Completed Auction Outcomes
            </h2>
            <div className="mt-5 space-y-3">
              {allAuctions
                .filter((a) => a.status === 'completed' || a.status === 'ended' || a.status === 'cancelled')
                .map((lot) => (
                  <div
                    key={lot.id}
                    className="flex flex-wrap items-center justify-between gap-4 border border-[#C9D1DC]/15 bg-[#05070D]/75 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <AuctionStatusBadge status={lot.status} />
                        <AuctionResultBadge resultStatus={lot.resultStatus} />
                      </div>
                      <h3 className="mt-2 font-display text-2xl font-light text-white">{lot.title}</h3>
                      <p className="text-xs text-[#C9D1DC]/75">
                        Winner Alias: {lot.highestBidderAlias || 'No bids'} · Final Bid:{' '}
                        <span className="font-mono-tabular text-[#D9AE61]">
                          {formatCurrencyMinor(lot.currentHighestBidMinor, lot.currency)}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['sold', 'unsold', 'reserve_not_met'] as AuctionResultStatus[]).map((resSt) => (
                        <button
                          key={resSt}
                          type="button"
                          onClick={() =>
                            void updateAuctionStatusAdmin({
                              adminUser: profile,
                              auctionId: lot.id,
                              status: 'completed',
                              resultStatus: resSt,
                            }).then(() => setFeedback(`Result for ${lot.lotCode} set to ${resSt}.`))
                          }
                          className={`border px-3 py-1.5 text-[10px] uppercase tracking-wider ${
                            lot.resultStatus === resSt
                              ? 'border-[#D9AE61] bg-[#D9AE61]/20 text-[#D9AE61]'
                              : 'border-[#C9D1DC]/25 text-[#C9D1DC]'
                          }`}
                        >
                          Mark {resSt.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* NOTIFICATION DISPATCH */}
        {section === 'notifications' && (
          <form
            onSubmit={handleBroadcastNotification}
            className="mt-8 max-w-2xl space-y-4 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6"
          >
            <h2 className="font-display text-2xl font-light text-white">
              Dispatch Collector Notification
            </h2>
            <p className="text-xs text-[#C9D1DC]/80">
              Send real-time in-app alerts to all verified collector accounts (and trigger optional email dispatch when configured).
            </p>
            <div>
              <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                Title *
              </label>
              <input
                type="text"
                required
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g., 6.20ct Royal Blue Sapphire Opens Tonight"
                className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                Link Auction Lot (Optional)
              </label>
              <select
                value={notifAuctionId}
                onChange={(e) => setNotifAuctionId(e.target.value)}
                className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
              >
                <option value="">General Announcement</option>
                {allAuctions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.lotCode} — {a.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                Message *
              </label>
              <textarea
                rows={4}
                required
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={notifSending}
              className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.18em] text-white"
            >
              <Send size={14} />
              <span>{notifSending ? 'Sending...' : 'Send Notification'}</span>
            </button>
          </form>
        )}

        {/* SETTINGS */}
        {section === 'settings' && settings && (
          <SettingsForm
            initial={settings}
            onSave={async (next) => {
              await savePlatformSettingsAdmin(profile, next);
              setSettings((s) => (s ? { ...s, ...next } : s));
              setFeedback('Platform settings saved.');
            }}
          />
        )}
      </div>
    </div>
  );
};

const AuctionEditorForm: React.FC<{
  adminUser: UserProfile;
  initialAuction: Auction | null;
  onSaved: (id: string) => void;
}> = ({ adminUser, initialAuction, onSaved }) => {
  const now = Date.now();
  const [lotCode, setLotCode] = useState(
    initialAuction?.lotCode || `SR-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 899))}`
  );
  const [title, setTitle] = useState(initialAuction?.title || '');
  const [gemstoneType, setGemstoneType] = useState(initialAuction?.gemstoneType || 'Royal Blue Sapphire');
  const [origin, setOrigin] = useState(initialAuction?.origin || 'Ratnapura, Sri Lanka');
  const [caratWeight, setCaratWeight] = useState(String(initialAuction?.caratWeight || '3.50'));
  const [cutShape, setCutShape] = useState(initialAuction?.cutShape || 'Cushion');
  const [colorGrade, setColorGrade] = useState(initialAuction?.colorGrade || 'Royal Blue');
  const [clarity, setClarity] = useState(initialAuction?.clarity || 'Eye Clean / VVS');
  const [treatment, setTreatment] = useState(initialAuction?.treatment || 'Unheated (No Heat)');
  const [certification, setCertification] = useState(initialAuction?.certification || 'GIA');
  const [certificateNumber, setCertificateNumber] = useState(initialAuction?.certificateNumber || '');
  const [dimensions, setDimensions] = useState(initialAuction?.dimensions || '');
  const [description, setDescription] = useState(initialAuction?.description || '');
  const [currency, setCurrency] = useState<SupportedCurrency>(initialAuction?.currency || 'USD');
  const [startingBidMajor, setStartingBidMajor] = useState(
    initialAuction ? String(toMajorUnits(initialAuction.startingBidMinor, initialAuction.currency)) : '5000'
  );
  const [incrementMajor, setIncrementMajor] = useState(
    initialAuction ? String(toMajorUnits(initialAuction.minimumIncrementMinor, initialAuction.currency)) : '250'
  );
  const [reserveMajor, setReserveMajor] = useState(
    initialAuction ? String(toMajorUnits(initialAuction.reservePriceMinor, initialAuction.currency)) : '0'
  );
  const [showReservePrice, setShowReservePrice] = useState(initialAuction?.showReservePrice ?? false);
  const [status, setStatus] = useState<AuctionStatus>(initialAuction?.status || 'live');
  const [featured, setFeatured] = useState(initialAuction?.featured ?? true);
  const [isDemo, setIsDemo] = useState(initialAuction?.isDemo ?? false);
  const [demoBiddingActive, setDemoBiddingActive] = useState(
    initialAuction?.demoBiddingActive ?? false
  );
  const [startLocal, setStartLocal] = useState(
    toDatetimeLocalValue(initialAuction?.startTimeMs || now - 60_000)
  );
  const [endLocal, setEndLocal] = useState(
    toDatetimeLocalValue(initialAuction?.endTimeMs || now + 72 * 3600_000)
  );
  const [liveStreamUrl, setLiveStreamUrl] = useState(initialAuction?.liveStreamUrl || '');
  const [auctionRules, setAuctionRules] = useState(
    initialAuction?.auctionRules ||
      'Bids are binding commitments in the listed lot currency. Insured worldwide dispatch from Colombo upon wire settlement.'
  );
  const [images, setImages] = useState<string[]>(
    initialAuction?.images.length
      ? initialAuction.images
      : ['/assets/aistudio/Royal_Blue_Sapphire_from_Sri_Lanka__Ceylon__1d3f139f.png']
  );
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadAuctionImageFile(file);
        uploadedUrls.push(url);
      }
      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const startTimeMs = new Date(startLocal).getTime();
    const endTimeMs = new Date(endLocal).getTime();
    if (!Number.isFinite(startTimeMs) || !Number.isFinite(endTimeMs) || endTimeMs <= startTimeMs) {
      setError('End date/time must be strictly after Start date/time.');
      return;
    }
    if (images.length === 0) {
      setError('At least one gemstone photograph is required.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please enter at least 10 characters for gemstone description.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        lotCode,
        title,
        gemstoneType,
        origin,
        caratWeight: Number(caratWeight) || 1,
        cutShape,
        colorGrade,
        clarity,
        treatment,
        certification,
        certificateNumber,
        dimensions,
        description,
        currency,
        startingBidMinor: toMinorUnits(startingBidMajor, currency),
        minimumIncrementMinor: Math.max(100, toMinorUnits(incrementMajor, currency)),
        reservePriceMinor: toMinorUnits(reserveMajor || '0', currency),
        showReservePrice,
        status,
        resultStatus: initialAuction?.resultStatus || ('pending' as const),
        startTimeMs,
        endTimeMs,
        featured,
        liveStreamUrl,
        auctionRules,
        images,
        isDemo,
        demoBiddingActive: isDemo ? demoBiddingActive : false,
      };

      if (initialAuction) {
        await updateAuctionAdmin(adminUser, initialAuction.id, payload);
        onSaved(initialAuction.id);
      } else {
        const id = await createAuctionAdmin(adminUser, payload);
        onSaved(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save auction lot.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid grid-cols-1 gap-6 border border-[#D9AE61]/25 bg-[#0A1226]/75 p-6 sm:p-8 lg:grid-cols-12"
    >
      <div className="space-y-4 lg:col-span-8">
        <h2 className="font-display text-2xl font-light text-white">
          {initialAuction ? `Edit Lot ${initialAuction.lotCode}` : 'Create New Gemstone Auction Lot'}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Lot Code *</label>
            <input
              type="text"
              required
              value={lotCode}
              onChange={(e) => setLotCode(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Lot Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 4.82ct Unheated Ceylon Royal Blue Sapphire"
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Gemstone Type *</label>
            <input
              type="text"
              required
              value={gemstoneType}
              onChange={(e) => setGemstoneType(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Origin *</label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Carat Weight *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={caratWeight}
              onChange={(e) => setCaratWeight(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Cut / Shape *</label>
            <input
              type="text"
              required
              value={cutShape}
              onChange={(e) => setCutShape(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Colour Grade *</label>
            <input
              type="text"
              required
              value={colorGrade}
              onChange={(e) => setColorGrade(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Clarity *</label>
            <input
              type="text"
              required
              value={clarity}
              onChange={(e) => setClarity(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Treatment *</label>
            <input
              type="text"
              required
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Certification Lab *</label>
            <input
              type="text"
              required
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Certificate No.</label>
            <input
              type="text"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Dimensions</label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="10.2 x 8.4 x 5.9 mm"
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">YouTube / Vimeo Live Stream URL</label>
            <input
              type="url"
              value={liveStreamUrl}
              onChange={(e) => setLiveStreamUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Lot Description *</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe provenance, colour zoning, pleochroism, and faceting quality..."
            className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Auction Rules</label>
          <textarea
            rows={2}
            value={auctionRules}
            onChange={(e) => setAuctionRules(e.target.value)}
            className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      {/* Right Pricing, Schedule & Gallery Upload */}
      <div className="space-y-5 lg:col-span-4">
        <div className="space-y-3 border border-[#C9D1DC]/15 bg-[#05070D]/75 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AE61]">
            Pricing & Schedule
          </h3>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Currency *</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226] px-3 py-2 text-sm text-white"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#C9D1DC]">Starting Bid *</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={startingBidMajor}
                onChange={(e) => setStartingBidMajor(e.target.value)}
                className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226] px-3 py-2 font-mono-tabular text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#C9D1DC]">Min Increment *</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={incrementMajor}
                onChange={(e) => setIncrementMajor(e.target.value)}
                className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226] px-3 py-2 font-mono-tabular text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#C9D1DC]">
              Reserve Price (0 = No Reserve)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={reserveMajor}
              onChange={(e) => setReserveMajor(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226] px-3 py-2 font-mono-tabular text-sm text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-[#C9D1DC]">
            <input
              type="checkbox"
              checked={showReservePrice}
              onChange={(e) => setShowReservePrice(e.target.checked)}
              className="accent-[#244DCE]"
            />
            <span>Display reserve amount publicly</span>
          </label>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#C9D1DC]">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AuctionStatus)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226] px-3 py-2 text-sm text-white"
            >
              <option value="draft">Draft (Admin Only)</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live Now</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-[#D9AE61]">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-[#D9AE61]"
            />
            <span>Feature on Homepage Spotlight</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-amber-200">
            <input
              type="checkbox"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              className="accent-amber-400"
            />
            <span>Mark as Demonstration Lot (DEMO)</span>
          </label>

          {isDemo && initialAuction && (
            <label className="flex items-center gap-2 text-xs text-emerald-200">
              <input
                type="checkbox"
                checked={demoBiddingActive}
                onChange={(e) => setDemoBiddingActive(e.target.checked)}
                className="accent-emerald-400"
              />
              <span>Activate Real Collector Bidding on Demo Lot</span>
            </label>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#C9D1DC]">Start Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226] px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#C9D1DC]">End Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226] px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Multi-image upload & House gallery selector */}
        <div className="space-y-3 border border-[#C9D1DC]/15 bg-[#05070D]/75 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D9AE61]">
            Gemstone Photographs ({images.length}/12)
          </h3>

          <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-[#D9AE61]/45 bg-[#0A1226]/70 py-3 text-xs text-[#D9AE61] hover:bg-[#102D69]/50">
            <ImagePlus size={15} />
            <span>{uploading ? 'Uploading...' : 'Upload Lot Photos (JPEG/PNG/WebP)'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => void handleFileUpload(e)}
              className="hidden"
            />
          </label>

          <div className="flex gap-1.5">
            <select
              aria-label="Pick from Serendib Reserve gem library"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setImages((prev) => [...prev, e.target.value].slice(0, 12));
                }
              }}
              className="w-full border border-[#C9D1DC]/25 bg-[#0A1226] px-2.5 py-2 text-xs text-[#C9D1DC]"
            >
              <option value="">+ Add from House Gem Library...</option>
              {GEMS_DATA.map((g) => (
                <option key={g.id} value={g.photoUrl}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1.5">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Or paste HTTPS image URL..."
              className="flex-1 border border-[#C9D1DC]/25 bg-[#0A1226] px-2.5 py-1.5 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => {
                if (imageUrlInput.trim()) {
                  setImages((prev) => [...prev, imageUrlInput.trim()].slice(0, 12));
                  setImageUrlInput('');
                }
              }}
              className="border border-[#C9D1DC]/25 px-3 text-[11px] uppercase text-white"
            >
              Add
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {images.map((url, idx) => (
              <div key={`${url}-${idx}`} className="relative aspect-square border border-[#C9D1DC]/20 bg-[#0A1226] p-1">
                <img src={url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute right-0.5 top-0.5 bg-black/80 p-0.5 text-rose-300"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="border border-rose-400/45 bg-rose-950/45 p-3 text-xs text-rose-200">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-luxury-primary flex w-full items-center justify-center gap-2 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white"
        >
          <CheckCircle2 size={15} />
          <span>{saving ? 'Saving Lot...' : initialAuction ? 'Update Auction Lot' : 'Publish Auction Lot'}</span>
        </button>
      </div>
    </form>
  );
};

const SettingsForm: React.FC<{
  initial: PlatformSettings;
  onSave: (
    next: Pick<PlatformSettings, 'defaultCurrency' | 'houseRules' | 'antiSnipingNote' | 'demoModeEnabled'>
  ) => Promise<void>;
}> = ({ initial, onSave }) => {
  const [defaultCurrency, setDefaultCurrency] = useState<SupportedCurrency>(initial.defaultCurrency);
  const [houseRules, setHouseRules] = useState(initial.houseRules);
  const [antiSnipingNote, setAntiSnipingNote] = useState(initial.antiSnipingNote);
  const [demoModeEnabled, setDemoModeEnabled] = useState(initial.demoModeEnabled !== false);
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await onSave({ defaultCurrency, houseRules, antiSnipingNote, demoModeEnabled });
        } finally {
          setSaving(false);
        }
      }}
      className="mt-8 max-w-2xl space-y-4 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6"
    >
      <h2 className="font-display text-2xl font-light text-white">Auction House Settings</h2>
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Default Currency</label>
        <select
          value={defaultCurrency}
          onChange={(e) => setDefaultCurrency(e.target.value as SupportedCurrency)}
          className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3 py-2 text-sm text-white"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Standard House Rules</label>
        <textarea
          rows={4}
          value={houseRules}
          onChange={(e) => setHouseRules(e.target.value)}
          className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3 py-2 text-sm text-white"
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#C9D1DC]">Server Clock / Timing Policy</label>
        <textarea
          rows={2}
          value={antiSnipingNote}
          onChange={(e) => setAntiSnipingNote(e.target.value)}
          className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3 py-2 text-sm text-white"
        />
      </div>
      <label className="flex cursor-pointer items-start gap-2.5 border border-amber-400/25 bg-[#05070D]/70 p-3.5 text-xs text-[#E6EAF0]">
        <input
          type="checkbox"
          checked={demoModeEnabled}
          onChange={(e) => setDemoModeEnabled(e.target.checked)}
          className="mt-0.5 accent-[#D9AE61]"
        />
        <span>
          <strong className="block text-amber-200">Display Demonstration Lots in Public Catalog</strong>
          When enabled, seeded <code className="text-[#D9AE61]">DEMO LOT</code> entries are visible on the Homepage and Auction Directory. Uncheck to hide demonstration lots when preparing pure production auctions.
        </span>
      </label>
      <button
        type="submit"
        disabled={saving}
        className="btn-luxury-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-white"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
};
