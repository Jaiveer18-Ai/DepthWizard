import React from 'react';
import {
  TrendingUp,
  Map,
  Compass,
  Maximize,
  Minimize,
  BarChart2,
  FileSpreadsheet,
} from 'lucide-react';
import { TerrainMetadata } from '../types';

interface AnalysisPanelProps {
  metadata: TerrainMetadata;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ metadata }) => {
  // Simulated transect elevation profile points for SVG curve
  const profilePoints = [
    { x: 0, y: metadata.minElevation + (metadata.elevationRange * 0.15) },
    { x: 50, y: metadata.minElevation + (metadata.elevationRange * 0.45) },
    { x: 100, y: metadata.minElevation + (metadata.elevationRange * 0.85) },
    { x: 150, y: metadata.minElevation + (metadata.elevationRange * 0.65) },
    { x: 200, y: metadata.minElevation + (metadata.elevationRange * 0.95) },
    { x: 250, y: metadata.minElevation + (metadata.elevationRange * 0.4) },
    { x: 300, y: metadata.minElevation + (metadata.elevationRange * 0.2) },
  ];

  // SVG coordinate transformation
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
    <div className="glass-panel rounded-xl p-5 border border-space-700/80 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gis-cyan" />
            Elevation & Geospatial Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Calibrated surface elevation statistics
          </p>
        </div>

        {metadata.isDemoData ? (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600/50">
            DEMO / SAMPLE VALUES
          </span>
        ) : (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600/50">
            CALIBRATED METRIC DSM
          </span>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Min Elevation */}
        <div className="p-3 rounded-lg bg-space-900/80 border border-space-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <Minimize className="w-3 h-3 text-gis-cyan" />
            <span>Min Elevation</span>
          </div>
          <p className="text-base font-mono font-bold text-white mt-1">
            {metadata.minElevation} <span className="text-xs font-normal text-slate-400">m</span>
          </p>
        </div>

        {/* Max Elevation */}
        <div className="p-3 rounded-lg bg-space-900/80 border border-space-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <Maximize className="w-3 h-3 text-amber-400" />
            <span>Max Elevation</span>
          </div>
          <p className="text-base font-mono font-bold text-white mt-1">
            {metadata.maxElevation} <span className="text-xs font-normal text-slate-400">m</span>
          </p>
        </div>

        {/* Elevation Range */}
        <div className="p-3 rounded-lg bg-space-900/80 border border-space-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <BarChart2 className="w-3 h-3 text-emerald-400" />
            <span>Relief Range</span>
          </div>
          <p className="text-base font-mono font-bold text-gis-cyan mt-1">
            {metadata.elevationRange} <span className="text-xs font-normal text-slate-400">m</span>
          </p>
        </div>

        {/* Average Slope */}
        <div className="p-3 rounded-lg bg-space-900/80 border border-space-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <Compass className="w-3 h-3 text-rose-400" />
            <span>Average Slope</span>
          </div>
          <p className="text-base font-mono font-bold text-white mt-1">
            {metadata.averageSlope}°
          </p>
        </div>
      </div>

      {/* Cross-Section Transect Profile Curve */}
      <div className="p-3 rounded-lg bg-space-950/60 border border-space-800">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
          <span>Terrain Elevation Transect (A → B Profile)</span>
          <span className="text-gis-cyan font-semibold">Z(x) Cross-Section</span>
        </div>
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-16 stroke-gis-cyan fill-none"
          >
            {/* Background grid lines */}
            <line x1="0" y1="15" x2={svgWidth} y2="15" stroke="#1e2b4a" strokeDasharray="3 3" />
            <line x1="0" y1="45" x2={svgWidth} y2="45" stroke="#1e2b4a" strokeDasharray="3 3" />
            {/* Area fill gradient */}
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`}
              fill="url(#elevationGrad)"
              stroke="none"
            />
            {/* Polyline stroke */}
            <polyline
              points={pointsString}
              stroke="#00f0ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Member 2 Handoff Parameters (Contract Section 7) */}
      <div className="p-3 rounded-lg bg-space-900/60 border border-space-800 font-mono text-[11px] space-y-1.5 text-slate-300">
        <div className="flex items-center gap-1 text-slate-400 font-semibold mb-1">
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
          <span>Member 2 → Member 3 GIS Handoff Spec:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-slate-400">
          <div>Units: <span className="text-white">{metadata.units}</span></div>
          <div>CRS: <span className="text-white">{metadata.crs}</span></div>
          <div>Resolution: <span className="text-white">{metadata.resolution}</span></div>
          <div>Calibration: <span className="text-gis-cyan">{metadata.calibrationMethod}</span></div>
          <div>Grid Dimensions: <span className="text-white">{metadata.shape ? `${metadata.shape[0]} × ${metadata.shape[1]}` : '512 × 512'}</span></div>
          <div>Format: <span className="text-white">{metadata.fileFormat}</span></div>
        </div>
      </div>
    </div>
  );
};
