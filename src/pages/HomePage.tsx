import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  Gem,
  Globe as GlobeIcon,
  Layers,
  Pickaxe,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { GEMS_DATA } from '../content/gems';
import { GEM_IMAGES } from '../content/images';
import { SAMPLE_CATALOGUE } from '../content/products';
import { LIVE_STATS, PLACEHOLDERS, SITE_CONFIG, TRUST_PILLARS } from '../content/siteConfig';
import { MARKET_DESTINATIONS } from '../content/markets';
import { prefersReducedMotion } from '../utils/webglHelpers';
import { Gem3D } from '../components/Gem3D';
import { GemParticles } from '../components/GemParticles';
import { GemSVG } from '../components/GemSVG';
import { Globe } from '../components/Globe';
import { ImageSlot } from '../components/ImageSlot';
import { CountUpNumber, SplitHeading, TiltGemCard } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';
import { SriLankaMap } from '../components/SriLankaMap';

gsap.registerPlugin(ScrollTrigger);

const CAROUSEL_GEMS = GEMS_DATA.filter((g) => g.featuredInCarousel);

const EARTH_TO_LIGHT_STEPS = [
  { step: '01', title: 'Mine', subtitle: 'Licensed Ceylon gravels', cut: 'rough' as const, color: '#1B3FD9' },
  { step: '02', title: 'Sort', subtitle: 'Natural hue selection', cut: 'rough' as const, color: '#3D7BFF' },
  { step: '03', title: 'Cut', subtitle: 'Precision facet angles', cut: 'emerald' as const, color: '#1B3FD9' },
  { step: '04', title: 'Polish', subtitle: 'Mirror lustre finish', cut: 'cushion' as const, color: '#3D7BFF' },
  { step: '05', title: 'Certify', subtitle: 'Lab-verified dossier', cut: 'brilliant' as const, color: '#E6EAF0' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const heroSectionRef = useRef<HTMLElement>(null);
  const [heroScale, setHeroScale] = useState(1);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);
  const [activeStageIdx, setActiveStageIdx] = useState(3);

  const activeCarouselGem = CAROUSEL_GEMS[activeCarouselIdx] || CAROUSEL_GEMS[0];
  const activeStage = EARTH_TO_LIGHT_STEPS[activeStageIdx] || EARTH_TO_LIGHT_STEPS[0];

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      if (heroSectionRef.current) {
        ScrollTrigger.create({
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            setHeroScale(1 + self.progress * 0.42);
          },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const signaturePieces = SAMPLE_CATALOGUE.slice(0, 6);

  return (
    <div className="relative">
      <PageSEO
        title="Serendib Reserve — Born in Ceylon. Cut for Eternity."
        description="Serendib Reserve (Pvt) Ltd — Most Quality Gems of Sri Lanka. Ethically sourced, expertly cut, and certified Ceylon sapphires and rare gemstones."
      />

      {/* a) HERO (100vh) */}
      <section
        ref={heroSectionRef}
        className="relative flex min-h-screen items-center overflow-hidden bg-[#05070D] pt-20 pb-16 lg:pb-0"
      >
        {/* Volumetric royal-blue aurora + subtle silk atmospheric backdrop */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <img
            src={GEM_IMAGES.silkBackdrop.url}
            alt=""
            className="h-full w-full object-cover opacity-22 mix-blend-screen"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 60% 48%, rgba(27,63,217,0.34) 0%, rgba(11,31,107,0.2) 38%, rgba(5,7,13,0.96) 76%)',
            }}
          />
        </div>

        <GemParticles density={42} tintHex="#3D7BFF" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-6 px-4 py-8 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:py-12">
          {/* Left Editorial Minimal Copy */}
          <div className="order-2 space-y-5 lg:order-1 lg:col-span-6 lg:space-y-6">
            <p className="text-xs font-medium tracking-[0.24em] uppercase text-[#C9D1DC]">
              {SITE_CONFIG.shortName} · COLOMBO, SRI LANKA
            </p>
            <SplitHeading
              as="h1"
              className="font-display text-4xl font-light leading-[1.04] tracking-tight text-white sm:text-6xl xl:text-7xl"
            >
              {SITE_CONFIG.taglineHero}
            </SplitHeading>
            <p className="max-w-md text-sm leading-relaxed text-[#C9D1DC] sm:text-base">
              {SITE_CONFIG.positioning}. Curated Ceylon sapphires and collector rarities, faceted for pure light.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/gem-types"
                className="btn-luxury-primary inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white sm:px-7"
              >
                <span>Explore Our Gems</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link
                to="/inquiries"
                className="btn-luxury inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-[#E6EAF0] sm:px-7"
              >
                <span>Make an Inquiry</span>
              </Link>
            </div>
          </div>

          {/* Right/Center Hero Animated 3D Cushion Ceylon Sapphire */}
          <div className="order-1 relative flex h-[250px] items-center justify-center sm:h-[380px] lg:order-2 lg:col-span-6 lg:h-[560px]">
            <Gem3D
              cut="cushion"
              colour="#1B3FD9"
              secondaryColour="#3D7BFF"
              size={1.38}
              externalScale={heroScale}
              rotationSpeed={0.32}
              floatAmplitude={0.06}
              glow
              showCausticPlane
              className="h-full w-full"
              ariaLabel="Animated 3D Ceylon Royal Blue Cushion Sapphire"
            />
          </div>
        </div>

        {/* Scroll falling-spark indicator (desktop only so mobile CTAs stay uncluttered) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#C9D1DC]/70">Scroll</span>
          <div className="relative h-8 w-[1px] bg-[#C9D1DC]/25 overflow-hidden">
            <span className="animate-sparkle absolute left-[-1.5px] top-0 h-3 w-1 bg-[#3D7BFF]" />
          </div>
        </div>
      </section>

      {/* b) GEM CAROUSEL — THE COLLECTION */}
      <section
        className="relative overflow-hidden border-t border-[#C9D1DC]/12 py-24 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${activeCarouselGem.glowHex}24 0%, #0A1226 55%, #05070D 100%)`,
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs tracking-[0.26em] uppercase text-[#C9D1DC]/75">
                01 · The Collection
              </p>
              <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
                {SITE_CONFIG.taglineSecondary}
              </SplitHeading>
            </div>
            <Link
              to="/gem-types"
              className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
            >
              <span>All 17+ Varieties</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {/* Stage: Active 3D Gem + Selector Strip */}
          <div className="mt-12 grid grid-cols-1 items-center gap-8 border border-[#C9D1DC]/15 bg-[#05070D]/60 p-6 sm:p-10 lg:grid-cols-12">
            <div className="h-[290px] sm:h-[360px] lg:col-span-6">
              <Gem3D
                cut={activeCarouselGem.cut}
                colour={activeCarouselGem.colorHex}
                secondaryColour={activeCarouselGem.secondaryColorHex}
                effect={activeCarouselGem.effect}
                ior={1.76}
                size={1.38}
                rotationSpeed={0.42}
                showCausticPlane
                className="h-full w-full"
                ariaLabel={`${activeCarouselGem.name} 3D showcase`}
              />
            </div>

            <div className="space-y-5 lg:col-span-6">
              <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">
                {activeCarouselGem.category} · Mohs {activeCarouselGem.hardnessMohs}
              </p>
              <h3 className="font-display text-4xl font-light text-white sm:text-5xl">
                {activeCarouselGem.name}
              </h3>
              <p className="text-base text-[#C9D1DC]">{activeCarouselGem.oneLineCaption}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/gem-types?gem=${activeCarouselGem.id}`)}
                  className="btn-luxury inline-flex items-center gap-2.5 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
                >
                  <span>Inspect Species</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal 8-Gem Carousel Cards */}
          <div
            className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
            role="listbox"
            aria-label="Select a featured Ceylon gemstone"
          >
            {CAROUSEL_GEMS.map((gem, idx) => {
              const selected = idx === activeCarouselIdx;
              return (
                <button
                  key={gem.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setActiveCarouselIdx(idx)}
                  className={`group flex flex-col items-center gap-2.5 border p-3 text-center transition-all duration-300 ${
                    selected
                      ? 'border-[#3D7BFF] bg-[#1B3FD9]/25 shadow-[0_0_24px_rgba(61,123,255,0.22)]'
                      : 'border-[#C9D1DC]/15 bg-[#05070D]/55 hover:border-[#C9D1DC]/45'
                  }`}
                >
                  <GemSVG
                    cut={gem.cut}
                    colorHex={gem.colorHex}
                    secondaryColorHex={gem.secondaryColorHex}
                    effect={gem.effect}
                    size={54}
                    animateSparkle={selected}
                    label={gem.name}
                  />
                  <span className="line-clamp-1 text-[11px] tracking-[0.1em] uppercase text-[#E6EAF0]">
                    {gem.name.replace('Ceylon ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* c) ISLAND OF GEMS */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#05070D] py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs tracking-[0.26em] uppercase text-[#C9D1DC]/75">
                02 · Island of Gems
              </p>
              <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
                Ratna-Dweepa — the Gem Island.
              </SplitHeading>
            </div>
            <Link
              to="/gems-of-sri-lanka"
              className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
            >
              <span>Explore Sri Lanka Heritage</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <SriLankaMap compact />
        </div>
      </section>

      {/* d) FROM EARTH TO LIGHT (5-step visual transformation) */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#0A1226] py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="text-center">
            <p className="text-xs tracking-[0.26em] uppercase text-[#C9D1DC]/75">
              03 · From Earth to Light
            </p>
            <SplitHeading className="mx-auto mt-2 max-w-2xl font-display text-4xl font-light text-white sm:text-5xl">
              {SITE_CONFIG.taglineTertiary}
            </SplitHeading>
          </div>

          <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Morphing 3D Geometry Preview */}
            <div className="h-[320px] border border-[#C9D1DC]/15 bg-[#05070D]/80 lg:col-span-5">
              <Gem3D
                cut={activeStage.cut}
                colour={activeStage.color}
                secondaryColour="#E6EAF0"
                size={1.32}
                rotationSpeed={0.38}
                showCausticPlane
                className="h-full w-full"
                ariaLabel={`Stage ${activeStage.step}: ${activeStage.title}`}
              />
            </div>

            {/* 5 Interactive Stage Selectors */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5 lg:col-span-7">
              {EARTH_TO_LIGHT_STEPS.map((st, idx) => {
                const active = idx === activeStageIdx;
                const icons = [Pickaxe, Layers, Gem, Sparkles, ShieldCheck];
                const IconComp = icons[idx] || Gem;
                return (
                  <button
                    key={st.step}
                    type="button"
                    onClick={() => setActiveStageIdx(idx)}
                    className={`flex flex-col items-start justify-between gap-6 border p-5 text-left transition-all duration-300 ${
                      active
                        ? 'border-[#3D7BFF] bg-[#1B3FD9]/25 shadow-[0_0_24px_rgba(61,123,255,0.2)]'
                        : 'border-[#C9D1DC]/15 bg-[#05070D]/60 hover:border-[#C9D1DC]/40'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-mono-tabular text-xs text-[#3D7BFF]">{st.step}</span>
                      <IconComp size={16} className="text-[#C9D1DC]" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-display text-2xl font-light text-white">{st.title}</p>
                      <p className="mt-1 text-xs text-[#C9D1DC]/80">{st.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* e) LIVE NUMBERS */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#05070D] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LIVE_STATS.map((stat) => (
              <div
                key={stat.id}
                className="border border-[#C9D1DC]/18 bg-[#0A1226]/65 p-7 transition-colors hover:border-[#3D7BFF]/50"
              >
                <p className="font-display text-4xl font-light text-silver-gradient sm:text-5xl">
                  <CountUpNumber
                    target={stat.numericTarget}
                    suffix={stat.suffix}
                    override={stat.displayOverride}
                  />
                </p>
                <p className="mt-3 text-sm font-medium text-white">{stat.label}</p>
                <p className="mt-1.5 text-xs text-[#C9D1DC]/70">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* f) GLOBAL REACH */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#0A1226] py-24">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-4 sm:px-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <p className="text-xs tracking-[0.26em] uppercase text-[#C9D1DC]/75">
              04 · Global Reach
            </p>
            <SplitHeading className="font-display text-4xl font-light text-white sm:text-5xl">
              From Colombo to Global Ateliers.
            </SplitHeading>
            <p className="text-sm leading-relaxed text-[#C9D1DC]">
              Insured international consignments connecting Sri Lanka’s gem fields with Europe, North America, the Middle East, and Asia.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[#C9D1DC]/15 pt-4 text-xs text-[#C9D1DC]">
              {MARKET_DESTINATIONS.slice(0, 10).map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5">
                  <GlobeIcon size={11} className="text-[#3D7BFF]" aria-hidden="true" />
                  {d.name}
                </span>
              ))}
            </div>
            <div className="pt-2">
              <Link
                to="/global-market"
                className="btn-luxury inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
              >
                <span>Explore Global Markets</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="h-[360px] sm:h-[440px] lg:col-span-7">
            <Globe className="h-full w-full" />
          </div>
        </div>
      </section>

      {/* g) SIGNATURE PIECES + EDITORIAL PHOTOGRAPHY */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#05070D] py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs tracking-[0.26em] uppercase text-[#C9D1DC]/75">
                05 · Signature Reserve
              </p>
              <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
                Curated Light, Held Back.
              </SplitHeading>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
            >
              <span>View Product Catalogue</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {signaturePieces.map((stone) => (
              <TiltGemCard key={stone.id} className="flex flex-col justify-between p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] tracking-[0.18em] uppercase text-[#3D7BFF]">
                      Sample Data · {stone.origin}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-light text-white">
                      {stone.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#C9D1DC]/75">
                      {stone.colourGrade} · {stone.caratRange}
                    </p>
                  </div>
                  <GemSVG
                    cut={stone.cut}
                    colorHex={stone.colorHex}
                    secondaryColorHex="#E6EAF0"
                    size={76}
                    label={stone.name}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#C9D1DC]/12 pt-4">
                  <span className="text-xs text-[#C9D1DC]">{stone.priceLabel}</span>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-white hover:text-[#3D7BFF]"
                  >
                    <span>View product</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                </div>
              </TiltGemCard>
            ))}
          </div>

          {/* Editorial Craft Photography Duo */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ImageSlot asset={GEM_IMAGES.roughCorundum} className="aspect-[16/9] border border-[#C9D1DC]/15">
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#3D7BFF]">Alluvial Rough</p>
                <p className="mt-1 font-display text-2xl text-white">Hexagonal Ceylon Corundum</p>
              </div>
            </ImageSlot>
            <ImageSlot asset={GEM_IMAGES.spectrumTray} className="aspect-[16/9] border border-[#C9D1DC]/15">
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#3D7BFF]">Curated Spectrum</p>
                <p className="mt-1 font-display text-2xl text-white">Matched for Hue & Brilliance</p>
              </div>
            </ImageSlot>
          </div>
        </div>
      </section>

      {/* h) TRUST STRIP */}
      <section className="border-t border-[#C9D1DC]/12 bg-[#0A1226] py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST_PILLARS.map((pillar, idx) => {
              const icons = [CheckCircle2, Compass, Award, ShieldCheck, Gem];
              const Icon = icons[idx] || CheckCircle2;
              return (
                <div key={pillar.id} className="border border-[#C9D1DC]/12 bg-[#05070D]/55 p-5">
                  <Icon size={20} className="text-[#C9D1DC]" aria-hidden="true" />
                  <h3 className="mt-3 text-sm font-medium text-white">{pillar.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#C9D1DC]/75">{pillar.caption}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 border border-dashed border-[#C9D1DC]/25 bg-[#05070D]/40 px-6 py-4 text-center text-xs tracking-[0.18em] uppercase text-[#C9D1DC]/70">
            {PLACEHOLDERS.certificationPartnerLogos} — Independent Laboratory Partner Logos Slot
          </div>
        </div>
      </section>

      {/* i) FINAL CTA */}
      <section className="relative overflow-hidden border-t border-[#C9D1DC]/12 bg-[#05070D] py-28">
        <GemParticles density={28} tintHex="#1B3FD9" />
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center px-4 text-center sm:px-8">
          <div className="h-[260px] w-[260px] sm:h-[320px] sm:w-[320px]">
            <Gem3D
              cut="cushion"
              colour="#1B3FD9"
              secondaryColour="#3D7BFF"
              size={1.45}
              rotationSpeed={0.28}
              glow
              className="h-full w-full"
              ariaLabel="Slowly rotating royal blue Ceylon sapphire"
            />
          </div>
          <SplitHeading className="mt-4 font-display text-4xl font-light text-white sm:text-6xl">
            Let’s Find Your Stone.
          </SplitHeading>
          <p className="mt-3 max-w-md text-sm text-[#C9D1DC]">
            Speak directly with our Colombo gemstone specialists for loose stones, matched pairs, or bespoke trade sourcing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/inquiries"
              className="btn-luxury-primary px-8 py-3.5 text-xs font-medium tracking-[0.2em] uppercase text-white"
            >
              Start an Inquiry
            </Link>
            <Link
              to="/contact"
              className="btn-luxury px-8 py-3.5 text-xs font-medium tracking-[0.2em] uppercase text-white"
            >
              Contact Colombo Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
