import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sun, Flame, X } from 'lucide-react';
import { FOUR_CS_GUIDE, GEM_CATEGORIES, GEMS_DATA, GemCategory, GemSpec } from '../content/gems';
import { buildInquiryPrefillQuery } from '../utils/formLogic';
import { Gem3D } from '../components/Gem3D';
import { GemSVG } from '../components/GemSVG';
import { SplitHeading, TiltGemCard } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';

export const GemTypesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<'All' | GemCategory>('All');
  const [selectedGem, setSelectedGem] = useState<GemSpec | null>(null);
  const [alexMode, setAlexMode] = useState<'daylight' | 'candlelight'>('daylight');

  useEffect(() => {
    const gemParam = searchParams.get('gem');
    if (gemParam) {
      const found = GEMS_DATA.find((g) => g.id === gemParam);
      if (found) setSelectedGem(found);
    }
  }, [searchParams]);

  const filteredGems =
    activeCategory === 'All'
      ? GEMS_DATA
      : GEMS_DATA.filter((g) => g.category === activeCategory);

  const openGem = (gem: GemSpec) => {
    setSelectedGem(gem);
    setSearchParams({ gem: gem.id });
  };

  const closeGem = () => {
    setSelectedGem(null);
    setSearchParams({});
  };

  const handleEnquire = (gem: GemSpec) => {
    const url = buildInquiryPrefillQuery({
      gem: gem.name,
      shape: gem.cut,
      type: 'Buy loose gems',
    });
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-32">
      <PageSEO
        title="Gem Types of Sri Lanka | Serendib Reserve"
        description="Explore Ceylon Blue Sapphire, Padparadscha, Star Sapphire, Ruby, Alexandrite, Cat's Eye, Spinel, Moonstone, and rare Serendibite."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Intro */}
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
            01 · Gem Types
          </p>
          <SplitHeading as="h1" className="mt-3 font-display text-5xl font-light text-white sm:text-6xl">
            A Spectrum of Natural Light
          </SplitHeading>
          <p className="mt-4 text-base leading-relaxed text-[#C9D1DC]">
            Sri Lanka yields an extraordinary range of natural gemstones from one compact highland geology. Select any stone to inspect its interactive 3D geometry and gemmological profile.
          </p>
        </div>

        {/* Filter Bar */}
        <div
          className="mt-10 flex flex-wrap gap-2 border-y border-[#C9D1DC]/15 py-5"
          role="tablist"
          aria-label="Filter gemstones by mineral family"
        >
          {GEM_CATEGORIES.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap shrink-0 border px-4 py-2 text-xs tracking-[0.14em] uppercase transition-all ${
                  active
                    ? 'border-[#3D7BFF] bg-[#1B3FD9]/30 text-white'
                    : 'border-[#C9D1DC]/18 bg-[#0A1226]/50 text-[#C9D1DC] hover:border-[#C9D1DC]/50 hover:text-white'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Grid of Gem Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGems.map((gem) => (
            <TiltGemCard key={gem.id} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/70">
                  <span>{gem.category}</span>
                  <span className="font-mono-tabular">Mohs {gem.hardnessMohs}</span>
                </div>

                <div className="my-6 flex justify-center">
                  <GemSVG
                    cut={gem.cut}
                    colorHex={gem.colorHex}
                    secondaryColorHex={gem.secondaryColorHex}
                    effect={gem.effect}
                    size={104}
                    label={gem.name}
                  />
                </div>

                <h2 className="font-display text-2xl font-light text-white">{gem.name}</h2>
                <p className="mt-1 text-xs text-[#3D7BFF]">{gem.subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#C9D1DC]/85">
                  {gem.oneLineCaption}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#C9D1DC]/12 pt-4">
                <button
                  type="button"
                  onClick={() => openGem(gem)}
                  className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] uppercase text-white hover:text-[#3D7BFF]"
                >
                  <span>Inspect 3D Gem</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </div>
            </TiltGemCard>
          ))}
        </div>

        {/* Educational Block: The 4 Cs + Origin & Treatment */}
        <section className="mt-24 border-t border-[#C9D1DC]/15 pt-16">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">
              Gemmological Guide
            </p>
            <SplitHeading className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">
              The 4 Cs of Coloured Gems + Origin & Treatment
            </SplitHeading>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {FOUR_CS_GUIDE.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between border border-[#C9D1DC]/15 bg-[#0A1226]/65 p-6"
              >
                <div>
                  <div className="mb-5 flex justify-center">
                    <GemSVG
                      cut={item.cut}
                      colorHex={item.colorHex}
                      secondaryColorHex="#E6EAF0"
                      size={74}
                      label={item.title}
                    />
                  </div>
                  <h3 className="font-display text-2xl font-light text-white">{item.title}</h3>
                  <p className="mt-1 text-xs tracking-[0.14em] uppercase text-[#3D7BFF]">
                    {item.subtitle}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[#C9D1DC]/85">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Full-Screen 3D Gem Detail Overlay */}
      {selectedGem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedGem.name} detail view`}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#05070D]/95 p-4 sm:p-8"
        >
          <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden border border-[#C9D1DC]/25 bg-[#0A1226] lg:grid-cols-12">
            <button
              type="button"
              onClick={closeGem}
              aria-label="Close gem detail overlay"
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center border border-[#C9D1DC]/25 bg-[#05070D]/80 text-white hover:border-white"
            >
              <X size={18} />
            </button>

            {/* Left: Interactive Draggable 3D Gem */}
            <div className="relative flex min-h-[340px] flex-col items-center justify-center bg-[#05070D] p-6 lg:col-span-6 lg:min-h-[540px]">
              <div className="h-[300px] w-full sm:h-[380px]">
                <Gem3D
                  cut={selectedGem.cut}
                  colour={selectedGem.colorHex}
                  secondaryColour={selectedGem.secondaryColorHex}
                  effect={selectedGem.effect}
                  alexandriteMode={selectedGem.effect === 'alexandrite' ? alexMode : 'auto'}
                  ior={selectedGem.ior}
                  size={1.45}
                  interactive
                  showCausticPlane
                  className="h-full w-full"
                  ariaLabel={`Draggable 3D ${selectedGem.name}`}
                />
              </div>

              <p className="mt-2 text-[11px] tracking-[0.18em] uppercase text-[#C9D1DC]/65">
                Drag to rotate stone · Cut: {selectedGem.cut}
              </p>

              {/* Live Daylight vs Candlelight toggle for Alexandrite */}
              {selectedGem.effect === 'alexandrite' && (
                <div className="mt-4 flex items-center gap-2 border border-[#C9D1DC]/20 bg-[#0A1226] p-1">
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

            {/* Right: Gem Data Panel */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6">
              <div className="space-y-5 pr-8">
                <div>
                  <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">
                    {selectedGem.category}
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-light text-white sm:text-4xl">
                    {selectedGem.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#C9D1DC]">{selectedGem.subtitle}</p>
                </div>

                <dl className="grid grid-cols-1 gap-3 border-y border-[#C9D1DC]/15 py-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/65">Species</dt>
                    <dd className="mt-0.5 text-white">{selectedGem.species}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/65">Hardness (Mohs)</dt>
                    <dd className="mt-0.5 font-mono-tabular text-white">{selectedGem.hardnessMohs}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/65">Refractive Index</dt>
                    <dd className="mt-0.5 font-mono-tabular text-white">{selectedGem.refractiveIndex}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/65">Sri Lankan Sources</dt>
                    <dd className="mt-0.5 text-white">{selectedGem.sriLankanSources}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]/65">Colour Range</dt>
                    <dd className="mt-0.5 text-[#E6EAF0]">{selectedGem.colourRange}</dd>
                  </div>
                </dl>

                <div>
                  <h3 className="text-xs tracking-[0.18em] uppercase text-[#3D7BFF]">
                    What Makes a Fine One
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#C9D1DC]">
                    {selectedGem.whatMakesAFineOne}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleEnquire(selectedGem)}
                  className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs font-medium tracking-[0.18em] uppercase text-white"
                >
                  <span>Enquire about this gem</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={closeGem}
                  className="btn-luxury px-5 py-3 text-xs tracking-[0.18em] uppercase text-[#C9D1DC]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
