import React, { useState } from 'react';
import { ImageAsset } from '../content/images';
import { GemSVG } from './GemSVG';

interface ImageSlotProps {
  asset: ImageAsset;
  className?: string;
  overlayClassName?: string;
  kenBurns?: boolean;
  children?: React.ReactNode;
}

/**
 * Editorial photography slot with dark gradient overlay, slow Ken Burns zoom,
 * and automatic CSS/SVG fallback if an asset fails to load.
 * Swap assets centrally in src/content/images.ts (REPLACE WITH SERENDIB RESERVE PHOTO).
 */
export const ImageSlot: React.FC<ImageSlotProps> = ({
  asset,
  className = '',
  overlayClassName = 'bg-gradient-to-t from-[#05070D] via-[#05070D]/45 to-transparent',
  kenBurns = true,
  children,
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#0A1226] ${className}`}>
      {!failed ? (
        <img
          src={asset.url}
          alt={asset.alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${kenBurns ? 'animate-ken-burns' : ''}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0A1226] to-[#05070D] p-6 text-center">
          <GemSVG cut="cushion" size={64} label={asset.alt} />
          <span className="text-xs tracking-[0.2em] uppercase text-[#C9D1DC]/70">{asset.caption}</span>
        </div>
      )}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${overlayClassName}`} />
      {children}
    </div>
  );
};
