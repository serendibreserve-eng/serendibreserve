/**
 * Pure pixel-processing utilities to extract photographed gemstone specimens
 * from light studio backdrops and crop out bottom caption bands so they float
 * seamlessly on Serendib Reserve's dark royal-blue luxury backgrounds.
 */

export interface MatteOptions {
  /** Fallback fraction of height if no clean gap row is found (default 0.84). */
  defaultCaptionCutoffRatio?: number;
  /** RGB distance threshold from edge background sample to treat as backdrop (default 44). */
  bgColorTolerance?: number;
  /** Feather transition width above tolerance for smooth anti-aliased edges (default 22). */
  featherWidth?: number;
}

function rgbDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function isNeutralLight(r: number, g: number, b: number, minLum = 205): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  // Studio backdrop / soft outer shadow: very low saturation and bright
  return max - min <= 18 && lum >= minLum;
}

/**
 * Finds the horizontal row separating the gemstone above from the bottom caption
 * text below by scanning from y = 0.72*H to 0.885*H for the earliest clean gap
 * row just above the caption text, avoiding stopping between 2-line captions.
 */
export function findCaptionCutoffRow(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  defaultRatio = 0.845,
): number {
  if (width <= 0 || height <= 0) return 0;

  const sampleTopLeft = [data[0], data[1], data[2]] as const;
  const trIdx = (width - 1) * 4;
  const sampleTopRight = [data[trIdx], data[trIdx + 1], data[trIdx + 2]] as const;

  const yStart = Math.max(1, Math.floor(height * 0.72));
  const yEnd = Math.min(height - 1, Math.floor(height * 0.885));

  // First detect if there is actually a dark caption band near bottom (0.84..0.98)
  let captionDarkPixels = 0;
  const capStart = Math.floor(height * 0.84);
  const capEnd = Math.floor(height * 0.98);
  const xStep = Math.max(1, Math.floor(width / 80));
  for (let y = capStart; y < capEnd; y += 2) {
    for (let x = Math.floor(width * 0.12); x < Math.floor(width * 0.88); x += xStep) {
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < 95) captionDarkPixels += 1;
    }
  }
  if (captionDarkPixels < 4) {
    return height;
  }

  let bestRow = Math.floor(height * defaultRatio);
  let bestScore = Infinity;
  const minCleanGapY = Math.floor(height * 0.81);

  for (let y = yStart; y <= yEnd; y++) {
    let nonBgCount = 0;
    for (let x = 2; x < width - 2; x += 2) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dL = rgbDistance(r, g, b, sampleTopLeft[0], sampleTopLeft[1], sampleTopLeft[2]);
      const dR = rgbDistance(r, g, b, sampleTopRight[0], sampleTopRight[1], sampleTopRight[2]);
      if (Math.min(dL, dR) > 30 && !isNeutralLight(r, g, b, 158)) {
        nonBgCount += 1;
      }
      // Strongly penalize dark text/stone pixels on this separator row
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 140) {
        nonBgCount += 4;
      }
    }
    if (nonBgCount === 0 && y >= minCleanGapY) {
      return y;
    }
    if (nonBgCount < bestScore) {
      bestScore = nonBgCount;
      bestRow = y;
    }
  }

  return bestRow;
}

/**
 * Performs an edge-connected BFS flood fill over `data` (RGBA in-place or copy)
 * to clear white, light-grey, and warm-beige studio backgrounds around a gem
 * while keeping internal specular white highlights untouched.
 * Returns the trimmed bounding box of non-transparent pixels.
 */
