import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Mountain,
  Layers,
  Box,
  Plane,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { generateSyntheticPreviewUrl } from '../../data/demoData';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'RGB Image Input',
      subtitle: 'Single Optical Frame',
      role: 'Input / Golden Sample',
      desc: 'Takes any single optical satellite or aerial photograph as input without requiring stereo pairs or LiDAR sensors.',
      icon: ImageIcon,
      previewType: 'rgb' as const,
      tag: 'data/sample/input.png',
    },
    {
      step: '02',
      title: 'Depth Estimation',
      subtitle: 'Monocular Relative Depth',
      role: 'Member 1 — AI / Depth',
      desc: 'Deep neural networks extract high-frequency structural relief cues, producing a float32 relative depth array.',
      icon: Mountain,
      previewType: 'depth' as const,
      tag: 'outputs/depth.npy & depth.png',
    },
    {
      step: '03',
      title: 'GIS Calibration',
      subtitle: 'Calibrated Elevation / DSM',
      role: 'Member 2 — GIS / Calibration',
      desc: 'Transforms relative depth values into scaled elevation surface rasters, yielding an elevation Digital Surface Model.',
      icon: Layers,
      previewType: 'dsm' as const,
      tag: 'outputs/dsm.npy & dsm.png',
    },
    {
      step: '04',
      title: '3D Reconstruction',
      subtitle: 'Triangulated Mesh & Texture',
      role: 'Member 3 — 3D / Integration',
      desc: 'Constructs 3D mesh geometry from DSM elevation vertices and drapes the original RGB imagery as a continuous texture.',
      icon: Box,
      previewType: 'rgb' as const,
      tag: 'outputs/terrain.glb',
    },
    {
      step: '05',
      title: 'Interactive Flythrough',
      subtitle: 'Cinematic WebGL Exploration',
      role: 'Member 4 — Frontend / Demo',
      desc: 'Delivers a real-time 3D flight experience with orbit controls, height exaggeration, wireframe inspection, and GIS analysis.',
      icon: Plane,
      previewType: 'dsm' as const,
      tag: 'Interactive WebGL UI',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-geo-bg-alt border-t border-geo-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-geo-surface text-geo-cyan border border-geo-border text-xs font-mono">
            <span>Sequential 4-Member Contract</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-geo-text">
            How DepthWizard Works
          </h2>
          <p className="text-base text-geo-muted leading-relaxed">
            From single-view optical pixels to a watertight 3D terrain flight — five streamlined
            milestones governed by the integration contract.
          </p>
        </div>

        {/* 5-Step Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-5">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeStep === idx;

            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(idx)}
                className={`geo-panel rounded-2xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-geo-cyan bg-geo-elevated shadow-geo-glow -translate-y-1'
                    : 'border-geo-border hover:border-geo-border/80 hover:bg-geo-surface/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-geo-cyan text-geo-bg'
                          : 'bg-geo-surface text-geo-muted border border-geo-border'
                      }`}
                    >
                      {item.step}
                    </span>
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? 'text-geo-cyan' : 'text-geo-subtle'
                      }`}
                    />
                  </div>

                  <h3 className="text-sm font-bold text-geo-text mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-geo-cyan font-mono mb-3">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-geo-muted leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-geo-border/60">
                  <span className="text-[10px] font-mono text-geo-subtle block truncate">
                    {item.role}
                  </span>
                  <span className="text-[10px] font-mono text-geo-text block truncate mt-0.5">
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Step Highlight Feature Card */}
        <div className="mt-10 geo-panel rounded-2xl p-6 sm:p-8 border border-geo-border flex flex-col md:flex-row items-center gap-8 bg-geo-surface/70">
          <div className="flex-1 space-y-3 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-geo-cyan">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pipeline Stage {steps[activeStep].step} Deep Dive</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-geo-text">
              {steps[activeStep].title}: {steps[activeStep].subtitle}
            </h3>
            <p className="text-sm text-geo-muted leading-relaxed">
              {steps[activeStep].desc}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono pt-2">
              <span className="text-geo-muted">Module Owner:</span>
              <span className="text-white font-semibold">{steps[activeStep].role}</span>
            </div>
          </div>

          <div className="w-full md:w-64 h-36 rounded-xl overflow-hidden border border-geo-border bg-geo-bg flex items-center justify-center relative shrink-0">
            <img
              src={generateSyntheticPreviewUrl(steps[activeStep].previewType)}
              alt="Stage Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-geo-bg/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white">
              <span>{steps[activeStep].tag}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
