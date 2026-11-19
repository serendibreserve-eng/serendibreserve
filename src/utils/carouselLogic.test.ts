import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeZoomPulseScale,
  formatCarouselCounter,
  getNextCarouselIndex,
} from './carouselLogic';

test('getNextCarouselIndex wraps forward and backward safely across bounds', () => {
  assert.equal(getNextCarouselIndex(0, 8, 1), 1);
  assert.equal(getNextCarouselIndex(7, 8, 1), 0);
  assert.equal(getNextCarouselIndex(0, 8, -1), 7);
  assert.equal(getNextCarouselIndex(3, 0, 1), 0);
});

test('formatCarouselCounter pads single digits cleanly', () => {
  assert.equal(formatCarouselCounter(0, 8), '01 / 08');
  assert.equal(formatCarouselCounter(7, 8), '08 / 08');
  assert.equal(formatCarouselCounter(0, 0), '00 / 00');
});

test('computeZoomPulseScale overshoots cleanly and settles at 1.0', () => {
  assert.equal(computeZoomPulseScale(0), 0.72);
  assert.ok(computeZoomPulseScale(405) > 1.1, 'Expected mid-transition zoom overshoot > 1.1');
  assert.equal(computeZoomPulseScale(900), 1.0);
  assert.equal(computeZoomPulseScale(1500), 1.0);
});
