import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GEM_IMAGES } from '../content/images';
import { PLACEHOLDERS, SITE_CONFIG } from '../content/siteConfig';
import { GemSVG } from '../components/GemSVG';
import { ImageSlot } from '../components/ImageSlot';
import { SplitHeading } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';

const VALUES = [
  {
    title: 'Authenticity',
    text: 'Every gemstone is natural and earth-mined, backed by verifiable provenance from Sri Lanka’s historic gem fields.',
    cut: 'cushion' as const,
    color: '#1B3FD9',
  },
  {
    title: 'Craft',
    text: 'We partner with skilled Sri Lankan lapidaries who orient and facet rough stones to awaken natural fire and symmetry.',
    cut: 'emerald' as const,
    color: '#3D7BFF',
  },
  {
    title: 'Transparency',
    text: 'Clear written disclosure of origin and any thermal treatment accompanies every transaction and laboratory dossier.',
    cut: 'brilliant' as const,
    color: '#C9D1DC',
  },
  {
    title: 'Care for Community',
    text: 'We respect the family-run licensed mining and cutting communities whose heritage sustains Ratna-Dweepa.',
    cut: 'rough' as const,
    color: '#0E4B5A',
  },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="Our Story — The Meaning of Serendib Reserve | Serendib Reserve"
        description="Discover the origin of the name Serendib Reserve, our Colombo heritage, mission, vision, and commitment to fine Ceylon gemstones."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Story Split */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
              Our Story · {PLACEHOLDERS.yearFounded}
            </p>
            <SplitHeading as="h1" className="font-display text-5xl font-light text-white sm:text-6xl">
              The Reserve of Rare Light.
            </SplitHeading>

            <div className="space-y-4 text-sm leading-relaxed text-[#C9D1DC] sm:text-base">
              <p>{SITE_CONFIG.nameStory.serendib}</p>
              <p>{SITE_CONFIG.nameStory.reserve}</p>
              <p>{SITE_CONFIG.nameStory.mineral}</p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <ImageSlot asset={GEM_IMAGES.brandCrest} kenBurns={false} className="aspect-[16/9] border border-[#C9D1DC]/15">
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs tracking-[0.2em] uppercase text-[#3D7BFF]">House Identity</p>
                <p className="mt-1 font-display text-2xl text-white">Serendib Reserve Crest</p>
              </div>
            </ImageSlot>
          </div>
        </div>

        {/* Founder Message Placeholder + Mission & Vision */}
        <section className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-8 lg:col-span-6">
            <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">Founder’s Note</p>
            <blockquote className="mt-4 font-display text-2xl font-light leading-relaxed text-white">
              {PLACEHOLDERS.founderMessage}
            </blockquote>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:col-span-6">
            <div className="border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#3D7BFF]">Mission</p>
              <p className="mt-2 text-sm leading-relaxed text-[#C9D1DC]">
                To connect the finest ethically sourced and expertly faceted gemstones of Sri Lanka with discerning jewellers and collectors worldwide through transparent gemmology.
              </p>
            </div>
            <div className="border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#3D7BFF]">Vision</p>
              <p className="mt-2 text-sm leading-relaxed text-[#C9D1DC]">
                To stand as an enduring Colombo gemstone house celebrated for quiet precision, honest provenance, and reverence for natural light.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mt-16 border-t border-[#C9D1DC]/12 pt-16">
          <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">House Values</p>
          <h2 className="mt-2 font-display text-4xl font-light text-white">Four Pillars of Trust</h2>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="border border-[#C9D1DC]/15 bg-[#0A1226]/65 p-6">
                <GemSVG cut={v.cut} colorHex={v.color} secondaryColorHex="#E6EAF0" size={50} label={v.title} />
                <h3 className="mt-4 font-display text-2xl text-white">{v.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#C9D1DC]/85">{v.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/inquiries"
              className="btn-luxury-primary inline-flex items-center gap-2 px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white"
            >
              <span>Connect With Our Colombo Desk</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
