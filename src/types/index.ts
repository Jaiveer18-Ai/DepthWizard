export type StageStatus = 'WAITING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
export type SystemStatus = 'READY' | 'PROCESSING' | 'TERRAIN READY' | 'ERROR';

export interface PipelineStageInfo {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  member: string;
  status: StageStatus;
  outputName?: string;
  description: string;
}

export interface TerrainMetadata {
  minElevation: number;
  maxElevation: number;
  avgElevation: number;
  elevationRange: number;
  averageSlope: number;
  resolution: string;
  units: string;
  crs: string;
  calibrationMethod: string;
  isDemoData: boolean;
  shape?: [number, number];
  fileFormat: string;
}

export interface TerrainPointInspection {
  x: number;
  y: number;
  elevation: number;
  slope: number;
  isDemoValue: boolean;
}

export interface PipelineOutputs {
  originalImage: string | null;
  depthImage: string | null;
  dsmImage: string | null;
  terrainGlb: string | null;
  terrainHtml: string | null;
  depthNpy: string | null;
  dsmNpy: string | null;
  dsmTif: string | null;
  isRealData: boolean;
  source: 'real' | 'demo' | 'none';
}

export interface CameraPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
}
