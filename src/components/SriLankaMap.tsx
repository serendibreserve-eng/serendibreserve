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
      {/* Left: Interactive SVG Island Map */}
      <div className="relative flex items-center justify-center lg:col-span-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#1B3FD9]/20 blur-3xl"
        />
        <svg
          viewBox="0 0 400 620"
          className={`relative z-10 w-full ${compact ? 'max-w-[300px]' : 'max-w-[380px]'} overflow-visible`}
          role="img"
          aria-label="Map of Sri Lanka showing five major gem-producing areas"
        >
          <defs>
            <linearGradient id="sl-outline" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E6EAF0" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#3D7BFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C9D1DC" stopOpacity="0.45" />
            </linearGradient>
            <radialGradient id="sl-highland" cx="52%" cy="62%" r="34%">
              <stop offset="0%" stopColor="#1B3FD9" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#05070D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Stylized silhouette of Sri Lanka */}
          <path
            d="M172,48 L194,54 L208,76 L222,115 L254,162 L276,216 L296,268 L314,322 L322,380 L312,438 L292,486 L254,530 L212,554 L172,562 L134,552 L110,518 L100,468 L98,412 L106,356 L104,296 L118,242 L132,190 L138,136 L148,86 Z"
            fill="url(#sl-highland)"
            stroke="url(#sl-outline)"
            strokeWidth="1.6"
          />

          {/* Abstract Highland Complex contour ring */}
          <ellipse
            cx="206"
            cy="392"
            rx="72"
            ry="96"
            fill="none"
            stroke="#3D7BFF"
            strokeOpacity="0.28"
            strokeDasharray="4 6"
          />

          {/* Connecting energy lines from Ratnapura / Highland hub */}
          {SRI_LANKA_REGIONS.map((region) => (
            <line
              key={`line-${region.id}`}
              x1={205}
              y1={392}
              x2={region.coords.x}
              y2={region.coords.y}
              stroke={region.id === activeId ? '#3D7BFF' : 'rgba(201,209,220,0.22)'}
              strokeWidth={region.id === activeId ? 1.4 : 0.8}
            />
          ))}

          {/* Interactive Gem Region Nodes */}
          {SRI_LANKA_REGIONS.map((region) => {
            const isActive = region.id === activeId;
            return (
              <g
                key={region.id}
                transform={`translate(${region.coords.x}, ${region.coords.y})`}
                className="cursor-pointer"
              >
                <circle
                  r={isActive ? 22 : 14}
                  fill="#3D7BFF"
                  fillOpacity={isActive ? 0.22 : 0.08}
                  className="transition-all duration-300"
                />
                <circle
                  r={isActive ? 7 : 5}
                  fill={isActive ? '#FFFFFF' : '#3D7BFF'}
                  stroke="#E6EAF0"
                  strokeWidth="1.5"
                />

                {/* Floating miniature SVG gem emerging on active node */}
                {isActive && (
                  <g transform="translate(-22, -52)">
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
                  x={region.coords.x > 215 ? 14 : -14}
                  y={4}
                  textAnchor={region.coords.x > 215 ? 'start' : 'end'}
                  className="fill-[#E6EAF0] text-[12px] font-medium tracking-wider"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {region.name}
                </text>

                {/* Accessible hit area */}
                <circle
                  r={24}
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
