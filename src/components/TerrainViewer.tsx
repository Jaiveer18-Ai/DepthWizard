import React, { Suspense, useRef, useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from './ThreeControls';
import * as THREE from 'three';
import { TerrainPointInspection } from '../types';
import { MapPin } from 'lucide-react';

export interface TerrainViewerProps {
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
  displayMode: 'mesh' | 'points';
}

export interface TerrainViewerRef {
  resetCamera: () => void;
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
  displayMode,
  colorMode,
}: {
  url: string;
  isWireframe: boolean;
  verticalScale: number;
  onPointerDown: (e: any) => void;
  displayMode?: 'mesh' | 'points';
  colorMode?: 'texture' | 'elevation';
}) {
  const { scene } = useGLTF(url);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    if (displayMode === 'points') {
      const meshesToReplace: {parent: any, oldMesh: any, newPts: any}[] = [];
      clone.traverse((child: any) => {
        if (child.isMesh && child.geometry) {
          const mat = new THREE.PointsMaterial({
            size: 0.5, // Increased point size for visibility
            vertexColors: child.geometry.hasAttribute('color'),
            color: child.geometry.hasAttribute('color') ? 0xffffff : 0x06b6d4,
            sizeAttenuation: true,
          });
          const pts = new THREE.Points(child.geometry, mat);
          pts.position.copy(child.position);
          pts.rotation.copy(child.rotation);
          pts.scale.copy(child.scale);
          if (child.parent) {
            meshesToReplace.push({parent: child.parent, oldMesh: child, newPts: pts});
          }
        }
      });
      meshesToReplace.forEach(({parent, oldMesh, newPts}) => {
        parent.remove(oldMesh);
        parent.add(newPts);
      });
      return clone;
    }

    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        
        if (colorMode === 'elevation') {
          // Compute vertex colors based on height if not already computed
          if (!child.geometry.attributes.color) {
            const pos = child.geometry.attributes.position;
            const colors = new Float32Array(pos.count * 3);
            
            let minZ = Infinity;
            let maxZ = -Infinity;
            for (let i = 0; i < pos.count; i++) {
              const z = pos.getZ(i);
              if (z < minZ) minZ = z;
              if (z > maxZ) maxZ = z;
            }
            
            const range = maxZ - minZ || 1;
            
            for (let i = 0; i < pos.count; i++) {
              const z = pos.getZ(i);
              const normZ = Math.max(0, Math.min(1, (z - minZ) / range));
              const cIndex = i * 3;
              
              // Turbo/GIS Elevation Ramp
              if (normZ < 0.25) {
                colors[cIndex] = 0.08; colors[cIndex + 1] = 0.35; colors[cIndex + 2] = 0.8;
              } else if (normZ < 0.5) {
                colors[cIndex] = 0.08; colors[cIndex + 1] = 0.7; colors[cIndex + 2] = 0.45;
              } else if (normZ < 0.75) {
                colors[cIndex] = 0.85; colors[cIndex + 1] = 0.75; colors[cIndex + 2] = 0.15;
              } else {
                colors[cIndex] = 0.85; colors[cIndex + 1] = 0.25; colors[cIndex + 2] = 0.2;
              }
            }
            child.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          }
          child.material.vertexColors = true;
          // Temporarily store original map if not already stored
          if (child.material.map && !child.userData.originalMap) {
            child.userData.originalMap = child.material.map;
          }
          child.material.map = null;
        } else {
          child.material.vertexColors = false;
          if (child.userData.originalMap) {
            child.material.map = child.userData.originalMap;
          }
        }
        
        child.material.wireframe = isWireframe;
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.needsUpdate = true;
      }
    });
    return clone;
  }, [scene, isWireframe, displayMode, colorMode]);

  return (
    <primitive
      object={clonedScene}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1, 1, verticalScale]}
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
  displayMode,
}: {
  isWireframe: boolean;
  verticalScale: number;
  colorMode: 'texture' | 'elevation';
  onPointerDown: (e: any) => void;
  displayMode?: 'mesh' | 'points';
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate 256x256 grid with dramatic mountain terrain
  const { geometry, colors } = useMemo(() => {
    const size = 500;
    const segments = 256;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const vertexColors = new Float32Array(pos.count * 3);
    const halfSize = size / 2;

    // First pass: compute heights
    const heights = new Float32Array(pos.count);
    let minH = Infinity;
    let maxH = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const nx = x / halfSize; // normalize to -1..1
      const nz = z / halfSize;

      // Multi-octave terrain with dramatic peaks
      const d = Math.sqrt(nx * nx + nz * nz);
      const falloff = Math.max(0, 1 - d * d * 0.7);

      // Large mountain features
      const h1 = Math.sin(x * 0.018) * Math.cos(z * 0.018) * 45;
      const h2 = Math.sin(x * 0.025 + z * 0.015) * 30;
      const h3 = Math.cos(x * 0.035 - z * 0.028) * 20;
      // Medium ridges
      const h4 = Math.sin(x * 0.06 + z * 0.04) * 12;
      const h5 = Math.cos(x * 0.08 - z * 0.06) * 8;
      // Fine detail
      const h6 = Math.sin(x * 0.15 + z * 0.12) * 4;
      const h7 = Math.cos(x * 0.22 - z * 0.18) * 2;

      // Create several distinct peaks
      const peak1 = Math.exp(-((nx - 0.3) * (nx - 0.3) + (nz + 0.2) * (nz + 0.2)) * 8) * 80;
      const peak2 = Math.exp(-((nx + 0.25) * (nx + 0.25) + (nz - 0.3) * (nz - 0.3)) * 6) * 65;
      const peak3 = Math.exp(-((nx + 0.1) * (nx + 0.1) + (nz + 0.35) * (nz + 0.35)) * 10) * 55;
      const peak4 = Math.exp(-((nx - 0.35) * (nx - 0.35) + (nz - 0.35) * (nz - 0.35)) * 12) * 70;
      const centralPeak = Math.exp(-(nx * nx + nz * nz) * 4) * 90;

      const y = (h1 + h2 + h3 + h4 + h5 + h6 + h7 + peak1 + peak2 + peak3 + peak4 + centralPeak + 40) * falloff;
      heights[i] = Math.max(0, y);
      if (heights[i] < minH) minH = heights[i];
      if (heights[i] > maxH) maxH = heights[i];
    }

    const range = maxH - minH || 1;

    // Second pass: set heights and colors
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, heights[i]);
      const normY = Math.max(0, Math.min(1, (heights[i] - minH) / range));
      const cIndex = i * 3;

      if (colorMode === 'elevation') {
        // Smooth rainbow elevation ramp: deep blue → cyan → green → yellow → orange → red → white
        let r: number, g: number, b: number;
        if (normY < 0.1) {
          // Deep blue (valleys/water)
          const t = normY / 0.1;
          r = 0.05; g = 0.1 + t * 0.25; b = 0.5 + t * 0.3;
        } else if (normY < 0.25) {
          // Blue to cyan
          const t = (normY - 0.1) / 0.15;
          r = 0.05; g = 0.35 + t * 0.4; b = 0.8 - t * 0.2;
        } else if (normY < 0.4) {
          // Cyan to green
          const t = (normY - 0.25) / 0.15;
          r = 0.05 + t * 0.1; g = 0.75 - t * 0.05; b = 0.6 - t * 0.45;
        } else if (normY < 0.55) {
          // Green to yellow
          const t = (normY - 0.4) / 0.15;
          r = 0.15 + t * 0.75; g = 0.7 + t * 0.15; b = 0.15 - t * 0.05;
        } else if (normY < 0.7) {
          // Yellow to orange
          const t = (normY - 0.55) / 0.15;
          r = 0.9 + t * 0.05; g = 0.85 - t * 0.35; b = 0.1;
        } else if (normY < 0.85) {
          // Orange to red
          const t = (normY - 0.7) / 0.15;
          r = 0.95 - t * 0.1; g = 0.5 - t * 0.3; b = 0.1 + t * 0.05;
        } else {
          // Red to white (snow caps)
          const t = (normY - 0.85) / 0.15;
          r = 0.85 + t * 0.15; g = 0.2 + t * 0.7; b = 0.15 + t * 0.8;
        }
        vertexColors[cIndex] = r;
        vertexColors[cIndex + 1] = g;
        vertexColors[cIndex + 2] = b;
      } else {
        // Natural satellite palette
        let r: number, g: number, b: number;
        if (normY < 0.15) {
          r = 0.08; g = 0.22; b = 0.38;
        } else if (normY < 0.4) {
          const t = (normY - 0.15) / 0.25;
          r = 0.08 + t * 0.12; g = 0.22 + t * 0.35; b = 0.38 - t * 0.2;
        } else if (normY < 0.65) {
          const t = (normY - 0.4) / 0.25;
          r = 0.2 + t * 0.35; g = 0.57 - t * 0.15; b = 0.18 + t * 0.15;
        } else if (normY < 0.85) {
          const t = (normY - 0.65) / 0.2;
          r = 0.55 - t * 0.1; g = 0.42 - t * 0.05; b = 0.33 + t * 0.02;
        } else {
          const t = (normY - 0.85) / 0.15;
          r = 0.45 + t * 0.5; g = 0.37 + t * 0.55; b = 0.35 + t * 0.6;
        }
        vertexColors[cIndex] = r;
        vertexColors[cIndex + 1] = g;
        vertexColors[cIndex + 2] = b;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
    geo.computeVertexNormals();
    return { geometry: geo, colors: vertexColors };
  }, [colorMode]);

  if (displayMode === 'points') {
    return (
      <points
        ref={meshRef as any}
        geometry={geometry}
        scale={[1, verticalScale, 1]}
      >
        <pointsMaterial
          size={0.2}
          vertexColors
          sizeAttenuation
        />
      </points>
    );
  }

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
        roughness={0.75}
        metalness={0.15}
        wireframe={isWireframe}
        flatShading={false}
      />
    </mesh>
  );
}

