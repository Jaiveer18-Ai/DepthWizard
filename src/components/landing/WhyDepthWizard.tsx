import React from 'react';
import { AlertCircle, CheckCircle2, Cpu, Satellite, Radio, Zap, Clock, Compass } from 'lucide-react';

export const WhyDepthWizard: React.FC = () => {
  return (
    <section id="why-depthwizard" className="py-20 lg:py-28 bg-geo-bg border-t border-geo-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-geo-surface text-geo-cyan border border-geo-border text-xs font-mono">
            <span>Problem & Breakthrough</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-geo-text">
            Why DepthWizard?
          </h2>
          <p className="text-base text-geo-muted leading-relaxed">
            Conventional 3D surface reconstruction relies on specialized equipment, multi-view passes,
            or active radar sensors. DepthWizard unlocks metric 3D elevation from a single optical frame.
          </p>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Traditional Methods Card */}
          <div className="geo-panel rounded-2xl p-7 sm:p-8 space-y-6 border border-geo-border/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-center text-rose-400">
                  <Satellite className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-geo-text">Traditional Methods</h3>
                  <p className="text-xs text-geo-muted">Conventional 3D Elevation Workflows</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/50">
                Resource Heavy
              </span>
            </div>

            <p className="text-xs text-geo-muted leading-relaxed">
              Standard topographic modeling requires specialized satellite constellations or aerial survey flights:
            </p>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">LiDAR Sensors:</strong> Prohibitive hardware cost,
                  complex mission planning, and high payload weight.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Stereo Satellite Pairs:</strong> Requires multiple synchronized
                  orbital passes with precise baselines.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">InSAR Radar:</strong> Severe speckle noise, geometric distortions,
                  and intricate phase-unwrapping requirements.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Slow Turnaround:</strong> Hours to days of photogrammetric
                  bundle adjustment and dense cloud matching.
                </span>
              </li>
            </ul>
          </div>

          {/* DepthWizard Single-View Card */}
          <div className="geo-panel rounded-2xl p-7 sm:p-8 space-y-6 border border-geo-cyan/40 bg-geo-surface/80 relative overflow-hidden shadow-geo-glow">
            {/* Corner accent gradient */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-geo-cyan/10 blur-2xl rounded-full pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-geo-cyan/15 border border-geo-cyan/40 flex items-center justify-center text-geo-cyan">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-geo-text">DepthWizard Pipeline</h3>
                  <p className="text-xs text-geo-muted">Single-View Deep Learning + Calibration</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-geo-cyan/15 text-geo-cyan border border-geo-cyan/40">
                Single Frame
              </span>
            </div>

            <p className="text-xs text-geo-muted leading-relaxed">
              DepthWizard achieves rapid 3D terrain modeling directly from any single optical RGB image:
            </p>

            <ul className="space-y-3.5 text-xs text-slate-200">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-geo-cyan shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Single Optical RGB Input:</strong> Works with standard drone,
                  satellite, or aerial camera frames without specialized hardware.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-geo-cyan shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Monocular Depth AI:</strong> Leverages deep neural architectures
                  to infer relative surface relief directly from visual cues.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-geo-cyan shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">GIS Elevation Calibration:</strong> Converts unitless relative depth
                  into calibrated digital surface models (DSM).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-geo-cyan shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Interactive 3D Flythrough:</strong> Generates watertight 3D terrain meshes
                  draped with RGB texture ready for real-time WebGL exploration.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
