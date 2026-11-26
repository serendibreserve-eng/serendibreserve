import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../utils/webglHelpers';

interface GemParticlesProps {
  className?: string;
  density?: number;
  tintHex?: string;
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  alpha: number;
  blue: boolean;
}

export const GemParticles: React.FC<GemParticlesProps> = ({
  className = '',
  density = 36,
  tintHex = '#3D7BFF',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.max(12, Math.floor(density * 0.45)) : density;

    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const shards: Shard[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.08 - Math.random() * 0.22,
      size: 1.5 + Math.random() * 3.2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.015,
      alpha: 0.16 + Math.random() * 0.52,
      blue: i % 2 === 0,
    }));

    let rafId = 0;
    let visible = true;
    let lastDraw = 0;

    const draw = (now = performance.now()) => {
      if (!visible) {
        rafId = 0;
        return;
      }
      if (now - lastDraw >= 32) {
        lastDraw = now;
        ctx.clearRect(0, 0, width, height);
        for (const s of shards) {
          s.x += s.vx;
          s.y += s.vy;
          s.angle += s.spin;

          if (s.y < -12) s.y = height + 12;
          if (s.x < -12) s.x = width + 12;
          if (s.x > width + 12) s.x = -12;

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.angle);
          ctx.globalAlpha = s.alpha;
          ctx.fillStyle = s.blue ? tintHex : '#E6EAF0';
          // Tiny faceted diamond shard
          ctx.beginPath();
          ctx.moveTo(0, -s.size);
          ctx.lineTo(s.size * 0.72, 0);
          ctx.lineTo(0, s.size);
          ctx.lineTo(-s.size * 0.72, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const nextVisible = entries[0]?.isIntersecting ?? true;
        visible = nextVisible;
        if (nextVisible && !rafId) {
          rafId = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [density, tintHex]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
};
