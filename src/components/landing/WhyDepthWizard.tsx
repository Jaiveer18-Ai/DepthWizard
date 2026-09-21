import React from 'react';
import { AlertCircle, CheckCircle2, Satellite, Zap } from 'lucide-react';

export const WhyDepthWizard: React.FC = () => {
  return (
    <section id="why-depthwizard" className="py-28 lg:py-36 bg-geo-bg border-t border-geo-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with generous margin */}
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-geo-surface text-geo-cyan border border-geo-border text-xs font-mono">
            <span>Problem & Breakthrough</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Why DepthWizard?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Conventional 3D surface reconstruction relies on expensive specialized hardware, multiple overlapping passes,
            or complex radar phase unwrapping. DepthWizard unlocks metric 3D elevation from a single optical frame.
          </p>
        </div>

        {/* Side-by-Side Comparison Cards with ample gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Traditional Card */}
          <div className="geo-panel rounded-3xl p-8 sm:p-12 space-y-8 border border-geo-border/80 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0">
                    <Satellite className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Traditional Methods</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Conventional 3D Elevation Workflows</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/50">
                  Resource Heavy
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Standard topographic survey workflows impose prohibitive constraints on logistics, turnaround, and cost:
              </p>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-white">LiDAR Sensors:</strong> High capital expenditure, specialized aircraft integration, and severe payload constraints.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-white">Stereo Satellite Pairs:</strong> Requires multiple synchronized satellite passes with strict orbital geometry.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-white">InSAR Radar:</strong> Sensitive to temporal decorrelation, atmospheric phase delays, and speckle noise.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-white">Hours to Days Turnaround:</strong> Heavy multi-view matching, bundle adjustment, and manual ground control.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-geo-border/60 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Hardware Dependency: High</span>
              <span>Constellation: Multi-Pass</span>
            </div>
          </div>

          {/* DepthWizard Card */}
          <div className="geo-panel rounded-3xl p-8 sm:p-12 space-y-8 border border-geo-cyan/40 bg-geo-surface/80 relative overflow-hidden shadow-geo-glow flex flex-col justify-between">
            {/* Ambient Corner Blur */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-geo-cyan/10 blur-3xl rounded-full pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-geo-cyan/15 border border-geo-cyan/40 flex items-center justify-center text-geo-cyan shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">DepthWizard Pipeline</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Single-View Deep Learning + Calibration</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-geo-cyan/15 text-geo-cyan border border-geo-cyan/40">
                  Single Frame
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                DepthWizard delivers instant end-to-end 3D surface modeling from any single optical photograph:
              </p>

              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-geo-cyan shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-white">Single Optical RGB Input:</strong> Compatible with off-the-shelf drone, aerial survey, or commercial satellite imagery.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-geo-cyan shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-white">Monocular Depth AI:</strong> Leverages foundational vision models to infer relative scene relief directly from visual cues.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-geo-cyan shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-white">GIS Elevation Calibration:</strong> Translates relative depth into an elevation surface raster (DSM) with metric scaling.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-geo-cyan shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-white">Interactive 3D Flythrough:</strong> Produces watertight 3D terrain meshes with draped RGB texture for instant WebGL flight.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-geo-border/60 flex items-center justify-between text-xs font-mono text-geo-cyan">
              <span>Hardware Dependency: None</span>
              <span>Turnaround: Near Real-Time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
