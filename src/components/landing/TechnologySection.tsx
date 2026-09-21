import React from 'react';
import { Cpu, Map, Box, Eye } from 'lucide-react';

export const TechnologySection: React.FC = () => {
  const techCards = [
    {
      category: 'AI / Depth Estimation',
      member: 'Member 1 — AI / Depth',
      icon: Cpu,
      accent: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
      description: 'Monocular deep neural networks predicting continuous relative scene depth directly from single-view optical pixel gradients.',
      artifacts: ['depth.npy (NumPy 2D float32)', 'depth.png (Visualization Map)'],
      specs: ['Single optical RGB frame', 'Preserved native spatial shape (H, W)', 'Relative unitless depth'],
    },
    {
      category: 'GIS / Calibration',
      member: 'Member 2 — GIS / Calibration',
      icon: Map,
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
      description: 'Prototype linear mapping and scale transfer converting relative depth values into scaled elevation surface rasters.',
      artifacts: ['dsm.npy (Elevation Matrix)', 'dsm.png (DSM Color Map)', 'dsm.tif (GeoTIFF)'],
      specs: ['Calibrated Z-elevation reference', 'Digital Surface Model grid', 'Resolution & CRS parameters'],
    },
    {
      category: '3D Mesh Reconstruction',
      member: 'Member 3 — 3D / Integration',
      icon: Box,
      accent: 'border-blue-500/30 text-blue-400 bg-blue-950/20',
      description: 'Constructs indexed triangulated 3D mesh geometry from DSM elevation vertices and drapes original optical RGB imagery as continuous UV texture.',
      artifacts: ['terrain.glb (glTF 2.0 Binary)', 'terrain.html (Standalone Fallback)'],
      specs: ['Local scene coordinates', 'UV texture projection', 'Watertight triangulated mesh'],
    },
    {
      category: 'Visualization & Flight Engine',
      member: 'Member 4 — Frontend / Demo',
      icon: Eye,
      accent: 'border-geo-cyan/30 text-geo-cyan bg-geo-cyan/10',
      description: 'Interactive real-time 3D flight interface featuring orbit controls, dynamic height exaggeration, raycast point inspection, and cross-section analysis.',
      artifacts: ['WebGL / Three.js Canvas', 'Interactive Flythrough Engine'],
      specs: ['Z-elevation exaggeration (0.5x–3.0x)', 'Cross-section surface slice', 'Dynamic point inspection'],
    },
  ];

  return (
    <section id="technology" className="py-28 lg:py-36 bg-geo-bg border-t border-geo-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with generous margin */}
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-geo-surface text-geo-cyan border border-geo-border text-xs font-mono">
            <span>Engineering Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Built as a Geospatial AI Pipeline
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Four specialized modules cooperating through strict hand-off contracts defined in{' '}
            <code className="text-xs font-mono bg-geo-surface px-2 py-0.5 rounded text-geo-cyan border border-geo-border">
              contract.md
            </code>
            .
          </p>
        </div>

        {/* Spacious 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
          {techCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.category}
                className="geo-panel rounded-3xl p-8 sm:p-12 border border-geo-border/80 hover:border-geo-border hover:bg-geo-surface/80 transition-all space-y-7 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.accent} shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{card.category}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{card.member}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-geo-surface text-slate-400 border border-geo-border">
                      SIH 2026
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-5 pt-6 border-t border-geo-border/60">
                  {/* Contract Deliverables */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Contract Deliverables:
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {card.artifacts.map((art) => (
                        <span
                          key={art}
                          className="text-xs font-mono px-3 py-1.5 rounded-lg bg-geo-surface border border-geo-border text-slate-200"
                        >
                          {art}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Specifications:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-400">
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
