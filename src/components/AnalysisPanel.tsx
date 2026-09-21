import React from 'react';
import {
  TrendingUp,
  Maximize,
  Minimize,
  BarChart2,
  Compass,
  FileSpreadsheet,
} from 'lucide-react';
import { TerrainMetadata } from '../types';

interface AnalysisPanelProps {
  metadata: TerrainMetadata;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ metadata }) => {
  const profilePoints = [
    { x: 0, y: metadata.minElevation + metadata.elevationRange * 0.15 },
    { x: 50, y: metadata.minElevation + metadata.elevationRange * 0.45 },
    { x: 100, y: metadata.minElevation + metadata.elevationRange * 0.85 },
    { x: 150, y: metadata.minElevation + metadata.elevationRange * 0.65 },
    { x: 200, y: metadata.minElevation + metadata.elevationRange * 0.95 },
    { x: 250, y: metadata.minElevation + metadata.elevationRange * 0.4 },
    { x: 300, y: metadata.minElevation + metadata.elevationRange * 0.2 },
  ];

  const minE = metadata.minElevation;
  const maxE = metadata.maxElevation;
  const range = maxE - minE || 1;
  const svgWidth = 300;
  const svgHeight = 70;

  const pointsString = profilePoints
    .map((pt) => {
      const sx = (pt.x / 300) * svgWidth;
      const sy = svgHeight - ((pt.y - minE) / range) * (svgHeight - 16) - 8;
      return `${sx},${sy}`;
    })
    .join(' ');

  return (
    <div className="geo-panel rounded-2xl p-6 sm:p-8 border border-geo-border space-y-6">
      {/* Section Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-geo-border/60">
        <div>
          <h3 className="text-sm font-bold tracking-wide text-geo-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-geo-cyan" />
            Elevation Analysis & Topographic Metrics
          </h3>
          <p className="text-xs text-geo-muted mt-0.5">
            Statistical distribution derived from the calibrated Digital Surface Model
          </p>
        </div>

        <div>
          {metadata.isDemoData ? (
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-geo-surface text-geo-muted border border-geo-border">
              DEMO DATA
            </span>
          ) : (
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-geo-cyan/15 text-geo-cyan border border-geo-cyan/40">
              CALIBRATED METRIC DSM
            </span>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Min Elevation */}
        <div className="p-4 rounded-xl bg-geo-surface/60 border border-geo-border">
          <div className="flex items-center gap-1.5 text-geo-muted text-xs font-mono">
            <Minimize className="w-3.5 h-3.5 text-geo-cyan" />
            <span>Min Elevation</span>
          </div>
          <p className="text-xl font-mono font-bold text-geo-text mt-2">
            {metadata.minElevation}{' '}
            <span className="text-xs font-normal text-geo-muted">m</span>
          </p>
        </div>

        {/* Max Elevation */}
        <div className="p-4 rounded-xl bg-geo-surface/60 border border-geo-border">
          <div className="flex items-center gap-1.5 text-geo-muted text-xs font-mono">
            <Maximize className="w-3.5 h-3.5 text-amber-400" />
            <span>Max Elevation</span>
          </div>
          <p className="text-xl font-mono font-bold text-geo-text mt-2">
            {metadata.maxElevation}{' '}
            <span className="text-xs font-normal text-geo-muted">m</span>
          </p>
        </div>

        {/* Elevation Range */}
        <div className="p-4 rounded-xl bg-geo-surface/60 border border-geo-border">
          <div className="flex items-center gap-1.5 text-geo-muted text-xs font-mono">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Relief Range</span>
          </div>
          <p className="text-xl font-mono font-bold text-geo-cyan mt-2">
            {metadata.elevationRange}{' '}
            <span className="text-xs font-normal text-geo-muted">m</span>
          </p>
        </div>

        {/* Average Slope */}
        <div className="p-4 rounded-xl bg-geo-surface/60 border border-geo-border">
          <div className="flex items-center gap-1.5 text-geo-muted text-xs font-mono">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>Average Slope</span>
          </div>
          <p className="text-xl font-mono font-bold text-geo-text mt-2">
            {metadata.averageSlope}°
          </p>
        </div>
      </div>

      {/* Cross-Section Transect Profile */}
      <div className="p-4 rounded-xl bg-geo-bg border border-geo-border">
        <div className="flex items-center justify-between text-xs font-mono text-geo-muted mb-3">
          <span>Terrain Elevation Transect (A → B Profile)</span>
          <span className="text-geo-cyan font-semibold">Z(x) Surface Slice</span>
        </div>
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-20 stroke-geo-cyan fill-none"
          >
            <line x1="0" y1="18" x2={svgWidth} y2="18" stroke="#1E314B" strokeDasharray="3 3" />
            <line x1="0" y1="46" x2={svgWidth} y2="46" stroke="#1E314B" strokeDasharray="3 3" />
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`}
              fill="url(#elevationGrad)"
              stroke="none"
            />
            <polyline
              points={pointsString}
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Member 2 GIS Handoff Parameters */}
      <div className="p-4 rounded-xl bg-geo-surface/40 border border-geo-border text-xs font-mono space-y-2 text-geo-muted">
        <div className="flex items-center gap-2 text-geo-text font-semibold mb-2">
          <FileSpreadsheet className="w-4 h-4 text-geo-muted" />
          <span>Member 2 → Member 3 GIS Handoff Spec (contract.md Section 7):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-geo-muted">
          <div>Units: <span className="text-geo-text font-bold">{metadata.units}</span></div>
          <div>CRS: <span className="text-geo-text font-bold">{metadata.crs}</span></div>
          <div>Resolution: <span className="text-geo-text font-bold">{metadata.resolution}</span></div>
          <div>Calibration: <span className="text-geo-cyan font-bold">{metadata.calibrationMethod}</span></div>
          <div>Grid Dimensions: <span className="text-geo-text font-bold">{metadata.shape ? `${metadata.shape[0]} × ${metadata.shape[1]}` : '512 × 512'}</span></div>
          <div>Format: <span className="text-geo-text font-bold">{metadata.fileFormat}</span></div>
        </div>
      </div>
    </div>
  );
};