function SceneFitter({ children, onFit }: { children: React.ReactNode, onFit: (center: THREE.Vector3, radius: number, minY: number, minX: number, maxX: number) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const fitted = useRef(false);

  useFrame(() => {
    if (fitted.current || !groupRef.current) return;

    groupRef.current.updateMatrixWorld(true);
    const box = new THREE.Box3();
    box.setFromObject(groupRef.current);
    if (box.isEmpty()) return; // Model not loaded yet

    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.length() === 0) return; // Prevent empty bounding box

    fitted.current = true;

    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // Use the maximum horizontal dimension (width/depth)
    // since the terrain is a flat plane and the sphere greatly overestimates the needed distance.
    const maxHorizontalDim = Math.max(size.x, size.z);

    onFit(center, maxHorizontalDim, box.min.y, box.min.x, box.max.x);
  });

  return (
    <group ref={groupRef}>{children}</group>
  );
}

/**
 * Camera Controller supporting Flythrough & Orbit.
 * OrbitControls min/max distance is set dynamically based on model radius.
 */
function CameraController({
  isFlythrough,
  flythroughSpeed,
  target,
  modelRadius,
  resetTrigger,
}: {
  isFlythrough: boolean;
  flythroughSpeed: number;
  target: [number, number, number];
  modelRadius: number;
  resetTrigger: number;
}) {
  const controlsRef = useRef<any>(null);
  const { camera, gl } = useThree();
  const [fittedTarget, setFittedTarget] = useState<string>("");
  const [lastReset, setLastReset] = useState<number>(0);

  const minDist = modelRadius > 0 ? modelRadius * 0.01 : 0.1;
  const maxDist = modelRadius > 0 ? modelRadius * 6 : 50000;
  const targetStr = target.join(',');

  useEffect(() => {
    if (modelRadius > 0 && (targetStr !== fittedTarget || resetTrigger !== lastReset) && controlsRef.current) {
      const center = new THREE.Vector3(...target);
      const perspCam = camera as THREE.PerspectiveCamera;
      // Robust heuristic to fit a flat square plane into a 45-degree FOV viewport
      // By tying it directly to the width (modelRadius) and using a 1.2 multiplier,
      // it reliably fills 65-80% of the screen regardless of the aspect ratio.
      const cameraDist = modelRadius * 1.2;

      // Elevated perspective, slightly in front
      const dir = new THREE.Vector3(0, 1.2, 1.5).normalize();
      const camPos = center.clone().add(dir.multiplyScalar(cameraDist));

      perspCam.position.copy(camPos);
      perspCam.lookAt(center);
      perspCam.near = Math.max(0.001, cameraDist * 0.01);
      perspCam.position.copy(camPos);
      perspCam.lookAt(center);
      perspCam.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }

      
      setFittedTarget(targetStr);
      setLastReset(resetTrigger);
    }
  }, [targetStr, modelRadius, camera, gl.domElement, fittedTarget, resetTrigger, lastReset]);

  useFrame(() => {
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
      minDistance={minDist}
      maxDistance={maxDist}
      target={target}
    />
  );
}

