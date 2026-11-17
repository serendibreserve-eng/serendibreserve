import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin, Mail } from 'lucide-react';
import { FOOTER_NAV_LINKS, PLACEHOLDERS, SITE_CONFIG } from '../content/siteConfig';
import { SerendibCrest } from './SerendibCrest';
import { GemSVG } from './GemSVG';

export const Footer: React.FC = () => {
  return (
    <>
      <footer className="relative border-t border-[#C9D1DC]/15 bg-[#0A1226] text-[#C9D1DC]">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            {/* Brand + Rotating Sapphire Emblem */}
            <div className="space-y-5 md:col-span-4">
              <div className="flex items-center gap-3">
                <SerendibCrest size={42} />
                <div>
                  <p className="font-display text-lg tracking-[0.22em] uppercase text-white">
                    {SITE_CONFIG.shortName}
                  </p>
                  <p className="text-xs tracking-[0.15em] uppercase text-[#C9D1DC]/70">
                    {SITE_CONFIG.positioning}
                  </p>
                </div>
              </div>

              <p className="max-w-sm text-sm leading-relaxed text-[#C9D1DC]/80">
                {SITE_CONFIG.taglineSecondary} Ethically sourced, expertly faceted, and certified Ceylon gemstones from Colombo to the world.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="animate-[spin_18s_linear_infinite]" aria-hidden="true">
                  <GemSVG cut="cushion" size={44} label="Rotating Ceylon Sapphire" />
                </div>
                <span className="text-xs tracking-[0.16em] uppercase text-[#C9D1DC]/70">
                  Colombo · Sri Lanka
                </span>
              </div>
            </div>

            {/* Sitemap */}
            <div className="md:col-span-4">
              <h2 className="text-xs font-medium tracking-[0.22em] uppercase text-white">
                Explore
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                {FOOTER_NAV_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-[#C9D1DC]/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Headquarters & Direct Contact */}
            <div className="space-y-4 md:col-span-4">
              <h2 className="text-xs font-medium tracking-[0.22em] uppercase text-white">
                Headquarters
              </h2>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2.5 text-[#C9D1DC]/85">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#3D7BFF]" aria-hidden="true" />
                  <span>{SITE_CONFIG.headquarters.fullAddress}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone size={16} className="shrink-0 text-[#3D7BFF]" aria-hidden="true" />
                  <a
                    href={SITE_CONFIG.phoneHref}
                    className="font-mono-tabular text-white transition-colors hover:text-[#3D7BFF]"
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail size={16} className="shrink-0 text-[#3D7BFF]" aria-hidden="true" />
                  <a
                    href={SITE_CONFIG.emailHref}
                    className="text-[#C9D1DC] transition-colors hover:text-white"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </p>
              </div>

              {/* Social Links Placeholders */}
              <div className="pt-2">
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#C9D1DC]/60">
                  Social Channels (Placeholders in siteConfig.ts)
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#C9D1DC]/80">
                  {Object.entries(PLACEHOLDERS.socialLinks).map(([network, url]) => (
                    <span
                      key={network}
                      title={`Configure ${network}: ${url}`}
                      className="border border-[#C9D1DC]/20 px-2.5 py-1 uppercase tracking-wider"
                    >
                      {network}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hairline-silver my-10" />

          <div className="flex flex-col justify-between gap-4 text-xs text-[#C9D1DC]/65 sm:flex-row sm:items-center">
            <p>{SITE_CONFIG.copyright}</p>
            <p className="max-w-xl sm:text-right">{SITE_CONFIG.legalNote}</p>
          </div>
        </div>
      </footer>

      {/* Compact Sticky Floating WhatsApp / Call Control */}
      <a
        href={SITE_CONFIG.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Message or call Serendib Reserve on WhatsApp ${SITE_CONFIG.phone}`}
        className="fixed bottom-4 right-4 z-40 inline-flex h-11 items-center gap-2 border border-[#3D7BFF]/65 bg-[#0A1226]/95 px-3.5 text-xs font-medium tracking-[0.12em] uppercase text-white shadow-[0_0_24px_rgba(27,63,217,0.35)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#E6EAF0]"
      >
        <MessageCircle size={15} className="text-[#3D7BFF]" aria-hidden="true" />
        <span className="hidden sm:inline font-mono-tabular">{SITE_CONFIG.phone}</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>
    </>
  );
};
