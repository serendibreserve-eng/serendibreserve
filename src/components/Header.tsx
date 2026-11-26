import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Menu, Shield, User, X } from 'lucide-react';
import { HOUSE_SUB_LINKS, MAIN_NAV_LINKS, SITE_CONFIG } from '../content/siteConfig';
import { useAuth } from '../context/AuthContext';
import { SerendibCrest } from './SerendibCrest';
import { GemSVG } from './GemSVG';

export const Header: React.FC = () => {
  const { pathname } = useLocation();
  const {
    firebaseUser,
    profile,
    isAdmin,
    liveAuctionsCount,
    unreadNotificationsCount,
  } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gemMenuOpen, setGemMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setGemMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || pathname !== '/'
            ? 'border-b border-[#C9D1DC]/15 bg-[#05070D]/94 backdrop-blur-md'
            : 'border-b border-transparent bg-gradient-to-b from-[#05070D]/85 to-transparent'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 xl:px-8">
          {/* Brand Logo Lockup */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-white focus-visible:outline-none"
            aria-label="Serendib Reserve Home"
          >
            <SerendibCrest size={30} />
            <span className="font-display text-sm font-medium tracking-[0.18em] uppercase text-white xl:text-base">
              {SITE_CONFIG.shortName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden xl:flex items-center gap-3.5 2xl:gap-5"
          >
            {MAIN_NAV_LINKS.map((item) => {
              const isActive =
                pathname === item.path ||
                (item.path === '/gem-types' &&
                  HOUSE_SUB_LINKS.some((s) => s.path === pathname));

              if (item.path === '/gem-types') {
                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => setGemMenuOpen(true)}
                    onMouseLeave={() => setGemMenuOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setGemMenuOpen((v) => !v)}
                      aria-expanded={gemMenuOpen}
                      className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 text-[11px] tracking-[0.09em] uppercase transition-colors duration-200 2xl:text-[12px] ${
                        isActive ? 'text-white' : 'text-[#C9D1DC] hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={12} aria-hidden="true" />
                    </button>

                    {gemMenuOpen && (
                      <div className="absolute left-0 top-full w-56 border border-[#C9D1DC]/20 bg-[#07152F]/98 py-2 shadow-2xl backdrop-blur-md">
                        {HOUSE_SUB_LINKS.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`block px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors ${
                              pathname === sub.path
                                ? 'bg-[#102D69] text-[#D9AE61]'
                                : 'text-[#C9D1DC] hover:bg-[#102D69]/60 hover:text-white'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const isLiveLink = item.path === '/auctions/live';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 py-1 text-[11px] tracking-[0.09em] uppercase transition-colors duration-200 2xl:text-[12px] ${
                    isActive ? 'text-white' : 'text-[#C9D1DC] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isLiveLink && liveAuctionsCount > 0 && (
                    <span className="inline-flex items-center gap-1 border border-[#D9AE61]/60 bg-[#D9AE61]/20 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[#D9AE61]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D9AE61] opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#D9AE61]" />
                      </span>
                      LIVE ({liveAuctionsCount})
                    </span>
                  )}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#3D7BFF] to-transparent"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Account, Notification, Admin & Mobile Trigger */}
          <div className="flex shrink-0 items-center gap-2.5">
            {liveAuctionsCount > 0 && (
              <Link
                to="/auctions/live"
                className="inline-flex items-center gap-1.5 border border-[#D9AE61]/60 bg-[#D9AE61]/15 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-[#D9AE61] xl:hidden"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D9AE61]" />
                <span>LIVE ({liveAuctionsCount})</span>
              </Link>
            )}

            {firebaseUser && (
              <Link
                to="/account/notifications"
                aria-label="Notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center border border-[#C9D1DC]/20 bg-[#0A1226]/70 text-[#E6EAF0] transition-colors hover:border-[#D9AE61]"
              >
                <Bell size={16} aria-hidden="true" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D9AE61] px-1 font-mono-tabular text-[9px] font-bold text-[#05070D]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 border border-[#D9AE61]/60 bg-[#D9AE61]/15 px-3 py-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-[#D9AE61] hover:bg-[#D9AE61]/25"
              >
                <Shield size={13} aria-hidden="true" />
                <span>Admin</span>
              </Link>
            )}

            {firebaseUser ? (
              <Link
                to="/account"
                className="btn-luxury hidden sm:inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-[10px] font-medium tracking-[0.14em] uppercase text-white 2xl:text-[11px]"
              >
                <User size={13} className="text-[#D9AE61]" aria-hidden="true" />
                <span>{profile?.fullName?.split(' ')[0] || 'My Account'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-luxury-primary hidden sm:inline-flex items-center whitespace-nowrap px-4 py-2 text-[10px] font-medium tracking-[0.14em] uppercase text-white 2xl:text-[11px]"
              >
                Login / Sign Up
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="inline-flex h-11 w-11 items-center justify-center border border-[#C9D1DC]/25 bg-[#0A1226]/70 text-white xl:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-[90] flex flex-col justify-between overflow-y-auto bg-[#05070D] px-6 py-8 xl:hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.06]"
          >
            <GemSVG cut="cushion" size={280} label="" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
              <SerendibCrest size={32} />
              <span className="font-display text-base tracking-[0.2em] uppercase text-white">
                {SITE_CONFIG.shortName}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="inline-flex h-11 w-11 items-center justify-center border border-[#C9D1DC]/25 text-white"
            >
              <X size={20} />
            </button>
          </div>

          <nav aria-label="Mobile menu links" className="relative z-10 my-6 flex flex-col gap-2.5">
            {MAIN_NAV_LINKS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between font-display text-2xl font-light tracking-wide transition-colors ${
                    isActive ? 'text-[#D9AE61]' : 'text-white hover:text-[#3D7BFF]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.path === '/auctions/live' && liveAuctionsCount > 0 && (
                    <span className="border border-[#D9AE61]/60 bg-[#D9AE61]/15 px-2 py-0.5 font-sans text-[10px] font-semibold tracking-wider text-[#D9AE61]">
                      LIVE ({liveAuctionsCount})
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="mt-3 border-t border-[#C9D1DC]/15 pt-3">
              <p className="mb-2 text-[10px] tracking-[0.2em] uppercase text-[#C9D1DC]/60">
                Collection & Heritage
              </p>
              <div className="grid grid-cols-2 gap-2">
                {HOUSE_SUB_LINKS.map((sub) => (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    onClick={() => setMobileOpen(false)}
                    className="text-xs text-[#C9D1DC] hover:text-white"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="relative z-10 flex flex-col gap-3 border-t border-[#C9D1DC]/15 pt-5">
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="border border-[#D9AE61]/60 bg-[#D9AE61]/15 py-2.5 text-center text-xs font-semibold tracking-[0.18em] uppercase text-[#D9AE61]"
              >
                Admin Control Panel
              </Link>
            )}
            {firebaseUser ? (
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="btn-luxury-primary py-3 text-center text-xs font-medium tracking-[0.2em] uppercase text-white"
              >
                My Account
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-luxury-primary py-3 text-center text-xs font-medium tracking-[0.2em] uppercase text-white"
              >
                Login / Sign Up
              </Link>
            )}
            <a
              href={SITE_CONFIG.phoneHref}
              className="text-center font-mono-tabular text-xs text-[#C9D1DC]"
            >
              {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      )}
    </>
  );
};
