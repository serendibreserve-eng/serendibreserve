import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Box, Camera, Flame, Sun, X } from 'lucide-react';
import { GemCut, GemEffect } from '../content/gems';
import { prefersReducedMotion } from '../utils/webglHelpers';
import { Gem3D } from './Gem3D';
import { GemSpecimenPhoto } from './GemSpecimenPhoto';

export interface SpecimenModalData {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  photoUrl: string;
  cut: GemCut;
  colorHex: string;
  secondaryColorHex: string;
  glowHex: string;
  ior: number;
  effect?: GemEffect;
  matteTolerance?: number;
  specs: Array<{ label: string; value: string; mono?: boolean; span2?: boolean }>;
  highlightTitle: string;
  highlightBody: string;
  ctaLabel: string;
}

interface SpecimenDetailModalProps {
  item: SpecimenModalData | null;
  onClose: () => void;
  onAction: (item: SpecimenModalData) => void;
  defaultViewMode?: 'photo' | '3d';
}

export const SpecimenDetailModal: React.FC<SpecimenDetailModalProps> = ({
  item,
  onClose,
  onAction,
  defaultViewMode = 'photo',
}) => {
  const [viewMode, setViewMode] = useState<'photo' | '3d'>(defaultViewMode);
  const [alexMode, setAlexMode] = useState<'daylight' | 'candlelight'>('daylight');
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (item) {
      setViewMode(defaultViewMode);
      setAlexMode('daylight');
    }
  }, [item, defaultViewMode]);

  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={`modal-backdrop-${item.id}`}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} detail view`}
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#04060E]/92 p-4 sm:p-8"
        >
          <motion.div
            key={`modal-panel-${item.id}`}
            initial={
              reduced
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.92, y: 28, clipPath: 'inset(6% 6% 6% 6%)' }
            }
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }
            }
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 14, clipPath: 'inset(4% 4% 4% 4%)' }
            }
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden border border-[#C9D1DC]/25 bg-[#0A1226] shadow-[0_32px_90px_rgba(3,6,18,0.95)] lg:grid-cols-12"
          >
            {/* Opening sapphire specular scan sheen */}
            {!reduced && (
              <motion.div
                aria-hidden="true"
                initial={{ x: '-110%', opacity: 0.65 }}
                animate={{ x: '130%', opacity: 0 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute inset-y-0 z-30 w-1/3 bg-gradient-to-r from-transparent via-[#3D7BFF]/20 to-transparent skew-x-[-18deg]"
              />
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close specimen detail overlay"
              className="absolute right-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center border border-[#C9D1DC]/25 bg-[#05070D]/85 text-white transition-colors hover:border-[#3D7BFF] hover:text-[#3D7BFF]"
            >
              <X size={18} />
            </button>

            {/* Left: Matching Dark Royal Blue Studio Specimen Stage */}
            <div
              className="relative flex min-h-[340px] flex-col items-center justify-between overflow-hidden p-6 lg:col-span-6 lg:min-h-[540px]"
              style={{
                background:
                  'radial-gradient(circle at 50% 45%, rgba(27, 63, 217, 0.36) 0%, #0A132C 48%, #05070D 100%)',
              }}
            >
              {/* View mode switch: Actual Macro Specimen Photo vs Interactive 3D Cut */}
              <div className="relative z-20 flex items-center gap-1.5 border border-[#C9D1DC]/20 bg-[#05070D]/80 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('photo')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase transition-colors ${
                    viewMode === 'photo'
                      ? 'bg-[#1B3FD9] text-white'
                      : 'text-[#C9D1DC] hover:text-white'
                  }`}
                >
                  <Camera size={13} aria-hidden="true" />
                  <span>Specimen Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase transition-colors ${
                    viewMode === '3d'
                      ? 'bg-[#1B3FD9] text-white'
                      : 'text-[#C9D1DC] hover:text-white'
                  }`}
                >
                  <Box size={13} aria-hidden="true" />
                  <span>Interactive 3D</span>
                </button>
              </div>

              {/* Center Stage Display */}
              <div className="relative my-4 flex h-[280px] w-full items-center justify-center sm:h-[360px]">
                <AnimatePresence mode="wait">
                  {viewMode === 'photo' ? (
                    <motion.div
                      key={`stage-photo-${item.id}`}
                      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.84, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full w-full"
                    >
                      <GemSpecimenPhoto
                        src={item.photoUrl}
                        alt={item.title}
                        glowHex={item.glowHex}
                        tolerance={item.matteTolerance}
                        variant="hero"
                        showBackdrop={false}
                        className="h-full w-full"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`stage-3d-${item.id}`}
                      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full w-full"
                    >
                      <Gem3D
                        cut={item.cut}
                        colour={item.colorHex}
                        secondaryColour={item.secondaryColorHex}
                        effect={item.effect}
                        alexandriteMode={item.effect === 'alexandrite' ? alexMode : 'auto'}
                        ior={item.ior}
                        size={1.45}
                        interactive
                        showCausticPlane
                        className="h-full w-full"
                        ariaLabel={`Draggable 3D ${item.title}`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative z-20 flex flex-col items-center gap-3">
                <p className="text-[11px] tracking-[0.18em] uppercase text-[#C9D1DC]/70">
                  {viewMode === 'photo'
                    ? `Studio Specimen · Cut: ${item.cut}`
                    : `Drag to rotate stone · Cut: ${item.cut}`}
                </p>

                {item.effect === 'alexandrite' && viewMode === '3d' && (
                  <div className="flex items-center gap-2 border border-[#C9D1DC]/20 bg-[#0A1226] p-1">
                    <button
                      type="button"
                      onClick={() => setAlexMode('daylight')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider ${
                        alexMode === 'daylight' ? 'bg-[#158467] text-white' : 'text-[#C9D1DC]'
                      }`}
                    >
                      <Sun size={13} aria-hidden="true" />
                      Daylight
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlexMode('candlelight')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider ${
                        alexMode === 'candlelight' ? 'bg-[#8E2464] text-white' : 'text-[#C9D1DC]'
                      }`}
                    >
                      <Flame size={13} aria-hidden="true" />
                      Candlelight
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Staggered Gem / Product Dossier */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6">
              <div className="space-y-5 pr-8">
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">{item.eyebrow}</p>
                  <h2 className="mt-1 font-display text-3xl font-light text-white sm:text-4xl">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#C9D1DC]">{item.subtitle}</p>
                </motion.div>

                <motion.dl
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-1 gap-3 border-y border-[#C9D1DC]/15 py-4 text-sm sm:grid-cols-2"
                >
                  {item.specs.map((spec) => (
                    <div key={spec.label} className={spec.span2 ? 'sm:col-span-2' : undefined}>
                      <dt className="text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/65">
                        {spec.label}
                      </dt>
                      <dd
                        className={`mt-0.5 text-white ${
                          spec.mono ? 'font-mono-tabular' : ''
                        }`}
                      >
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </motion.dl>

                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="text-xs tracking-[0.18em] uppercase text-[#3D7BFF]">
                    {item.highlightTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#C9D1DC]">{item.highlightBody}</p>
                </motion.div>
              </div>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <button
                  type="button"
                  onClick={() => onAction(item)}
                  className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs font-medium tracking-[0.18em] uppercase text-white"
                >
                  <span>{item.ctaLabel}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-luxury px-5 py-3 text-xs tracking-[0.18em] uppercase text-[#C9D1DC]"
                >
                  Close
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
