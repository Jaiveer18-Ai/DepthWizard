import React from 'react';
import { ArrowRight, Box, Compass } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '../ThreeControls';
import * as THREE from 'three';

function PreviewTerrainMesh() {
  const { geometry } = React.useMemo(() => {
    const size = 34;
    const segments = 110;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const vertexColors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const dist = Math.sqrt(x * x + z * z);
      const h1 = Math.sin(x * 0.22) * Math.cos(z * 0.22) * 3.8;
      const h2 = Math.sin(x * 0.5 + z * 0.4) * 1.5;
      const h3 = Math.cos(x * 1.0 - z * 0.8) * 0.7;
      const falloff = Math.max(0, 1 - Math.pow(dist / 17, 2));

      const y = (h1 + h2 + h3 + 3.0) * falloff;
      pos.setY(i, y);

      const normY = Math.max(0, Math.min(1, y / 7.0));
      const cIndex = i * 3;

      if (normY < 0.25) {
        vertexColors[cIndex] = 0.12;
        vertexColors[cIndex + 1] = 0.25;
        vertexColors[cIndex + 2] = 0.38;
      } else if (normY < 0.6) {
        vertexColors[cIndex] = 0.08;
        vertexColors[cIndex + 1] = 0.48;
        vertexColors[cIndex + 2] = 0.42;
      } else if (normY < 0.82) {
        vertexColors[cIndex] = 0.45;
        vertexColors[cIndex + 1] = 0.42;
        vertexColors[cIndex + 2] = 0.38;
      } else {
        vertexColors[cIndex] = 0.92;
        vertexColors[cIndex + 1] = 0.95;
        vertexColors[cIndex + 2] = 0.98;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
    geo.computeVertexNormals();
    return { geometry: geo };
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.75}
        metalness={0.15}
        wireframe={false}
      />
    </mesh>
  );
}

export const TerrainPreviewSection: React.FC = () => {
  const scrollToWorkspace = () => {
    const el = document.getElementById('demo-workspace');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-28 lg:py-36 bg-geo-bg-alt border-t border-geo-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="geo-panel rounded-3xl p-8 sm:p-14 border border-geo-border/80 bg-geo-surface/80 relative overflow-hidden shadow-geo-elevated space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4 border-b border-geo-border/60">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-geo-elevated text-geo-cyan border border-geo-border text-xs font-mono">
                <Box className="w-3.5 h-3.5" />
                <span>Interactive Terrain Preview</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Explore the Terrain
              </h2>
              <p className="text-base text-slate-300 leading-relaxed font-normal">
                Interact with this reconstructed 3D surface model directly in your browser. Rotate,
                pan, and inspect relief contours before launching the full processing workspace.
              </p>
            </div>

            <button
              onClick={scrollToWorkspace}
              className="px-8 py-4 rounded-2xl bg-geo-cyan text-geo-bg hover:bg-cyan-400 font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-geo-glow hover:shadow-[0_0_35px_rgba(6,182,212,0.45)] hover:-translate-y-0.5 shrink-0"
            >
              <span>Launch Full Demo Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Large 3D Canvas Box with ample height */}
          <div className="relative w-full h-[460px] sm:h-[580px] lg:h-[640px] rounded-2xl overflow-hidden border border-geo-border bg-geo-bg shadow-inner">
            <div className="absolute top-5 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-geo-surface/90 border border-geo-border text-xs font-mono text-slate-200 backdrop-blur-md pointer-events-none">
              <Compass className="w-4 h-4 text-geo-cyan" />
              <span>Left Click: Rotate • Right Click: Pan • Scroll: Zoom</span>
            </div>

            <Canvas
              shadows
              camera={{ position: [18, 14, 22], fov: 42 }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[25, 30, 20]} intensity={1.5} castShadow />
              <directionalLight position={[-20, 15, -15]} intensity={0.3} color="#60a5fa" />
              <gridHelper args={[36, 36, '#06b6d4', '#1e314b']} position={[0, -0.05, 0]} />
              <PreviewTerrainMesh />
              <OrbitControls
                enableDamping
                dampingFactor={0.06}
                maxPolarAngle={Math.PI / 2 - 0.05}
                minDistance={6}
                maxDistance={60}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  );
};
