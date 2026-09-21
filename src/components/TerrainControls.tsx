import React from 'react';
import {
  RotateCcw,
  Plane,
  Grid,
  Maximize2,
  Minimize2,
  Box,
  Eye,
  Sliders,
  Sun,
} from 'lucide-react';

interface TerrainControlsProps {
  onResetView: () => void;
  isFlythrough: boolean;
  onToggleFlythrough: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  isWireframe: boolean;
  onToggleWireframe: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  verticalScale: number;
  onChangeVerticalScale: (scale: number) => void;
  colorMode: 'texture' | 'elevation';
  onToggleColorMode: () => void;
  sunIntensity: number;
  onChangeSunIntensity: (val: number) => void;
}

export const TerrainControls: React.FC<TerrainControlsProps> = ({
  onResetView,
  isFlythrough,
  onToggleFlythrough,
  showGrid,
  onToggleGrid,
  isWireframe,
  onToggleWireframe,
  isFullscreen,
  onToggleFullscreen,
  verticalScale,
  onChangeVerticalScale,
  colorMode,
  onToggleColorMode,
  sunIntensity,
  onChangeSunIntensity,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-space-900/90 border border-space-700/80 backdrop-blur-md text-xs font-mono">
      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={onResetView}
          title="Reset Camera View to default perspective"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 hover:text-white border border-space-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>RESET VIEW</span>
        </button>

        <button
          onClick={onToggleFlythrough}
          title="Toggle 3D Flythrough Camera Mode"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            isFlythrough
              ? 'bg-gis-cyan text-space-950 font-bold border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-space-800 hover:bg-space-700 text-slate-200 border-space-700'
          }`}
        >
          <Plane className={`w-3.5 h-3.5 ${isFlythrough ? 'text-space-950' : 'text-gis-cyan'}`} />
          <span>FLYTHROUGH</span>
        </button>

        <button
          onClick={onToggleGrid}
          title="Toggle Ground Reference Grid"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
            showGrid
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
              : 'bg-space-800 hover:bg-space-700 text-slate-300 border-space-700'
          }`}
        >
          <Grid className="w-3.5 h-3.5 text-slate-400" />
          <span>GRID</span>
        </button>

        <button
          onClick={onToggleWireframe}
          title="Toggle Mesh Triangulation Wireframe"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
            isWireframe
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
              : 'bg-space-800 hover:bg-space-700 text-slate-300 border-space-700'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-slate-400" />
          <span>WIREFRAME</span>
        </button>

        <button
          onClick={onToggleColorMode}
          title="Toggle between RGB Draped Texture and Elevation Colormap"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 border border-space-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>{colorMode === 'texture' ? 'RGB TEXTURE' : 'DSM RAMP'}</span>
        </button>
      </div>

      {/* Sliders & Fullscreen */}
      <div className="flex items-center gap-3">
        {/* Height Exaggeration */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-space-950/60 border border-space-800">
          <Sliders className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] text-slate-400">Z-Scale:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={verticalScale}
            onChange={(e) => onChangeVerticalScale(parseFloat(e.target.value))}
            className="w-16 h-1 bg-space-700 rounded-lg appearance-none cursor-pointer accent-gis-cyan"
            title="Terrain vertical scale / height exaggeration"
          />
          <span className="text-[11px] text-gis-cyan font-bold min-w-[28px]">
            {verticalScale.toFixed(1)}x
          </span>
        </div>

        {/* Sun Lighting */}
        <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-lg bg-space-950/60 border border-space-800">
          <Sun className="w-3 h-3 text-amber-400" />
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={sunIntensity}
            onChange={(e) => onChangeSunIntensity(parseFloat(e.target.value))}
            className="w-14 h-1 bg-space-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            title="Directional sun light intensity"
          />
        </div>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand 3D Viewer'}
          className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-300 hover:text-white border border-space-700 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
