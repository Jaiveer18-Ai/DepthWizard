import React from 'react';
import { AlertCircle, CheckCircle2, Satellite, Zap } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const WhyDepthWizard: React.FC = () => {
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section id="why-depthwizard" ref={sectionRef} className="py-36 lg:py-48 bg-geo-bg relative overflow-hidden">
      {/* Section Top Divider */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[400px] bg-rose-500/3 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[400px] bg-geo-cyan/4 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
          <div className="reveal reveal-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-geo-surface/70 text-geo-cyan border border-geo-border/60 text-xs font-mono backdrop-blur-md">
            <span>Problem & Breakthrough</span>
          </div>
          <h2 className="reveal reveal-delay-2 text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-white">
            Why DepthWizard?
          </h2>
          <p className="reveal reveal-delay-3 text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
            Conventional 3D surface reconstruction relies on expensive specialized hardware, multiple overlapping passes,
            or complex radar phase unwrapping. DepthWizard unlocks metric 3D elevation from a single optical frame.
          </p>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Traditional Card */}
          <div className="reveal reveal-delay-3 geo-panel geo-panel-hover rounded-3xl p-10 sm:p-14 space-y-10 border border-geo-border/60 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-800/30 flex items-center justify-center text-rose-400 shrink-0 animate-float-slower">
                    <Satellite className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Traditional Methods</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">Conventional 3D Elevation Workflows</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-rose-950/50 text-rose-400 border border-rose-800/40">
                  Resource Heavy
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Standard topographic survey workflows impose prohibitive constraints on logistics, turnaround, and cost:
              </p>

              <ul className="space-y-6 text-sm text-slate-300">
                {[
                  { label: 'LiDAR Sensors:', text: 'High capital expenditure, specialized aircraft integration, and severe payload constraints.' },
                  { label: 'Stereo Satellite Pairs:', text: 'Requires multiple synchronized satellite passes with strict orbital geometry.' },
                  { label: 'InSAR Radar:', text: 'Sensitive to temporal decorrelation, atmospheric phase delays, and speckle noise.' },
                  { label: 'Hours to Days Turnaround:', text: 'Heavy multi-view matching, bundle adjustment, and manual ground control.' },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-white">{item.label}</strong> {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 border-t border-geo-border/40 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Hardware Dependency: High</span>
              <span>Constellation: Multi-Pass</span>
            </div>
          </div>

          {/* DepthWizard Card */}
          <div className="reveal reveal-delay-4 geo-panel geo-panel-hover rounded-3xl p-10 sm:p-14 space-y-10 border border-geo-cyan/30 bg-geo-surface/60 relative overflow-hidden shadow-geo-glow flex flex-col justify-between">
            {/* Ambient Corner Blur */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-geo-cyan/8 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />

            <div className="space-y-8 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-geo-cyan/15 border border-geo-cyan/30 flex items-center justify-center text-geo-cyan shrink-0 animate-float">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">DepthWizard Pipeline</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">Single-View Deep Learning + Calibration</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-geo-cyan/15 text-geo-cyan border border-geo-cyan/30">
                  Single Frame
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                DepthWizard delivers instant end-to-end 3D surface modeling from any single optical photograph:
              </p>

              <ul className="space-y-6 text-sm text-slate-200">
                {[
                  { label: 'Single Optical RGB Input:', text: 'Compatible with off-the-shelf drone, aerial survey, or commercial satellite imagery.' },
                  { label: 'Monocular Depth AI:', text: 'Leverages foundational vision models to infer relative scene relief directly from visual cues.' },
                  { label: 'GIS Elevation Calibration:', text: 'Translates relative depth into an elevation surface raster (DSM) with metric scaling.' },
                  { label: 'Interactive 3D Flythrough:', text: 'Produces watertight 3D terrain meshes with draped RGB texture for instant WebGL flight.' },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-geo-cyan shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-white">{item.label}</strong> {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 border-t border-geo-cyan/20 flex items-center justify-between text-xs font-mono text-geo-cyan">
              <span>Hardware Dependency: None</span>
              <span>Turnaround: Near Real-Time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
