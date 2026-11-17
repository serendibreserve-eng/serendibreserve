import * as THREE from 'three';
import { GemCut } from '../content/gems';

interface Vec2 {
  x: number;
  z: number;
}

function pushTri(
  out: number[],
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  cz: number,
) {
  out.push(ax, ay, az, bx, by, bz, cx, cy, cz);
}

function buildPolygonRing(
  segments: number,
  shapeFn: (theta: number) => Vec2,
): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    pts.push(shapeFn(theta));
  }
  return pts;
}

function scaleRing(ring: Vec2[], sx: number, sz: number): Vec2[] {
  return ring.map((p) => ({ x: p.x * sx, z: p.z * sz }));
}

function connectRings(
  out: number[],
  upper: Vec2[],
  yUpper: number,
  lower: Vec2[],
  yLower: number,
) {
  const n = upper.length;
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const u0 = upper[i];
    const u1 = upper[next];
    const l0 = lower[i];
    const l1 = lower[next];
    // Outward winding (counter-clockwise viewed from outside)
    pushTri(out, u0.x, yUpper, u0.z, l0.x, yLower, l0.z, l1.x, yLower, l1.z);
    pushTri(out, u0.x, yUpper, u0.z, l1.x, yLower, l1.z, u1.x, yUpper, u1.z);
  }
}

function capRing(
  out: number[],
  ring: Vec2[],
  yRing: number,
  centerY: number,
  faceUp: boolean,
) {
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const a = ring[i];
    const b = ring[next];
    if (faceUp) {
      pushTri(out, 0, centerY, 0, b.x, yRing, b.z, a.x, yRing, a.z);
    } else {
      pushTri(out, 0, centerY, 0, a.x, yRing, a.z, b.x, yRing, b.z);
    }
  }
}

