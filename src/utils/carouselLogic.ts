/**
 * Pure state/progression utilities for the Collection auto-morph carousel.
 */

export function getNextCarouselIndex(current: number, total: number, step = 1): number {
  if (total <= 0) return 0;
  const normalized = ((current % total) + total) % total;
  return (((normalized + step) % total) + total) % total;
}

export function formatCarouselCounter(index: number, total: number): string {
  if (total <= 0) return '00 / 00';
  const cur = String(Math.max(0, index) + 1).padStart(2, '0');
  const max = String(total).padStart(2, '0');
  return `${cur} / ${max}`;
}

export function computeZoomPulseScale(elapsedMs: number, burstDurationMs = 900): number {
  if (elapsedMs <= 0) return 0.72;
  if (elapsedMs >= burstDurationMs) return 1.0;
  const t = elapsedMs / burstDurationMs;
  // Overshoot crystal zoom curve: zooms in cleanly past 1.14 then settles at 1.0
  if (t < 0.45) {
    const k = t / 0.45;
    const ease = 1 - Math.pow(1 - k, 3);
    return 0.72 + (1.14 - 0.72) * ease;
  }
  const k = (t - 0.45) / 0.55;
  const ease = 1 - Math.pow(1 - k, 2);
  return 1.14 + (1.0 - 1.14) * ease;
}
