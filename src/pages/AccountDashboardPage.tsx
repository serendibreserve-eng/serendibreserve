import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Gavel,
  Heart,
  LogOut,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  markNotificationRead,
  removeReminderById,
  subscribeUserBids,
  toggleWatchlistItem,
} from '../services/auctionService';
import type { BidRecord, NotificationPreferences } from '../types/auction';
import { formatCurrencyMinor, getEffectiveAuctionStatus } from '../utils/auctionLogic';
import { AuctionStatusBadge } from '../components/AuctionBadgesAndTimer';
import { PageSEO } from '../components/PageSEO';

type AccountTab = 'overview' | 'my-bids' | 'watchlist' | 'reminders' | 'notifications';

function resolveTab(pathname: string): AccountTab {
  if (pathname.endsWith('/my-bids')) return 'my-bids';
  if (pathname.endsWith('/watchlist')) return 'watchlist';
  if (pathname.endsWith('/reminders')) return 'reminders';
  if (pathname.endsWith('/notifications')) return 'notifications';
  return 'overview';
}

export const AccountDashboardPage: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeTab = resolveTab(pathname);

  const {
    authReady,
    firebaseUser,
    profile,
    isAdmin,
    publicAuctions,
    userReminders,
    notifications,
    unreadNotificationsCount,
    serverNowMs,
    completeOrUpdateProfile,
    signOutUser,
  } = useAuth();

  const [myBids, setMyBids] = useState<BidRecord[]>([]);
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailReminders: true,
    outbidAlerts: true,
    newAuctionAlerts: true,
    liveStartAlerts: true,
  });
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName);
    setContactNumber(profile.contactNumber);
    setNationality(profile.nationality);
    setCompanyName(profile.companyName);
    setPrefs(profile.notificationPreferences);
  }, [profile]);

  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const unsub = subscribeUserBids(firebaseUser.uid, setMyBids);
    return () => unsub();
  }, [authReady, firebaseUser]);

  const auctionMap = useMemo(() => {
    const map = new Map(publicAuctions.map((a) => [a.id, a]));
    return map;
  }, [publicAuctions]);

  const watchlistAuctions = useMemo(() => {
    if (!profile) return [];
    return profile.watchlistAuctionIds
      .map((id) => auctionMap.get(id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a));
  }, [profile, auctionMap]);

  if (!authReady) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#05070D] pt-20 text-xs tracking-widest uppercase text-[#C9D1DC]">
        Loading Account Vault...
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(pathname)}`} replace />;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg(null);
    if (!fullName.trim() || !contactNumber.trim() || !nationality.trim()) {
      setSaveMsg({ type: 'err', text: 'Full name, contact number, and nationality are required.' });
      return;
    }
    setSaving(true);
    try {
      await completeOrUpdateProfile({
        fullName,
        contactNumber,
        nationality,
        companyName,
        notificationPreferences: prefs,
      });
      setSaveMsg({ type: 'ok', text: 'Profile and notification preferences saved.' });
    } catch (err) {
      setSaveMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs: Array<{ id: AccountTab; label: string; to: string; count?: number }> = [
    { id: 'overview', label: 'Profile & Verification', to: '/account/profile' },
    { id: 'my-bids', label: 'My Bids', to: '/account/my-bids', count: myBids.length },
    { id: 'watchlist', label: 'Watchlist', to: '/account/watchlist', count: watchlistAuctions.length },
    { id: 'reminders', label: 'Reminders', to: '/account/reminders', count: userReminders.length },
    {
      id: 'notifications',
      label: 'Notifications',
      to: '/account/notifications',
      count: unreadNotificationsCount,
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO title="My Collector Account — Serendib Reserve" description="Manage your bidder verification, active bids, watchlist, and auction reminders." />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Top Account Banner */}
        <div className="flex flex-col justify-between gap-4 border border-[#D9AE61]/25 bg-[#07152F]/80 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-[#D9AE61]">
              Collector Vault · {profile?.role === 'admin' || isAdmin ? 'Administrator' : 'Verified Bidder Portal'}
            </p>
            <h1 className="mt-1 font-display text-3xl font-light text-white sm:text-4xl">
              {profile?.fullName || firebaseUser.displayName || firebaseUser.email}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[#C9D1DC]/80">{firebaseUser.email}</span>
              {firebaseUser.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[#D9AE61]">
                  <ShieldCheck size={13} aria-hidden="true" />
                  Email Verified
                </span>
              ) : (
                <Link to="/verify-email" className="inline-flex items-center gap-1 text-amber-300 underline">
                  <ShieldAlert size={13} aria-hidden="true" />
                  Verify Email Required
                </Link>
              )}
              {profile?.accountStatus === 'suspended' && (
                <span className="border border-rose-400/50 bg-rose-950/50 px-2 py-0.5 text-rose-200">
                  Account Suspended
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {isAdmin && (
              <Link
                to="/admin"
                className="border border-[#D9AE61] bg-[#D9AE61]/15 px-4 py-2 text-xs font-medium tracking-[0.16em] uppercase text-[#D9AE61]"
              >
                Open Admin Panel
              </Link>
            )}
            <button
              type="button"
              onClick={() => void signOutUser().then(() => navigate('/'))}
              className="inline-flex items-center gap-1.5 border border-[#C9D1DC]/25 px-4 py-2 text-xs tracking-[0.16em] uppercase text-[#C9D1DC] hover:text-white"
            >
              <LogOut size={13} aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-[#C9D1DC]/15 pb-4">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <Link
                key={t.id}
                to={t.to}
                className={`inline-flex items-center gap-2 border px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors ${
                  active
                    ? 'border-[#D9AE61] bg-[#102D69] text-[#D9AE61]'
                    : 'border-[#C9D1DC]/20 bg-[#0A1226]/55 text-[#C9D1DC] hover:text-white'
                }`}
              >
                <span>{t.label}</span>
                {typeof t.count === 'number' && t.count > 0 && (
                  <span className="font-mono-tabular rounded-full bg-[#D9AE61]/20 px-1.5 py-0.5 text-[10px] text-[#D9AE61]">
                    {t.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <form
              onSubmit={handleSaveProfile}
              className="grid grid-cols-1 gap-8 lg:grid-cols-12"
            >
              <div className="space-y-4 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6 lg:col-span-7">
                <h2 className="flex items-center gap-2 font-display text-2xl font-light text-white">
                  <User size={18} className="text-[#D9AE61]" aria-hidden="true" />
                  <span>Collector Details</span>
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                      Nationality / Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                      Company / Atelier (Optional)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#05070D]/80 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
                    />
                  </div>
                </div>

                {saveMsg && (
                  <p
                    className={`border p-3 text-xs ${
                      saveMsg.type === 'ok'
                        ? 'border-[#D9AE61]/45 bg-[#D9AE61]/15 text-[#F5F3EF]'
                        : 'border-rose-400/45 bg-rose-950/45 text-rose-200'
                    }`}
                  >
                    {saveMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving || !firebaseUser.emailVerified}
                  className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs font-medium tracking-[0.18em] uppercase text-white disabled:opacity-50"
                >
                  <Save size={14} aria-hidden="true" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>

              <div className="space-y-4 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6 lg:col-span-5">
                <h2 className="flex items-center gap-2 font-display text-2xl font-light text-white">
                  <Bell size={18} className="text-[#D9AE61]" aria-hidden="true" />
                  <span>Notification Preferences</span>
                </h2>
                <p className="text-xs text-[#C9D1DC]/75">
                  Control how Serendib Reserve alerts you about upcoming lots and live outbid activity.
                </p>

                <div className="space-y-3 pt-2 text-xs text-[#E6EAF0]">
                  {(
                    [
                      ['emailReminders', 'Upcoming auction email reminders (24h, 1h, Live)'],
                      ['outbidAlerts', 'Instant outbid notifications'],
                      ['newAuctionAlerts', 'New Ceylon gemstone lot announcements'],
                      ['liveStartAlerts', 'Live auction room opening alerts'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-3 border border-[#C9D1DC]/12 bg-[#05070D]/60 p-3">
                      <input
                        type="checkbox"
                        checked={prefs[key]}
                        onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                        className="h-4 w-4 accent-[#244DCE]"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          )}

          {activeTab === 'my-bids' && (
            <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
              <h2 className="font-display text-2xl font-light text-white">My Bidding History</h2>
              {myBids.length === 0 ? (
                <p className="mt-4 text-sm text-[#C9D1DC]/75">
                  You have not placed any bids yet. Explore live lots to participate.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {myBids.map((b) => {
                    const lot = auctionMap.get(b.auctionId);
                    const isLeading = lot?.highestBidderId === firebaseUser.uid && lot?.currentHighestBidMinor === b.amountMinor;
                    return (
                      <div
                        key={b.id}
                        className="flex flex-col justify-between gap-3 border border-[#C9D1DC]/15 bg-[#05070D]/75 p-4 sm:flex-row sm:items-center"
                      >
                        <div>
                          <Link
                            to={`/auction/${b.auctionId}`}
                            className="font-display text-xl text-white hover:text-[#D9AE61]"
                          >
                            {lot ? lot.title : `Lot ${b.auctionId}`}
                          </Link>
                          <p className="mt-1 text-xs text-[#C9D1DC]/70">
                            Bid #{b.bidSequence} · {new Date(b.createdAtMs).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-mono-tabular text-base font-medium text-[#D9AE61]">
                              {formatCurrencyMinor(b.amountMinor, b.currency)}
                            </p>
                            <p className="text-[11px] uppercase tracking-wider text-[#C9D1DC]/80">
                              {isLeading ? 'Highest Bid' : 'Outbid / Earlier Bid'}
                            </p>
                          </div>
                          <Link
                            to={`/auction/${b.auctionId}`}
                            className="btn-luxury inline-flex items-center gap-1.5 px-3.5 py-2 text-[10px] uppercase tracking-wider text-white"
                          >
                            <Gavel size={12} />
                            <span>View Lot</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
              <h2 className="font-display text-2xl font-light text-white">Saved Watchlist</h2>
              {watchlistAuctions.length === 0 ? (
                <p className="mt-4 text-sm text-[#C9D1DC]/75">
                  No lots saved in your watchlist yet.
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {watchlistAuctions.map((lot) => (
                    <div key={lot.id} className="border border-[#C9D1DC]/15 bg-[#05070D]/80 p-4">
                      <div className="flex items-center justify-between">
                        <AuctionStatusBadge status={getEffectiveAuctionStatus(lot, serverNowMs)} />
                        <button
                          type="button"
                          onClick={() => profile && void toggleWatchlistItem(profile, lot.id)}
                          aria-label="Remove from watchlist"
                          className="text-xs text-[#C9D1DC] hover:text-rose-300"
                        >
                          <Heart size={15} fill="currentColor" className="text-[#D9AE61]" />
                        </button>
                      </div>
                      <Link to={`/auction/${lot.id}`} className="mt-3 block font-display text-xl text-white hover:text-[#D9AE61]">
                        {lot.title}
                      </Link>
                      <p className="mt-1 font-mono-tabular text-sm text-[#D9AE61]">
                        {formatCurrencyMinor(
                          lot.bidCount > 0 ? lot.currentHighestBidMinor : lot.startingBidMinor,
                          lot.currency
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
              <h2 className="flex items-center gap-2 font-display text-2xl font-light text-white">
                <BellRing size={18} className="text-[#D9AE61]" aria-hidden="true" />
                <span>Upcoming Auction Reminders</span>
              </h2>
              {userReminders.length === 0 ? (
                <p className="mt-4 text-sm text-[#C9D1DC]/75">
                  You have no scheduled upcoming auction reminders.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {userReminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="flex flex-wrap items-center justify-between gap-3 border border-[#C9D1DC]/15 bg-[#05070D]/75 p-4"
                    >
                      <div>
                        <Link to={`/auction/${rem.auctionId}`} className="font-display text-xl text-white hover:text-[#D9AE61]">
                          {rem.auctionTitle}
                        </Link>
                        <p className="mt-1 text-xs text-[#C9D1DC]/70">
                          Opens: {new Date(rem.auctionStartTimeMs).toLocaleString()} · Alerts: {rem.offsets.join(', ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeReminderById(rem.id)}
                        className="inline-flex items-center gap-1.5 border border-rose-400/35 px-3 py-1.5 text-xs uppercase tracking-wider text-rose-200 hover:bg-rose-950/40"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-light text-white">Notification Center</h2>
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      notifications
                        .filter((n) => !n.read)
                        .forEach((n) => void markNotificationRead(n.id, true))
                    }
                    className="border border-[#D9AE61]/45 px-3.5 py-1.5 text-[11px] uppercase tracking-wider text-[#D9AE61]"
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="mt-4 text-sm text-[#C9D1DC]/75">
                  No notifications yet. Outbid alerts and auction updates will appear here in real time.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex flex-wrap items-start justify-between gap-3 border p-4 ${
                        n.read
                          ? 'border-[#C9D1DC]/12 bg-[#05070D]/55'
                          : 'border-[#D9AE61]/45 bg-[#102D69]/35'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <p className="mt-1 text-xs text-[#C9D1DC]/85">{n.message}</p>
                        <p className="mt-1 text-[10px] text-[#C9D1DC]/60">
                          {n.createdAtMs ? new Date(n.createdAtMs).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {n.auctionId && (
                          <Link
                            to={`/auction/${n.auctionId}`}
                            className="border border-[#C9D1DC]/25 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white"
                          >
                            View Lot
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => void markNotificationRead(n.id, true)}
                            className="inline-flex items-center gap-1 border border-[#D9AE61]/45 px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#D9AE61]"
                          >
                            <CheckCircle2 size={12} />
                            <span>Mark Read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
