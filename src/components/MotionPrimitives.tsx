import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { prefersReducedMotion } from '../utils/webglHelpers';
import { GemSVG } from './GemSVG';

export const SplitHeading: React.FC<{
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}> = ({ children, as = 'h2', className = '' }) => {
  const Tag = motion[as];
  const reduced = prefersReducedMotion();
  const isHero = as === 'h1';

  return (
    <Tag
      initial={reduced || isHero ? false : { opacity: 0, y: 18 }}
      whileInView={isHero ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`text-balance ${className}`}
    >
      {children}
    </Tag>
  );
};

export const TiltGemCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hovered: false });
  const reduced = prefersReducedMotion();

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === 'touch') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 8,
      ry: (px - 0.5) * 10,
      gx: px * 100,
      gy: py * 100,
      hovered: true,
    });
  };

  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, hovered: false });
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
      style={{
        transform: reduced
          ? undefined
          : `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: tilt.hovered ? 'transform 0.12s ease-out' : 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
      className={`relative overflow-hidden border border-[#C9D1DC]/15 bg-[#0A1226]/65 transition-colors duration-300 hover:border-[#3D7BFF]/55 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: tilt.hovered ? 0.5 : 0,
          background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(61, 123, 255, 0.22) 0%, rgba(230,234,240,0.06) 30%, transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
};

export const CountUpNumber: React.FC<{
  target: number | null;
  suffix?: string;
  override?: string | null;
}> = ({ target, suffix = '', override = null }) => {
  const [val, setVal] = useState(target ?? 0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (target === null || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const duration = 1100;
          const step = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  if (override) {
    return <span className="font-mono-tabular">{override}</span>;
  }
  return (
    <span ref={ref} className="font-mono-tabular">
      {val}
      {suffix}
    </span>
  );
};

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100, active: false, visible: false });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 1024) {
      setEnabled(true);
    } else {
      return;
    }

    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = Boolean(target?.closest('a, button, [role="button"], input, select, textarea'));
      setPos({ x: e.clientX, y: e.clientY, active: interactive, visible: true });
    };
    const onLeave = () => setPos((p) => ({ ...p, visible: false }));

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (!enabled || !pos.visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden lg:block"
      style={{
        transform: `translate3d(${pos.x - 12}px, ${pos.y - 12}px, 0)`,
        transition: 'transform 0.06s linear',
      }}
    >
      <div
        className={`flex h-6 w-6 items-center justify-center transition-transform duration-200 ${
          pos.active ? 'scale-125 rotate-45 border border-[#3D7BFF] bg-[#1B3FD9]/25' : 'rounded-full border border-[#E6EAF0]/60'
        }`}
      >
        {pos.active && <span className="h-1.5 w-1.5 bg-white" />}
      </div>
    </div>
  );
};

export const GemLoadingScreen: React.FC = () => {
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1' || prefersReducedMotion();
  });

  useEffect(() => {
    if (done) return;
    const timer = window.setTimeout(() => setDone(true), 520);
    return () => clearTimeout(timer);
  }, [done]);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05070D] transition-opacity duration-500"
    >
      <div className="relative flex flex-col items-center gap-4">
        <GemSVG cut="cushion" size={72} label="Loading Serendib Reserve" />
        <p className="text-xs tracking-[0.35em] uppercase text-[#C9D1DC]">Serendib Reserve</p>
      </div>
    </div>
  );
};
