import test from 'node:test';
import assert from 'node:assert/strict';
import { extractGemSpecimenRGBA, findCaptionCutoffRow } from './gemPhotoMatte';

function makeSolidRGBA(w: number, h: number, r: number, g: number, b: number): Uint8ClampedArray {
  const arr = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    arr[i * 4] = r;
    arr[i * 4 + 1] = g;
    arr[i * 4 + 2] = b;
    arr[i * 4 + 3] = 255;
  }
  return arr;
}

function fillRect(
  arr: Uint8ClampedArray,
  w: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  g: number,
  b: number,
) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      arr[i] = r;
      arr[i + 1] = g;
      arr[i + 2] = b;
      arr[i + 3] = 255;
    }
  }
}

test('extractGemSpecimenRGBA removes outer light backdrop and preserves inner white specular facets', () => {
  const w = 40;
  const h = 40;
  const img = makeSolidRGBA(w, h, 245, 246, 248);

  // Colored gemstone body in center
  fillRect(img, w, 10, 8, 30, 28, 22, 58, 210);
  // Pure white specular flash completely enclosed inside the gemstone
  fillRect(img, w, 17, 15, 23, 20, 255, 255, 255);
  // Black caption text bar near bottom (rows 35..38)
  fillRect(img, w, 6, 35, 34, 38, 12, 12, 12);

  const cutoff = findCaptionCutoffRow(img, w, h);
  assert.ok(cutoff >= 28 && cutoff <= 35, `Expected cutoff between 28 and 35, got ${cutoff}`);

  const res = extractGemSpecimenRGBA(img, w, h);
  // Corner backdrop cleared
  assert.equal(res.output[3], 0);
  // Gemstone edge pixel retained
  assert.ok(res.output[(12 * w + 14) * 4 + 3] > 200);
  // Inner white specular facet retained
  assert.equal(res.output[(17 * w + 19) * 4 + 3], 255);
  // Caption pixel cleared
  assert.equal(res.output[(36 * w + 20) * 4 + 3], 0);
  // Cropped bounding box matches stone bounds
  assert.equal(res.cropX, 10);
  assert.equal(res.cropY, 8);
  assert.equal(res.cropWidth, 20);
  assert.equal(res.cropHeight, 20);
});
