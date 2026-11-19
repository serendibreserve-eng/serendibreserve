import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { GEMS_DATA } from '../content/gems';
import { SITE_CONFIG } from '../content/siteConfig';
import {
  computeZoomPulseScale,
  formatCarouselCounter,
  getNextCarouselIndex,
} from '../utils/carouselLogic';
import { prefersReducedMotion } from '../utils/webglHelpers';
import { Gem3D } from './Gem3D';
import { GemSpecimenPhoto } from './GemSpecimenPhoto';
import { SplitHeading } from './MotionPrimitives';

const CAROUSEL_GEMS = GEMS_DATA.filter((g) => g.featuredInCarousel);
const AUTO_ADVANCE_MS = 4800;

interface CollectionShowcaseStageProps {
  onInspectGem: (gemId: string) => void;
}

/**
 * Section 01 — The Collection ("The Reserve of Rare Light.")
 * Auto-advancing abstract metamorphosis stage with expanding prism apertures,
 * optical crystal zoom bursts, and smooth multi-stone 3D + photographic transitions.
 */
export const CollectionShowcaseStage: React.FC<CollectionShowcaseStageProps> = ({
  onInspectGem,
}) => {
  const reduced = prefersReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion());
  const [isHovered, setIsHovered] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const activeGem = CAROUSEL_GEMS[activeIdx] || CAROUSEL_GEMS[0];

  // Auto-advance cycle timer
  useEffect(() => {
    if (reduced || !isPlaying || isHovered || CAROUSEL_GEMS.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => getNextCarouselIndex(prev, CAROUSEL_GEMS.length, 1));
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [reduced, isPlaying, isHovered]);

  // Optical zoom-burst curve driving Gem3D scale whenever activeIdx changes
  useEffect(() => {
    if (reduced) {
      setZoomScale(1);
      return;
    }
    let rafId = 0;
    const start = performance.now();
    const duration = 920;

    const tick = (now: number) => {
      const elapsed = now - start;
      setZoomScale(computeZoomPulseScale(elapsed, duration));
      if (elapsed < duration) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    setZoomScale(computeZoomPulseScale(0, duration));
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [activeIdx, reduced]);

  const selectIndex = (idx: number) => {
    setActiveIdx(getNextCarouselIndex(idx, CAROUSEL_GEMS.length, 0));
  };

  const stepIndex = (delta: number) => {
    setActiveIdx((prev) => getNextCarouselIndex(prev, CAROUSEL_GEMS.length, delta));
  };

  return (
    <section
      className="relative overflow-hidden border-t border-[#C9D1DC]/12 py-24 transition-colors duration-700"
      style={{
        background: `radial-gradient(circle at 50% 42%, ${activeGem.glowHex}28 0%, #0A1226 55%, #05070D 100%)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Section Header + Auto-Morph Controls */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs tracking-[0.26em] uppercase text-[#C9D1DC]/75">
              01 · The Collection
            </p>
            <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
              {SITE_CONFIG.taglineSecondary}
            </SplitHeading>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-cycle play/pause + prev/next controls */}
            <div className="inline-flex items-center border border-[#C9D1DC]/20 bg-[#05070D]/75">
              <button
                type="button"
                onClick={() => stepIndex(-1)}
                aria-label="Previous gemstone in collection"
                className="flex h-9 w-9 items-center justify-center text-[#C9D1DC] transition-colors hover:bg-[#1B3FD9]/25 hover:text-white"
              >
                <ChevronLeft size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-pressed={isPlaying}
                aria-label={isPlaying ? 'Pause automatic gem transition' : 'Resume automatic gem transition'}
                className="inline-flex h-9 items-center gap-1.5 border-x border-[#C9D1DC]/15 px-3 text-[11px] font-mono-tabular tracking-[0.16em] uppercase text-[#E6EAF0] transition-colors hover:bg-[#1B3FD9]/25"
              >
                {isPlaying ? (
                  <Pause size={12} className="text-[#3D7BFF]" aria-hidden="true" />
                ) : (
                  <Play size={12} className="text-[#3D7BFF]" aria-hidden="true" />
                )}
                <span>{formatCarouselCounter(activeIdx, CAROUSEL_GEMS.length)}</span>
              </button>
              <button
                type="button"
                onClick={() => stepIndex(1)}
                aria-label="Next gemstone in collection"
                className="flex h-9 w-9 items-center justify-center text-[#C9D1DC] transition-colors hover:bg-[#1B3FD9]/25 hover:text-white"
              >
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>

            <Link
              to="/gem-types"
              className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C9D1DC] hover:text-white"
            >
              <span>All 17+ Varieties</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Main Abstract Zoom Metamorphosis Stage */}
        <div className="relative mt-10 overflow-hidden border border-[#C9D1DC]/18 bg-[#05070D]/70 p-6 sm:p-10">
          {/* Top sweeping cycle timing bar */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-[#C9D1DC]/10">
            {isPlaying && !isHovered && !reduced && (
              <motion.div
                key={`progress-${activeGem.id}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
                className="h-full origin-left"
                style={{
                  background: `linear-gradient(90deg, #1B3FD9 0%, ${activeGem.glowHex} 65%, #FFFFFF 100%)`,
                }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left: Abstract Prismatic Aperture + Optical Zoom Gem3D */}
            <div className="relative flex h-[320px] items-center justify-center overflow-hidden sm:h-[390px] lg:col-span-6">
              {/* Abstract zoom burst rings & crystal geometry waves */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`burst-${activeGem.id}`}
                  aria-hidden="true"
                  initial={reduced ? false : { opacity: 0.95, scale: 0.25, rotate: -38 }}
                  animate={{ opacity: 0, scale: 1.65, rotate: 32 }}
                  exit={{ opacity: 0, scale: 1.9 }}
                  transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <svg viewBox="0 0 240 240" className="h-[310px] w-[310px] sm:h-[370px] sm:w-[370px]">
                    <polygon
                      points="120,12 196,44 228,120 196,196 120,228 44,196 12,120 44,44"
                      fill="none"
                      stroke={activeGem.glowHex}
                      strokeWidth="1.2"
                      strokeOpacity="0.8"
                    />
                    <polygon
                      points="120,34 181,59 206,120 181,181 120,206 59,181 34,120 59,59"
                      fill="none"
                      stroke="#E6EAF0"
                      strokeWidth="0.9"
                      strokeOpacity="0.65"
                      strokeDasharray="6 6"
                    />
                  </svg>
                </motion.div>
              </AnimatePresence>

              {/* Radial spectral warp glow */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`glow-${activeGem.id}`}
                  aria-hidden="true"
                  initial={reduced ? false : { opacity: 0.15, scale: 0.45 }}
                  animate={{ opacity: [0.85, 0.45], scale: [0.55, 1.15, 0.95] }}
                  exit={{ opacity: 0, scale: 1.45 }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute h-64 w-64 rounded-full blur-3xl sm:h-80 sm:w-80"
                  style={{
                    background: `radial-gradient(circle, ${activeGem.glowHex}88 0%, ${activeGem.colorHex}33 48%, rgba(5,7,13,0) 76%)`,
                  }}
                />
              </AnimatePresence>

              {/* Outgoing specimen depth-zoom dissolve echo */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`echo-${activeGem.id}`}
                  aria-hidden="true"
                  initial={reduced ? false : { opacity: 0.45, scale: 0.55, filter: 'blur(8px)' }}
                  animate={{ opacity: 0.14, scale: 1.08, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.75, filter: 'blur(16px)' }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute inset-12 flex items-center justify-center opacity-15"
                >
                  <GemSpecimenPhoto
                    src={activeGem.photoUrl}
                    alt=""
                    glowHex={activeGem.glowHex}
                    tolerance={activeGem.matteTolerance}
                    variant="thumb"
                    showBackdrop={false}
                    className="h-56 w-56 sm:h-72 sm:w-72"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Persistent Live 3D Crystal Driven by Optical Zoom Curve */}
              <div className="relative z-10 h-full w-full">
                <Gem3D
                  cut={activeGem.cut}
                  colour={activeGem.colorHex}
                  secondaryColour={activeGem.secondaryColorHex}
                  effect={activeGem.effect}
                  ior={activeGem.ior}
                  size={1.4}
                  externalScale={zoomScale}
                  rotationSpeed={zoomScale > 1.03 ? 1.15 : 0.46}
                  showCausticPlane
                  className="h-full w-full"
                  ariaLabel={`${activeGem.name} 3D showcase`}
                />
              </div>
            </div>

            {/* Right: Morphing Editorial Spec Card */}
            <div className="lg:col-span-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`meta-${activeGem.id}`}
                  initial={reduced ? false : { opacity: 0, y: 18, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, y: -14, scale: 1.03 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: activeGem.glowHex,
                        boxShadow: `0 0 12px ${activeGem.glowHex}`,
                      }}
                    />
                    <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">
                      {activeGem.category} · Mohs {activeGem.hardnessMohs} · RI {activeGem.refractiveIndex}
                    </p>
                  </div>

                  <h3
                    data-testid="collection-active-gem-title"
                    className="font-display text-4xl font-light text-white sm:text-5xl"
                  >
                    {activeGem.name}
                  </h3>

                  <p className="text-base leading-relaxed text-[#C9D1DC]">
                    {activeGem.oneLineCaption}
                  </p>

                  <p className="text-xs tracking-[0.14em] uppercase text-[#C9D1DC]/70">
                    Ceylon Sources: <span className="text-[#E6EAF0]">{activeGem.sriLankanSources}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onInspectGem(activeGem.id)}
                      className="btn-luxury inline-flex items-center gap-2.5 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
                    >
                      <span>Inspect Species</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Horizontal 8-Gem Carousel Selector Cards */}
        <div
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
          role="listbox"
          aria-label="Select a featured Ceylon gemstone"
        >
          {CAROUSEL_GEMS.map((gem, idx) => {
            const selected = idx === activeIdx;
            return (
              <button
                key={gem.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => selectIndex(idx)}
                className={`group relative flex flex-col items-center gap-2 overflow-hidden border p-3 text-center transition-all duration-300 ${
                  selected
                    ? 'scale-[1.02] border-[#3D7BFF] bg-[#1B3FD9]/25 shadow-[0_0_26px_rgba(61,123,255,0.28)]'
                    : 'border-[#C9D1DC]/15 bg-[#05070D]/55 hover:border-[#C9D1DC]/45'
                }`}
              >
                <div className={`transition-transform duration-500 ${selected ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <GemSpecimenPhoto
                    src={gem.photoUrl}
                    alt={gem.name}
                    glowHex={gem.glowHex}
                    tolerance={gem.matteTolerance}
                    variant="thumb"
                    showBackdrop={false}
                    className="h-14 w-14"
                  />
                </div>
                <span className="line-clamp-1 text-[11px] tracking-[0.1em] uppercase text-[#E6EAF0]">
                  {gem.name.replace('Ceylon ', '')}
                </span>
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${gem.glowHex}, #FFFFFF, transparent)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
