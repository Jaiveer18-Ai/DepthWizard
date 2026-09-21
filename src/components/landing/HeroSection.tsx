import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '../ThreeControls';
import * as THREE from 'three';
import { ArrowRight, ChevronDown, Mountain, Compass, Sparkles, Layers, Box } from 'lucide-react';

function HeroTerrainMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry } = useMemo(() => {
    const size = 32;
    const segments = 110;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const vertexColors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const dist = Math.sqrt(x * x + z * z);
      const h1 = Math.sin(x * 0.22) * Math.cos(z * 0.22) * 3.6;
      const h2 = Math.sin(x * 0.5 + z * 0.4) * 1.5;
      const h3 = Math.cos(x * 1.0 - z * 0.8) * 0.7;
      const falloff = Math.max(0, 1 - Math.pow(dist / 17, 2));

      const y = (h1 + h2 + h3 + 2.8) * falloff;
      pos.setY(i, y);

      const normY = Math.max(0, Math.min(1, y / 6.5));
      const cIndex = i * 3;

      if (normY < 0.28) {
        vertexColors[cIndex] = 0.08;
        vertexColors[cIndex + 1] = 0.16;
        vertexColors[cIndex + 2] = 0.28;
      } else if (normY < 0.65) {
        vertexColors[cIndex] = 0.06;
        vertexColors[cIndex + 1] = 0.48;
        vertexColors[cIndex + 2] = 0.55;
      } else if (normY < 0.85) {
        vertexColors[cIndex] = 0.18;
        vertexColors[cIndex + 1] = 0.68;
        vertexColors[cIndex + 2] = 0.78;
      } else {
        vertexColors[cIndex] = 0.88;
        vertexColors[cIndex + 1] = 0.94;
        vertexColors[cIndex + 2] = 0.98;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
    geo.computeVertexNormals();
    return { geometry: geo };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.07;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.7}
        metalness={0.15}
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
      className="relative pt-36 pb-24 lg:pt-44 lg:pb-36 overflow-hidden bg-geo-pattern"
    >
      {/* Subtle Atmospheric Light Pools */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-geo-cyan/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[400px] bg-blue-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Editorial Narrative */}
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-geo-surface/80 border border-geo-border text-xs font-mono text-geo-cyan shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-geo-cyan" />
            <span>SIH 2026 • Problem Statement 26175</span>
          </div>

          {/* Large Hero Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
            From a Single Image <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-geo-cyan via-teal-300 to-blue-400 bg-clip-text text-transparent">
              to a 3D World.
            </span>
          </h1>

          {/* Subtitle with Generous Line Height */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            DepthWizard transforms a single optical satellite or aerial image into depth,
            calibrated elevation, and an interactive 3D terrain experience.
          </p>

          {/* Action CTAs with generous touch targets */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => scrollTo('demo-workspace')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-geo-cyan text-geo-bg hover:bg-cyan-400 font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-geo-glow hover:shadow-[0_0_35px_rgba(6,182,212,0.45)] hover:-translate-y-0.5"
            >
              <span>Explore 3D Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('how-it-works')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-geo-surface/80 hover:bg-geo-elevated text-slate-200 border border-geo-border text-sm font-medium flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5"
            >
              <span>See How It Works</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Spacious Horizontal Capability Tags */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-3.5 py-1.5 rounded-full bg-geo-surface/60 border border-geo-border/80">
              01 • Single Optical RGB
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-geo-surface/60 border border-geo-border/80">
              02 • Monocular Depth
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-geo-surface/60 border border-geo-border/80">
              03 • Calibrated DSM
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-geo-surface/60 border border-geo-border/80 text-geo-cyan">
              04 • Watertight 3D GLB
            </span>
          </div>
        </div>

        {/* Expansive Full-Width 3D Showcase Stage */}
        <div className="mt-16 lg:mt-24 max-w-5xl mx-auto">
          <div className="relative w-full h-[450px] sm:h-[540px] lg:h-[600px] rounded-3xl overflow-hidden border border-geo-border bg-geo-surface/50 shadow-geo-elevated backdrop-blur-md">
            {/* Top Showcase HUD */}
            <div className="absolute top-5 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-geo-bg/90 border border-geo-border text-xs font-mono text-slate-200 backdrop-blur-md">
                <Mountain className="w-4 h-4 text-geo-cyan" />
                <span>Single-View Reconstructed Heightfield</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-geo-surface/90 border border-geo-border text-[11px] font-mono text-slate-400 backdrop-blur-md">
                Interactive WebGL • Drag to Orbit
              </div>
            </div>

            {/* Three.js Canvas */}
            <Canvas
              shadows
              camera={{ position: [18, 15, 22], fov: 42 }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[25, 30, 20]} intensity={1.5} castShadow />
              <directionalLight position={[-18, 12, -14]} intensity={0.35} color="#60a5fa" />
              <gridHelper args={[34, 34, '#06b6d4', '#1e314b']} position={[0, -0.05, 0]} />
              <HeroTerrainMesh />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.8}
                maxPolarAngle={Math.PI / 2 - 0.05}
              />
            </Canvas>

            {/* Bottom HUD */}
            <div className="absolute bottom-5 left-6 right-6 z-20 flex items-center justify-between text-xs font-mono text-slate-400 pointer-events-none">
              <span>Dynamic Topographic Contouring</span>
              <span className="text-geo-cyan font-semibold">Continuous 3D Surface →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
