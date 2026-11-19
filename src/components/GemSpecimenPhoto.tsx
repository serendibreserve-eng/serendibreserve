import React, { useEffect, useState } from 'react';
import { extractGemSpecimenRGBA, MatteOptions } from '../utils/gemPhotoMatte';

export interface GemSpecimenPhotoProps {
  src: string;
  alt: string;
  glowHex?: string;
  variant?: 'stage' | 'thumb' | 'hero';
  tolerance?: number;
  className?: string;
  imgClassName?: string;
  showBackdrop?: boolean;
}

const processedCache = new Map<string, Promise<string>>();

function processSpecimenImage(src: string, matteOptions?: MatteOptions): Promise<string> {
  const cacheKey = `${src}::${matteOptions?.bgColorTolerance ?? 34}`;
  const cached = processedCache.get(cacheKey);
  if (cached) return cached;

  const task = new Promise<string>((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Downscale oversized images slightly before pixel BFS for crisp instant speed
        const maxDim = 680;
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        const w = Math.max(1, Math.round((img.naturalWidth || 512) * scale));
        const h = Math.max(1, Math.round((img.naturalHeight || 512) * scale));

        const workCanvas = document.createElement('canvas');
        workCanvas.width = w;
        workCanvas.height = h;
        const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const extracted = extractGemSpecimenRGBA(imageData.data, w, h, matteOptions);

        const outImage = new ImageData(new Uint8ClampedArray(extracted.output), w, h);
        ctx.putImageData(outImage, 0, 0);

        // Trim tightly to the gem bounds and add subtle uniform padding
        const pad = Math.round(Math.max(extracted.cropWidth, extracted.cropHeight) * 0.06);
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = extracted.cropWidth + pad * 2;
        finalCanvas.height = extracted.cropHeight + pad * 2;
        const fCtx = finalCanvas.getContext('2d');
        if (!fCtx) {
          resolve(workCanvas.toDataURL('image/png'));
          return;
        }

        fCtx.drawImage(
          workCanvas,
          extracted.cropX,
          extracted.cropY,
          extracted.cropWidth,
          extracted.cropHeight,
          pad,
          pad,
          extracted.cropWidth,
          extracted.cropHeight,
        );

        resolve(finalCanvas.toDataURL('image/png'));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

  processedCache.set(cacheKey, task);
  return task;
}

export const GemSpecimenPhoto: React.FC<GemSpecimenPhotoProps> = ({
  src,
  alt,
  glowHex = '#3D7BFF',
  variant = 'stage',
  tolerance,
  className = '',
  imgClassName = '',
  showBackdrop = true,
}) => {
  const [cutoutSrc, setCutoutSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setCutoutSrc(null);
    processSpecimenImage(
      src,
      tolerance !== undefined ? { bgColorTolerance: tolerance } : undefined,
    ).then((url) => {
      if (active) setCutoutSrc(url);
    });
    return () => {
      active = false;
    };
  }, [src, tolerance]);

  const paddingClass =
    variant === 'thumb' ? 'p-1.5' : variant === 'hero' ? 'p-6 sm:p-8' : 'p-5 sm:p-6';

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${paddingClass} ${className}`}
      style={
        showBackdrop
          ? {
              background: `radial-gradient(circle at 50% 48%, rgba(27, 63, 217, 0.34) 0%, #0A1432 48%, #05070D 100%)`,
            }
          : undefined
      }
    >
      {/* Matching Royal Blue + Stone-Tinted Aura */}
      {showBackdrop && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${glowHex}26 0%, rgba(27, 63, 217, 0.14) 42%, transparent 72%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[18%] bottom-[12%] h-6 rounded-full blur-xl opacity-75"
            style={{
              background: `radial-gradient(ellipse at center, rgba(61, 123, 255, 0.42) 0%, ${glowHex}22 50%, transparent 80%)`,
            }}
          />
        </>
      )}

      {/* Subtle corner silver hairlines on stage cards */}
      {variant === 'stage' && showBackdrop && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 border border-[#C9D1DC]/10 transition-colors duration-500 group-hover:border-[#3D7BFF]/30"
        />
      )}

      <img
        src={cutoutSrc || src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`relative z-10 h-full w-full object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          cutoutSrc ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${variant !== 'thumb' ? 'group-hover:scale-105' : ''} ${imgClassName}`}
        style={{
          filter:
            variant === 'thumb'
              ? 'drop-shadow(0 6px 12px rgba(5,7,13,0.85))'
              : `drop-shadow(0 18px 26px rgba(3, 6, 16, 0.92)) drop-shadow(0 0 18px ${glowHex}33)`,
        }}
      />
    </div>
  );
};
