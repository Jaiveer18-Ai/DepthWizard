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
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-geo-surface/90 border border-geo-border backdrop-blur-md text-xs font-mono">
      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onResetView}
          title="Reset Camera to default perspective"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-geo-elevated hover:bg-geo-border text-geo-text border border-geo-border transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-geo-muted" />
          <span>RESET VIEW</span>
        </button>

        <button
          onClick={onToggleFlythrough}
          title="Toggle 3D Flythrough Camera Navigation"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border transition-all ${
            isFlythrough
              ? 'bg-geo-cyan text-geo-bg font-bold border-cyan-400 shadow-geo-glow'
              : 'bg-geo-elevated hover:bg-geo-border text-geo-text border-geo-border'
          }`}
        >
          <Plane className={`w-3.5 h-3.5 ${isFlythrough ? 'text-geo-bg' : 'text-geo-cyan'}`} />
          <span>FLYTHROUGH</span>
        </button>

        <button
          onClick={onToggleGrid}
          title="Toggle Ground Metric Reference Grid"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
            showGrid
              ? 'bg-geo-cyan/15 text-geo-cyan border-geo-cyan/40'
              : 'bg-geo-elevated hover:bg-geo-border text-geo-muted border-geo-border'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>GRID</span>
        </button>

        <button
          onClick={onToggleWireframe}
          title="Toggle Mesh Triangulation Wireframe"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
            isWireframe
              ? 'bg-geo-cyan/15 text-geo-cyan border-geo-cyan/40'
              : 'bg-geo-elevated hover:bg-geo-border text-geo-muted border-geo-border'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>WIREFRAME</span>
        </button>

        <button
          onClick={onToggleColorMode}
          title="Toggle between Draped RGB Satellite Texture and DSM Elevation Ramp"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-geo-elevated hover:bg-geo-border text-geo-text border border-geo-border transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-geo-cyan" />
          <span>{colorMode === 'texture' ? 'RGB TEXTURE' : 'DSM RAMP'}</span>
        </button>
      </div>

      {/* Sliders & Screen Expand */}
      <div className="flex items-center gap-3">
        {/* Height Exaggeration */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-geo-bg border border-geo-border">
          <Sliders className="w-3 h-3 text-geo-muted" />
          <span className="text-[11px] text-geo-muted">Z-Scale:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={verticalScale}
            onChange={(e) => onChangeVerticalScale(parseFloat(e.target.value))}
            className="w-16 h-1 bg-geo-border rounded-lg appearance-none cursor-pointer accent-geo-cyan"
            title="Vertical height exaggeration scale"
          />
          <span className="text-[11px] text-geo-cyan font-bold min-w-[28px]">
            {verticalScale.toFixed(1)}x
          </span>
        </div>

        {/* Sun Lighting */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-geo-bg border border-geo-border">
          <Sun className="w-3 h-3 text-amber-400" />
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={sunIntensity}
            onChange={(e) => onChangeSunIntensity(parseFloat(e.target.value))}
            className="w-14 h-1 bg-geo-border rounded-lg appearance-none cursor-pointer accent-amber-400"
            title="Directional sun lighting intensity"
          />
        </div>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand 3D Viewer Fullscreen'}
          className="p-2 rounded-lg bg-geo-elevated hover:bg-geo-border text-geo-muted hover:text-white border border-geo-border transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
