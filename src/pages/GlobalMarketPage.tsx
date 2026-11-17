import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Globe as GlobeIcon, PlaneTakeoff } from 'lucide-react';
import {
  MARKET_DESTINATIONS,
  MARKET_REGIONS,
  SHIPPING_STEPS,
  TRADE_EVENTS,
} from '../content/markets';
import { PLACEHOLDERS } from '../content/siteConfig';
import { Globe } from '../components/Globe';
import { SplitHeading } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';

type RegionTab = 'All' | 'Europe' | 'Americas' | 'Middle East' | 'Asia';

export const GlobalMarketPage: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState<RegionTab>('All');
  const [attendingFilter, setAttendingFilter] = useState<'all' | 'marked'>('all');

  const currentRegionInfo =
    activeRegion === 'All' ? null : MARKET_REGIONS.find((r) => r.id === activeRegion);

  const visibleDestinations =
    activeRegion === 'All'
      ? MARKET_DESTINATIONS
      : MARKET_DESTINATIONS.filter((d) => d.region === activeRegion);

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="Our Global Market — Worldwide Gem Exports | Serendib Reserve"
        description="Explore Serendib Reserve's international gem destinations across Europe, Americas, Middle East, and Asia with insured FOB/CIF/DDP shipping."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Hero with Full-Width Globe */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
              04 · Our Global Market
            </p>
            <SplitHeading as="h1" className="font-display text-5xl font-light text-white sm:text-6xl">
              From Colombo to the World’s Vaults.
            </SplitHeading>
            <p className="text-base leading-relaxed text-[#C9D1DC]">
              Select a region below to orient the globe and explore what fine jewellers, cutting centres, and collectors value in each market.
            </p>

            {/* Region Tabs */}
            <div className="flex flex-wrap gap-2 pt-2" role="tablist" aria-label="Global trade regions">
              {(['All', 'Europe', 'Americas', 'Middle East', 'Asia'] as RegionTab[]).map((tab) => {
                const active = activeRegion === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveRegion(tab)}
                    className={`whitespace-nowrap shrink-0 border px-4 py-2 text-xs tracking-[0.16em] uppercase transition-all ${
                      active
                        ? 'border-[#3D7BFF] bg-[#1B3FD9]/35 text-white'
                        : 'border-[#C9D1DC]/20 bg-[#0A1226]/55 text-[#C9D1DC] hover:border-[#C9D1DC]/50'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {currentRegionInfo && (
              <div className="border border-[#3D7BFF]/45 bg-[#0A1226]/80 p-5">
                <p className="text-xs tracking-[0.18em] uppercase text-[#3D7BFF]">
                  {currentRegionInfo.countries.join(' · ')}
                </p>
                <h2 className="mt-1.5 font-display text-2xl text-white">
                  {currentRegionInfo.headline}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#C9D1DC]">
                  {currentRegionInfo.buyerPreference}
                </p>
                {currentRegionInfo.highlightNote && (
                  <p className="mt-3 border-t border-[#C9D1DC]/15 pt-2.5 text-xs text-white">
                    {currentRegionInfo.highlightNote}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="h-[380px] sm:h-[480px] lg:col-span-7">
            <Globe activeRegion={activeRegion} className="h-full w-full" />
          </div>
        </div>

        {/* Highlighted Destinations Grid */}
        <section className="mt-16 border-t border-[#C9D1DC]/12 pt-14">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDestinations.map((dest) => (
              <div
                key={dest.name}
                className="border border-[#C9D1DC]/15 bg-[#0A1226]/60 p-5 transition-colors hover:border-[#3D7BFF]/55"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl text-white">{dest.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] uppercase text-[#3D7BFF]">
                    <GlobeIcon size={12} aria-hidden="true" />
                    {dest.region}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#C9D1DC]/85">{dest.focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How We Ship */}
        <section className="mt-20 border-t border-[#C9D1DC]/12 pt-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">
                Export Logistics
              </p>
              <SplitHeading className="mt-2 font-display text-4xl font-light text-white">
                How We Ship Worldwide
              </SplitHeading>
            </div>
            <p className="text-xs tracking-[0.18em] uppercase text-[#C9D1DC]">
              Buyer Choice of Incoterms: FOB · CIF · DDP
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-4">
            {SHIPPING_STEPS.map((s) => (
              <div key={s.step} className="border border-[#C9D1DC]/15 bg-[#0A1226]/65 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-xs text-[#3D7BFF]">{s.step}</span>
                  <PlaneTakeoff size={15} className="text-[#C9D1DC]" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-2xl text-white">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#C9D1DC]/85">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trade Events Strip */}
        <section className="mt-20 border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">
                International Calendar · {PLACEHOLDERS.eventsWeAttend}
              </p>
              <h2 className="mt-2 font-display text-3xl font-light text-white">
                Global Gem & Jewellery Trade Events
              </h2>
            </div>

            <div className="flex items-center gap-2 border border-[#C9D1DC]/20 bg-[#05070D] p-1">
              <button
                type="button"
                onClick={() => setAttendingFilter('all')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider ${
                  attendingFilter === 'all' ? 'bg-[#1B3FD9] text-white' : 'text-[#C9D1DC]'
                }`}
              >
                All Shows
              </button>
              <button
                type="button"
                onClick={() => setAttendingFilter('marked')}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider ${
                  attendingFilter === 'marked' ? 'bg-[#1B3FD9] text-white' : 'text-[#C9D1DC]'
                }`}
              >
                {PLACEHOLDERS.eventsWeAttend}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(attendingFilter === 'all' ? TRADE_EVENTS : TRADE_EVENTS.slice(0, 3)).map((ev) => (
              <div key={ev.name} className="border border-[#C9D1DC]/15 bg-[#05070D]/70 p-4">
                <div className="flex items-center gap-2 text-xs text-[#3D7BFF]">
                  <Calendar size={13} aria-hidden="true" />
                  <span>{ev.location}</span>
                </div>
                <h3 className="mt-2 font-display text-xl text-white">{ev.name}</h3>
                <p className="mt-1.5 text-xs text-[#C9D1DC]/80">{ev.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[#C9D1DC]/15 pt-8 sm:flex-row sm:items-center">
            <p className="font-display text-2xl text-white">
              Looking for a reliable Ceylon source partner?
            </p>
            <Link
              to="/inquiries?type=Wholesale+%26+trade"
              className="btn-luxury-primary inline-flex items-center gap-2 px-7 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white"
            >
              <span>Become a Trade Partner</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
