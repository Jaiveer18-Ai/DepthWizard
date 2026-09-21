import React from 'react';
import { Plane, X, Compass } from 'lucide-react';

interface FlythroughControlsProps {
  isActive: boolean;
  onExit: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
}

export const FlythroughControls: React.FC<FlythroughControlsProps> = ({
  isActive,
  onExit,
  speed,
  onChangeSpeed,
}) => {
  if (!isActive) return null;

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 p-3 rounded-xl bg-space-950/85 border border-gis-cyan/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.2)] font-mono text-xs max-w-xs animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-space-800 pb-2">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-gis-cyan animate-pulse" />
          <span className="font-bold text-white tracking-wider">FLYTHROUGH MODE</span>
        </div>
        <button
          onClick={onExit}
          title="Exit Flythrough (ESC)"
          className="p-1 rounded-md bg-space-800 hover:bg-space-700 text-slate-300 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1 text-[11px] text-slate-300 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Navigation:</span>
          <span className="font-bold text-gis-cyan">Auto-Orbit / Cinematic Flight</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Manual Orbit:</span>
          <span className="text-slate-300">Left Click + Drag</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Altitude / Pan:</span>
          <span className="text-slate-300">Right Click + Drag</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Zoom / Thrust:</span>
          <span className="text-slate-300">Scroll Wheel</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Exit:</span>
          <span className="text-amber-400 font-bold">ESC key</span>
        </div>
      </div>

      {/* Flight Speed Slider */}
      <div className="pt-2 border-t border-space-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Compass className="w-3.5 h-3.5 text-gis-cyan" />
          <span>Flight Speed:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.2"
            value={speed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="w-20 h-1 bg-space-700 rounded-lg appearance-none cursor-pointer accent-gis-cyan"
          />
          <span className="text-gis-cyan font-bold w-6 text-right">{speed.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};
