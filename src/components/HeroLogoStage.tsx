import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GEMS_DATA } from '../content/gems';
import { extractDarkLogoRGBA } from '../utils/gemPhotoMatte';
import { prefersReducedMotion } from '../utils/webglHelpers';
import { Gem3D } from './Gem3D';
import { GemSpecimenPhoto } from './GemSpecimenPhoto';

interface HeroLogoStageProps {
  heroScale: number;
}

const LOGO_SRC = '/assets/aistudio/Frame_3679__1__483cd70c.png';
const logoCutoutCache = new Map<string, string>();

interface OrbitNode {
  id: string;
  label: string;
  ring: 'outer' | 'inner';
  anchorClass: string;
  sizeClass: string;
}

const ORBIT_NODES: OrbitNode[] = [
  {
    id: 'padparadscha',
    label: 'Padparadscha',
    ring: 'outer',
    anchorClass: '-top-5 left-1/2 -translate-x-1/2',
    sizeClass: 'h-10 w-10 sm:h-12 sm:w-12',
  },
  {
    id: 'ruby',
    label: 'Ceylon Ruby',
    ring: 'outer',
    anchorClass: 'top-1/2 -right-5 -translate-y-1/2',
    sizeClass: 'h-10 w-10 sm:h-13 sm:w-13',
  },
  {
    id: 'alexandrite',
    label: 'Alexandrite',
    ring: 'outer',
    anchorClass: '-bottom-5 left-1/2 -translate-x-1/2',
    sizeClass: 'h-10 w-10 sm:h-12 sm:w-12',
  },
  {
    id: 'star-sapphire',
    label: 'Star Sapphire',
    ring: 'inner',
    anchorClass: 'top-1/2 -left-5 -translate-y-1/2',
    sizeClass: 'h-9 w-9 sm:h-11 sm:w-11',
  },
  {
    id: 'spinel',
    label: 'Cobalt Spinel',
    ring: 'inner',
    anchorClass: '-top-4 right-[16%]',
    sizeClass: 'h-9 w-9 sm:h-11 sm:w-11',
  },
];

/**
 * Hero constellation stage showcasing:
 * 1) Shining transparent-matted Original Serendib Reserve Logo (unobstructed)
 * 2) Beside the Large Animated 3D Royal Blue Ceylon Sapphire framed by
 *    revolving orbital astrolabe rings & real moving Ceylon gem specimens.
 */