export function extractGemSpecimenRGBA(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  options: MatteOptions = {},
): {
  output: Uint8ClampedArray;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
} {
  const tolerance = options.bgColorTolerance ?? 34;
  const feather = options.featherWidth ?? 18;
  const allowShadowPass = tolerance > 24;
  const neutralMinLum = allowShadowPass ? 154 : 212;
  const cutoffY = findCaptionCutoffRow(
    rgba,
    width,
    height,
    options.defaultCaptionCutoffRatio ?? 0.845,
  );

  const output = new Uint8ClampedArray(rgba);
  const visited = new Uint8Array(width * height);
  const bgMask = new Uint8Array(width * height);

  // Sample outer perimeter references above caption area (never bottom-center where the stone may sit)
  const refPoints: Array<[number, number]> = [
    [1, 1],
    [Math.floor(width * 0.5), 1],
    [Math.max(0, width - 2), 1],
    [1, Math.floor(cutoffY * 0.45)],
    [Math.max(0, width - 2), Math.floor(cutoffY * 0.45)],
    [1, Math.max(0, cutoffY - 2)],
    [Math.max(0, width - 2), Math.max(0, cutoffY - 2)],
  ];
  const refs: Array<[number, number, number]> = refPoints.map(([px, py]) => {
    const idx = (Math.min(height - 1, Math.max(0, py)) * width + Math.min(width - 1, Math.max(0, px))) * 4;
    return [rgba[idx], rgba[idx + 1], rgba[idx + 2]];
  });

  const minRefDist = (r: number, g: number, b: number): number => {
    let best = Infinity;
    for (let k = 0; k < refs.length; k++) {
      const d = rgbDistance(r, g, b, refs[k][0], refs[k][1], refs[k][2]);
      if (d < best) best = d;
    }
    return best;
  };

  // Average perimeter color for edge decontamination
  let avgR = 0;
  let avgG = 0;
  let avgB = 0;
  for (let k = 0; k < refs.length; k++) {
    avgR += refs[k][0];
    avgG += refs[k][1];
    avgB += refs[k][2];
  }
  avgR /= refs.length;
  avgG /= refs.length;
  avgB /= refs.length;
  const warmBackdrop = avgR - avgB > 6;

  const isBackdropOrShadow = (r: number, g: number, b: number, d: number): boolean => {
    if (d <= tolerance) return true;
    if (isNeutralLight(r, g, b, neutralMinLum)) return true;
    if (!allowShadowPass) return false;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const chroma = max - min;

    // Cross soft tinted under-stone contact shadows / bounce pools without entering dark or rich gem facets
    if (warmBackdrop) {
      // On cream/beige backdrops keep cool blue-lavender gem facets intact while clearing warm beige shadows
      return lum >= 158 && chroma <= 52 && r >= b - 8 && d <= 88;
    }
    return lum >= 152 && chroma <= 52 && d <= 82;
  };

  // Clear everything at or below caption cutoff row immediately
  for (let y = cutoffY; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      output[p * 4 + 3] = 0;
      visited[p] = 1;
      bgMask[p] = 1;
    }
  }

  // Seed perimeter pixels of the region [0 .. cutoffY - 1]
  const queue = new Int32Array(width * cutoffY);
  let qHead = 0;
  let qTail = 0;

  const trySeed = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= cutoffY) return;
    const p = y * width + x;
    if (visited[p]) return;
    const i = p * 4;
    if (output[i + 3] === 0) {
      visited[p] = 1;
      bgMask[p] = 1;
      queue[qTail++] = p;
      return;
    }
    const r = output[i];
    const g = output[i + 1];
    const b = output[i + 2];
    const d = minRefDist(r, g, b);
    if (isBackdropOrShadow(r, g, b, d) || d <= tolerance + feather) {
      visited[p] = 1;
      bgMask[p] = 1;
      queue[qTail++] = p;
    }
  };

  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    if (cutoffY > 1) trySeed(x, cutoffY - 1);
  }
  for (let y = 0; y < cutoffY; y++) {
    trySeed(0, y);
    if (width > 1) trySeed(width - 1, y);
  }

  // BFS flood fill inward stopping on saturated / dark stone boundaries
  while (qHead < qTail) {
    const p = queue[qHead++];
    const px = p % width;
    const py = (p - px) / width;

    const neighbors = [
      px > 0 ? p - 1 : -1,
      px + 1 < width ? p + 1 : -1,
      py > 0 ? p - width : -1,
      py + 1 < cutoffY ? p + width : -1,
    ];

    for (let n = 0; n < 4; n++) {
      const np = neighbors[n];
      if (np < 0 || visited[np]) continue;
      visited[np] = 1;

      const i = np * 4;
      const r = output[i];
      const g = output[i + 1];
      const b = output[i + 2];
      const d = minRefDist(r, g, b);

      if (isBackdropOrShadow(r, g, b, d)) {
        bgMask[np] = 1;
        queue[qTail++] = np;
      }
    }
  }

  // Apply alpha clearance + anti-aliased fringe smoothing & halo decontamination
  let minX = width;
  let minY = cutoffY;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < cutoffY; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (bgMask[p]) {
        output[p * 4 + 3] = 0;
        continue;
      }

      // Check 4-neighbors to soften hard silhouette rim pixels & decontaminate light fringes
      let bgAdj = 0;
      if (x > 0 && bgMask[p - 1]) bgAdj++;
      if (x + 1 < width && bgMask[p + 1]) bgAdj++;
      if (y > 0 && bgMask[p - width]) bgAdj++;
      if (y + 1 < cutoffY && bgMask[p + width]) bgAdj++;

      if (bgAdj > 0) {
        const i = p * 4;
        const r = output[i];
        const g = output[i + 1];
        const b = output[i + 2];
        const d = minRefDist(r, g, b);
        const effFeather = feather * 1.4;
        if (d < tolerance + effFeather) {
          const rawFactor = (d - tolerance * 0.45) / effFeather;
          const factor = Math.max(0.08, Math.min(1, rawFactor));
          output[i + 3] = Math.round(output[i + 3] * factor);
          // Un-premultiply light background spill along edges so dark backgrounds have zero chalky halo
          if (factor < 0.95) {
            const inv = 1 - factor;
            const denom = Math.max(0.38, factor);
            output[i] = Math.max(0, Math.min(255, Math.round((r - inv * avgR) / denom)));
            output[i + 1] = Math.max(0, Math.min(255, Math.round((g - inv * avgG) / denom)));
            output[i + 2] = Math.max(0, Math.min(255, Math.round((b - inv * avgB) / denom)));
          }
        }
      }

      if (output[p * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { output, cropX: 0, cropY: 0, cropWidth: width, cropHeight: cutoffY || height };
  }

  return {
    output,
    cropX: minX,
    cropY: minY,
    cropWidth: maxX - minX + 1,
    cropHeight: maxY - minY + 1,
  };
}

