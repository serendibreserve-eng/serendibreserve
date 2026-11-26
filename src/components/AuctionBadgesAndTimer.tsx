import React from 'react';
import { CheckCircle2, Clock, Radio, ShieldAlert, XCircle } from 'lucide-react';
import type { AuctionResultStatus, AuctionStatus } from '../types/auction';
import { formatCountdown } from '../utils/auctionLogic';

export const AuctionStatusBadge: React.FC<{ status: AuctionStatus }> = ({ status }) => {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-[#D9AE61]/60 bg-[#D9AE61]/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-[#D9AE61]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D9AE61] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D9AE61]" />
        </span>
        LIVE AUCTION
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-[#3D7BFF]/45 bg-[#244DCE]/20 px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] uppercase text-[#E6EAF0]">
        <Clock size={11} className="text-[#3D7BFF]" aria-hidden="true" />
        UPCOMING
      </span>
    );
  }
  if (status === 'paused') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-amber-400/45 bg-amber-500/15 px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] uppercase text-amber-200">
        <ShieldAlert size={11} aria-hidden="true" />
        PAUSED
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-rose-400/45 bg-rose-500/15 px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] uppercase text-rose-200">
        <XCircle size={11} aria-hidden="true" />
        CANCELLED
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-[#C9D1DC]/30 bg-[#C9D1DC]/10 px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] uppercase text-[#C9D1DC]">
        DRAFT
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 border border-[#C9D1DC]/30 bg-[#0A1226] px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] uppercase text-[#C9D1DC]">
      <CheckCircle2 size={11} className="text-[#D9AE61]" aria-hidden="true" />
      {status === 'completed' ? 'COMPLETED' : 'ENDED'}
    </span>
  );
};

export const AuctionResultBadge: React.FC<{ resultStatus: AuctionResultStatus }> = ({
  resultStatus,
}) => {
  if (resultStatus === 'sold') {
    return (
      <span className="inline-flex items-center gap-1 border border-[#D9AE61]/60 bg-[#D9AE61]/18 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-[#D9AE61]">
        SOLD
      </span>
    );
  }
  if (resultStatus === 'reserve_not_met') {
    return (
      <span className="inline-flex items-center gap-1 border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] uppercase text-amber-200">
        RESERVE NOT MET
      </span>
    );
  }
  if (resultStatus === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 border border-rose-400/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] uppercase text-rose-200">
        CANCELLED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 border border-[#C9D1DC]/25 bg-[#0A1226] px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] uppercase text-[#C9D1DC]">
      UNSOLD
    </span>
  );
};

export const DemoLotBadge: React.FC<{ activeBidding?: boolean }> = ({
  activeBidding = false,
}) => (
  <span
    title={
      activeBidding
        ? 'Demonstration showcase lot with admin-activated live bidding'
        : 'Demonstration showcase lot — illustrative pricing & simulated activity only'
    }
    className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase ${
      activeBidding
        ? 'border-[#3D7BFF]/60 bg-[#244DCE]/25 text-[#E6EAF0]'
        : 'border-amber-400/50 bg-amber-500/15 text-amber-200'
    }`}
  >
    {activeBidding ? 'DEMO · LIVE OPEN' : 'DEMO LOT'}
  </span>
);

export const DemoSimulatedBidBadge: React.FC = () => (
  <span className="inline-flex items-center border border-amber-400/40 bg-amber-500/12 px-1.5 py-0.5 text-[9px] font-medium tracking-[0.12em] uppercase text-amber-200">
    DEMO / SIMULATED
  </span>
);

export const DemoResultDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <p
    className={`border border-amber-400/25 bg-amber-500/10 text-amber-100/90 ${
      compact ? 'px-2.5 py-1.5 text-[10px] leading-snug' : 'px-3.5 py-2.5 text-xs leading-relaxed'
    }`}
  >
    Illustrative demonstration record — specifications, weights, and simulated figures are showcase examples rather than certified historical sales.
  </p>
);

export const CountdownBlocks: React.FC<{
  targetMs: number;
  nowMs: number;
  label: string;
  compact?: boolean;
}> = ({ targetMs, nowMs, label, compact = false }) => {
  const cd = formatCountdown(targetMs, nowMs);
  const pad = (n: number) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <div className="flex items-center justify-between border border-[#C9D1DC]/15 bg-[#05070D]/75 px-3 py-2 text-xs">
        <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase text-[#C9D1DC]/75">
          <Radio size={11} className="text-[#D9AE61]" aria-hidden="true" />
          {label}
        </span>
        <span className="font-mono-tabular font-medium text-[#F5F3EF]">
          {cd.expired ? 'Closed' : cd.formatted}
        </span>
      </div>
    );
  }

  const units = [
    { val: pad(cd.days), unit: 'DAYS' },
    { val: pad(cd.hours), unit: 'HRS' },
    { val: pad(cd.minutes), unit: 'MIN' },
    { val: pad(cd.seconds), unit: 'SEC' },
  ];

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium tracking-[0.22em] uppercase text-[#D9AE61]">
        {label}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map((u) => (
          <div
            key={u.unit}
            className="border border-[#C9D1DC]/20 bg-[#05070D]/80 px-2 py-2.5 text-center"
          >
            <p className="font-mono-tabular text-xl font-medium text-white sm:text-2xl">
              {u.val}
            </p>
            <p className="mt-0.5 text-[9px] tracking-[0.2em] uppercase text-[#C9D1DC]/70">
              {u.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
