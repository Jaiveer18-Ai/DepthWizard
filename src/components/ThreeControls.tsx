import React, { useEffect, useMemo, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export interface OrbitControlsProps {
  enableZoom?: boolean;
  enablePan?: boolean;
  enableDamping?: boolean;
  dampingFactor?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  maxPolarAngle?: number;
  minDistance?: number;
  maxDistance?: number;
}

export const OrbitControls = React.forwardRef<any, OrbitControlsProps>((props, ref) => {
  const { camera, gl } = useThree();

  const controls = useMemo(() => {
    const ctrl = new ThreeOrbitControls(camera, gl.domElement);
    if (props.enableZoom !== undefined) ctrl.enableZoom = props.enableZoom;
    if (props.enablePan !== undefined) ctrl.enablePan = props.enablePan;
    if (props.enableDamping !== undefined) ctrl.enableDamping = props.enableDamping;
    if (props.dampingFactor !== undefined) ctrl.dampingFactor = props.dampingFactor;
    if (props.autoRotate !== undefined) ctrl.autoRotate = props.autoRotate;
    if (props.autoRotateSpeed !== undefined) ctrl.autoRotateSpeed = props.autoRotateSpeed;
    if (props.maxPolarAngle !== undefined) ctrl.maxPolarAngle = props.maxPolarAngle;
    if (props.minDistance !== undefined) ctrl.minDistance = props.minDistance;
    if (props.maxDistance !== undefined) ctrl.maxDistance = props.maxDistance;
    return ctrl;
  }, [camera, gl.domElement]);

  // Update dynamic props
  useEffect(() => {
    if (props.enableZoom !== undefined) controls.enableZoom = props.enableZoom;
    if (props.enablePan !== undefined) controls.enablePan = props.enablePan;
    if (props.enableDamping !== undefined) controls.enableDamping = props.enableDamping;
    if (props.dampingFactor !== undefined) controls.dampingFactor = props.dampingFactor;
    if (props.autoRotate !== undefined) controls.autoRotate = props.autoRotate;
    if (props.autoRotateSpeed !== undefined) controls.autoRotateSpeed = props.autoRotateSpeed;
    if (props.maxPolarAngle !== undefined) controls.maxPolarAngle = props.maxPolarAngle;
    if (props.minDistance !== undefined) controls.minDistance = props.minDistance;
    if (props.maxDistance !== undefined) controls.maxDistance = props.maxDistance;
  }, [props, controls]);

  useFrame(() => {
    controls.update();
  });

  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(controls);
      } else {
        (ref as any).current = controls;
      }
    }
    return () => {
      controls.dispose();
    };
  }, [controls, ref]);

  return null;
});

OrbitControls.displayName = 'OrbitControls';

/**
 * Robust glTF hook directly using Three's GLTFLoader without heavy bundle overhead
 */
const gltfCache = new Map<string, THREE.Group>();

export function useGLTF(url: string): { scene: THREE.Group } {
  const [scene, setScene] = React.useState<THREE.Group>(() => {
    return gltfCache.get(url) || new THREE.Group();
  });

  useEffect(() => {
    if (gltfCache.has(url)) {
      setScene(gltfCache.get(url)!);
      return;
    }

    const loader = new GLTFLoader();
    let cancelled = false;

    loader.load(
      url,
      (gltf) => {
        if (!cancelled) {
          gltfCache.set(url, gltf.scene);
          setScene(gltf.scene);
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load GLTF at ' + url, error);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { scene };
}
