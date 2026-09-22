import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from './ThreeControls';
import * as THREE from 'three';
import { TerrainPointInspection } from '../types';
import { MapPin } from 'lucide-react';

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
    const size = 32;
    const segments = 128;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const vertexColors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Multi-octave natural terrain formula
      const distFromCenter = Math.sqrt(x * x + z * z);
      const h1 = Math.sin(x * 0.22) * Math.cos(z * 0.22) * 3.8;
      const h2 = Math.sin(x * 0.55 + z * 0.35) * 1.6;
      const h3 = Math.cos(x * 1.1 - z * 0.8) * 0.7;
      const falloff = Math.max(0, 1 - Math.pow(distFromCenter / 17, 2));

      const y = (h1 + h2 + h3 + 3.2) * falloff;
      pos.setY(i, y);

      const normY = Math.max(0, Math.min(1, y / 7.5));
      const cIndex = i * 3;

      if (colorMode === 'elevation') {
        // Subtle Turbo/GIS Elevation Ramp
        if (normY < 0.25) {
          vertexColors[cIndex] = 0.08;
          vertexColors[cIndex + 1] = 0.35;
          vertexColors[cIndex + 2] = 0.8;
        } else if (normY < 0.5) {
          vertexColors[cIndex] = 0.08;
          vertexColors[cIndex + 1] = 0.7;
          vertexColors[cIndex + 2] = 0.45;
        } else if (normY < 0.75) {
          vertexColors[cIndex] = 0.85;
          vertexColors[cIndex + 1] = 0.75;
          vertexColors[cIndex + 2] = 0.15;
        } else {
          vertexColors[cIndex] = 0.85;
          vertexColors[cIndex + 1] = 0.25;
          vertexColors[cIndex + 2] = 0.2;
        }
      } else {
        // Satellite Natural Palette: River valley -> Forest -> Rock -> Snow
        if (normY < 0.2) {
          vertexColors[cIndex] = 0.12;
          vertexColors[cIndex + 1] = 0.28;
          vertexColors[cIndex + 2] = 0.45;
        } else if (normY < 0.52) {
          vertexColors[cIndex] = 0.18;
          vertexColors[cIndex + 1] = 0.48;
          vertexColors[cIndex + 2] = 0.24;
        } else if (normY < 0.8) {
          vertexColors[cIndex] = 0.5;
          vertexColors[cIndex + 1] = 0.42;
          vertexColors[cIndex + 2] = 0.35;
        } else {
          vertexColors[cIndex] = 0.9;
          vertexColors[cIndex + 1] = 0.94;
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
        roughness={0.75}
        metalness={0.15}
        wireframe={isWireframe}
        flatShading={false}
      />
    </mesh>
  );
}

/**
 * SceneFitter: Wraps children in a group, uses useFrame to poll for geometry,
 * then computes proper camera framing based on actual bounding box.
 * This solves the async GLB loading timing issue — the old AutoFit used
 * requestAnimationFrame which ran before the async GLB was loaded.
 */
