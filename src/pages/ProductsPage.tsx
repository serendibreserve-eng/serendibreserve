import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Droplets, Shield, Sparkles } from 'lucide-react';
import {
  CARE_CLEANING_GUIDE,
  CHOOSE_STONE_STEPS,
  PRODUCT_CATEGORIES,
  SAMPLE_CATALOGUE,
} from '../content/products';
import { buildInquiryPrefillQuery } from '../utils/formLogic';
import { GemSVG } from '../components/GemSVG';
import { SplitHeading, TiltGemCard } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredCatalogue =
    selectedCategory === 'All'
      ? SAMPLE_CATALOGUE
      : SAMPLE_CATALOGUE.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="Our Products & Services | Serendib Reserve"
        description="Certified loose Ceylon sapphires, calibrated parcels, matched pairs, cabochons, custom cutting, and fine jewellery silhouettes."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
            05 · Our Products & Services
          </p>
          <SplitHeading as="h1" className="mt-3 font-display text-5xl font-light text-white sm:text-6xl">
            Loose Stones, Calibrated Suites & Craft
          </SplitHeading>
          <p className="mt-4 text-base leading-relaxed text-[#C9D1DC]">
            From investment-grade certified single stones to precision calibrated parcels and bespoke fine jewellery silhouettes.
          </p>
        </div>

        {/* 9 Product Categories Grid */}
        <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_CATEGORIES.map((cat) => (
            <TiltGemCard key={cat.id} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-xs text-[#3D7BFF]">{cat.number}</span>
                  <GemSVG
                    cut={cat.cut}
                    colorHex={cat.colorHex}
                    secondaryColorHex="#E6EAF0"
                    size={54}
                    label={cat.title}
                  />
                </div>
                <h2 className="mt-3 font-display text-2xl font-light text-white">{cat.title}</h2>
                <p className="mt-1 text-xs tracking-[0.14em] uppercase text-[#C9D1DC]/75">
                  {cat.subtitle}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-[#C9D1DC]/85">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 border-t border-[#C9D1DC]/12 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      buildInquiryPrefillQuery({
                        type: cat.id === 'fine-jewellery' ? 'Custom jewellery' : 'Buy loose gems',
                        shape: cat.cut,
                      }),
                    )
                  }
                  className="inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-white hover:text-[#3D7BFF]"
                >
                  <span>Inquire on {cat.title.split(' ')[0]}</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </div>
            </TiltGemCard>
          ))}
        </section>

        {/* Fine Jewellery Abstract Line-Drawn Silhouette Feature */}
        <section className="mt-16 grid grid-cols-1 items-center gap-8 border border-[#C9D1DC]/18 bg-[#0A1226]/65 p-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">
              Bespoke Atelier Silhouette
            </p>
            <h2 className="font-display text-3xl font-light text-white sm:text-4xl">
              Sapphire-Led High Jewellery Design
            </h2>
            <p className="text-sm leading-relaxed text-[#C9D1DC]">
              Each fine ring, pendant, or earring begins with the proportions of the centre Sri Lankan gemstone, framed by understated platinum or white-gold architecture.
            </p>
            <button
              type="button"
              onClick={() => navigate('/inquiries?type=Custom+jewellery&shape=cushion')}
              className="btn-luxury inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
            >
              <span>Commission a Design</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center justify-center lg:col-span-5">
            <svg viewBox="0 0 240 200" className="h-48 w-60" role="img" aria-label="Abstract silver ring silhouette with sapphire setting">
              <ellipse cx="120" cy="130" rx="64" ry="44" fill="none" stroke="#C9D1DC" strokeWidth="1.6" />
              <ellipse cx="120" cy="130" rx="54" ry="36" fill="none" stroke="#C9D1DC" strokeOpacity="0.45" strokeWidth="1" />
              <line x1="94" y1="88" x2="104" y2="62" stroke="#E6EAF0" strokeWidth="1.2" />
              <line x1="146" y1="88" x2="136" y2="62" stroke="#E6EAF0" strokeWidth="1.2" />
              <g transform="translate(86, 20) scale(0.56)">
                <GemSVG cut="cushion" colorHex="#1B3FD9" secondaryColorHex="#3D7BFF" size={120} label="Setting Sapphire" />
              </g>
            </svg>
          </div>
        </section>

        {/* Sample Catalogue (12 Sample Stones) */}
        <section className="mt-20 border-t border-[#C9D1DC]/12 pt-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">
                SAMPLE DATA · Replace with Live Vault Inventory
              </p>
              <SplitHeading className="mt-2 font-display text-4xl font-light text-white">
                Representative Stone Catalogue
              </SplitHeading>
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', 'Certified Loose Gemstones', 'Cabochons', 'Rare & Collector Gems'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedCategory(f)}
                  className={`whitespace-nowrap shrink-0 border px-3.5 py-2 text-xs tracking-[0.12em] uppercase ${
                    selectedCategory === f
                      ? 'border-[#3D7BFF] bg-[#1B3FD9]/30 text-white'
                      : 'border-[#C9D1DC]/20 bg-[#0A1226]/50 text-[#C9D1DC]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCatalogue.map((stone) => (
              <div
                key={stone.id}
                className="flex flex-col justify-between border border-[#C9D1DC]/15 bg-[#0A1226]/65 p-6"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] tracking-[0.15em] uppercase text-[#3D7BFF]">
                    <span>SAMPLE DATA · {stone.id}</span>
                    <span>{stone.origin}</span>
                  </div>

                  <div className="my-5 flex items-center gap-4">
                    <GemSVG
                      cut={stone.cut}
                      colorHex={stone.colorHex}
                      secondaryColorHex="#E6EAF0"
                      size={74}
                      label={stone.name}
                    />
                    <div>
                      <h3 className="font-display text-2xl font-light text-white">{stone.name}</h3>
                      <p className="mt-1 text-xs text-[#C9D1DC]">{stone.species}</p>
                    </div>
                  </div>

                  <dl className="space-y-1.5 border-t border-[#C9D1DC]/12 pt-4 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#C9D1DC]/70">Carat / Size</dt>
                      <dd className="font-mono-tabular text-white">{stone.caratRange}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#C9D1DC]/70">Colour Grade</dt>
                      <dd className="text-right text-white">{stone.colourGrade}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#C9D1DC]/70">Clarity</dt>
                      <dd className="text-white">{stone.clarity}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#C9D1DC]/70">Treatment</dt>
                      <dd className="text-white">{stone.treatmentStatus}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#C9D1DC]/70">Lab Report</dt>
                      <dd className="text-[#C9D1DC]">{stone.lab}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#C9D1DC]/12 pt-4">
                  <span className="text-xs font-medium tracking-wider uppercase text-[#E6EAF0]">
                    {stone.priceLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        buildInquiryPrefillQuery({
                          gem: stone.name,
                          shape: stone.cut,
                          carat: stone.caratRange,
                          type: 'Buy loose gems',
                        }),
                      )
                    }
                    className="btn-luxury px-4 py-2 text-xs tracking-[0.16em] uppercase text-white"
                  >
                    Inquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Choose + Care & Cleaning Guides */}
        <section className="mt-20 grid grid-cols-1 gap-8 border-t border-[#C9D1DC]/12 pt-16 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-6">
            <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">Buyer Guide</p>
            <h2 className="font-display text-3xl font-light text-white">How to Choose Your Stone</h2>
            <div className="space-y-4">
              {CHOOSE_STONE_STEPS.map((st) => (
                <div key={st.step} className="border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-5">
                  <p className="font-mono-tabular text-xs text-[#3D7BFF]">Step {st.step}</p>
                  <h3 className="mt-1 text-sm font-medium text-white">{st.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#C9D1DC]/85">{st.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5 lg:col-span-6">
            <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">Preservation</p>
            <h2 className="font-display text-3xl font-light text-white">Care & Cleaning</h2>
            <div className="space-y-4">
              {CARE_CLEANING_GUIDE.map((item, idx) => {
                const icons = [Droplets, Shield, Sparkles];
                const Icon = icons[idx] || Sparkles;
                return (
                  <div key={item.title} className="flex gap-4 border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-5">
                    <Icon size={20} className="mt-0.5 shrink-0 text-[#3D7BFF]" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-medium text-white">{item.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#C9D1DC]/85">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
