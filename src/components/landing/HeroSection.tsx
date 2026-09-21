import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '../ThreeControls';
import * as THREE from 'three';
import { ArrowRight, ChevronDown, Mountain, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

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
  const sectionRef = useScrollReveal<HTMLElement>();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative pt-44 pb-28 lg:pt-56 lg:pb-40 overflow-hidden bg-geo-pattern"
    >
      {/* Floating Particles */}
      <div className="floating-dot" style={{ top: '15%', left: '10%' }} />
      <div className="floating-dot" style={{ top: '25%', right: '15%' }} />
      <div className="floating-dot" style={{ top: '60%', left: '20%' }} />
      <div className="floating-dot" style={{ top: '45%', right: '8%' }} />
      <div className="floating-dot" style={{ top: '75%', left: '40%' }} />

      {/* Atmospheric Glow Pools */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-geo-cyan/8 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[600px] h-[500px] bg-blue-600/4 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-violet-600/4 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Editorial Narrative */}
        <div className="text-center max-w-4xl mx-auto space-y-10">
          {/* Pill Badge */}
          <div className="reveal reveal-delay-1">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-geo-surface/70 border border-geo-border/80 text-xs font-mono text-geo-cyan shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-geo-cyan animate-subtle-pulse" />
              <span>SIH 2026 • Problem Statement 26175</span>
            </div>
          </div>

          {/* Large Hero Heading */}
          <div className="reveal reveal-delay-2">
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.08]">
              From a Single Image <br className="hidden sm:inline" />
              <span className="text-shimmer">
                to a 3D World.
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="reveal reveal-delay-3">
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-300/90 max-w-2xl mx-auto font-normal leading-relaxed">
              DepthWizard transforms a single optical satellite or aerial image into depth,
              calibrated elevation, and an interactive 3D terrain experience.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="reveal reveal-delay-4 flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
            <button
              onClick={() => scrollTo('demo-workspace')}
              className="btn-shimmer w-full sm:w-auto px-10 py-5 rounded-2xl bg-geo-cyan text-geo-bg hover:bg-cyan-400 font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-geo-glow hover:shadow-geo-glow-lg hover:-translate-y-1 duration-300"
            >
              <span>Explore 3D Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('how-it-works')}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-geo-surface/70 hover:bg-geo-elevated text-slate-200 border border-geo-border text-sm font-medium flex items-center justify-center gap-3 transition-all hover:-translate-y-1 duration-300 backdrop-blur-md"
            >
              <span>See How It Works</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Pipeline Steps Capsules */}
          <div className="reveal reveal-delay-5 pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
            {[
              '01 • Single Optical RGB',
              '02 • Monocular Depth',
              '03 • Calibrated DSM',
              '04 • Watertight 3D GLB',
            ].map((text, i) => (
              <span
                key={text}
                className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:border-geo-cyan/40 hover:text-geo-cyan ${
                  i === 3
                    ? 'bg-geo-cyan/10 border-geo-cyan/30 text-geo-cyan'
                    : 'bg-geo-surface/50 border-geo-border/60'
                }`}
              >
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Expansive 3D Showcase Stage */}
        <div className="reveal-scale reveal-delay-6 mt-20 lg:mt-28 max-w-5xl mx-auto">
          <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden border border-geo-border/60 bg-geo-surface/40 shadow-geo-elevated backdrop-blur-md gradient-border animate-pulse-glow">
            {/* Top Showcase HUD */}
            <div className="absolute top-5 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-geo-bg/80 border border-geo-border/60 text-xs font-mono text-slate-200 backdrop-blur-md">
                <Mountain className="w-4 h-4 text-geo-cyan" />
                <span>Single-View Reconstructed Heightfield</span>
              </div>
              <div className="hidden sm:block px-3.5 py-1.5 rounded-full bg-geo-surface/80 border border-geo-border/60 text-[11px] font-mono text-slate-400 backdrop-blur-md">
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
            <div className="absolute bottom-5 left-6 right-6 z-20 flex items-center justify-between text-xs font-mono text-slate-400/80 pointer-events-none">
              <span>Dynamic Topographic Contouring</span>
              <span className="text-geo-cyan font-semibold">Continuous 3D Surface →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
