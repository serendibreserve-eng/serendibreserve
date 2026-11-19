import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import { FOUR_CS_GUIDE, GEM_CATEGORIES, GEMS_DATA, GemCategory, GemSpec } from '../content/gems';
import { buildInquiryPrefillQuery } from '../utils/formLogic';
import { GemSpecimenPhoto } from '../components/GemSpecimenPhoto';
import { GemSVG } from '../components/GemSVG';
import { SplitHeading, TiltGemCard } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';
import { SpecimenDetailModal, SpecimenModalData } from '../components/SpecimenDetailModal';

function gemSpecToModalData(gem: GemSpec): SpecimenModalData {
  return {
    id: gem.id,
    eyebrow: gem.category,
    title: gem.name,
    subtitle: gem.subtitle,
    photoUrl: gem.photoUrl,
    cut: gem.cut,
    colorHex: gem.colorHex,
    secondaryColorHex: gem.secondaryColorHex,
    glowHex: gem.glowHex,
    ior: gem.ior,
    effect: gem.effect,
    matteTolerance: gem.matteTolerance,
    specs: [
      { label: 'Species', value: gem.species },
      { label: 'Hardness (Mohs)', value: gem.hardnessMohs, mono: true },
      { label: 'Refractive Index', value: gem.refractiveIndex, mono: true },
      { label: 'Sri Lankan Sources', value: gem.sriLankanSources },
      { label: 'Colour Range', value: gem.colourRange, span2: true },
    ],
    highlightTitle: 'What Makes a Fine One',
    highlightBody: gem.whatMakesAFineOne,
    ctaLabel: 'Enquire about this gem',
  };
}

export const GemTypesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<'All' | GemCategory>('All');
  const [selectedGem, setSelectedGem] = useState<GemSpec | null>(null);

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

  const handleEnquire = (item: SpecimenModalData) => {
    const gem = GEMS_DATA.find((g) => g.id === item.id);
    if (!gem) return;
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
            Sri Lanka yields an extraordinary range of natural gemstones from one compact highland geology. Select any specimen to inspect its macro profile and interactive 3D geometry.
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

        {/* Grid of Gem Cards with Real Macro Photography on Dark Royal Blue Matching Stages */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGems.map((gem) => (
            <TiltGemCard key={gem.id} className="group flex flex-col justify-between p-0">
              <div>
                <button
                  type="button"
                  onClick={() => openGem(gem)}
                  aria-label={`Inspect ${gem.name}`}
                  className="relative block h-56 w-full border-b border-[#C9D1DC]/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D7BFF]"
                >
                  <GemSpecimenPhoto
                    src={gem.photoUrl}
                    alt={gem.name}
                    glowHex={gem.glowHex}
                    tolerance={gem.matteTolerance}
                    className="h-full w-full"
                  />
                  <span className="absolute left-4 top-3 z-20 text-[10px] tracking-[0.16em] uppercase text-[#C9D1DC]/80">
                    {gem.category}
                  </span>
                  <span className="font-mono-tabular absolute right-4 top-3 z-20 text-[10px] tracking-[0.12em] uppercase text-[#C9D1DC]/80">
                    Mohs {gem.hardnessMohs}
                  </span>
                </button>

                <div className="p-6 pb-4">
                  <h2 className="font-display text-2xl font-light text-white">{gem.name}</h2>
                  <p className="mt-1 text-xs text-[#3D7BFF]">{gem.subtitle}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#C9D1DC]/85">
                    {gem.oneLineCaption}
                  </p>
                </div>
              </div>

              <div className="mx-6 mb-6 flex items-center justify-between border-t border-[#C9D1DC]/12 pt-4">
                <button
                  type="button"
                  onClick={() => openGem(gem)}
                  className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] uppercase text-white hover:text-[#3D7BFF]"
                >
                  <Eye size={13} aria-hidden="true" />
                  <span>Inspect Specimen</span>
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

      {/* Modern Animated Specimen & Interactive 3D Detail Modal */}
      <SpecimenDetailModal
        item={selectedGem ? gemSpecToModalData(selectedGem) : null}
        onClose={closeGem}
        onAction={handleEnquire}
        defaultViewMode={searchParams.get('gem') ? '3d' : 'photo'}
      />
    </div>
  );
};
