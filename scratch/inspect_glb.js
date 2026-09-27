import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
import path from 'path';

// Node 18+ has native fetch, no need for node-fetch polyfill.
const glbPath = path.resolve('./public/outputs/terrain.glb');
const arrayBuffer = fs.readFileSync(glbPath).buffer;

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);

  console.log(JSON.stringify({
    min: box.min,
    max: box.max,
    size: size,
    center: center,
    radius: sphere.radius,
    position: scene.position,
    scale: scene.scale,
    rotation: scene.rotation
  }, null, 2));
}, (err) => {
  console.error("Error loading GLTF:", err);
});