/**
 * Extracts a bright/colored logo (e.g. white mane + royal sapphire + wordmark)
 * from a pure black (#000000) background using edge-connected dark BFS flood fill
 * plus counter cleanup inside the lower text band, while preserving internal
 * enclosed dark facial details in the upper crest.
 */
export function extractDarkLogoRGBA(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  options: { darkThreshold?: number; featherRange?: number; textBandRatio?: number } = {},
): {
  output: Uint8ClampedArray;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
} {
  if (width <= 0 || height <= 0) {
    return {
      output: new Uint8ClampedArray(rgba),
      cropX: 0,
      cropY: 0,
      cropWidth: width,
      cropHeight: height,
    };
  }

  const darkMax = options.darkThreshold ?? 28;
  const featherRange = options.featherRange ?? 34;
  const textBandStartY = Math.floor(height * (options.textBandRatio ?? 0.56));

  const output = new Uint8ClampedArray(rgba);
  const total = width * height;
  const visited = new Uint8Array(total);
  const bgMask = new Uint8Array(total);

  const isDarkBackdrop = (r: number, g: number, b: number): boolean => {
    const chMax = Math.max(r, g, b);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return chMax <= darkMax && lum <= darkMax;
  };

  const queue = new Int32Array(total);
  let qHead = 0;
  let qTail = 0;

  const trySeed = (x: number, y: number) => {
    const p = y * width + x;
    if (visited[p]) return;
    visited[p] = 1;
    const i = p * 4;
    if (output[i + 3] === 0 || isDarkBackdrop(output[i], output[i + 1], output[i + 2])) {
      bgMask[p] = 1;
      queue[qTail++] = p;
    }
  };

  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    if (height > 1) trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    trySeed(0, y);
    if (width > 1) trySeed(width - 1, y);
  }

  while (qHead < qTail) {
    const p = queue[qHead++];
    const px = p % width;
    const py = (p - px) / width;

    const neighbors = [
      px > 0 ? p - 1 : -1,
      px + 1 < width ? p + 1 : -1,
      py > 0 ? p - width : -1,
      py + 1 < height ? p + width : -1,
    ];

    for (let n = 0; n < 4; n++) {
      const np = neighbors[n];
      if (np < 0 || visited[np]) continue;
      visited[np] = 1;
      const i = np * 4;
      if (isDarkBackdrop(output[i], output[i + 1], output[i + 2])) {
        bgMask[np] = 1;
        queue[qTail++] = np;
      }
    }
  }

  // Also clear enclosed black counters inside lower lettering (e.g. R, D, B)
  for (let y = textBandStartY; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (bgMask[p]) continue;
      const i = p * 4;
      if (isDarkBackdrop(output[i], output[i + 1], output[i + 2])) {
        bgMask[p] = 1;
      }
    }
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      if (bgMask[p]) {
        output[i + 3] = 0;
        continue;
      }

      // Soften + recover anti-aliased bright rim pixels adjacent to cleared black space
      let bgAdj = 0;
      if (x > 0 && bgMask[p - 1]) bgAdj++;
      if (x + 1 < width && bgMask[p + 1]) bgAdj++;
      if (y > 0 && bgMask[p - width]) bgAdj++;
      if (y + 1 < height && bgMask[p + width]) bgAdj++;

      if (bgAdj > 0) {
        const chMax = Math.max(output[i], output[i + 1], output[i + 2]);
        if (chMax < darkMax + featherRange) {
          const factor = Math.max(0.08, Math.min(1, (chMax - darkMax * 0.35) / featherRange));
          output[i + 3] = Math.round(output[i + 3] * factor);
          // Un-premultiply over pure black background (C_obs = alpha * C_fg)
          const invFactor = 1 / Math.max(0.32, factor);
          output[i] = Math.min(255, Math.round(output[i] * invFactor));
          output[i + 1] = Math.min(255, Math.round(output[i + 1] * invFactor));
          output[i + 2] = Math.min(255, Math.round(output[i + 2] * invFactor));
        }
      }

      if (output[i + 3] > 20) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { output, cropX: 0, cropY: 0, cropWidth: width, cropHeight: height };
  }

  return {
    output,
    cropX: minX,
    cropY: minY,
    cropWidth: maxX - minX + 1,
    cropHeight: maxY - minY + 1,
  };
}

