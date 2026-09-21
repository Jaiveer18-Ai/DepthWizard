import React from 'react';
import { Layers } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const Footer: React.FC = () => {
  const footerRef = useScrollReveal<HTMLElement>();

  return (
    <footer ref={footerRef} className="w-full bg-geo-bg-alt relative overflow-hidden">
      {/* Top Gradient Divider */}
      <div className="section-divider" />

      <div className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-xs font-mono text-geo-muted">
        <div className="reveal max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand & Project Info */}
          <div className="space-y-2.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-geo-surface/80 border border-geo-border/60 flex items-center justify-center text-geo-cyan">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-geo-text">DepthWizard</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-geo-surface/80 text-geo-cyan border border-geo-border/60">
                SIH 2026 • PS 26175
              </span>
            </div>
            <p className="text-geo-subtle">
              Single-View Height Estimation & 3D Flythrough
            </p>
          </div>

          {/* 4-Member Architecture Contract */}
          <div className="text-center md:text-right space-y-1.5">
            <p className="text-geo-text font-medium">
              4-Member Architecture Contract (contract.md)
            </p>
            <p className="text-geo-subtle text-[11px]">
              AI/Depth → GIS/Calibration → 3D/Integration → Frontend/Demo
            </p>
          </div>
        </div>

        <div className="reveal reveal-delay-2 max-w-7xl mx-auto mt-10 pt-8 border-t border-geo-border/30 text-center text-geo-subtle text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Smart India Hackathon (SIH) 2026 Demo Presentation</span>
          <span>Built strictly adhering to integration contract</span>
        </div>
      </div>
    </footer>
  );
};