export const HeroLogoStage: React.FC<HeroLogoStageProps> = ({ heroScale }) => {
  const reduced = prefersReducedMotion();
  const [logoCutoutUrl, setLogoCutoutUrl] = useState<string | null>(
    () => logoCutoutCache.get(LOGO_SRC) || null,
  );

  useEffect(() => {
    const cached = logoCutoutCache.get(LOGO_SRC);
    if (cached) {
      setLogoCutoutUrl(cached);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = LOGO_SRC;

    img.onload = () => {
      if (cancelled) return;
      try {
        const w = img.naturalWidth || 1333;
        const h = img.naturalHeight || 1052;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const res = extractDarkLogoRGBA(imageData.data, w, h, {
          darkThreshold: 28,
          featherRange: 34,
          textBandRatio: 0.56,
        });

        const outCanvas = document.createElement('canvas');
        outCanvas.width = res.cropWidth;
        outCanvas.height = res.cropHeight;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) return;

        const outData = new ImageData(new Uint8ClampedArray(res.output), w, h);
        const tmp = document.createElement('canvas');
        tmp.width = w;
        tmp.height = h;
        const tmpCtx = tmp.getContext('2d');
        if (!tmpCtx) return;
        tmpCtx.putImageData(outData, 0, 0);

        outCtx.drawImage(
          tmp,
          res.cropX,
          res.cropY,
          res.cropWidth,
          res.cropHeight,
          0,
          0,
          res.cropWidth,
          res.cropHeight,
        );

        const url = outCanvas.toDataURL('image/png');
        logoCutoutCache.set(LOGO_SRC, url);
        if (!cancelled) setLogoCutoutUrl(url);
      } catch {
        // Fallback smoothly if canvas blocked
      }
    };

    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedNodes = ORBIT_NODES.map((node) => {
    const spec = GEMS_DATA.find((g) => g.id === node.id);
    return spec ? { ...node, spec } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const outerNodes = resolvedNodes.filter((n) => n.ring === 'outer');
  const innerNodes = resolvedNodes.filter((n) => n.ring === 'inner');

  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-3 py-2 sm:flex-row sm:gap-5 sm:py-4 lg:gap-7">
      {/* 1) Shining Transparent-Matted Original Serendib Reserve Logo (completely unobstructed) */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.92, y: 10 }}
        animate={
          reduced
            ? { opacity: 1, scale: 1 }
            : { opacity: 1, scale: 1, y: [0, -6, 0] }
        }
        transition={
          reduced
            ? { duration: 0.35 }
            : {
                opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 6.2, repeat: Infinity, ease: 'easeInOut' },
              }
        }
        className="relative z-30 flex w-[165px] shrink-0 items-center justify-center sm:w-[225px] lg:w-[245px] xl:w-[268px]"
      >
        {/* Breathing royal-sapphire luminescence behind the crest */}
        <motion.div
          aria-hidden="true"
          animate={
            reduced
              ? undefined
              : { opacity: [0.55, 0.95, 0.55], scale: [0.94, 1.06, 0.94] }
          }
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-1 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(61,123,255,0.6) 0%, rgba(27,63,217,0.34) 48%, rgba(5,7,13,0) 78%)',
          }}
        />

        <div className="relative aspect-[1210/780] w-full">
          <img
            src={logoCutoutUrl || LOGO_SRC}
            alt="Serendib Reserve original royal blue sapphire and Ceylon lion emblem"
            className={`relative z-10 h-full w-full object-contain drop-shadow-[0_0_24px_rgba(61,123,255,0.65)] transition-opacity duration-300 ${
              logoCutoutUrl ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Silhouette-masked specular glint traveling strictly across white lion/letters & sapphire */}
          {logoCutoutUrl && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
              style={{
                WebkitMaskImage: `url("${logoCutoutUrl}")`,
                maskImage: `url("${logoCutoutUrl}")`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
            >
              <div
                className="logo-shine-sweep h-full w-1/3"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 50%, rgba(147,197,253,0.7) 75%, rgba(255,255,255,0) 100%)',
                }}
              />
            </div>
          )}

          {/* Pinpoint diamond star flare over the crest sapphire */}
          <span
            aria-hidden="true"
            className="animate-sparkle pointer-events-none absolute left-[49%] top-[33%] z-30 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_4px_rgba(147,197,253,0.95)]"
          />
        </div>
      </motion.div>

      {/* Subtle vertical platinum hairline divider on sm+ */}
      <div
        aria-hidden="true"
        className="hidden h-48 w-[1px] shrink-0 bg-gradient-to-b from-transparent via-[#C9D1DC]/35 to-transparent sm:block"
      />

      {/* 2) Big Interactive 3D Royal Blue Cushion Sapphire + Revolving Orbiting Ceylon Gems */}
      <div className="relative flex h-[250px] w-[250px] shrink-0 items-center justify-center sm:h-[360px] sm:w-[360px] lg:h-[430px] lg:w-[430px] xl:h-[465px] xl:w-[465px]">
        {/* Deep sapphire halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(61,123,255,0.38) 0%, rgba(27,63,217,0.22) 48%, rgba(5,7,13,0) 76%)',
          }}
        />

        {/* Outer Orbit Ring carrying counter-rotated upright Ceylon gem specimens */}
        <div className="animate-orbit-slow pointer-events-none absolute z-20 h-[232px] w-[232px] rounded-full border border-dashed border-[#C9D1DC]/20 sm:h-[336px] sm:w-[336px] lg:h-[404px] lg:w-[404px] xl:h-[436px] xl:w-[436px]">
          <span
            aria-hidden="true"
            className="absolute left-1/4 top-[11%] h-1.5 w-1.5 rounded-full bg-[#3D7BFF] shadow-[0_0_12px_#3D7BFF]"
          />
          {outerNodes.map((orb) => (
            <div
              key={orb.id}
              className={`pointer-events-auto absolute ${orb.anchorClass}`}
            >
              <Link
                to={`/gem-types?gem=${orb.spec.id}`}
                aria-label={`Explore ${orb.spec.name}`}
                className="animate-orbit-counter-slow group flex flex-col items-center gap-1 focus:outline-none"
              >
                <div
                  className={`relative flex items-center justify-center rounded-full border border-[#C9D1DC]/25 bg-[#070D1E]/85 p-1.5 backdrop-blur-sm transition-all duration-300 group-hover:scale-115 group-hover:border-[#3D7BFF] group-hover:shadow-[0_0_24px_rgba(61,123,255,0.5)] ${orb.sizeClass}`}
                >
                  <GemSpecimenPhoto
                    src={orb.spec.photoUrl}
                    alt={orb.spec.name}
                    glowHex={orb.spec.glowHex}
                    tolerance={orb.spec.matteTolerance}
                    variant="thumb"
                    showBackdrop={false}
                    className="h-full w-full"
                  />
                </div>
                <span className="hidden text-[9px] tracking-[0.18em] uppercase text-[#C9D1DC]/80 transition-colors group-hover:text-white sm:block">
                  {orb.label}
                </span>
              </Link>
            </div>
          ))}
        </div>

        {/* Inner Counter-Rotating Orbit Ring */}
        <div className="animate-orbit-reverse pointer-events-none absolute z-20 h-[182px] w-[182px] rounded-full border border-[#3D7BFF]/24 sm:h-[268px] sm:w-[268px] lg:h-[322px] lg:w-[322px] xl:h-[348px] xl:w-[348px]">
          <span
            aria-hidden="true"
            className="absolute bottom-[12%] right-[12%] h-1.5 w-1.5 rounded-full bg-[#E6EAF0] shadow-[0_0_10px_#FFFFFF]"
          />
          {innerNodes.map((orb) => (
            <div
              key={orb.id}
              className={`pointer-events-auto absolute ${orb.anchorClass}`}
            >
              <Link
                to={`/gem-types?gem=${orb.spec.id}`}
                aria-label={`Explore ${orb.spec.name}`}
                className="animate-orbit-counter-rev group flex flex-col items-center gap-1 focus:outline-none"
              >
                <div
                  className={`relative flex items-center justify-center rounded-full border border-[#C9D1DC]/25 bg-[#070D1E]/85 p-1.5 backdrop-blur-sm transition-all duration-300 group-hover:scale-115 group-hover:border-[#3D7BFF] group-hover:shadow-[0_0_24px_rgba(61,123,255,0.5)] ${orb.sizeClass}`}
                >
                  <GemSpecimenPhoto
                    src={orb.spec.photoUrl}
                    alt={orb.spec.name}
                    glowHex={orb.spec.glowHex}
                    tolerance={orb.spec.matteTolerance}
                    variant="thumb"
                    showBackdrop={false}
                    className="h-full w-full"
                  />
                </div>
                <span className="hidden text-[9px] tracking-[0.18em] uppercase text-[#C9D1DC]/80 transition-colors group-hover:text-white sm:block">
                  {orb.label}
                </span>
              </Link>
            </div>
          ))}
        </div>

        {/* Central 3D Royal Blue Cushion Sapphire */}
        <div className="relative z-10 h-[142px] w-[142px] sm:h-[218px] sm:w-[218px] lg:h-[268px] lg:w-[268px] xl:h-[290px] xl:w-[290px]">
          <Gem3D
            cut="cushion"
            colour="#1B3FD9"
            secondaryColour="#3D7BFF"
            size={1.34}
            externalScale={heroScale}
            rotationSpeed={0.34}
            floatAmplitude={0.07}
            glow
            showCausticPlane
            className="h-full w-full"
            ariaLabel="Animated 3D Ceylon Royal Blue Cushion Sapphire"
          />
        </div>
      </div>
    </div>
  );
};
