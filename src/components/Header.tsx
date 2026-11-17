import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { MAIN_NAV_LINKS, SITE_CONFIG } from '../content/siteConfig';
import { SerendibCrest } from './SerendibCrest';
import { GemSVG } from './GemSVG';

export const Header: React.FC = () => {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || pathname !== '/'
            ? 'border-b border-[#C9D1DC]/15 bg-[#05070D]/92'
            : 'border-b border-transparent bg-gradient-to-b from-[#05070D]/80 to-transparent'
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
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative whitespace-nowrap shrink-0 py-1 text-[11px] tracking-[0.09em] uppercase transition-colors duration-200 2xl:text-[12px] 2xl:tracking-[0.12em] ${
                    isActive ? 'text-white' : 'text-[#C9D1DC] hover:text-white'
                  }`}
                >
                  {item.label}
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

          {/* Primary CTA + Mobile Trigger */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/inquiries"
              className="btn-luxury hidden sm:inline-flex whitespace-nowrap shrink-0 items-center px-3.5 py-2 text-[10px] font-medium tracking-[0.14em] uppercase text-white 2xl:px-4 2xl:text-[11px]"
            >
              Request a Quote
            </Link>

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
          className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-[#05070D]/98 px-6 py-8 xl:hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-20"
          >
            <GemSVG cut="cushion" size={300} label="" />
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

          <nav aria-label="Mobile menu links" className="relative z-10 my-8 flex flex-col gap-3">
            {MAIN_NAV_LINKS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`font-display text-3xl font-light tracking-wide transition-colors ${
                    isActive ? 'text-[#3D7BFF]' : 'text-white hover:text-[#3D7BFF]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="mt-2 font-display text-2xl font-light text-[#C9D1DC] hover:text-white"
            >
              Our Story
            </Link>
          </nav>

          <div className="relative z-10 flex flex-col gap-3 border-t border-[#C9D1DC]/15 pt-5">
            <Link
              to="/inquiries"
              onClick={() => setMobileOpen(false)}
              className="btn-luxury-primary py-3 text-center text-xs font-medium tracking-[0.2em] uppercase text-white"
            >
              Request a Quote
            </Link>
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
