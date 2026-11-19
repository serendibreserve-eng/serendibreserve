import React, { useState } from 'react';
import { SRI_LANKA_REGIONS, SriLankaRegion } from '../content/gems';
import { GemSVG } from './GemSVG';

interface SriLankaMapProps {
  compact?: boolean;
  onSelectRegion?: (region: SriLankaRegion) => void;
}

/**
 * Abstract glowing dot-map and line-art silhouette of Sri Lanka
 * with interactive nodes for the five major gem-producing areas.
 */
export const SriLankaMap: React.FC<SriLankaMapProps> = ({ compact = false, onSelectRegion }) => {
  const [activeId, setActiveId] = useState<string>(SRI_LANKA_REGIONS[0].id);
  const activeRegion = SRI_LANKA_REGIONS.find((r) => r.id === activeId) || SRI_LANKA_REGIONS[0];

  const handleSelect = (region: SriLankaRegion) => {
    setActiveId(region.id);
    onSelectRegion?.(region);
  };

  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
      {/* Left: Interactive SVG Island Map using uploaded Sri Lanka outline */}
      <div className="relative flex items-center justify-center lg:col-span-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-80 w-80 rounded-full bg-[#1B3FD9]/22 blur-3xl"
        />
        <svg
          viewBox="410 60 1240 1900"
          className={`relative z-10 w-full ${compact ? 'max-w-[320px]' : 'max-w-[400px]'} overflow-visible`}
          role="img"
          aria-label="Map of Sri Lanka showing five major gem-producing areas"
        >
          <defs>
            <radialGradient id="sl-highland" cx="50%" cy="62%" r="36%">
              <stop offset="0%" stopColor="#1B3FD9" stopOpacity="0.42" />
              <stop offset="55%" stopColor="#0B1F6B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#05070D" stopOpacity="0" />
            </radialGradient>
            <filter id="sl-map-glow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#3D7BFF" floodOpacity="0.55" />
            </filter>
          </defs>

          {/* Highland Complex ambient glow inside island center */}
          <ellipse cx="1010" cy="1280" rx="410" ry="590" fill="url(#sl-highland)" />

          {/* Uploaded Sri Lanka Outline Vector Asset */}
          <image
            href="/assets/aistudio/Frame_3646_1_fb372d20.svg"
            x="0"
            y="0"
            width="2065"
            height="2023"
            preserveAspectRatio="none"
            style={{
              filter: 'brightness(1.22) saturate(1.18) drop-shadow(0 0 18px rgba(61,123,255,0.52))',
            }}
          />

          {/* Abstract Highland Complex contour ring */}
          <ellipse
            cx="995"
            cy="1275"
            rx="235"
            ry="335"
            fill="none"
            stroke="#3D7BFF"
            strokeOpacity="0.34"
            strokeWidth="4"
            strokeDasharray="16 20"
          />

          {/* Connecting energy lines from Central Highland hub */}
          {SRI_LANKA_REGIONS.map((region) => (
            <line
              key={`line-${region.id}`}
              x1={995}
              y1={1235}
              x2={region.coords.x}
              y2={region.coords.y}
              stroke={region.id === activeId ? '#3D7BFF' : 'rgba(201,209,220,0.28)'}
              strokeWidth={region.id === activeId ? 4.5 : 2.2}
            />
          ))}

          {/* Interactive Gem Region Nodes */}
          {SRI_LANKA_REGIONS.map((region) => {
            const isActive = region.id === activeId;
            const labelRight = region.id === 'ratnapura' || region.coords.x >= 995;
            const labelDy = region.id === 'ratnapura' ? 22 : 12;
            return (
              <g
                key={region.id}
                transform={`translate(${region.coords.x}, ${region.coords.y})`}
                className="cursor-pointer"
              >
                <circle
                  r={isActive ? 66 : 42}
                  fill="#3D7BFF"
                  fillOpacity={isActive ? 0.24 : 0.09}
                  className="transition-all duration-300"
                />
                {isActive && (
                  <circle
                    r={44}
                    fill="none"
                    stroke="#3D7BFF"
                    strokeOpacity={0.55}
                    strokeWidth="2.5"
                  />
                )}
                <circle
                  r={isActive ? 20 : 14}
                  fill={isActive ? '#FFFFFF' : '#3D7BFF'}
                  stroke="#E6EAF0"
                  strokeWidth="4"
                />

                {/* Floating miniature SVG gem emerging above active node */}
                {isActive && (
                  <g transform="translate(-62, -148) scale(2.8)">
                    <GemSVG
                      cut={region.featuredGemCut}
                      colorHex={region.featuredGemColor}
                      secondaryColorHex="#E6EAF0"
                      size={44}
                      label={`${region.name} gem`}
                    />
                  </g>
                )}

                <text
                  x={labelRight ? 38 : -38}
                  y={labelDy}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fontSize="36"
                  letterSpacing="1.6"
                  className="fill-[#E6EAF0] font-medium"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {region.name}
                </text>

                {/* Accessible hit area */}
                <circle
                  r={78}
                  fill="transparent"
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${region.name} gem area`}
                  aria-pressed={isActive}
                  onMouseEnter={() => handleSelect(region)}
                  onClick={() => handleSelect(region)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(region);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right: Glowing Detail Card + Region Buttons */}
      <div className="space-y-6 lg:col-span-6">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sri Lankan gem-producing areas">
          {SRI_LANKA_REGIONS.map((region) => {
            const isActive = region.id === activeId;
            return (
              <button
                key={region.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelect(region)}
                className={`whitespace-nowrap shrink-0 border px-3.5 py-2 text-xs tracking-[0.14em] uppercase transition-all duration-300 ${
                  isActive
                    ? 'border-[#3D7BFF] bg-[#1B3FD9]/30 text-white shadow-[0_0_24px_rgba(61,123,255,0.28)]'
                    : 'border-[#C9D1DC]/20 bg-[#0A1226]/50 text-[#C9D1DC] hover:border-[#C9D1DC]/50 hover:text-white'
                }`}
              >
                {region.name}
              </button>
            );
          })}
        </div>

        <div className="border border-[#C9D1DC]/20 bg-[#0A1226]/75 p-6 sm:p-8 shadow-[0_0_45px_rgba(27,63,217,0.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">
                {activeRegion.depositType}
              </p>
              <h3 className="mt-2 font-display text-3xl font-light text-white sm:text-4xl">
                {activeRegion.name} — {activeRegion.title}
              </h3>
            </div>
            <GemSVG
              cut={activeRegion.featuredGemCut}
              colorHex={activeRegion.featuredGemColor}
              secondaryColorHex="#E6EAF0"
              size={58}
              label={activeRegion.name}
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#C9D1DC] sm:text-base">
            {activeRegion.description}
          </p>

          <div className="mt-6 border-t border-[#C9D1DC]/15 pt-4">
            <p className="text-xs tracking-[0.18em] uppercase text-[#C9D1DC]/70">
              Notable Species Found
            </p>
            <p className="mt-2 text-sm text-white">
              {activeRegion.gems.join('  ·  ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
