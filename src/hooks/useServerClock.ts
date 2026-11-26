import { useEffect, useState } from 'react';

let cachedOffsetMs = 0;
let syncedOnce = false;

async function syncServerClock(): Promise<number> {
  try {
    const t0 = Date.now();
    const res = await fetch('/api/time', { cache: 'no-store' });
    if (!res.ok) return cachedOffsetMs;
    const data = (await res.json()) as { serverTimeMs?: number };
    const t1 = Date.now();
    if (typeof data.serverTimeMs === 'number') {
      const rttHalf = (t1 - t0) / 2;
      cachedOffsetMs = data.serverTimeMs + rttHalf - t1;
      syncedOnce = true;
    }
  } catch {
    // Keep existing offset if offline
  }
  return cachedOffsetMs;
}

export function getAuthoritativeNowMs(): number {
  return Date.now() + cachedOffsetMs;
}

export function useServerClock(tickMs = 1000): number {
  const [nowMs, setNowMs] = useState<number>(() => getAuthoritativeNowMs());

  useEffect(() => {
    let active = true;
    if (!syncedOnce) {
      void syncServerClock().then(() => {
        if (active) setNowMs(getAuthoritativeNowMs());
      });
    }

    const resyncTimer = window.setInterval(() => {
      void syncServerClock();
    }, 60_000);

    const tickTimer = window.setInterval(() => {
      if (active) {
        setNowMs(getAuthoritativeNowMs());
      }
    }, tickMs);

    return () => {
      active = false;
      window.clearInterval(resyncTimer);
      window.clearInterval(tickTimer);
    };
  }, [tickMs]);

  return nowMs;
}
