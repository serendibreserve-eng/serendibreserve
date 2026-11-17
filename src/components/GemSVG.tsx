import React from 'react';
import { GemCut, GemEffect } from '../content/gems';

interface GemSVGProps {
  cut?: GemCut;
  colorHex?: string;
  secondaryColorHex?: string;
  effect?: GemEffect;
  size?: number;
  className?: string;
  label?: string;
  animateSparkle?: boolean;
}

export const GemSVG: React.FC<GemSVGProps> = ({
  cut = 'cushion',
  colorHex = '#1B3FD9',
  secondaryColorHex = '#3D7BFF',
  effect = 'standard',
  size = 96,
  className = '',
  label = 'Faceted gemstone illustration',
  animateSparkle = true,
}) => {
  const uid = React.useId().replace(/:/g, '');
  const gradMain = `gem-main-${uid}`;
  const gradCore = `gem-core-${uid}`;
  const gradSpec = `gem-spec-${uid}`;

  const renderShape = () => {
    switch (cut) {
      case 'cabochon':
        return (
          <>
            <ellipse cx="60" cy="60" rx="38" ry="46" fill={`url(#${gradMain})`} stroke="rgba(230,234,240,0.45)" strokeWidth="1.2" />
            <ellipse cx="52" cy="44" rx="22" ry="28" fill={`url(#${gradCore})`} opacity="0.65" />
            <ellipse cx="44" cy="34" rx="10" ry="14" fill="rgba(255,255,255,0.42)" transform="rotate(-18 44 34)" />
            {effect === 'star' && (
              <g stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" opacity="0.88">
                <line x1="60" y1="20" x2="60" y2="100" />
                <line x1="26" y1="40" x2="94" y2="80" />
                <line x1="94" y1="40" x2="26" y2="80" />
                <circle cx="60" cy="60" r="4" fill="#FFFFFF" stroke="none" opacity="0.85" />
              </g>
            )}
            {effect === 'cats-eye' && (
              <g>
                <rect x="57" y="18" width="6" height="84" rx="3" fill="rgba(255,248,220,0.9)" />
                <rect x="59" y="18" width="2" height="84" rx="1" fill="#FFFFFF" />
              </g>
            )}
            {effect === 'moonstone' && (
              <ellipse cx="56" cy="52" rx="24" ry="30" fill="rgba(160,210,255,0.42)" />
            )}
          </>
        );

      case 'rough':
        return (
          <>
            <polygon points="60,12 86,28 84,88 60,108 36,88 34,28" fill={`url(#${gradMain})`} stroke="rgba(230,234,240,0.4)" strokeWidth="1.2" />
            <polygon points="60,12 86,28 60,40 34,28" fill={secondaryColorHex} opacity="0.65" />
            <polygon points="34,28 60,40 60,108 36,88" fill={`url(#${gradCore})`} opacity="0.78" />
            <polygon points="86,28 102,42 98,88 84,88" fill={colorHex} stroke="rgba(230,234,240,0.28)" strokeWidth="0.8" />
            <polygon points="34,28 18,46 22,86 36,88" fill={secondaryColorHex} opacity="0.55" stroke="rgba(230,234,240,0.28)" strokeWidth="0.8" />
            <polyline points="60,12 60,108" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          </>
        );

      case 'emerald':
        return (
          <>
            <polygon points="36,14 84,14 98,28 98,92 84,106 36,106 22,92 22,28" fill={`url(#${gradMain})`} stroke="rgba(230,234,240,0.48)" strokeWidth="1.2" />
            <polygon points="42,24 78,24 88,34 88,86 78,96 42,96 32,86 32,34" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="0.9" />
            <polygon points="48,34 72,34 78,40 78,80 72,86 48,86 42,80 42,40" fill={`url(#${gradCore})`} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
            <polygon points="36,14 84,14 78,24 42,24" fill="rgba(255,255,255,0.28)" />
            <polygon points="22,28 36,14 42,24 32,34" fill="rgba(255,255,255,0.42)" />
          </>
        );

      case 'pear':
        return (
          <>
            <path d="M60 12 C76 34 94 58 94 78 C94 96 79 108 60 108 C41 108 26 96 26 78 C26 58 44 34 60 12 Z" fill={`url(#${gradMain})`} stroke="rgba(230,234,240,0.48)" strokeWidth="1.2" />
            <path d="M60 28 C70 44 80 60 80 76 C80 88 71 96 60 96 C49 96 40 88 40 76 C40 60 50 44 60 28 Z" fill={`url(#${gradCore})`} stroke="rgba(255,255,255,0.48)" strokeWidth="0.9" />
            <line x1="60" y1="12" x2="60" y2="28" stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
            <line x1="26" y1="78" x2="40" y2="76" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9" />
            <line x1="94" y1="78" x2="80" y2="76" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9" />
            <polygon points="44,50 60,28 52,58" fill="rgba(255,255,255,0.35)" />
          </>
        );

      case 'marquise':
        return (
          <>
            <path d="M60 10 Q96 42 96 60 Q96 78 60 110 Q24 78 24 60 Q24 42 60 10 Z" fill={`url(#${gradMain})`} stroke="rgba(230,234,240,0.48)" strokeWidth="1.2" />
            <path d="M60 26 Q80 48 80 60 Q80 72 60 94 Q40 72 40 60 Q40 48 60 26 Z" fill={`url(#${gradCore})`} stroke="rgba(255,255,255,0.5)" strokeWidth="0.9" />
            <line x1="60" y1="10" x2="60" y2="110" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
            <line x1="24" y1="60" x2="96" y2="60" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
            <polygon points="42,46 60,26 56,52" fill="rgba(255,255,255,0.38)" />
          </>
        );

      case 'brilliant':
        return (
          <>
            <polygon points="60,12 84,18 102,36 108,60 102,84 84,102 60,108 36,102 18,84 12,60 18,36 36,18" fill={`url(#${gradMain})`} stroke="rgba(230,234,240,0.48)" strokeWidth="1.2" />
            <polygon points="60,30 76,34 86,44 90,60 86,76 76,86 60,90 44,86 34,76 30,60 34,44 44,34" fill={`url(#${gradCore})`} stroke="rgba(255,255,255,0.52)" strokeWidth="0.9" />
            <line x1="60" y1="12" x2="60" y2="30" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
            <line x1="108" y1="60" x2="90" y2="60" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
            <line x1="60" y1="108" x2="60" y2="90" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
            <line x1="12" y1="60" x2="30" y2="60" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
            <polygon points="36,18 60,12 60,30 44,34" fill="rgba(255,255,255,0.36)" />
            <polygon points="84,102 102,84 86,76 76,86" fill="rgba(255,255,255,0.28)" />
          </>
        );

      case 'oval':
        return (
          <>
            <ellipse cx="60" cy="60" rx="40" ry="48" fill={`url(#${gradMain})`} stroke="rgba(230,234,240,0.48)" strokeWidth="1.2" />
            <ellipse cx="60" cy="60" rx="23" ry="30" fill={`url(#${gradCore})`} stroke="rgba(255,255,255,0.48)" strokeWidth="0.9" />
            <line x1="60" y1="12" x2="60" y2="30" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9" />
            <line x1="60" y1="90" x2="60" y2="108" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9" />
            <line x1="20" y1="60" x2="37" y2="60" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9" />
            <line x1="83" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9" />
            <polygon points="35,28 54,18 50,36" fill="rgba(255,255,255,0.38)" />
          </>
        );

      case 'cushion':
      default:
        return (
          <>
            <path d="M34,16 Q60,12 86,16 Q104,20 106,60 Q104,100 86,104 Q60,108 34,104 Q16,100 14,60 Q16,20 34,16 Z" fill={`url(#${gradMain})`} stroke="rgba(230,234,240,0.52)" strokeWidth="1.2" />
            <path d="M42,32 Q60,29 78,32 Q88,36 89,60 Q88,84 78,88 Q60,91 42,88 Q32,84 31,60 Q32,36 42,32 Z" fill={`url(#${gradCore})`} stroke="rgba(255,255,255,0.52)" strokeWidth="1" />
            <line x1="34" y1="16" x2="42" y2="32" stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
            <line x1="86" y1="16" x2="78" y2="32" stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
            <line x1="86" y1="104" x2="78" y2="88" stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
            <line x1="34" y1="104" x2="42" y2="88" stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
            {/* Crisp specular crown flash matching hero sapphire */}
            <polygon points="22,34 42,32 31,56" fill="rgba(255,255,255,0.52)" />
            <polygon points="78,88 96,74 86,100" fill="rgba(255,255,255,0.4)" />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id={gradMain} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor={secondaryColorHex} />
          <stop offset="48%" stopColor={colorHex} />
          <stop offset="100%" stopColor="#040A24" />
        </linearGradient>
        <radialGradient id={gradCore} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="45%" stopColor={secondaryColorHex} stopOpacity="0.85" />
          <stop offset="100%" stopColor={colorHex} stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id={gradSpec} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {renderShape()}

      {animateSparkle && (
        <g className="animate-sparkle" style={{ transformOrigin: '86px 28px' }}>
          <path d="M86 19 L87.5 26.5 L95 28 L87.5 29.5 L86 37 L84.5 29.5 L77 28 L84.5 26.5 Z" fill={`url(#${gradSpec})`} />
        </g>
      )}
    </svg>
  );
};
