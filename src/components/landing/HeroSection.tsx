import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowRight, ChevronDown, Layers, Mountain, Compass, Sparkles } from 'lucide-react';

/**
 * Animated 3D Hero Terrain Mesh
 * Seamlessly demonstrates the 2D -> Depth -> DSM -> 3D Terrain concept
 */
function HeroTerrainAnimation() {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, colors } = useMemo(() => {
    const size = 26;
    const segments = 90;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const vertexColors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Natural terrain height with radial falloff
      const dist = Math.sqrt(x * x + z * z);
      const h1 = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2.8;
      const h2 = Math.sin(x * 0.7 + z * 0.5) * 1.2;
      const h3 = Math.cos(x * 1.4 - z * 1.1) * 0.6;
      const falloff = Math.max(0, 1 - Math.pow(dist / 14, 2));

      const y = (h1 + h2 + h3 + 2.4) * falloff;
      pos.setY(i, y);

      // Elegant palette: Deep Blue-Gray -> Cyan/Teal -> Subtle White Peak
      const normY = Math.max(0, Math.min(1, y / 5.5));
      const cIndex = i * 3;

      if (normY < 0.3) {
        vertexColors[cIndex] = 0.08;
        vertexColors[cIndex + 1] = 0.16;
        vertexColors[cIndex + 2] = 0.28;
      } else if (normY < 0.65) {
        vertexColors[cIndex] = 0.06;
        vertexColors[cIndex + 1] = 0.45;
        vertexColors[cIndex + 2] = 0.55;
      } else if (normY < 0.85) {
        vertexColors[cIndex] = 0.15;
        vertexColors[cIndex + 1] = 0.65;
        vertexColors[cIndex + 2] = 0.75;
      } else {
        vertexColors[cIndex] = 0.85;
        vertexColors[cIndex + 1] = 0.92;
        vertexColors[cIndex + 2] = 0.98;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
    geo.computeVertexNormals();
    return { geometry: geo, colors: vertexColors };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating rotation
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.7}
        metalness={0.2}
        wireframe={false}
      />
    </mesh>
  );
}

export const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] pt-28 pb-16 lg:pt-36 lg:pb-24 flex items-center justify-center overflow-hidden bg-geo-pattern"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-geo-cyan/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-geo-blue/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Product Narrative & CTAs */}
          <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-geo-surface/90 border border-geo-border text-xs font-mono text-geo-cyan shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-geo-cyan" />
              <span>SIH 2026 • Problem Statement 26175</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-geo-text leading-[1.12]">
              From a Single Image <br />
              <span className="bg-gradient-to-r from-geo-cyan via-teal-300 to-blue-400 bg-clip-text text-transparent">
                to a 3D World.
              </span>
            </h1>

            {/* Subtitle description */}
            <p className="text-base sm:text-lg text-geo-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              DepthWizard transforms a single optical satellite or aerial image into depth,
              calibrated elevation, and an interactive 3D terrain experience.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => scrollTo('demo-workspace')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-geo-cyan text-geo-bg hover:bg-cyan-400 font-mono text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-geo-glow hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
              >
                <span>Explore 3D Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollTo('how-it-works')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-geo-surface hover:bg-geo-elevated text-geo-text border border-geo-border text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <span>See How It Works</span>
                <ChevronDown className="w-4 h-4 text-geo-muted" />
              </button>
            </div>

            {/* Pipeline Stage Badges */}
            <div className="pt-6 border-t border-geo-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-lg bg-geo-surface/40 border border-geo-border/60">
                <p className="text-[11px] font-mono text-geo-subtle">Step 01</p>
                <p className="text-xs font-semibold text-geo-text mt-0.5">Optical RGB</p>
              </div>
              <div className="p-3 rounded-lg bg-geo-surface/40 border border-geo-border/60">
                <p className="text-[11px] font-mono text-geo-subtle">Step 02</p>
                <p className="text-xs font-semibold text-geo-text mt-0.5">Relative Depth</p>
              </div>
              <div className="p-3 rounded-lg bg-geo-surface/40 border border-geo-border/60">
                <p className="text-[11px] font-mono text-geo-subtle">Step 03</p>
                <p className="text-xs font-semibold text-geo-text mt-0.5">Metric DSM</p>
              </div>
              <div className="p-3 rounded-lg bg-geo-surface/40 border border-geo-border/60">
                <p className="text-[11px] font-mono text-geo-subtle">Step 04</p>
                <p className="text-xs font-semibold text-geo-cyan mt-0.5">3D Terrain GLB</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero 3D Visualization */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-square max-w-[500px] mx-auto rounded-2xl overflow-hidden border border-geo-border/80 bg-geo-surface/60 shadow-geo-elevated backdrop-blur-md">
              {/* Canvas Overlay Header */}
              <div className="absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-geo-bg/85 border border-geo-border/80 text-[11px] font-mono text-geo-text">
                  <Mountain className="w-3.5 h-3.5 text-geo-cyan" />
                  <span>3D Heightfield Preview</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-geo-surface/85 border border-geo-border/80 text-[10px] font-mono text-geo-muted">
                  Interactive WebGL
                </div>
              </div>

              {/* Three.js Hero Canvas */}
              <Canvas
                shadows
                camera={{ position: [16, 14, 18], fov: 45 }}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              >
                <ambientLight intensity={0.5} />
                <directionalLight position={[20, 25, 15]} intensity={1.5} castShadow />
                <directionalLight position={[-15, 10, -10]} intensity={0.4} color="#60a5fa" />
                <gridHelper args={[28, 28, '#06b6d4', '#1e314b']} position={[0, -0.05, 0]} />
                <HeroTerrainAnimation />
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  autoRotate
                  autoRotateSpeed={0.8}
                  maxPolarAngle={Math.PI / 2 - 0.05}
                />
              </Canvas>

              {/* Canvas Bottom Legend */}
              <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] font-mono text-geo-muted pointer-events-none">
                <span>Single-View Reconstructed Mesh</span>
                <span className="text-geo-cyan">Rotate to inspect →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
