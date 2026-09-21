import { TerrainMetadata, PipelineStageInfo } from '../types';

export const CONTRACT_PATHS = {
  GOLDEN_SAMPLE_INPUT: 'data/sample/input.png',
  ORIGINAL_IMAGE: 'outputs/original.png',
  DEPTH_NPY: 'outputs/depth.npy',
  DEPTH_PNG: 'outputs/depth.png',
  DSM_NPY: 'outputs/dsm.npy',
  DSM_PNG: 'outputs/dsm.png',
  DSM_TIF: 'outputs/dsm.tif',
  TERRAIN_GLB: 'outputs/terrain.glb',
  TERRAIN_HTML: 'outputs/terrain.html',
};

export const INITIAL_PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: 'rgb',
    stepNumber: '01',
    title: 'RGB IMAGE',
    subtitle: 'Input Optical Image',
    member: 'Input / Golden Sample',
    status: 'WAITING',
    outputName: 'original.png',
    description: 'Single high-resolution optical satellite / aerial imagery source.',
  },
  {
    id: 'depth',
    stepNumber: '02',
    title: 'DEPTH',
    subtitle: 'Relative Depth Estimation',
    member: 'Member 1 — AI / Depth',
    status: 'WAITING',
    outputName: 'depth.png / depth.npy',
    description: 'Monocular deep-learning relative depth estimation.',
  },
  {
    id: 'dsm',
    stepNumber: '03',
    title: 'DSM',
    subtitle: 'Calibrated Elevation Surface',
    member: 'Member 2 — GIS / Calibration',
    status: 'WAITING',
    outputName: 'dsm.png / dsm.npy',
    description: 'Calibrated elevation raster / Digital Surface Model.',
  },
  {
    id: 'terrain',
    stepNumber: '04',
    title: '3D TERRAIN',
    subtitle: 'Mesh & Texture Reconstruction',
    member: 'Member 3 — 3D / Integration',
    status: 'WAITING',
    outputName: 'terrain.glb / terrain.html',
    description: 'Watertight triangulated 3D mesh with RGB texture draping.',
  },
  {
    id: 'demo',
    stepNumber: '05',
    title: 'VISUALIZATION',
    subtitle: 'Interactive SIH Demo',
    member: 'Member 4 — Frontend / Demo',
    status: 'WAITING',
    outputName: 'Interactive WebGL',
    description: 'Real-time 3D flythrough, GIS analysis & terrain inspection.',
  },
];

export const DEMO_TERRAIN_METADATA: TerrainMetadata = {
  minElevation: 245.8,
  maxElevation: 1892.4,
  avgElevation: 874.2,
  elevationRange: 1646.6,
  averageSlope: 18.3,
  resolution: '0.5m / pixel',
  units: 'metres (calibrated)',
  crs: 'EPSG:32643 (UTM 43N)',
  calibrationMethod: 'GAMUS / Prototype Linear Elevation Transfer',
  isDemoData: true,
  shape: [512, 512],
  fileFormat: 'GLB (Binary glTF)',
};

/**
 * Generate an SVG / Canvas base64 synthetic terrain heightmap for fallback preview
 */
export function generateSyntheticPreviewUrl(type: 'rgb' | 'depth' | 'dsm'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const imgData = ctx.createImageData(512, 512);
  const data = imgData.data;

  // Simple multi-octave gradient simulation
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const nx = x / 512 - 0.5;
      const ny = y / 512 - 0.5;
      const dist = Math.sqrt(nx * nx + ny * ny);
      
      // Ridge-like elevation
      const v1 = Math.sin(nx * 10 + Math.cos(ny * 8)) * 0.3;
      const v2 = Math.cos(nx * 16 - ny * 12) * 0.2;
      const v3 = (1 - Math.min(1, dist * 1.8)) * 0.5;
      let elevation = Math.max(0, Math.min(1, 0.5 + v1 + v2 + v3));

      const idx = (y * 512 + x) * 4;

      if (type === 'rgb') {
        // Satellite-like terrain texture (greens, browns, rocky peaks, snow)
        if (elevation > 0.8) {
          // Snow peak
          data[idx] = 230 + Math.random() * 25;
          data[idx + 1] = 235 + Math.random() * 20;
          data[idx + 2] = 245;
        } else if (elevation > 0.55) {
          // Mountain rock
          data[idx] = 110 + elevation * 40;
          data[idx + 1] = 95 + elevation * 30;
          data[idx + 2] = 80 + elevation * 20;
        } else if (elevation > 0.3) {
          // Forest / vegetation
          data[idx] = 34 + elevation * 40;
          data[idx + 1] = 85 + elevation * 80;
          data[idx + 2] = 34 + elevation * 20;
        } else {
          // Valley / river bank
          data[idx] = 40 + elevation * 60;
          data[idx + 1] = 60 + elevation * 60;
          data[idx + 2] = 90 + elevation * 100;
        }
        data[idx + 3] = 255;
      } else if (type === 'depth') {
        // Inverted grayscale or inferno relative depth
        const val = Math.floor(elevation * 255);
        // Inferno-like gradient (black -> purple -> orange -> yellow)
        data[idx] = Math.min(255, Math.floor(val * 1.4));
        data[idx + 1] = Math.floor(val > 128 ? (val - 128) * 2 : 20);
        data[idx + 2] = Math.floor(255 - val * 0.9);
        data[idx + 3] = 255;
      } else if (type === 'dsm') {
        // Turbo / Rainbow GIS colormap for elevation
        const t = elevation;
        // Approximation of Turbo colormap
        data[idx] = Math.floor(255 * Math.sin(t * Math.PI));
        data[idx + 1] = Math.floor(255 * Math.sin(t * Math.PI * 0.8 + 0.3));
        data[idx + 2] = Math.floor(255 * Math.cos(t * Math.PI * 0.7));
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}
