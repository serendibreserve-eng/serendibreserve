import React from 'react';

interface SerendibCrestProps {
  size?: number;
  className?: string;
}

/**
 * Vector monogram inspired by the Serendib Reserve crest:
 * Stylized Ceylon lion mane & banyan roots encircling a faceted emerald-cut blue sapphire.
 */
export const SerendibCrest: React.FC<SerendibCrestProps> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="sr-crest-sapphire" x1="40" y1="32" x2="80" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3D7BFF" />
          <stop offset="50%" stopColor="#1B3FD9" />
          <stop offset="100%" stopColor="#08164F" />
        </linearGradient>
        <linearGradient id="sr-crest-silver" x1="12" y1="12" x2="108" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#C9D1DC" />
          <stop offset="100%" stopColor="#8E9BAE" />
        </linearGradient>
      </defs>

      {/* Radiating stylized banyan roots (left) & lion mane (right) */}
      <g stroke="url(#sr-crest-silver)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M46 36 C36 26, 26 26, 18 22" />
        <path d="M42 48 C30 42, 22 44, 14 40" />
        <path d="M40 60 C28 60, 20 62, 12 60" />
        <path d="M42 72 C30 78, 22 76, 15 82" />
        <path d="M46 84 C36 94, 28 95, 22 102" />
        <path d="M56 32 C54 22, 58 16, 62 12" />
        <path d="M56 88 C52 98, 56 104, 60 108" />

        {/* Lion silhouette & sweeping mane */}
        <path d="M68 28 C82 22, 98 28, 102 44 C105 52, 101 58, 106 64 C102 68, 96 68, 94 74 C98 78, 94 88, 84 94 C76 98, 68 96, 66 88" />
        <path d="M74 36 C86 34, 94 42, 92 50" />
        <path d="M84 52 L92 52 L88 57" />
        <path d="M76 66 C84 68, 88 74, 84 82" />
      </g>

      {/* Central Emerald/Cushion Sapphire Emblem */}
      <polygon
        points="49,38 69,38 75,44 75,76 69,82 49,82 43,76 43,44"
        fill="url(#sr-crest-sapphire)"
        stroke="#E6EAF0"
        strokeWidth="1.8"
      />
      <polygon
        points="53,45 65,45 68,48 68,72 65,75 53,75 50,72 50,48"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1"
      />
      <polygon points="43,44 49,38 53,45 50,48" fill="rgba(255,255,255,0.45)" />
    </svg>
  );
};
