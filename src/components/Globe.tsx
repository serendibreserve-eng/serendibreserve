import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { COLOMBO_COORDS, MARKET_DESTINATIONS } from '../content/markets';
import { afterDraw, detectSoftwareWebGL, latLonToVector3, prefersReducedMotion } from '../utils/webglHelpers';

interface GlobeProps {
  activeRegion?: 'All' | 'Europe' | 'Americas' | 'Middle East' | 'Asia';
  className?: string;
}

/**
 * Rough land-mass bounding boxes (lat/lon) to procedurally populate dotted continents
 * with zero external GeoJSON/texture files.
 */
function isApproxLand(lat: number, lon: number): boolean {
  // North America
  if (lat >= 15 && lat <= 70 && lon >= -165 && lon <= -55) {
    if (lat < 30 && lon > -85) return false;
    return true;
  }
  // South America
  if (lat >= -55 && lat <= 12 && lon >= -81 && lon <= -35) {
    if (lat < -20 && lon < -72) return false;
    return true;
  }
  // Europe
  if (lat >= 36 && lat <= 70 && lon >= -10 && lon <= 45) return true;
  // Africa
  if (lat >= -35 && lat <= 36 && lon >= -18 && lon <= 50) {
    if (lat > 10 && lon < -15) return false;
    if (lat < 5 && lon < 8) return false;
    return true;
  }
  // Middle East & Asia
  if (lat >= 8 && lat <= 72 && lon >= 34 && lon <= 145) {
    if (lat < 20 && lon > 108) return false; // South China Sea
    return true;
  }
  // Sri Lanka & India tip
  if (lat >= 5 && lat <= 25 && lon >= 68 && lon <= 90) return true;
  // Japan
  if (lat >= 30 && lat <= 45 && lon >= 129 && lon <= 146) return true;
  // Indonesia / SE Asia
  if (lat >= -8 && lat <= 8 && lon >= 95 && lon <= 135) return true;
  // Australia
  if (lat >= -40 && lat <= -11 && lon >= 113 && lon <= 154) return true;
  return false;
}

