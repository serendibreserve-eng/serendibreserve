import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GemSVG } from '../components/GemSVG';
import { PageSEO } from '../components/PageSEO';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center bg-[#05070D] px-4 pt-20 text-center">
      <PageSEO
        title="Page Not Found | Serendib Reserve"
        description="The requested gemstone archive page could not be located."
      />
      <GemSVG cut="cushion" colorHex="#1B3FD9" secondaryColorHex="#3D7BFF" size={110} label="Sapphire 404" />
      <p className="mt-6 font-mono-tabular text-xs tracking-[0.28em] uppercase text-[#3D7BFF]">
        404 · Uncharted Facet
      </p>
      <h1 className="mt-2 font-display text-5xl font-light text-white sm:text-6xl">
        This Stone Is Not Here.
      </h1>
      <p className="mt-3 max-w-md text-sm text-[#C9D1DC]">
        The archive path you requested could not be found. Return to the main vault to continue exploring Ceylon gemstones.
      </p>
      <Link
        to="/"
        className="btn-luxury mt-8 inline-flex items-center gap-2 px-7 py-3 text-xs tracking-[0.18em] uppercase text-white"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        <span>Return Home</span>
      </Link>
    </div>
  );
};
