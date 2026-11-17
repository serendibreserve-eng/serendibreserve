import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  EXPORT_SNAPSHOT_2025,
  INDUSTRY_KEY_FACTS,
  SERENDIB_COMMITMENTS,
  SUSTAINABILITY_PILLARS,
  VALUE_CHAIN_STAGES,
} from '../content/industry';
import { GEM_IMAGES } from '../content/images';
import { GemSVG } from '../components/GemSVG';
import { ImageSlot } from '../components/ImageSlot';
import { SplitHeading } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';

export const GemIndustryPage: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="Sri Lankan Gem Industry — From Mine to Market | Serendib Reserve"
        description="Explore Sri Lanka's gem value chain, NGJA regulation, FACETS Sri Lanka, and 2025 export performance toward the US$1 billion 2030 vision."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Header + Lapidary Editorial Shot */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center space-y-5 lg:col-span-6">
            <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
              03 · Gem Industry in Sri Lanka
            </p>
            <SplitHeading as="h1" className="font-display text-5xl font-light text-white sm:text-6xl">
              From Mine to Market.
            </SplitHeading>
            <p className="text-base leading-relaxed text-[#C9D1DC]">
              Sri Lanka’s gemstone sector blends generational lapidary artistry with formal national oversight, supporting approximately 650,000 livelihoods from rural river pits to Colombo’s export houses.
            </p>
          </div>

          <div className="lg:col-span-6">
            <ImageSlot
              asset={GEM_IMAGES.lapidaryWheel}
              className="aspect-[4/3] h-full border border-[#C9D1DC]/15"
            >
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs tracking-[0.2em] uppercase text-[#3D7BFF]">Sri Lankan Lapidary</p>
                <p className="mt-1 font-display text-2xl text-white">
                  Precision Cutting & Proportioning
                </p>
              </div>
            </ImageSlot>
          </div>
        </div>

        {/* 5-Stage Value Chain */}
        <section className="mt-20 border-t border-[#C9D1DC]/12 pt-16">
          <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">The Value Chain</p>
          <SplitHeading className="mt-2 font-display text-3xl font-light text-white sm:text-4xl">
            Five Stages of Value Addition
          </SplitHeading>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
            {VALUE_CHAIN_STAGES.map((stage, idx) => {
              const active = idx === activeStage;
              return (
                <button
                  key={stage.step}
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  className={`flex flex-col justify-between border p-5 text-left transition-all ${
                    active
                      ? 'border-[#3D7BFF] bg-[#1B3FD9]/25'
                      : 'border-[#C9D1DC]/15 bg-[#0A1226]/55 hover:border-[#C9D1DC]/40'
                  }`}
                >
                  <div>
                    <span className="font-mono-tabular text-xs text-[#3D7BFF]">{stage.step}</span>
                    <h3 className="mt-2 font-display text-2xl text-white">{stage.title}</h3>
                    <p className="mt-3 text-xs leading-relaxed text-[#C9D1DC]/85">
                      {stage.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Key Facts & Institutions */}
        <section className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRY_KEY_FACTS.map((fact) => (
            <div key={fact.label} className="border border-[#C9D1DC]/15 bg-[#0A1226]/70 p-6">
              <p className="text-xs tracking-[0.18em] uppercase text-[#C9D1DC]/70">{fact.label}</p>
              <p className="mt-2 font-display text-4xl font-light text-silver-gradient">
                {fact.value}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#C9D1DC]/85">{fact.detail}</p>
            </div>
          ))}
        </section>

        {/* 2025 Market Snapshot Chart */}
        <section className="mt-20 border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6 sm:p-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">
                Market Snapshot (2025)
              </p>
              <h2 className="font-display text-3xl font-light text-white sm:text-4xl">
                US${EXPORT_SNAPSHOT_2025.total2025Millions} Million in 2025 Exports
              </h2>
              <p className="text-sm leading-relaxed text-[#C9D1DC]">
                {EXPORT_SNAPSHOT_2025.valueAdditionNote}
              </p>
              <div className="border-t border-[#C9D1DC]/15 pt-4">
                <p className="text-xs tracking-[0.16em] uppercase text-[#C9D1DC]/70">
                  2030 National Ambition
                </p>
                <p className="mt-1 font-mono-tabular text-2xl text-white">
                  US$1.0 Billion Annually
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6 lg:col-span-7">
              {EXPORT_SNAPSHOT_2025.breakdown.map((row) => (
                <div key={row.label} className="space-y-2">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-white">{row.label}</span>
                    <span className="font-mono-tabular text-[#E6EAF0]">
                      ~US${row.amountMillions}M ({row.sharePct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden bg-[#05070D]">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${Math.max(6, (row.amountMillions / EXPORT_SNAPSHOT_2025.total2025Millions) * 100)}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Target comparison bar */}
              <div className="space-y-2 border-t border-[#C9D1DC]/15 pt-4">
                <div className="flex items-baseline justify-between text-xs text-[#C9D1DC]">
                  <span>2025 Combined Total vs. 2030 US$1B Target</span>
                  <span className="font-mono-tabular">33.4% of 2030 Goal</span>
                </div>
                <div className="h-2.5 w-full bg-[#05070D]">
                  <div className="h-full bg-gradient-to-r from-[#1B3FD9] to-[#3D7BFF]" style={{ width: '33.4%' }} />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 border-t border-[#C9D1DC]/12 pt-4 text-xs text-[#C9D1DC]/70">
            {EXPORT_SNAPSHOT_2025.sourceFootnote}
          </p>
        </section>

        {/* Serendib Reserve's Role & Sustainability */}
        <section className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">Our Role</p>
            <h2 className="font-display text-3xl font-light text-white sm:text-4xl">
              Principled Stewardship Across Every Parcel
            </h2>
            <div className="space-y-4">
              {SERENDIB_COMMITMENTS.map((c) => (
                <div key={c.title} className="border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-5">
                  <h3 className="text-sm font-medium text-white">{c.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#C9D1DC]/85">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-6">
            <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">
              Sustainability & Ethics
            </p>
            <h2 className="font-display text-3xl font-light text-white sm:text-4xl">
              Care for Land, Miner & Craft
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SUSTAINABILITY_PILLARS.map((p) => (
                <div key={p.title} className="border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-5">
                  <GemSVG cut="emerald" colorHex="#1B3FD9" secondaryColorHex="#C9D1DC" size={40} label={p.title} />
                  <h3 className="mt-4 text-sm font-medium text-white">{p.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#C9D1DC]/85">{p.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/global-market"
                className="btn-luxury inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
              >
                <span>See Our Global Export Reach</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