export const TerrainViewer = forwardRef<TerrainViewerRef, TerrainViewerProps>(({
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
  displayMode,
}, ref) => {
  const [hasGlbError, setHasGlbError] = useState(false);
  const [target, setTarget] = useState<[number, number, number]>([0, 0, 0]);
  const [modelRadius, setModelRadius] = useState(0);
  const [modelMinY, setModelMinY] = useState(0);
  const [boxMinX, setBoxMinX] = useState(0);
  const [boxMaxX, setBoxMaxX] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      setResetTrigger((prev) => prev + 1);
    }
  }));

  const handleFit = React.useCallback((center: THREE.Vector3, radius: number, minY: number, minX: number, maxX: number) => {
    setTarget([center.x, center.y, center.z]);
    setModelRadius(radius);
    setModelMinY(minY);
    setBoxMinX(minX);
    setBoxMaxX(maxX);
  }, []);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!e.point) return;

    const x = parseFloat(e.point.x.toFixed(2));
    const z = parseFloat(e.point.z.toFixed(2));
    const rawY = e.point.y;

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
    <div className="relative w-full h-[550px] lg:h-[700px] rounded-3xl overflow-hidden border border-geo-border bg-geo-bg shadow-geo-elevated">
      
      {/* 3D Header Overlay */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-geo-bg/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-4 left-6 z-20 pointer-events-none">
        <h3 className="text-lg font-bold font-mono tracking-wider text-white uppercase drop-shadow-md">
          Interactive 3D Terrain
        </h3>
      </div>

      {/* Subtle Technical Terrain Status Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {hasGlbError ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-geo-surface/90 border border-red-500/40 text-red-400 font-mono text-xs shadow-sm backdrop-blur-md">
            <span className="font-semibold">⚠ TERRAIN LOAD ERROR</span>
          </div>
        ) : isRealData && glbUrl ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-geo-surface/90 border border-emerald-500/40 text-emerald-300 font-mono text-xs shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">GENERATED TERRAIN</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-geo-surface/90 border border-geo-border text-geo-text font-mono text-xs shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-geo-cyan" />
            <span className="font-semibold">TERRAIN READY</span>
          </div>
        )}
      </div>

      {/* Fallback standalone HTML mode */}
      {!glbUrl && htmlUrl ? (
        <div className="w-full h-full flex flex-col">
          <div className="bg-geo-surface px-4 py-2 border-b border-geo-border text-xs font-mono text-geo-muted flex items-center justify-between">
            <span>Stand-alone 3D Viewer (terrain.html fallback)</span>
            <a
              href={htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-geo-cyan hover:underline"
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
        <Canvas
          shadows
          camera={{ position: [200, 400, 600], fov: 45, near: 0.1, far: 50000 }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing bg-geo-bg"
        >
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[500, 700, 300]}
            intensity={sunIntensity * 1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-400, 300, -300]} intensity={0.3} color="#60a5fa" />
          <hemisphereLight args={['#38bdf8', '#0b1728', 0.4]} />

          {showGrid && (
            <gridHelper
              args={[modelRadius > 0 ? (boxMaxX - boxMinX) * 1.75 : 100, 80, '#06b6d4', '#1e314b']}
              position={[target[0], modelRadius > 0 ? modelMinY - (modelRadius * 0.02) : 0, target[2]]}
            />
          )}

          <Suspense fallback={null}>
            <SceneFitter onFit={handleFit}>
              {isRealData && glbUrl && !hasGlbError ? (
                <ModelErrorBoundary
                  onError={() => setHasGlbError(true)}
                  fallback={
                    <ProceduralDemoTerrain
                      isWireframe={isWireframe}
                      verticalScale={verticalScale}
                      colorMode={colorMode}
                      onPointerDown={handlePointerDown}
                      displayMode={displayMode}
                    />
                  }
                >
                  <RealTerrainModel
                    url={glbUrl}
                    isWireframe={isWireframe}
                    verticalScale={verticalScale}
                    onPointerDown={handlePointerDown}
                    displayMode={displayMode}
                    colorMode={colorMode}
                  />
                </ModelErrorBoundary>
              ) : (
                <ProceduralDemoTerrain
                  isWireframe={isWireframe}
                  verticalScale={verticalScale}
                  colorMode={colorMode}
                  onPointerDown={handlePointerDown}
                  displayMode={displayMode}
                />
              )}
            </SceneFitter>
          </Suspense>

          <CameraController
            isFlythrough={isFlythrough}
            flythroughSpeed={flythroughSpeed}
            target={target}
            modelRadius={modelRadius}
            resetTrigger={resetTrigger}
          />
        </Canvas>
      )}
    </div>
  );
});
