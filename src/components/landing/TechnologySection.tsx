import React from 'react';
import { Cpu, Map, Box, Eye, FileCode2, Layers, HardDrive } from 'lucide-react';

export const TechnologySection: React.FC = () => {
  const techCards = [
    {
      category: 'AI / Depth Estimation',
      member: 'Member 1',
      icon: Cpu,
      accent: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
      description: 'Monocular deep neural networks predicting relative geometric scene depth from 2D pixel gradients.',
      artifacts: ['depth.npy (NumPy 2D float32)', 'depth.png (Visual map)'],
      specs: ['Single optical RGB', '2D array shape (H, W)', 'Relative depth scale'],
    },
    {
      category: 'GIS / Calibration',
      member: 'Member 2',
      icon: Map,
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
      description: 'Prototype linear transfer & scale calibration transforming relative depth into calibrated surface elevation.',
      artifacts: ['dsm.npy (Elevation matrix)', 'dsm.png (Surface map)', 'dsm.tif (GeoTIFF)'],
      specs: ['Z-elevation calibration', 'Raster DSM grid', 'Resolution & CRS mapping'],
    },
    {
      category: '3D Mesh Reconstruction',
      member: 'Member 3',
      icon: Box,
      accent: 'border-blue-500/30 text-blue-400 bg-blue-950/20',
      description: 'Triangulation of DSM elevation vertices into high-performance watertight 3D models with draped RGB textures.',
      artifacts: ['terrain.glb (Binary glTF)', 'terrain.html (Standalone fallback)'],
      specs: ['Local scene coordinates', 'Draped RGB texture', 'Triangulated heightfield'],
    },
    {
      category: 'WebGL Visualization & Flight',
      member: 'Member 4',
      icon: Eye,
      accent: 'border-geo-cyan/30 text-geo-cyan bg-geo-cyan/10',
      description: 'Interactive real-time 3D exploration interface with orbit controls, flight simulation, and cross-section analysis.',
      artifacts: ['Three.js / React Three Fiber', 'Interactive Flythrough Engine'],
      specs: ['Vertical Z-scale control', 'Cross-section transect', 'Real-time raycast inspection'],
    },
  ];

  return (
    <section id="technology" className="py-20 lg:py-28 bg-geo-bg border-t border-geo-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-geo-surface text-geo-cyan border border-geo-border text-xs font-mono">
            <span>Engineering Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-geo-text">
            Built as a Geospatial AI Pipeline
          </h2>
          <p className="text-base text-geo-muted leading-relaxed">
            Four specialized modules cooperating through strict hand-off contracts defined in{' '}
            <code className="text-xs font-mono bg-geo-surface px-1.5 py-0.5 rounded text-geo-text border border-geo-border">
              contract.md
            </code>
            .
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {techCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.category}
                className="geo-panel rounded-2xl p-7 border border-geo-border/80 hover:border-geo-border hover:bg-geo-surface/80 transition-all space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-geo-text">{card.category}</h3>
                      <p className="text-xs text-geo-muted">{card.member} Scope</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-geo-surface text-geo-muted border border-geo-border">
                    SIH 2026
                  </span>
                </div>

                <p className="text-xs text-geo-muted leading-relaxed">
                  {card.description}
                </p>

                {/* Contract Deliverables */}
                <div className="space-y-2 pt-2 border-t border-geo-border/60">
                  <p className="text-[11px] font-mono text-geo-subtle uppercase tracking-wider">
                    Contract Outputs / Hand-off:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {card.artifacts.map((art) => (
                      <span
                        key={art}
                        className="text-xs font-mono px-2.5 py-1 rounded-md bg-geo-surface border border-geo-border text-slate-200"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-mono text-geo-subtle uppercase tracking-wider">
                    Specifications:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-geo-muted">
                    {card.specs.map((spec) => (
                      <span key={spec} className="truncate">
                        • {spec}
                      </span>
                    ))}
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