function buildFacetedStone(
  segments: number,
  shapeFn: (theta: number) => Vec2,
  opts: {
    tableScale: number;
    crownMidScale: number;
    tableY: number;
    crownMidY: number;
    girdleTopY: number;
    girdleBotY: number;
    pavilionMidScale: number;
    pavilionMidY: number;
    culetY: number;
  },
): THREE.BufferGeometry {
  const positions: number[] = [];
  const girdle = buildPolygonRing(segments, shapeFn);
  const table = scaleRing(girdle, opts.tableScale, opts.tableScale);
  const crownMid = scaleRing(girdle, opts.crownMidScale, opts.crownMidScale);
  const pavMid = scaleRing(girdle, opts.pavilionMidScale, opts.pavilionMidScale);

  // Table cap (facing +Y)
  capRing(positions, table, opts.tableY, opts.tableY, true);
  // Crown upper tier (star/bezel)
  connectRings(positions, table, opts.tableY, crownMid, opts.crownMidY);
  // Crown lower tier
  connectRings(positions, crownMid, opts.crownMidY, girdle, opts.girdleTopY);
  // Girdle band
  connectRings(positions, girdle, opts.girdleTopY, girdle, opts.girdleBotY);
  // Pavilion upper tier
  connectRings(positions, girdle, opts.girdleBotY, pavMid, opts.pavilionMidY);
  // Pavilion lower tier to culet (facing -Y)
  capRing(positions, pavMid, opts.pavilionMidY, opts.culetY, false);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  // Add planar UVs for shaders (top-down normalized)
  const posAttr = geo.attributes.position;
  const uvs = new Float32Array(posAttr.count * 2);
  for (let i = 0; i < posAttr.count; i++) {
    uvs[i * 2] = posAttr.getX(i) * 0.5 + 0.5;
    uvs[i * 2 + 1] = posAttr.getZ(i) * 0.5 + 0.5;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

function buildCabochonGeometry(): THREE.BufferGeometry {
  // Smooth high dome with subtle girdle and flat/shallow base
  const geo = new THREE.SphereGeometry(1, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.54);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    pos.setXYZ(i, x * 0.96, (y - 0.12) * 0.78, z * 1.16);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

function createHexCrystalPrism(
  radius: number,
  height: number,
  tipHeight: number,
  offset: THREE.Vector3,
  euler: THREE.Euler,
): number[] {
  const positions: number[] = [];
  const sides = 6;
  const ringTop: THREE.Vector3[] = [];
  const ringBot: THREE.Vector3[] = [];
  const halfH = height * 0.5;
  const mat = new THREE.Matrix4().compose(
    offset,
    new THREE.Quaternion().setFromEuler(euler),
    new THREE.Vector3(1, 1, 1),
  );

  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    // Slight natural crystal asymmetry
    const r = radius * (i % 2 === 0 ? 1.0 : 0.94);
    ringTop.push(new THREE.Vector3(Math.cos(a) * r, halfH, Math.sin(a) * r).applyMatrix4(mat));
    ringBot.push(new THREE.Vector3(Math.cos(a) * r * 1.04, -halfH, Math.sin(a) * r * 1.04).applyMatrix4(mat));
  }
  const apex = new THREE.Vector3(0, halfH + tipHeight, 0).applyMatrix4(mat);
  const base = new THREE.Vector3(0, -halfH - tipHeight * 0.45, 0).applyMatrix4(mat);

  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    // Side walls
    pushTri(
      positions,
      ringTop[i].x, ringTop[i].y, ringTop[i].z,
      ringBot[i].x, ringBot[i].y, ringBot[i].z,
      ringBot[next].x, ringBot[next].y, ringBot[next].z,
    );
    pushTri(
      positions,
      ringTop[i].x, ringTop[i].y, ringTop[i].z,
      ringBot[next].x, ringBot[next].y, ringBot[next].z,
      ringTop[next].x, ringTop[next].y, ringTop[next].z,
    );
    // Top termination
    pushTri(
      positions,
      apex.x, apex.y, apex.z,
      ringTop[next].x, ringTop[next].y, ringTop[next].z,
      ringTop[i].x, ringTop[i].y, ringTop[i].z,
    );
    // Bottom termination
    pushTri(
      positions,
      base.x, base.y, base.z,
      ringBot[i].x, ringBot[i].y, ringBot[i].z,
      ringBot[next].x, ringBot[next].y, ringBot[next].z,
    );
  }
  return positions;
}

function buildRoughClusterGeometry(): THREE.BufferGeometry {
  const main = createHexCrystalPrism(0.56, 1.15, 0.44, new THREE.Vector3(0, 0.05, 0), new THREE.Euler(0.08, 0.2, -0.06));
  const left = createHexCrystalPrism(0.36, 0.85, 0.32, new THREE.Vector3(-0.42, -0.15, 0.14), new THREE.Euler(0.24, 0.6, 0.42));
  const right = createHexCrystalPrism(0.31, 0.72, 0.28, new THREE.Vector3(0.4, -0.22, -0.18), new THREE.Euler(-0.22, -0.4, -0.48));
  const combined = new Float32Array([...main, ...left, ...right]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(combined, 3));
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

export function createGemGeometry(cut: GemCut): THREE.BufferGeometry {
  switch (cut) {
    case 'brilliant':
      return buildFacetedStone(
        16,
        (t) => ({ x: Math.cos(t), z: Math.sin(t) }),
        {
          tableScale: 0.56,
          crownMidScale: 0.82,
          tableY: 0.34,
          crownMidY: 0.2,
          girdleTopY: 0.03,
          girdleBotY: -0.03,
          pavilionMidScale: 0.52,
          pavilionMidY: -0.46,
          culetY: -0.82,
        },
      );

    case 'cushion':
      // Squircle superellipse matching classic Ceylon cushion sapphire silhouette
      return buildFacetedStone(
        16,
        (t) => {
          const c = Math.cos(t);
          const s = Math.sin(t);
          const p = 0.68; // superellipse softness for antique cushion corners
          return {
            x: Math.sign(c) * Math.pow(Math.abs(c), p) * 1.02,
            z: Math.sign(s) * Math.pow(Math.abs(s), p) * 1.1,
          };
        },
        {
          tableScale: 0.58,
          crownMidScale: 0.84,
          tableY: 0.34,
          crownMidY: 0.2,
          girdleTopY: 0.035,
          girdleBotY: -0.035,
          pavilionMidScale: 0.56,
          pavilionMidY: -0.48,
          culetY: -0.84,
        },
      );

    case 'oval':
      return buildFacetedStone(
        16,
        (t) => ({ x: Math.cos(t) * 0.86, z: Math.sin(t) * 1.18 }),
        {
          tableScale: 0.56,
          crownMidScale: 0.82,
          tableY: 0.33,
          crownMidY: 0.19,
          girdleTopY: 0.03,
          girdleBotY: -0.03,
          pavilionMidScale: 0.5,
          pavilionMidY: -0.46,
          culetY: -0.8,
        },
      );

    case 'emerald':
      // Architectural chamfered octagon step-cut
      return buildFacetedStone(
        8,
        (t) => {
          const idx = Math.round((t / (Math.PI * 2)) * 8) % 8;
          const octAngles = [
            Math.PI * 0.12,
            Math.PI * 0.38,
            Math.PI * 0.62,
            Math.PI * 0.88,
            Math.PI * 1.12,
            Math.PI * 1.38,
            Math.PI * 1.62,
            Math.PI * 1.88,
          ];
          const a = octAngles[idx];
          return { x: Math.cos(a) * 0.88, z: Math.sin(a) * 1.18 };
        },
        {
          tableScale: 0.62,
          crownMidScale: 0.84,
          tableY: 0.31,
          crownMidY: 0.17,
          girdleTopY: 0.04,
          girdleBotY: -0.04,
          pavilionMidScale: 0.55,
          pavilionMidY: -0.44,
          culetY: -0.76,
        },
      );

    case 'pear':
      return buildFacetedStone(
        18,
        (t) => {
          const s = Math.sin(t);
          const c = Math.cos(t);
          // Tapered crown tip at +Z, rounded belly at -Z
          const taper = s > 0 ? 1 - 0.56 * Math.pow(s, 1.35) : 1 + 0.06 * Math.abs(s);
          return {
            x: c * 0.86 * taper,
            z: s * 1.24,
          };
        },
        {
          tableScale: 0.55,
          crownMidScale: 0.81,
          tableY: 0.32,
          crownMidY: 0.18,
          girdleTopY: 0.03,
          girdleBotY: -0.03,
          pavilionMidScale: 0.48,
          pavilionMidY: -0.45,
          culetY: -0.78,
        },
      );

    case 'marquise':
      return buildFacetedStone(
        16,
        (t) => {
          const s = Math.sin(t);
          const c = Math.cos(t);
          const widthFactor = Math.pow(Math.max(0.08, Math.abs(c)), 0.72);
          return {
            x: Math.sign(c) * widthFactor * 0.68,
            z: s * 1.32,
          };
        },
        {
          tableScale: 0.52,
          crownMidScale: 0.8,
          tableY: 0.32,
          crownMidY: 0.18,
          girdleTopY: 0.03,
          girdleBotY: -0.03,
          pavilionMidScale: 0.46,
          pavilionMidY: -0.42,
          culetY: -0.74,
        },
      );

    case 'cabochon':
      return buildCabochonGeometry();

    case 'rough':
      return buildRoughClusterGeometry();
  }
}

export const ALL_GEM_CUTS: GemCut[] = [
  'brilliant',
  'cushion',
  'oval',
  'emerald',
  'pear',
  'marquise',
  'cabochon',
  'rough',
];
