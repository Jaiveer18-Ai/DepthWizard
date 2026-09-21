import React from 'react';
import { Layers, Github, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-geo-border/80 bg-geo-bg-alt py-12 px-4 sm:px-6 lg:px-8 text-xs font-mono text-geo-muted">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Project Info */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="w-6 h-6 rounded-md bg-geo-surface border border-geo-border flex items-center justify-center text-geo-cyan">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-geo-text">DepthWizard</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-geo-surface text-geo-cyan border border-geo-border">
              SIH 2026 • PS 26175
            </span>
          </div>
          <p className="text-geo-subtle">
            Single-View Height Estimation & 3D Flythrough
          </p>
        </div>

        {/* 4-Member Architecture Contract reminder */}
        <div className="text-center md:text-right space-y-1">
          <p className="text-geo-text font-medium">
            4-Member Architecture Contract (contract.md)
          </p>
          <p className="text-geo-subtle text-[11px]">
            AI/Depth → GIS/Calibration → 3D/Integration → Frontend/Demo
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-geo-border/40 text-center text-geo-subtle text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Smart India Hackathon (SIH) 2026 Demo Presentation</span>
        <span>Built strictly adhering to integration contract</span>
      </div>
    </footer>
  );
};
