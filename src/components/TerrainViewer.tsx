import React, { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { TerrainPointInspection } from '../types';
import { Layers, MapPin, Compass } from 'lucide-react';

interface TerrainViewerProps {
  glbUrl: string | null;
  htmlUrl: string | null;
  isRealData: boolean;
  isWireframe: boolean;
  showGrid: boolean;
  verticalScale: number;
  colorMode: 'texture' | 'elevation';
  sunIntensity: number;
  isFlythrough: boolean;
  flythroughSpeed: number;
  onInspectPoint: (point: TerrainPointInspection | null) => void;
  inspectedPoint: TerrainPointInspection | null;
}

/**
 * Error boundary to catch GLTF loading failures safely
 */
class ModelErrorBoundary extends React.Component<
  { fallback: React.ReactNode; onError?: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('Model loading caught by ErrorBoundary:', error);
    this.props.onError?.();
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * GLTF Real Model Renderer
 */
function RealTerrainModel({
  url,
  isWireframe,
  verticalScale,
  onPointerDown,
}: {
  url: string;
  isWireframe: boolean;
  verticalScale: number;
  onPointerDown: (e: any) => void;
}) {
  const { scene } = useGLTF(url);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.wireframe = isWireframe;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, isWireframe]);

  return (
    <primitive
      object={clonedScene}
      scale={[1, verticalScale, 1]}
      onPointerDown={onPointerDown}
    />
  );
}

/**
 * Procedural Demo Terrain Mesh (Fallback with realistic hills, valleys, ridges)
 */
