import React from 'react';
import { Layers, Activity, Sparkles, RefreshCw } from 'lucide-react';
import { SystemStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface NavbarProps {
  status: SystemStatus;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onRefresh: () => void;
  isScanning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  isDemoMode,
  onToggleDemoMode,
  onRefresh,
  isScanning,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-space-700/70 bg-space-950/80 backdrop-blur-md">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gis-cyan/20 to-blue-600/20 border border-gis-cyan/30 flex items-center justify-center text-gis-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                DepthWizard
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gis-cyan/10 text-gis-cyan border border-gis-cyan/30">
                  SIH 2026 • PS 26175
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Single-View Height Estimation & 3D Flythrough
            </p>
          </div>
        </div>

        {/* Right Controls: Mode Toggle & Status Indicator */}
        <div className="flex items-center gap-3">
          {/* Refresh file scan */}
          <button
            onClick={onRefresh}
            disabled={isScanning}
            title="Scan outputs/ directory for new pipeline files"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-slate-300 bg-space-900 border border-space-700/80 hover:border-gis-cyan/40 hover:text-gis-cyan transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-gis-cyan' : ''}`} />
            <span>Scan outputs/</span>
          </button>

          {/* Demo Mode Switcher */}
          <button
            onClick={onToggleDemoMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-all ${
              isDemoMode
                ? 'bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/40'
                : 'bg-space-900 text-slate-300 border-space-700 hover:border-slate-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isDemoMode ? 'Demo Fallback ON' : 'Live Outputs Mode'}</span>
          </button>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2 pl-2 border-l border-space-800">
            <Activity className="w-4 h-4 text-slate-400" />
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </header>
  );
};
