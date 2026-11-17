import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_GEM_CUTS, createGemGeometry } from './gemGeometryFactory';

test('every gem cut builds valid indexed/non-indexed BufferGeometry with non-zero bounding box', () => {
  for (const cut of ALL_GEM_CUTS) {
    const geo = createGemGeometry(cut);
    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    assert.ok(pos, `${cut} must have position attribute`);
    assert.ok(norm, `${cut} must have normal attribute`);
    assert.ok(pos.count >= 24, `${cut} must have meaningful facet vertices (got ${pos.count})`);
    assert.ok(geo.boundingBox !== null, `${cut} must compute boundingBox`);
    assert.ok(geo.boundingSphere && geo.boundingSphere.radius > 0.4, `${cut} must have positive radius`);

    // Ensure no NaN coordinates
    for (let i = 0; i < pos.count; i++) {
      assert.ok(Number.isFinite(pos.getX(i)), `${cut} X coordinate finite`);
      assert.ok(Number.isFinite(pos.getY(i)), `${cut} Y coordinate finite`);
      assert.ok(Number.isFinite(pos.getZ(i)), `${cut} Z coordinate finite`);
    }
    geo.dispose();
  }
});
