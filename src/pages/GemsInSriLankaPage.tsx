import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FAMOUS_CEYLON_STONES, GEMS_DATA } from '../content/gems';
import { GEM_IMAGES } from '../content/images';
import { GemSVG } from '../components/GemSVG';
import { ImageSlot } from '../components/ImageSlot';
import { SplitHeading } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';
import { SriLankaMap } from '../components/SriLankaMap';

const MINING_STEPS = [
  {
    step: '01',
    title: 'Licensed Family Pits',
    caption: 'Traditional timbered illama shafts reach ancient river-gravel strata several metres below paddy fields.',
  },
  {
    step: '02',
    title: 'Gravel Excavation',
    caption: 'Gem-bearing illama gravel is brought up in woven baskets by hand, keeping surface impact compact and reversible.',
  },
  {
    step: '03',
    title: 'River Basket Washing',
    caption: 'Miners swirl gravel in conical cane baskets in clear river water so dense corundum and spinel settle to the centre.',
  },
  {
    step: '04',
    title: 'Land Rehabilitation',
    caption: 'Once gravel extraction finishes, pits are backfilled and restored to agriculture or lush highland vegetation.',
  },
];

export const GemsInSriLankaPage: React.FC = () => {
  const [activeMiningIdx, setActiveMiningIdx] = useState(0);
  const galleryGems = GEMS_DATA.filter((g) => g.featuredInGallery);

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="Gems of Sri Lanka — Ratna-Dweepa | Serendib Reserve"
        description="Discover Sri Lanka's two-thousand-year gem heritage, Highland Complex geology, Ratnapura, Elahera, Okkampitiya, and traditional illama mining."
      />

      {/* Opening Cinematic Banner */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center space-y-6 py-4 lg:col-span-6">
            <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
              02 · Gems of Sri Lanka
            </p>
            <SplitHeading as="h1" className="font-display text-5xl font-light text-white sm:text-6xl">
              The Gem Island.
            </SplitHeading>
            <p className="text-base leading-relaxed text-[#C9D1DC]">
              For over two millennia, Sri Lanka has been celebrated as <em className="font-display text-xl text-white">Ratna-Dweepa</em> — the Island of Gems. Chroniclers and travellers including Marco Polo wrote in wonder of its royal sapphires, rubies, and star stones.
            </p>
            <p className="text-sm leading-relaxed text-[#C9D1DC]/85">
              Geologically, most gem formations originate in the island’s central Highland Complex. Today, Sri Lanka yields nearly 75 varieties of coloured and colourless gemstones across ten principal mineral species — one of the highest densities of gem deposits relative to landmass anywhere on Earth.
            </p>
          </div>

          <div className="lg:col-span-6">
            <ImageSlot
              asset={GEM_IMAGES.ratnapuraValley}
              className="h-full min-h-[300px] border border-[#C9D1DC]/15"
            >
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs tracking-[0.2em] uppercase text-[#3D7BFF]">Highland Complex</p>
                <p className="mt-1 font-display text-2xl text-white">
                  Ratnapura — “The City of Gems”
                </p>
              </div>
            </ImageSlot>
          </div>
        </div>

        {/* Deposit Geology Strip */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              title: 'Alluvial Deposits',
              text: 'Water-worn crystals concentrated in ancient river gravels (illama) beneath valleys around Ratnapura.',
            },
            {
              title: 'Eluvial Deposits',
              text: 'Gems weathered slightly downslope from parent metamorphic rock, notably across the Elahera belt.',
            },
            {
              title: 'Residual Deposits',
              text: 'Stones resting directly above decomposed host rock layers in regions such as Okkampitiya.',
            },
          ].map((dep) => (
            <div key={dep.title} className="border border-[#C9D1DC]/15 bg-[#0A1226]/60 p-6">
              <h2 className="font-display text-2xl font-light text-white">{dep.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#C9D1DC]/85">{dep.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Five Main Gem-Producing Areas */}
      <section className="mt-20 border-t border-[#C9D1DC]/12 bg-[#0A1226]/45 py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">Five Historic Regions</p>
            <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
              From Mountain Valleys to the Southern Coast
            </SplitHeading>
          </div>
          <SriLankaMap />
        </div>
      </section>

      {/* Mining Heritage Line-Art Sequence */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#05070D] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">
                Mining Heritage
              </p>
              <SplitHeading className="font-display text-4xl font-light text-white sm:text-5xl">
                Traditional Pit Mining & River Washing
              </SplitHeading>
              <p className="text-sm leading-relaxed text-[#C9D1DC]">
                Unlike heavy open-cast quarrying, licensed Sri Lankan family mines rely on timber-shored illama shafts and woven cane baskets washed in river currents.
              </p>

              <div className="space-y-3">
                {MINING_STEPS.map((st, idx) => {
                  const active = idx === activeMiningIdx;
                  return (
                    <button
                      key={st.step}
                      type="button"
                      onClick={() => setActiveMiningIdx(idx)}
                      className={`w-full border p-4 text-left transition-all ${
                        active
                          ? 'border-[#3D7BFF] bg-[#1B3FD9]/20'
                          : 'border-[#C9D1DC]/15 bg-[#0A1226]/50 hover:border-[#C9D1DC]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono-tabular text-xs text-[#3D7BFF]">{st.step}</span>
                        <span className="font-display text-xl text-white">{st.title}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#C9D1DC]/85">
                        {st.caption}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Abstract SVG Line-Art Illustration */}
            <div className="flex flex-col items-center justify-center border border-[#C9D1DC]/15 bg-[#0A1226]/65 p-8 lg:col-span-6">
              <svg
                viewBox="0 0 420 300"
                className="w-full max-w-md"
                role="img"
                aria-label="Abstract line art depicting traditional Sri Lankan gem pit and river basket washing"
              >
                {/* Ground strata */}
                <line x1="20" y1="80" x2="400" y2="80" stroke="#C9D1DC" strokeOpacity="0.4" />
                <path
                  d="M20 215 Q120 198 210 215 T400 210"
                  fill="none"
                  stroke="#3D7BFF"
                  strokeOpacity={activeMiningIdx === 1 || activeMiningIdx === 0 ? 0.9 : 0.35}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                {/* Timbered Illama shaft */}
                <rect
                  x="85"
                  y="80"
                  width="54"
                  height="135"
                  fill="none"
                  stroke={activeMiningIdx === 0 ? '#FFFFFF' : '#C9D1DC'}
                  strokeOpacity={activeMiningIdx === 0 ? 1 : 0.45}
                  strokeWidth="1.5"
                />
                <line x1="85" y1="115" x2="139" y2="115" stroke="#C9D1DC" strokeOpacity="0.4" />
                <line x1="85" y1="150" x2="139" y2="150" stroke="#C9D1DC" strokeOpacity="0.4" />
                <line x1="85" y1="185" x2="139" y2="185" stroke="#C9D1DC" strokeOpacity="0.4" />

                {/* Hoist pulley */}
                <line x1="112" y1="36" x2="112" y2="195" stroke="#3D7BFF" strokeDasharray="3 3" />
                <circle cx="112" cy="36" r="10" fill="none" stroke="#E6EAF0" strokeWidth="1.4" />

                {/* Conical river washing basket (Wattiya) */}
                <polygon
                  points="230,150 350,150 290,205"
                  fill="none"
                  stroke={activeMiningIdx === 2 ? '#FFFFFF' : '#3D7BFF'}
                  strokeWidth="1.8"
                />
                <ellipse
                  cx="290"
                  cy="150"
                  rx="60"
                  ry="12"
                  fill="none"
                  stroke={activeMiningIdx === 2 ? '#FFFFFF' : '#3D7BFF'}
                  strokeWidth="1.4"
                />
                {/* Settled gem sparkle inside basket */}
                <polygon points="290,184 296,192 290,200 284,192" fill="#3D7BFF" />
                {/* Sprouting rehabilitation leaves */}
                <path
                  d="M210 80 C210 62, 224 54, 232 58 C228 68, 220 76, 210 80 Z"
                  fill="none"
                  stroke={activeMiningIdx === 3 ? '#FFFFFF' : '#C9D1DC'}
                  strokeOpacity={activeMiningIdx === 3 ? 1 : 0.4}
                  strokeWidth="1.4"
                />
              </svg>
              <p className="mt-4 text-center text-xs tracking-[0.18em] uppercase text-[#C9D1DC]/75">
                Stage {MINING_STEPS[activeMiningIdx].step} · {MINING_STEPS[activeMiningIdx].title}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Famous Ceylon Stones */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#0A1226]/50 py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">Historic Provenance</p>
          <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
            Notable Ceylon Stones in Museum Collections
          </SplitHeading>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FAMOUS_CEYLON_STONES.map((stone) => (
              <div key={stone.name} className="border border-[#C9D1DC]/15 bg-[#05070D]/75 p-6">
                <p className="font-mono-tabular text-xs text-[#3D7BFF]">{stone.weight}</p>
                <h3 className="mt-2 font-display text-2xl font-light text-white">{stone.name}</h3>
                <p className="mt-3 text-xs leading-relaxed text-[#C9D1DC]/85">{stone.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Colour of Ceylon Marquee Gallery */}
      <section className="overflow-hidden border-t border-[#C9D1DC]/12 bg-[#05070D] py-20">
        <div className="mx-auto mb-10 flex max-w-[1440px] items-end justify-between px-4 sm:px-8">
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">Colour of Ceylon</p>
            <h2 className="mt-2 font-display text-3xl font-light text-white sm:text-4xl">
              Twelve Expressions of Sri Lankan Light
            </h2>
          </div>
          <Link
            to="/gem-types"
            className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
          >
            <span>Inspect All</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="flex w-max animate-marquee-slow gap-6 px-4">
          {[...galleryGems, ...galleryGems].map((gem, i) => (
            <Link
              key={`${gem.id}-${i}`}
              to={`/gem-types?gem=${gem.id}`}
              className="flex w-52 shrink-0 flex-col items-center gap-3 border border-[#C9D1DC]/15 bg-[#0A1226]/70 p-6 transition-colors hover:border-[#3D7BFF]"
            >
              <GemSVG
                cut={gem.cut}
                colorHex={gem.colorHex}
                secondaryColorHex={gem.secondaryColorHex}
                effect={gem.effect}
                size={78}
                label={gem.name}
              />
              <p className="text-center font-display text-lg text-white">{gem.name}</p>
              <span className="text-[11px] tracking-[0.14em] uppercase text-[#C9D1DC]/70">
                {gem.category}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