export const Globe: React.FC<GlobeProps> = ({ activeRegion = 'All', className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(() => prefersReducedMotion());
  const regionRef = useRef(activeRegion);
  regionRef.current = activeRegion;

  useEffect(() => {
    if (fallback) return;
    const mount = mountRef.current;
    const container = containerRef.current;
    if (!mount || !container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallback(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth || 480, mount.clientHeight || 480);
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      (mount.clientWidth || 480) / (mount.clientHeight || 480),
      0.1,
      50,
    );
    camera.position.set(0, 0.35, 5.2);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const R = 1.68;

    // Dark obsidian sphere core
    const coreGeo = new THREE.SphereGeometry(R * 0.99, 40, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: '#070E22',
      transparent: true,
      opacity: 0.92,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreSphere);

    // Subtle longitude/latitude graticule rings
    const ringGeo = new THREE.RingGeometry(R * 1.003, R * 1.006, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#1B3FD9',
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const eqRing = new THREE.Mesh(ringGeo, ringMat);
    eqRing.rotation.x = Math.PI / 2;
    globeGroup.add(eqRing);

    // Dotted continents via Fibonacci sphere sampling
    const dotCount = 2600;
    const landCoords: number[] = [];
    const oceanCoords: number[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const vTemp = new THREE.Vector3();

    for (let i = 0; i < dotCount; i++) {
      const y = 1 - (i / (dotCount - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * rad;
      const z = Math.sin(theta) * rad;
      const lat = 90 - Math.acos(y) * (180 / Math.PI);
      const lon = Math.atan2(z, -x) * (180 / Math.PI) - 180;
      const normLon = ((lon + 540) % 360) - 180;

      vTemp.set(x * R, y * R, z * R);
      if (isApproxLand(lat, normLon)) {
        landCoords.push(vTemp.x, vTemp.y, vTemp.z);
      } else if (i % 4 === 0) {
        oceanCoords.push(vTemp.x, vTemp.y, vTemp.z);
      }
    }

    const landGeo = new THREE.BufferGeometry();
    landGeo.setAttribute('position', new THREE.Float32BufferAttribute(landCoords, 3));
    const landPoints = new THREE.Points(
      landGeo,
      new THREE.PointsMaterial({ color: '#8FB5FF', size: 0.032, transparent: true, opacity: 0.85 }),
    );
    globeGroup.add(landPoints);

    const oceanGeo = new THREE.BufferGeometry();
    oceanGeo.setAttribute('position', new THREE.Float32BufferAttribute(oceanCoords, 3));
    const oceanPoints = new THREE.Points(
      oceanGeo,
      new THREE.PointsMaterial({ color: '#1B3FD9', size: 0.018, transparent: true, opacity: 0.28 }),
    );
    globeGroup.add(oceanPoints);

    // Colombo origin beacon
    const colomboPos = latLonToVector3(COLOMBO_COORDS.lat, COLOMBO_COORDS.lon, R * 1.015);
    const colomboBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#FFFFFF' }),
    );
    colomboBeacon.position.copy(colomboPos);
    globeGroup.add(colomboBeacon);

    // Destination nodes and quadratic shipment arcs
    const arcEntries: Array<{
      region: string;
      line: THREE.Line;
      lineMat: THREE.LineBasicMaterial;
      node: THREE.Mesh;
      nodeMat: THREE.MeshBasicMaterial;
      pulse: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
    }> = [];

    const destVec = new THREE.Vector3();
    const midVec = new THREE.Vector3();

    for (const dest of MARKET_DESTINATIONS) {
      latLonToVector3(dest.lat, dest.lon, R * 1.01, destVec);
      const dist = colomboPos.distanceTo(destVec);
      midVec.copy(colomboPos).add(destVec).multiplyScalar(0.5).normalize().multiplyScalar(R + dist * 0.42);

      const curve = new THREE.QuadraticBezierCurve3(colomboPos.clone(), midVec.clone(), destVec.clone());
      const pts = curve.getPoints(36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: '#C9D1DC',
        transparent: true,
        opacity: 0.48,
      });
      const line = new THREE.Line(arcGeo, lineMat);
      globeGroup.add(line);

      const nodeMat = new THREE.MeshBasicMaterial({ color: '#3D7BFF' });
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), nodeMat);
      node.position.copy(destVec);
      globeGroup.add(node);

      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 10, 10),
        new THREE.MeshBasicMaterial({ color: '#FFFFFF' }),
      );
      globeGroup.add(pulse);

      arcEntries.push({
        region: dest.region,
        line,
        lineMat,
        node,
        nodeMat,
        pulse,
        curve,
      });
    }

    // Orient globe initially so Sri Lanka / Indian Ocean / Europe / Asia face viewer
    globeGroup.rotation.y = -2.45;
    globeGroup.rotation.x = 0.25;

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 },
    );
    io.observe(container);

    const onResize = () => {
      const w = mount.clientWidth || 480;
      const h = mount.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const regionTargetLon: Record<string, number> = {
      All: -2.55,
      Europe: -1.65,
      Americas: -0.25,
      'Middle East': -2.15,
      Asia: -3.05,
    };

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsed = 0;
    const _pulsePos = new THREE.Vector3();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isVisible) {
        elapsed += dt;
        const activeReg = regionRef.current;

        if (activeReg === 'All') {
          globeGroup.rotation.y += dt * 0.14;
        } else {
          const targetY = regionTargetLon[activeReg] ?? -2.55;
          globeGroup.rotation.y += (targetY - globeGroup.rotation.y) * 0.05;
        }

        arcEntries.forEach((entry, idx) => {
          const highlighted = activeReg === 'All' || entry.region === activeReg;
          entry.lineMat.opacity = highlighted ? 0.72 : 0.12;
          entry.lineMat.color.set(highlighted ? '#E6EAF0' : '#1B3FD9');
          entry.nodeMat.color.set(highlighted ? '#3D7BFF' : '#1B3FD9');
          entry.node.scale.setScalar(highlighted ? 1.15 : 0.7);
          entry.pulse.visible = highlighted;

          if (highlighted) {
            const t = (elapsed * 0.35 + idx * 0.13) % 1;
            entry.curve.getPoint(t, _pulsePos);
            entry.pulse.position.copy(_pulsePos);
          }
        });

        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(renderer, tick, (id) => {
          frameId = id;
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(renderer, tick, (id) => {
        frameId = id;
      });
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      io.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      landGeo.dispose();
      oceanGeo.dispose();
      arcEntries.forEach((e) => {
        e.line.geometry.dispose();
        e.lineMat.dispose();
        e.node.geometry.dispose();
        e.nodeMat.dispose();
        e.pulse.geometry.dispose();
      });
      renderer.dispose();
    };
  }, [fallback]);

  if (fallback) {
    return (
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center rounded-full border border-[#C9D1DC]/20 bg-[#0A1226]/70 p-8 ${className}`}
        aria-label="Global gemstone export routes from Colombo"
      >
        <svg viewBox="0 0 240 240" className="h-64 w-64">
          <circle cx="120" cy="120" r="96" fill="#070E22" stroke="#3D7BFF" strokeOpacity="0.4" />
          <ellipse cx="120" cy="120" rx="96" ry="34" fill="none" stroke="#C9D1DC" strokeOpacity="0.2" />
          <ellipse cx="120" cy="120" rx="44" ry="96" fill="none" stroke="#C9D1DC" strokeOpacity="0.2" />
          <path d="M135 128 Q90 60 65 75" fill="none" stroke="#E6EAF0" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M135 128 Q160 80 185 95" fill="none" stroke="#E6EAF0" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M135 128 Q115 95 105 90" fill="none" stroke="#3D7BFF" strokeWidth="1.2" />
          <circle cx="135" cy="128" r="5" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid="global-reach-globe"
      className={`relative flex items-center justify-center ${className}`}
      style={{ touchAction: 'pan-y' }}
      aria-label="Interactive rotating 3D globe showing gem trade routes from Colombo"
      role="img"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(61,123,255,0.38) 0%, rgba(11,31,107,0.18) 55%, transparent 75%)' }}
      />
      <div ref={mountRef} className="relative z-10 h-full w-full" />
    </div>
  );
};
