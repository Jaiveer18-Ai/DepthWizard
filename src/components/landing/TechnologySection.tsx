import React from 'react';
import { Cpu, Map, Box, Eye } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const TechnologySection: React.FC = () => {
  const sectionRef = useScrollReveal<HTMLElement>();

  const techCards = [
    {
      category: 'AI / Depth Estimation',
      member: 'Member 1 — AI / Depth',
      icon: Cpu,
      accent: 'border-amber-500/25 text-amber-400 bg-amber-950/20',
      accentGlow: 'bg-amber-500/4',
      description: 'Monocular deep neural networks predicting continuous relative scene depth directly from single-view optical pixel gradients.',
      artifacts: ['depth.npy (NumPy 2D float32)', 'depth.png (Visualization Map)'],
      specs: ['Single optical RGB frame', 'Preserved native spatial shape (H, W)', 'Relative unitless depth'],
    },
    {
      category: 'GIS / Calibration',
      member: 'Member 2 — GIS / Calibration',
      icon: Map,
      accent: 'border-emerald-500/25 text-emerald-400 bg-emerald-950/20',
      accentGlow: 'bg-emerald-500/4',
      description: 'Prototype linear mapping and scale transfer converting relative depth values into scaled elevation surface rasters.',
      artifacts: ['dsm.npy (Elevation Matrix)', 'dsm.png (DSM Color Map)', 'dsm.tif (GeoTIFF)'],
      specs: ['Calibrated Z-elevation reference', 'Digital Surface Model grid', 'Resolution & CRS parameters'],
    },
    {
      category: '3D Mesh Reconstruction',
      member: 'Member 3 — 3D / Integration',
      icon: Box,
      accent: 'border-blue-500/25 text-blue-400 bg-blue-950/20',
      accentGlow: 'bg-blue-500/4',
      description: 'Constructs indexed triangulated 3D mesh geometry from DSM elevation vertices and drapes original optical RGB imagery as continuous UV texture.',
      artifacts: ['terrain.glb (glTF 2.0 Binary)', 'terrain.html (Standalone Fallback)'],
      specs: ['Local scene coordinates', 'UV texture projection', 'Watertight triangulated mesh'],
    },
    {
      category: 'Visualization & Flight',
      member: 'Member 4 — Frontend / Demo',
      icon: Eye,
      accent: 'border-geo-cyan/25 text-geo-cyan bg-geo-cyan/10',
      accentGlow: 'bg-geo-cyan/4',
      description: 'Interactive real-time 3D flight interface featuring orbit controls, dynamic height exaggeration, raycast point inspection, and cross-section analysis.',
      artifacts: ['WebGL / Three.js Canvas', 'Interactive Flythrough Engine'],
      specs: ['Z-elevation exaggeration (0.5x–3.0x)', 'Cross-section surface slice', 'Dynamic point inspection'],
    },
  ];

  return (
    <section id="technology" ref={sectionRef} className="py-36 lg:py-48 bg-geo-bg relative overflow-hidden">
      {/* Section Top Divider */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      {/* Ambient Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-500/3 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
          <div className="reveal reveal-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-geo-surface/70 text-geo-cyan border border-geo-border/60 text-xs font-mono backdrop-blur-md">
            <span>Engineering Architecture</span>
          </div>
          <h2 className="reveal reveal-delay-2 text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-white">
            Built as a Geospatial AI Pipeline
          </h2>
          <p className="reveal reveal-delay-3 text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
            Four specialized modules cooperating through strict hand-off contracts defined in{' '}
            <code className="text-xs font-mono bg-geo-surface/80 px-2.5 py-1 rounded-lg text-geo-cyan border border-geo-border/60">
              contract.md
            </code>
            .
          </p>
        </div>

        {/* Spacious 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          {techCards.map((card, idx) => {
            const Icon = card.icon;

            return (
              <div
                key={card.category}
                className={`reveal reveal-delay-${Math.min(idx + 2, 6)} geo-panel geo-panel-hover rounded-3xl p-10 sm:p-14 border border-geo-border/50 transition-all space-y-8 flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Ambient Card Glow */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 ${card.accentGlow} blur-[60px] rounded-full pointer-events-none`} />

                <div className="space-y-7 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${card.accent} shrink-0 animate-float-slow`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{card.category}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-1">{card.member}</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline text-xs font-mono px-3 py-1.5 rounded-full bg-geo-surface/80 text-slate-400 border border-geo-border/60">
                      SIH 2026
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-6 pt-7 border-t border-geo-border/40 relative z-10">
                  {/* Contract Deliverables */}
                  <div className="space-y-3">
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Contract Deliverables:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {card.artifacts.map((art) => (
                        <span
                          key={art}
                          className="text-xs font-mono px-3.5 py-2 rounded-xl bg-geo-surface/80 border border-geo-border/60 text-slate-200 transition-colors hover:border-geo-cyan/30 hover:text-geo-cyan"
                        >
                          {art}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Specifications:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono text-slate-400">
                      {card.specs.map((spec) => (
                        <span key={spec} className="truncate">
                          • {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