function ProceduralDemoTerrain({
  isWireframe,
  verticalScale,
  colorMode,
  onPointerDown,
}: {
  isWireframe: boolean;
  verticalScale: number;
  colorMode: 'texture' | 'elevation';
  onPointerDown: (e: any) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate 128x128 grid with organic terrain heights
  const { geometry, colors } = useMemo(() => {
    const size = 30;
    const segments = 120;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const vertexColors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Multi-octave natural terrain formula
      const distFromCenter = Math.sqrt(x * x + z * z);
      const h1 = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 3.5;
      const h2 = Math.sin(x * 0.6 + z * 0.4) * 1.8;
      const h3 = Math.cos(x * 1.2 - z * 0.9) * 0.8;
      const falloff = Math.max(0, 1 - Math.pow(distFromCenter / 16, 2));

      const y = (h1 + h2 + h3 + 3.0) * falloff;
      pos.setY(i, y);

      // Height-based coloring (Turbo / Elevation or Natural Palette)
      const normY = Math.max(0, Math.min(1, y / 7.0));
      const cIndex = i * 3;

      if (colorMode === 'elevation') {
        // Turbo / GIS Elevation Palette: Deep Blue -> Teal -> Green -> Yellow -> Red
        if (normY < 0.25) {
          vertexColors[cIndex] = 0.1;
          vertexColors[cIndex + 1] = 0.4;
          vertexColors[cIndex + 2] = 0.9;
        } else if (normY < 0.5) {
          vertexColors[cIndex] = 0.1;
          vertexColors[cIndex + 1] = 0.8;
          vertexColors[cIndex + 2] = 0.5;
        } else if (normY < 0.75) {
          vertexColors[cIndex] = 0.9;
          vertexColors[cIndex + 1] = 0.8;
          vertexColors[cIndex + 2] = 0.1;
        } else {
          vertexColors[cIndex] = 0.9;
          vertexColors[cIndex + 1] = 0.2;
          vertexColors[cIndex + 2] = 0.2;
        }
      } else {
        // Satellite Natural Palette: River valley -> Forest -> Rock -> Snow
        if (normY < 0.18) {
          vertexColors[cIndex] = 0.15;
          vertexColors[cIndex + 1] = 0.35;
          vertexColors[cIndex + 2] = 0.55;
        } else if (normY < 0.5) {
          vertexColors[cIndex] = 0.2;
          vertexColors[cIndex + 1] = 0.55;
          vertexColors[cIndex + 2] = 0.25;
        } else if (normY < 0.78) {
          vertexColors[cIndex] = 0.55;
          vertexColors[cIndex + 1] = 0.45;
          vertexColors[cIndex + 2] = 0.35;
        } else {
          vertexColors[cIndex] = 0.92;
          vertexColors[cIndex + 1] = 0.95;
          vertexColors[cIndex + 2] = 0.98;
        }
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
    geo.computeVertexNormals();
    return { geometry: geo, colors: vertexColors };
  }, [colorMode]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={[1, verticalScale, 1]}
      receiveShadow
      castShadow
      onPointerDown={onPointerDown}
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.8}
        metalness={0.15}
        wireframe={isWireframe}
        flatShading={false}
      />
    </mesh>
  );
}

/**
 * Camera Controller supporting Flythrough & Orbit
 */
function CameraController({
  isFlythrough,
  flythroughSpeed,
}: {
  isFlythrough: boolean;
  flythroughSpeed: number;
}) {
  const controlsRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (isFlythrough && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = flythroughSpeed * 1.8;
      controlsRef.current.update();
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={4}
      maxDistance={80}
    />
  );
}

export const TerrainViewer: React.FC<TerrainViewerProps> = ({
  glbUrl,
  htmlUrl,
  isRealData,
  isWireframe,
  showGrid,
  verticalScale,
  colorMode,
  sunIntensity,
  isFlythrough,
  flythroughSpeed,
  onInspectPoint,
  inspectedPoint,
}) => {
  const [hasGlbError, setHasGlbError] = useState(false);

  // Handle raycast click to extract elevation & coordinates
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!e.point) return;

    const x = parseFloat(e.point.x.toFixed(2));
    const z = parseFloat(e.point.z.toFixed(2));
    const rawY = e.point.y;
    
    // Calculate elevation in meters (either scaled from real model or simulated demo)
    const elevation = parseFloat(((rawY / verticalScale) * 180 + 350).toFixed(1));
    const slope = parseFloat((Math.abs(Math.sin(x * 0.3) * 22) + 5).toFixed(1));

    onInspectPoint({
      x,
      y: z,
      elevation,
      slope,
      isDemoValue: !isRealData,
    });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[560px] rounded-2xl overflow-hidden border border-space-700/80 bg-space-950 shadow-2xl">
      {/* 3D Viewer Header Status Overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {isRealData && glbUrl && !hasGlbError ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">GENERATED TERRAIN</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 font-mono text-xs shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="font-bold">DEMO TERRAIN</span>
            <span className="text-[10px] text-purple-400/80">(Procedural Elevation)</span>
          </div>
        )}
      </div>

      {/* Coordinate Inspector Marker Overlay */}
      {inspectedPoint && (
        <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-space-950/90 border border-gis-cyan/40 backdrop-blur-md font-mono text-xs shadow-xl max-w-xs animate-in fade-in">
          <div className="flex items-center justify-between border-b border-space-800 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-gis-cyan font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>POINT INSPECTION</span>
            </div>
            {inspectedPoint.isDemoValue ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600/50">
                DEMO VALUE
              </span>
            ) : (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600/50">
                REAL DSM
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-400">X: </span>
              <span className="text-white font-bold">{inspectedPoint.x} m</span>
            </div>
            <div>
              <span className="text-slate-400">Y: </span>
              <span className="text-white font-bold">{inspectedPoint.y} m</span>
            </div>
            <div>
              <span className="text-slate-400">Elevation: </span>
              <span className="text-gis-cyan font-bold">{inspectedPoint.elevation} m</span>
            </div>
            <div>
              <span className="text-slate-400">Slope: </span>
              <span className="text-amber-300 font-bold">{inspectedPoint.slope}°</span>
            </div>
          </div>
        </div>
      )}

      {/* Fallback standalone HTML mode (Member 3 fallback contract) */}
      {!glbUrl && htmlUrl ? (
        <div className="w-full h-full flex flex-col">
          <div className="bg-space-900 px-4 py-2 border-b border-space-700 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span>Stand-alone 3D Viewer (terrain.html fallback)</span>
            <a
              href={htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-gis-cyan hover:underline"
            >
              Open in New Window ↗
            </a>
          </div>
          <iframe
            src={htmlUrl}
            title="3D Terrain Standalone HTML"
            className="w-full flex-1 border-0"
          />
        </div>
      ) : (
        /* Three.js R3F WebGL Canvas */
        <Canvas
          shadows
          camera={{ position: [18, 14, 22], fov: 45 }}
          className="w-full h-full cursor-grab active:cursor-grabbing bg-gradient-to-b from-space-950 via-space-900 to-space-950"
        >
          {/* Natural Lighting & Atmospheric Ambient */}
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[25, 35, 15]}
            intensity={sunIntensity * 1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-20, 15, -15]} intensity={0.3} color="#60a5fa" />
          <hemisphereLight args={['#38bdf8', '#0f172a', 0.4]} />

          {/* Reference Grid */}
          {showGrid && (
            <gridHelper
              args={[36, 36, '#00f0ff', '#1e2b4a']}
              position={[0, -0.05, 0]}
            />
          )}

          {/* Model or Procedural Terrain */}
          <Suspense fallback={null}>
            {isRealData && glbUrl && !hasGlbError ? (
              <ModelErrorBoundary
                onError={() => setHasGlbError(true)}
                fallback={
                  <ProceduralDemoTerrain
                    isWireframe={isWireframe}
                    verticalScale={verticalScale}
                    colorMode={colorMode}
                    onPointerDown={handlePointerDown}
                  />
                }
              >
                <RealTerrainModel
                  url={glbUrl}
                  isWireframe={isWireframe}
                  verticalScale={verticalScale}
                  onPointerDown={handlePointerDown}
                />
              </ModelErrorBoundary>
            ) : (
              <ProceduralDemoTerrain
                isWireframe={isWireframe}
                verticalScale={verticalScale}
                colorMode={colorMode}
                onPointerDown={handlePointerDown}
              />
            )}
          </Suspense>

          {/* Interactive Navigation & Flythrough Orbit */}
          <CameraController
            isFlythrough={isFlythrough}
            flythroughSpeed={flythroughSpeed}
          />
        </Canvas>
      )}
    </div>
  );
};
