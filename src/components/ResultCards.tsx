import React from 'react';
import {
  Image as ImageIcon,
  Mountain,
  Layers,
  Box,
  Download,
  AlertCircle,
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
  const tabs = [
    {
      id: 'rgb' as const,
      label: 'Input Optical RGB',
      shortLabel: 'RGB Input',
      step: '01',
      icon: ImageIcon,
      available: !!outputs.originalImage,
      filename: 'outputs/original.png',
      owner: 'Golden Sample / Input',
      format: 'PNG (24-bit RGB)',
      desc: 'Raw optical satellite or aerial photograph provided as the single-view input baseline.',
      src: outputs.originalImage,
      downloadUrl: outputs.originalImage,
      downloadName: 'original.png',
    },
    {
      id: 'depth' as const,
      label: 'Relative Depth Map',
      shortLabel: 'Depth Map',
      step: '02',
      icon: Mountain,
      available: !!outputs.depthImage,
      filename: 'outputs/depth.png & depth.npy',
      owner: 'Member 1 — AI / Depth',
      format: 'NumPy 2D float32 + PNG',
      desc: 'Monocular neural relative depth estimation capturing structural depth gradients and surface geometry.',
      src: outputs.depthImage,
      downloadUrl: outputs.depthImage,
      downloadName: 'depth.png',
    },
    {
      id: 'dsm' as const,
      label: 'Calibrated DSM Surface',
      shortLabel: 'Calibrated DSM',
      step: '03',
      icon: Layers,
      available: !!outputs.dsmImage,
      filename: 'outputs/dsm.png & dsm.npy',
      owner: 'Member 2 — GIS / Calibration',
      format: 'NumPy 2D float32 + GeoTIFF',
      desc: 'Topographic elevation raster with calibrated metric Z-coordinates and spatial scale references.',
      src: outputs.dsmImage,
      downloadUrl: outputs.dsmImage,
      downloadName: 'dsm.png',
    },
    {
      id: '3d' as const,
      label: '3D Terrain Model',
      shortLabel: '3D Terrain',
      step: '04',
      icon: Box,
      available: !!outputs.terrainGlb || !!outputs.terrainHtml,
      filename: 'outputs/terrain.glb',
      owner: 'Member 3 — 3D / Integration',
      format: 'glTF 2.0 Binary (GLB)',
      desc: 'Triangulated 3D mesh surface draped with original optical RGB texture for real-time visualization.',
      src: null,
      downloadUrl: outputs.terrainGlb,
      downloadName: 'terrain.glb',
    },
  ];

  const currentTab = tabs.find((t) => t.id === selectedStage) || tabs[0];

  return (
    <div className="geo-panel rounded-3xl p-8 sm:p-10 border border-geo-border/50 space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-geo-border/40">
        <div>
          <h3 className="text-base font-bold tracking-wide text-geo-text flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-geo-cyan" />
            Pipeline Output Artifacts
          </h3>
          <p className="text-xs text-geo-muted mt-1.5">
            Detailed inspection of contract deliverables generated in outputs/
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-geo-bg/80 border border-geo-border/40">
          {tabs.map((tab) => {
            const isSelected = selectedStage === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectViewStage(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all duration-300 ${
                  isSelected
                    ? 'bg-geo-elevated/80 text-geo-text border border-geo-border/60 font-bold shadow-sm'
                    : 'text-geo-muted hover:text-geo-text hover:bg-geo-surface/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-geo-cyan' : 'text-geo-subtle'}`} />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left: Large Visual Preview */}
        <div className="lg:col-span-7">
          <div className="relative w-full h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden border border-geo-border/40 bg-geo-bg flex items-center justify-center group">
            {currentTab.src ? (
              <img
                src={currentTab.src}
                alt={currentTab.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : currentTab.id === '3d' ? (
              <div className="text-center p-8 space-y-3">
                <Box className="w-14 h-14 mx-auto text-geo-cyan animate-float" />
                <p className="text-base font-bold text-geo-text">
                  3D Watertight Terrain Mesh
                </p>
                <p className="text-sm text-geo-muted max-w-sm mx-auto leading-relaxed">
                  The interactive 3D terrain model is live in the main viewer above. You can also download the binary GLB file below.
                </p>
              </div>
            ) : (
              <div className="text-center p-8 space-y-2 text-geo-muted font-mono text-xs">
                <AlertCircle className="w-8 h-8 mx-auto text-geo-subtle" />
                <p className="font-semibold text-geo-text text-sm">Not Available Yet</p>
                <p className="text-[11px] text-geo-subtle">{currentTab.filename}</p>
              </div>
            )}

            {/* Availability badge */}
            <div className="absolute top-4 left-4 z-10">
              <span
                className={`text-[10px] font-mono px-3 py-1.5 rounded-full border backdrop-blur-md ${
                  currentTab.available
                    ? 'bg-geo-surface/80 text-emerald-300 border-emerald-500/25'
                    : 'bg-geo-surface/80 text-geo-muted border-geo-border/60'
                }`}
              >
                {currentTab.available ? '✓ Contract Output Available' : '○ Standby / Demo Fallback'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Technical Metadata */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-geo-surface/80 text-geo-cyan border border-geo-border/60">
              Step {currentTab.step} Artifact
            </span>
            <h4 className="text-xl font-bold text-geo-text mt-3">
              {currentTab.label}
            </h4>
            <p className="text-sm text-geo-muted leading-relaxed mt-2">
              {currentTab.desc}
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-xl bg-geo-surface/40 border border-geo-border/40 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-geo-subtle">Output Path:</span>
              <span className="text-geo-text font-bold truncate max-w-[200px]">
                {currentTab.filename}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-geo-subtle">Responsible:</span>
              <span className="text-geo-cyan truncate">{currentTab.owner}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-geo-subtle">Data Format:</span>
              <span className="text-geo-text">{currentTab.format}</span>
            </div>
          </div>

          {currentTab.downloadUrl ? (
            <a
              href={currentTab.downloadUrl}
              download={currentTab.downloadName}
              className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-xl bg-geo-elevated/80 hover:bg-geo-border text-geo-text border border-geo-border/60 font-mono text-xs font-medium transition-all duration-300 shadow-sm hover:-translate-y-0.5"
            >
              <Download className="w-3.5 h-3.5 text-geo-cyan" />
              <span>Download {currentTab.downloadName}</span>
            </a>
          ) : (
            <div className="text-center py-3 px-4 rounded-xl bg-geo-surface/40 text-geo-subtle text-xs font-mono border border-geo-border/40">
              Artifact generated during active pipeline run
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
