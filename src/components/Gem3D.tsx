import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GemCut, GemEffect } from '../content/gems';
import { createGemGeometry } from '../utils/gemGeometryFactory';
import { afterDraw, detectSoftwareWebGL, prefersReducedMotion } from '../utils/webglHelpers';
import { GemSVG } from './GemSVG';

export interface Gem3DProps {
  cut?: GemCut;
  colour?: string;
  secondaryColour?: string;
  size?: number;
  rotationSpeed?: number;
  floatAmplitude?: number;
  glow?: boolean;
  interactive?: boolean;
  effect?: GemEffect;
  alexandriteMode?: 'auto' | 'daylight' | 'candlelight';
  ior?: number;
  showCausticPlane?: boolean;
  externalScale?: number;
  className?: string;
  ariaLabel?: string;
}

function createCausticTexture(hexColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 6, 128, 128, 124);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.22, hexColor);
  grad.addColorStop(0.65, `${hexColor}33`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const Gem3D: React.FC<Gem3DProps> = ({
  cut = 'cushion',
  colour = '#1B3FD9',
  secondaryColour = '#3D7BFF',
  size = 1.4,
  rotationSpeed = 0.35,
  floatAmplitude = 0.08,
  glow = true,
  interactive = false,
  effect = 'standard',
  alexandriteMode = 'auto',
  ior = 1.76,
  showCausticPlane = false,
  externalScale = 1,
  className = '',
  ariaLabel = 'Interactive 3D Ceylon gemstone',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const immediateRenderRef = useRef<(() => void) | null>(null);
  const [fallbackActive, setFallbackActive] = useState(() => prefersReducedMotion());

  // Mutable ref props so scene never tears down on prop updates
  const propsRef = useRef({
    cut,
    colour,
    secondaryColour,
    size,
    rotationSpeed,
    floatAmplitude,
    glow,
    interactive,
    effect,
    alexandriteMode,
    ior,
    showCausticPlane,
    externalScale,
  });
  propsRef.current = {
    cut,
    colour,
    secondaryColour,
    size,
    rotationSpeed,
    floatAmplitude,
    glow,
    interactive,
    effect,
    alexandriteMode,
    ior,
    showCausticPlane,
    externalScale,
  };

  useEffect(() => {
    if (fallbackActive) return;
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
      setFallbackActive(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth || 320, mount.clientHeight || 320);
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      34,
      (mount.clientWidth || 320) / (mount.clientHeight || 320),
      0.1,
      50,
    );
    camera.position.set(0, 1.02, 4.95);
    camera.lookAt(0, -0.05, 0);

    // Three-point studio rig calibrated for deep jewel saturation + crisp specular facets
    const hemi = new THREE.HemisphereLight('#7CA4FF', '#02040D', 0.24);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#FFFFFF', 3.4);
    keyLight.position.set(3.4, 4.8, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(secondaryColour, 2.8);
    rimLight.position.set(-4.2, 2.2, -3.2);
    scene.add(rimLight);

    const fillPoint = new THREE.PointLight(colour, 2.2, 10);
    fillPoint.position.set(0, -1.8, 2.6);
    scene.add(fillPoint);

    const hoverPulseLight = new THREE.PointLight(secondaryColour, 0, 8);
    hoverPulseLight.position.set(0, 1.2, 2.2);
    scene.add(hoverPulseLight);

    const gemGroup = new THREE.Group();
    scene.add(gemGroup);

    // Outer & Inner Gem Meshes
    let currentCut = propsRef.current.cut;
    let baseGeometry = createGemGeometry(currentCut);

    const outerMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(propsRef.current.colour),
      metalness: 0.14,
      roughness: currentCut === 'rough' ? 0.22 : 0.03,
      ior: propsRef.current.ior,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.15,
      flatShading: currentCut !== 'cabochon',
      transmission: isSoftwareGl ? 0 : 0.78,
      thickness: 1.8,
      attenuationDistance: 0.9,
      attenuationColor: new THREE.Color(propsRef.current.colour),
      transparent: true,
      opacity: isSoftwareGl ? 0.78 : 1.0,
      side: THREE.DoubleSide,
    });

    const innerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(propsRef.current.colour).multiplyScalar(0.55),
      emissive: new THREE.Color(propsRef.current.colour),
      emissiveIntensity: 0.26,
      metalness: 0.55,
      roughness: 0.08,
      flatShading: currentCut !== 'cabochon',
    });

    const outerMesh = new THREE.Mesh(baseGeometry, outerMat);
    const innerMesh = new THREE.Mesh(baseGeometry, innerMat);
    innerMesh.scale.setScalar(0.76);
    gemGroup.add(innerMesh);
    gemGroup.add(outerMesh);

    // Subtle silver wireframe facet accent for futuristic luxury depth
    const edgesMat = new THREE.LineBasicMaterial({
      color: '#E6EAF0',
      transparent: true,
      opacity: currentCut === 'cabochon' ? 0 : 0.16,
    });
    let edgesGeo = new THREE.EdgesGeometry(baseGeometry, 18);
    const edgesLines = new THREE.LineSegments(edgesGeo, edgesMat);
    edgesLines.scale.setScalar(1.003);
    gemGroup.add(edgesLines);

    // Phenomenon shader overlay (Star 6-ray asterism / Cat's Eye chatoyancy / Moonstone adularescence)
    const phenomMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMode: { value: 0 }, // 1=star, 2=cats-eye, 3=moonstone
        uGlowColor: { value: new THREE.Color(secondaryColour) },
        uTilt: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uMode;
        uniform vec3 uGlowColor;
        uniform vec2 uTilt;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPos;

        void main() {
          if (uMode < 0.5) discard;
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPos);
          float facing = max(0.0, dot(N, V));
          vec2 p = (vUv - 0.5) * 2.0 - uTilt * 0.28;

          if (uMode < 1.5) {
            // 6-ray Star Sapphire asterism
            float r = length(p);
            float a = atan(p.y, p.x);
            float rays = pow(abs(cos(a * 3.0)), 22.0);
            float core = exp(-r * 3.4);
            float intensity = (rays * 0.85 + core * 0.55) * smoothstep(1.05, 0.2, r) * facing;
            gl_FragColor = vec4(vec3(0.92, 0.96, 1.0) * intensity, intensity);
          } else if (uMode < 2.5) {
            // Cat's Eye chatoyant band
            float band = exp(-abs(p.x) * 9.5) * smoothstep(1.1, 0.1, abs(p.y));
            float intensity = band * facing * 1.15;
            gl_FragColor = vec4(mix(uGlowColor, vec3(1.0, 0.98, 0.88), 0.7) * intensity, intensity);
          } else {
            // Moonstone blue adularescence
            float fresnel = pow(1.0 - facing, 2.2);
            float billow = exp(-length(p - vec2(sin(uTime * 0.8) * 0.25, 0.1)) * 2.2);
            float intensity = (billow * 0.65 + fresnel * 0.45);
            gl_FragColor = vec4(vec3(0.58, 0.82, 1.0) * intensity, intensity * 0.85);
          }
        }
      `,
    });
    const phenomMesh = new THREE.Mesh(baseGeometry, phenomMat);
    phenomMesh.scale.setScalar(1.008);
    gemGroup.add(phenomMesh);

    // Caustic ground light plane
    let causticTex = createCausticTexture(propsRef.current.glow ? propsRef.current.secondaryColour : '#1B3FD9');
    const causticMat = new THREE.MeshBasicMaterial({
      map: causticTex,
      transparent: true,
      opacity: propsRef.current.showCausticPlane ? 0.48 : 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const causticPlane = new THREE.Mesh(new THREE.CircleGeometry(1.75, 32), causticMat);
    causticPlane.rotation.x = -Math.PI / 2;
    causticPlane.position.y = -1.28;
    scene.add(causticPlane);

    // Initial dramatic tilt so facets catch studio lights like reference sapphire
    gemGroup.rotation.set(0.32, 0.4, 0.14);

    // Pointer interaction state
    let pointerX = 0;
    let pointerY = 0;
    let isHovered = false;
    let isDragging = false;
    let lastDragX = 0;
    let lastDragY = 0;
    let dragRotX = 0;
    let dragRotY = 0;
    let pulseIntensity = 0;

    const onPointerEnter = () => {
      isHovered = true;
      pulseIntensity = 3.2;
    };
    const onPointerLeave = () => {
      isHovered = false;
      isDragging = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!propsRef.current.interactive) return;
      isDragging = true;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }
      if (isDragging && propsRef.current.interactive) {
        const dx = e.clientX - lastDragX;
        const dy = e.clientY - lastDragY;
        dragRotY += dx * 0.012;
        dragRotX += dy * 0.012;
        lastDragX = e.clientX;
        lastDragY = e.clientY;
      }
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerenter', onPointerEnter);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    // Resize handling
    const handleResize = () => {
      const w = mount.clientWidth || 320;
      const h = mount.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(mount);

    // Visibility observer to pause off-screen canvases
    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 },
    );
    io.observe(container);

    // WebGL context loss guard
    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      setFallbackActive(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const _cDay = new THREE.Color('#158467');
    const _cCandle = new THREE.Color('#9E226E');
    const _cBase = new THREE.Color();
    const _cSec = new THREE.Color();

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsed = 0;

    const syncAndRender = (dt: number) => {
      elapsed += dt;
      const p = propsRef.current;

      // Swap procedural cut geometry if props changed
      if (p.cut !== currentCut) {
        currentCut = p.cut;
        const nextGeo = createGemGeometry(currentCut);
        outerMesh.geometry = nextGeo;
        innerMesh.geometry = nextGeo;
        phenomMesh.geometry = nextGeo;
        baseGeometry.dispose();
        baseGeometry = nextGeo;

        edgesGeo.dispose();
        edgesGeo = new THREE.EdgesGeometry(baseGeometry, 18);
        edgesLines.geometry = edgesGeo;
        edgesMat.opacity = currentCut === 'cabochon' ? 0 : 0.16;

        outerMat.flatShading = currentCut !== 'cabochon';
        outerMat.roughness = currentCut === 'rough' ? 0.24 : 0.04;
        outerMat.needsUpdate = true;
        innerMat.flatShading = currentCut !== 'cabochon';
        innerMat.needsUpdate = true;
      }

      // Update colour / Alexandrite daylight-vs-candlelight shift
      if (p.effect === 'alexandrite') {
        const blend =
          p.alexandriteMode === 'daylight'
            ? 0
            : p.alexandriteMode === 'candlelight'
              ? 1
              : 0.5 + 0.5 * Math.sin(elapsed * 0.9);
        _cBase.copy(_cDay).lerp(_cCandle, blend);
        _cSec.copy(_cBase).offsetHSL(0.02, 0.1, 0.12);
      } else {
        _cBase.set(p.colour);
        _cSec.set(p.secondaryColour);
      }

      outerMat.color.copy(_cBase).multiplyScalar(0.82);
      outerMat.attenuationColor.copy(_cBase);
      outerMat.ior = p.ior;
      innerMat.color.copy(_cBase).multiplyScalar(0.55);
      innerMat.emissive.copy(_cBase);
      rimLight.color.copy(_cSec);
      fillPoint.color.copy(_cBase);
      causticMat.color.copy(_cBase);

      // Brighten on hover pulse
      const targetEmissive = isHovered ? 0.55 : 0.26;
      innerMat.emissiveIntensity += (targetEmissive - innerMat.emissiveIntensity) * 0.12;
      pulseIntensity *= 0.92;
      hoverPulseLight.color.copy(_cSec);
      hoverPulseLight.intensity = isHovered ? 1.8 + pulseIntensity : pulseIntensity;

      // Phenomenon shader uniforms
      phenomMat.uniforms.uTime.value = elapsed;
      phenomMat.uniforms.uGlowColor.value.copy(_cSec);
      phenomMat.uniforms.uTilt.value.set(pointerX, pointerY);
      phenomMat.uniforms.uMode.value =
        p.effect === 'star' ? 1 : p.effect === 'cats-eye' ? 2 : p.effect === 'moonstone' ? 3 : 0;

      causticMat.opacity = p.showCausticPlane ? (isHovered ? 0.65 : 0.45) : 0;

      // Smooth rotation, float, and mouse/touch parallax tilt
      const targetScale = p.size * p.externalScale;
      gemGroup.scale.setScalar(targetScale);
      gemGroup.position.y = Math.sin(elapsed * 1.4) * p.floatAmplitude;

      const baseRotY = elapsed * p.rotationSpeed + dragRotY + pointerX * 0.35;
      const baseRotX = 0.34 + Math.sin(elapsed * 0.65) * 0.08 + dragRotX + pointerY * 0.25;
      gemGroup.rotation.y += (baseRotY - gemGroup.rotation.y) * 0.12;
      gemGroup.rotation.x += (baseRotX - gemGroup.rotation.x) * 0.12;

      // Subtle moving light sweep across facets
      keyLight.position.x = 3.2 + Math.sin(elapsed * 0.7) * 1.1 + pointerX * 1.2;
      keyLight.position.y = 4.2 + pointerY * 0.9;

      renderer.render(scene, camera);
    };

    immediateRenderRef.current = () => {
      if (!disposed) syncAndRender(0);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isVisible) {
        syncAndRender(dt);
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
      // Draw first frame immediately, then pace with afterDraw
      syncAndRender(0);
      afterDraw(renderer, tick, (id) => {
        frameId = id;
      });
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      immediateRenderRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      io.disconnect();
      ro.disconnect();
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

      baseGeometry.dispose();
      edgesGeo.dispose();
      outerMat.dispose();
      innerMat.dispose();
      edgesMat.dispose();
      phenomMat.dispose();
      causticPlane.geometry.dispose();
      causticMat.dispose();
      causticTex.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [fallbackActive]);

  useEffect(() => {
    immediateRenderRef.current?.();
  }, [cut, colour, secondaryColour, alexandriteMode, effect, ior, showCausticPlane]);

  if (fallbackActive) {
    return (
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center ${className}`}
        aria-label={ariaLabel}
      >
        <GemSVG
          cut={cut}
          colorHex={colour}
          secondaryColorHex={secondaryColour}
          effect={effect}
          size={Math.round(140 * size)}
          label={ariaLabel}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid="gem-3d-canvas"
      className={`relative flex items-center justify-center ${interactive ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      style={{ touchAction: 'pan-y' }}
      aria-label={ariaLabel}
      role="img"
    >
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 rounded-full blur-3xl opacity-45 transition-colors duration-700"
          style={{
            background: `radial-gradient(circle, ${secondaryColour}55 0%, ${colour}25 45%, transparent 72%)`,
          }}
        />
      )}
      <div ref={mountRef} className="relative z-10 h-full w-full" />
    </div>
  );
};
