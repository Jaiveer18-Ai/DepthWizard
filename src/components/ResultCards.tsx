import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Layers,
  Mountain,
  Box,
  ExternalLink,
  Download,
  Eye,
  FileCode,
  Info,
} from 'lucide-react';
import { PipelineOutputs } from '../types';

interface ResultCardsProps {
  outputs: PipelineOutputs;
  isProcessing: boolean;
  onSelectViewStage: (stage: 'rgb' | 'depth' | 'dsm' | '3d') => void;
  selectedStage: 'rgb' | 'depth' | 'dsm' | '3d';
}

export const ResultCards: React.FC<ResultCardsProps> = ({
  outputs,
  isProcessing,
  onSelectViewStage,
  selectedStage,
}) => {
  const [activeModalImg, setActiveModalImg] = useState<{ title: string; src: string } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-gis-cyan" />
            Pipeline Output Artifacts
          </h2>
          <p className="text-xs text-slate-400">
            Per Section 4 & 14 of contract.md (outputs/ directory)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: INPUT RGB */}
        <div
          onClick={() => onSelectViewStage('rgb')}
          className={`glass-panel rounded-xl p-3.5 border transition-all cursor-pointer ${
            selectedStage === 'rgb'
              ? 'border-gis-cyan/60 bg-space-900/90 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              : 'border-space-700/70 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <ImageIcon className="w-3.5 h-3.5 text-gis-cyan" />
              <span>INPUT RGB</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                outputs.originalImage
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-space-900 text-slate-500 border-space-800'
              }`}
            >
              {outputs.originalImage ? '✓ Available' : 'Not available'}
            </span>
          </div>

          <div className="relative h-28 rounded-lg overflow-hidden bg-space-950 border border-space-800 flex items-center justify-center">
            {outputs.originalImage ? (
              <img
                src={outputs.originalImage}
                alt="Input RGB"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-slate-500 text-xs font-mono">
                <span>Not available</span>
                <p className="text-[10px] text-slate-600 mt-1">outputs/original.png</p>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate">original.png</span>
            {outputs.originalImage && (
              <a
                href={outputs.originalImage}
                download="original.png"
                onClick={(e) => e.stopPropagation()}
                title="Download original.png"
                className="text-slate-400 hover:text-gis-cyan"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Card 2: RELATIVE DEPTH (Member 1) */}
        <div
          onClick={() => onSelectViewStage('depth')}
          className={`glass-panel rounded-xl p-3.5 border transition-all cursor-pointer ${
            selectedStage === 'depth'
              ? 'border-gis-cyan/60 bg-space-900/90 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              : 'border-space-700/70 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              <span>RELATIVE DEPTH</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                outputs.depthImage
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-purple-950/60 text-purple-300 border-purple-500/40'
              }`}
            >
              {outputs.depthImage ? '✓ Available' : 'DEMO / PREVIEW'}
            </span>
          </div>

          <div className="relative h-28 rounded-lg overflow-hidden bg-space-950 border border-space-800 flex items-center justify-center">
            {outputs.depthImage ? (
              <img
                src={outputs.depthImage}
                alt="Depth Map"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-slate-400 text-xs font-mono">
                <span className="text-purple-400 font-bold">DEMO PREVIEW</span>
                <p className="text-[10px] text-slate-500 mt-1">Member 1 — AI / Depth</p>
                <p className="text-[9px] text-slate-600">outputs/depth.png</p>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate">depth.png / depth.npy</span>
            {outputs.depthImage && (
              <a
                href={outputs.depthImage}
                download="depth.png"
                onClick={(e) => e.stopPropagation()}
                title="Download depth.png"
                className="text-slate-400 hover:text-gis-cyan"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Card 3: CALIBRATED DSM (Member 2) */}
        <div
          onClick={() => onSelectViewStage('dsm')}
          className={`glass-panel rounded-xl p-3.5 border transition-all cursor-pointer ${
            selectedStage === 'dsm'
              ? 'border-gis-cyan/60 bg-space-900/90 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              : 'border-space-700/70 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>CALIBRATED DSM</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                outputs.dsmImage
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-purple-950/60 text-purple-300 border-purple-500/40'
              }`}
            >
              {outputs.dsmImage ? '✓ Available' : 'DEMO / PREVIEW'}
            </span>
          </div>

          <div className="relative h-28 rounded-lg overflow-hidden bg-space-950 border border-space-800 flex items-center justify-center">
            {outputs.dsmImage ? (
              <img
                src={outputs.dsmImage}
                alt="DSM Elevation"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-slate-400 text-xs font-mono">
                <span className="text-purple-400 font-bold">DEMO PREVIEW</span>
                <p className="text-[10px] text-slate-500 mt-1">Member 2 — GIS / Calibration</p>
                <p className="text-[9px] text-slate-600">outputs/dsm.png</p>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate">dsm.png / dsm.npy</span>
            {outputs.dsmImage && (
              <a
                href={outputs.dsmImage}
                download="dsm.png"
                onClick={(e) => e.stopPropagation()}
                title="Download dsm.png"
                className="text-slate-400 hover:text-gis-cyan"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Card 4: 3D TERRAIN (Member 3) */}
        <div
          onClick={() => onSelectViewStage('3d')}
          className={`glass-panel rounded-xl p-3.5 border transition-all cursor-pointer ${
            selectedStage === '3d'
              ? 'border-gis-cyan/60 bg-space-900/90 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              : 'border-space-700/70 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <Box className="w-3.5 h-3.5 text-blue-400" />
              <span>3D TERRAIN</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                outputs.terrainGlb || outputs.terrainHtml
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-purple-950/60 text-purple-300 border-purple-500/40'
              }`}
            >
              {outputs.terrainGlb
                ? '✓ terrain.glb'
                : outputs.terrainHtml
                ? '✓ terrain.html'
                : 'DEMO / PREVIEW'}
            </span>
          </div>

          <div className="relative h-28 rounded-lg overflow-hidden bg-space-950 border border-space-800 flex items-center justify-center">
            <div className="text-center p-2 font-mono text-xs">
              <Box className="w-7 h-7 mx-auto mb-1 text-gis-cyan animate-pulse" />
              <p className="text-slate-300 font-bold">Interactive 3D Mesh</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {outputs.terrainGlb ? 'GLB Loaded' : 'Procedural Fallback'}
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate">terrain.glb</span>
            {outputs.terrainGlb && (
              <a
                href={outputs.terrainGlb}
                download="terrain.glb"
                onClick={(e) => e.stopPropagation()}
                title="Download terrain.glb"
                className="text-slate-400 hover:text-gis-cyan"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
