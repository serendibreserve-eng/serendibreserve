import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, CheckCircle2, Gavel, Globe2, ShieldCheck, UserCheck } from 'lucide-react';
import { PageSEO } from '../components/PageSEO';
import { SplitHeading } from '../components/MotionPrimitives';
import { CURRENCY_METADATA, SUPPORTED_CURRENCIES } from '../types/auction';

const STEPS = [
  {
    step: '01',
    title: 'Register & Verify Collector Profile',
    description:
      'Sign in instantaneously with Google or register via Email & Password. Complete email verification plus your phone/WhatsApp number and nationality to activate bidding access.',
    icon: UserCheck,
  },
  {
    step: '02',
    title: 'Inspect Provenance & Set Reminders',
    description:
      'Review high-resolution zoom photography, laboratory certificates, origin notes, and currency rules. Set reminders on upcoming lots or save them to your private watchlist.',
    icon: BellRing,
  },
  {
    step: '03',
    title: 'Atomic Real-Time Bidding',
    description:
      'Submit bids equal to or above the current minimum next bid. Every bid is processed atomically against our Colombo authoritative server clock, updating all live viewers immediately.',
    icon: Gavel,
  },
  {
    step: '04',
    title: 'Settlement & Insured Dispatch',
    description:
      'When hammer time closes and reserve conditions are satisfied, our Colombo specialists contact the winning bidder directly for verified settlement and insured international delivery.',
    icon: ShieldCheck,
  },
];

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="How Auctions Work — Serendib Reserve"
        description="Learn how verified collectors participate in Serendib Reserve real-time Ceylon gemstone auctions."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="border-b border-[#C9D1DC]/15 pb-12">
          <p className="text-xs font-medium tracking-[0.26em] uppercase text-[#D9AE61]">
            Collector Protocol · How It Works
          </p>
          <SplitHeading as="h1" className="mt-2 font-display text-4xl font-light text-white sm:text-6xl">
            Precision Bidding. Global Confidence.
          </SplitHeading>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#C9D1DC]/85">
            Serendib Reserve unites centuries of Sri Lankan lapidary heritage with an institutional-grade real-time auction engine.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="border border-[#C9D1DC]/18 bg-[#07152F]/70 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-xs font-medium text-[#D9AE61]">
                    STEP {s.step}
                  </span>
                  <Icon size={20} className="text-[#3D7BFF]" aria-hidden="true" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-light text-white">{s.title}</h2>
                <p className="mt-3 text-xs leading-relaxed text-[#C9D1DC]/85">{s.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="border border-[#D9AE61]/25 bg-[#0A1226]/75 p-7 lg:col-span-6">
            <h2 className="flex items-center gap-2 font-display text-2xl font-light text-white">
              <Globe2 size={20} className="text-[#D9AE61]" aria-hidden="true" />
              <span>Supported Auction Currencies</span>
            </h2>
            <p className="mt-2 text-xs text-[#C9D1DC]/80">
              Each lot is denominated strictly in one designated currency with integer precision. No automatic cross-currency conversion alters your bid commitment.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SUPPORTED_CURRENCIES.map((code) => (
                <div key={code} className="border border-[#C9D1DC]/15 bg-[#05070D]/80 p-3">
                  <p className="font-mono-tabular text-sm font-medium text-[#D9AE61]">{code}</p>
                  <p className="text-[11px] text-[#C9D1DC]/75">{CURRENCY_METADATA[code].name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/75 p-7 lg:col-span-6">
            <h2 className="font-display text-2xl font-light text-white">
              Bidding Rules & Reserve Protection
            </h2>
            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-[#C9D1DC]/85">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#D9AE61]" aria-hidden="true" />
                <span>
                  <strong className="text-white">Opening & Increments:</strong> First valid bid must meet or exceed the Starting Bid. Each subsequent bid must add at least the specified Minimum Bid Increment.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#D9AE61]" aria-hidden="true" />
                <span>
                  <strong className="text-white">Reserve Price Transparency:</strong> Lots display whether a Reserve Price applies and immediately indicate once the Reserve is Met.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#D9AE61]" aria-hidden="true" />
                <span>
                  <strong className="text-white">Simultaneous Bid Resolution:</strong> Firestore atomic transactions ensure only valid higher bids advance the lot, returning clear prompts if another collector bids milliseconds earlier.
                </span>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/auctions/live"
                className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
              >
                <span>Enter Live Auctions</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link
                to="/register"
                className="btn-luxury inline-flex items-center px-6 py-3 text-xs tracking-[0.18em] uppercase text-[#E6EAF0]"
              >
                Register Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
