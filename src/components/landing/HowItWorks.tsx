import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Mountain,
  Layers,
  Box,
  Plane,
  Sparkles,
  ArrowRight,
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
      desc: 'Takes any single optical satellite, drone, or aerial frame without requiring multi-pass constellations or LiDAR payloads.',
      icon: ImageIcon,
      previewType: 'rgb' as const,
      tag: 'data/sample/input.png',
      outputDesc: 'Raw 24-bit Optical RGB',
    },
    {
      step: '02',
      title: 'Depth Estimation',
      subtitle: 'Monocular Relative Depth',
      role: 'Member 1 — AI / Depth',
      desc: 'Deep neural networks analyze shading, texture gradients, and scene geometry to produce a continuous float32 relative depth map.',
      icon: Mountain,
      previewType: 'depth' as const,
      tag: 'outputs/depth.npy & depth.png',
      outputDesc: 'NumPy float32 relative depth array',
    },
    {
      step: '03',
      title: 'GIS Calibration',
      subtitle: 'Calibrated Elevation / DSM',
      role: 'Member 2 — GIS / Calibration',
      desc: 'Transforms relative depth into metric surface elevation rasters, calibrating scaling references to produce a Digital Surface Model.',
      icon: Layers,
      previewType: 'dsm' as const,
      tag: 'outputs/dsm.npy & dsm.png',
      outputDesc: 'Calibrated metric DSM surface',
    },
    {
      step: '04',
      title: '3D Reconstruction',
      subtitle: 'Triangulated Mesh & Texture',
      role: 'Member 3 — 3D / Integration',
      desc: 'Constructs an indexed 3D mesh from DSM elevation vertices and projects the original optical RGB image as a continuous UV texture map.',
      icon: Box,
      previewType: 'rgb' as const,
      tag: 'outputs/terrain.glb',
      outputDesc: 'Watertight glTF 2.0 binary mesh',
    },
    {
      step: '05',
      title: 'Interactive Flythrough',
      subtitle: 'Real-Time WebGL Exploration',
      role: 'Member 4 — Frontend / Demo',
      desc: 'Enables cinematic camera flight, orbit inspection, elevation profile cross-sectioning, and topographic relief analysis in the browser.',
      icon: Plane,
      previewType: 'dsm' as const,
      tag: 'Interactive WebGL UI',
      outputDesc: 'Real-time 3D flight & GIS inspection',
    },
  ];

  return (
    <section id="how-it-works" className="py-28 lg:py-36 bg-geo-bg-alt border-t border-geo-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with large breathing room */}
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-geo-surface text-geo-cyan border border-geo-border text-xs font-mono">
            <span>Sequential 4-Member Contract</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            How DepthWizard Works
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            From single-view optical pixels to a watertight 3D terrain flight — five sequential
            milestones governed by the integration contract.
          </p>
        </div>

        {/* Milestone Cards Grid: Spacious 3-col/2-col instead of cramped 5-col */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeStep === idx;

            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(idx)}
                className={`geo-panel rounded-3xl p-8 border cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-6 ${
                  isSelected
                    ? 'border-geo-cyan bg-geo-elevated shadow-geo-glow -translate-y-1'
                    : 'border-geo-border/80 hover:border-geo-border hover:bg-geo-surface/80'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold font-mono text-slate-600">
                      {item.step}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isSelected
                          ? 'bg-geo-cyan/20 border-geo-cyan/40 text-geo-cyan'
                          : 'bg-geo-surface border-geo-border text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-geo-cyan">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-5 border-t border-geo-border/60 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Role:</span>
                    <span className="text-white font-medium">{item.role.split('—')[0].trim()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Artifact:</span>
                    <span className="text-geo-cyan truncate max-w-[180px]">{item.tag}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Pipeline Guarantee / Contract Callout */}
          <div className="geo-panel rounded-3xl p-8 border border-geo-border/80 bg-geo-surface/50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-geo-surface text-geo-cyan border border-geo-border">
                  Single System
                </span>
                <Sparkles className="w-5 h-5 text-geo-cyan" />
              </div>

              <h3 className="text-lg font-bold text-white">
                One Cohesive Pipeline
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The objective is not four independent modules, but one working end-to-end system:
                every stage seamlessly validates and consumes upstream artifacts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-geo-bg border border-geo-border text-xs font-mono text-slate-400 space-y-1">
              <p className="text-white font-semibold">Golden Pipeline Test:</p>
              <p className="text-geo-cyan">RGB → Depth → DSM → 3D → Flight</p>
            </div>
          </div>
        </div>

        {/* Spacious Interactive Deep-Dive Preview Box */}
        <div className="mt-16 lg:mt-20 geo-panel rounded-3xl p-8 sm:p-12 border border-geo-border/80 bg-geo-surface/60 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-geo-cyan">
              <Sparkles className="w-4 h-4" />
              <span>Step {steps[activeStep].step} Deep Dive</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {steps[activeStep].title}: {steps[activeStep].subtitle}
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              {steps[activeStep].desc}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-xs font-mono pt-3 border-t border-geo-border/60">
              <div>
                <span className="text-slate-400">Component Owner: </span>
                <span className="text-white font-bold">{steps[activeStep].role}</span>
              </div>
              <div>
                <span className="text-slate-400">Deliverable: </span>
                <span className="text-geo-cyan font-bold">{steps[activeStep].outputDesc}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 h-48 rounded-2xl overflow-hidden border border-geo-border bg-geo-bg shrink-0 shadow-lg relative">
            <img
              src={generateSyntheticPreviewUrl(steps[activeStep].previewType)}
              alt="Stage Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-geo-bg/85 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-white">
              <span>{steps[activeStep].tag}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