function SceneFitter({ children, onFit, onDebugInfo }: { children: React.ReactNode, onFit: (center: THREE.Vector3, radius: number) => void, onDebugInfo: (info: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const fitted = useRef(false);

  useFrame(() => {
    if (fitted.current || !groupRef.current) return;

    const box = new THREE.Box3().setFromObject(groupRef.current);
    if (box.isEmpty()) return; // Model not loaded yet — keep polling

    // Wait until the canvas has reasonable dimensions (not collapsed)
    // to ensure correct aspect ratio for camera computation
    if (gl.domElement.height < 200) return;

    // Model is ready and canvas is properly sized — compute framing
    fitted.current = true;

    const center = new THREE.Vector3();
    box.getCenter(center);

    const size = new THREE.Vector3();
    box.getSize(size);

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const radius = sphere.radius;

    const perspCam = camera as THREE.PerspectiveCamera;
    const fovRad = perspCam.fov * (Math.PI / 180);
    const aspect = perspCam.aspect;

    // Calculate the camera distance needed to fit the model in view.
    // We need to consider both the vertical and horizontal FOV to ensure
    // the entire model fits regardless of aspect ratio.
    const fovH = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
    
    // Distance needed so the bounding sphere fits in the vertical FOV
    const distV = radius / Math.sin(fovRad / 2);
    // Distance needed so the bounding sphere fits in the horizontal FOV
    const distH = radius / Math.sin(fovH / 2);
    // Take the larger distance to ensure full fit
    let cameraDist = Math.max(distV, distH);

    // Apply padding so the terrain fills ~70% of viewport rather than 100%
    cameraDist *= 1.15;

    // Position camera at an isometric-like angle above and behind the center
    // This gives a natural terrain viewing angle
    const camX = center.x + cameraDist * 0.25;
    const camY = center.y + cameraDist * 0.6;  // Y is up — elevate significantly
    const camZ = center.z + cameraDist * 0.7;

    perspCam.position.set(camX, camY, camZ);
    perspCam.lookAt(center);

    // Set near/far based on model dimensions to avoid clipping
    perspCam.near = Math.max(0.1, cameraDist * 0.01);
    perspCam.far = cameraDist * 10;
    perspCam.updateProjectionMatrix();

    const debugInfo = {
      min: box.min.toArray(),
      max: box.max.toArray(),
      size: size.toArray(),
      center: center.toArray(),
      radius,
      cameraPos: perspCam.position.toArray(),
      cameraDist,
      fov: fovRad,
      aspect,
      canvasWidth: gl.domElement.width,
      canvasHeight: gl.domElement.height,
      devicePixelRatio: window.devicePixelRatio,
    };

    console.log('[SceneFitter] Model detected and camera fitted:', debugInfo);

    onDebugInfo(debugInfo);
    onFit(center, radius);
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
}: {
  isFlythrough: boolean;
  flythroughSpeed: number;
  target: [number, number, number];
  modelRadius: number;
}) {
  const controlsRef = useRef<any>(null);

  // Compute dynamic distance limits based on model size
  // modelRadius 0 means not yet measured — use generous defaults
  const minDist = modelRadius > 0 ? modelRadius * 0.2 : 1;
  const maxDist = modelRadius > 0 ? modelRadius * 8 : 50000;

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
  const [target, setTarget] = useState<[number, number, number]>([0, 0, 0]);
  const [debugData, setDebugData] = useState<any>(null);
  const [modelRadius, setModelRadius] = useState(0);

  const handleFit = React.useCallback((center: THREE.Vector3, radius: number) => {
    setTarget([center.x, center.y, center.z]);
    setModelRadius(radius);
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
    <div className="relative w-full h-[600px] lg:h-[720px] xl:h-[780px] rounded-3xl overflow-hidden border border-geo-border bg-geo-bg shadow-geo-elevated">
      {debugData && (
        <div className="absolute top-16 left-4 z-50 p-4 bg-black/80 text-green-400 font-mono text-[10px] whitespace-pre rounded border border-green-500/30 max-h-[80%] overflow-y-auto pointer-events-none">
          <div>MODEL SIZE:</div>
          <div>X = {debugData.size[0].toFixed(2)}</div>
          <div>Y = {debugData.size[1].toFixed(2)}</div>
          <div>Z = {debugData.size[2].toFixed(2)}</div>
          <div className="mt-2">MODEL CENTER:</div>
          <div>X = {debugData.center[0].toFixed(2)}</div>
          <div>Y = {debugData.center[1].toFixed(2)}</div>
          <div>Z = {debugData.center[2].toFixed(2)}</div>
          <div className="mt-2">CAMERA:</div>
          <div>position = {debugData.cameraPos.map((v:any) => v.toFixed(2)).join(', ')}</div>
          <div>FOV = {(debugData.fov * 180 / Math.PI).toFixed(1)}°</div>
          <div>aspect = {debugData.aspect.toFixed(2)}</div>
          <div>dist = {debugData.cameraDist?.toFixed(1)}</div>
          <div className="mt-2">CANVAS:</div>
          <div>width = {debugData.canvasWidth}</div>
          <div>height = {debugData.canvasHeight}</div>
          <div>dpr = {debugData.devicePixelRatio}</div>
          <div className="mt-2">RADIUS: {debugData.radius?.toFixed(1)}</div>
        </div>
      )}
      {/* Subtle Technical Terrain Status Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {isRealData && glbUrl && !hasGlbError ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-geo-surface/90 border border-emerald-500/40 text-emerald-300 font-mono text-xs shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">GENERATED TERRAIN</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-geo-surface/90 border border-geo-border text-geo-text font-mono text-xs shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-geo-cyan" />
            <span className="font-semibold">DEMO TERRAIN</span>
            <span className="text-[11px] text-geo-muted">(Procedural Surface)</span>
          </div>
        )}
      </div>

      {/* Point Inspector Marker Overlay */}
      {inspectedPoint && (
        <div className="absolute bottom-4 left-4 z-20 p-3.5 rounded-xl bg-geo-surface/95 border border-geo-border backdrop-blur-md font-mono text-xs shadow-geo-card max-w-xs animate-in fade-in">
          <div className="flex items-center justify-between border-b border-geo-border/80 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-geo-cyan font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>POINT INSPECTION</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-geo-bg border border-geo-border text-geo-muted">
              {inspectedPoint.isDemoValue ? 'DEMO VALUE' : 'REAL DSM'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div>
              <span className="text-geo-muted">X: </span>
              <span className="text-geo-text font-bold">{inspectedPoint.x} m</span>
            </div>
            <div>
              <span className="text-geo-muted">Y: </span>
              <span className="text-geo-text font-bold">{inspectedPoint.y} m</span>
            </div>
            <div>
              <span className="text-geo-muted">Elevation: </span>
              <span className="text-geo-cyan font-bold">{inspectedPoint.elevation} m</span>
            </div>
            <div>
              <span className="text-geo-muted">Slope: </span>
              <span className="text-amber-300 font-bold">{inspectedPoint.slope}°</span>
            </div>
          </div>
        </div>
      )}

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
              args={[600, 30, '#06b6d4', '#1e314b']}
              position={[255, -0.5, 255]}
            />
          )}

          <Suspense fallback={null}>
            <SceneFitter onFit={handleFit} onDebugInfo={setDebugData}>
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
            </SceneFitter>
          </Suspense>

          <CameraController
            isFlythrough={isFlythrough}
            flythroughSpeed={flythroughSpeed}
            target={target}
            modelRadius={modelRadius}
          />
        </Canvas>
      )}
    </div>
  );
};
