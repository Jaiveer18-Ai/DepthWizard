import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Mountain,
  Layers,
  Box,
  Plane,
  Sparkles,
} from 'lucide-react';
import { generateSyntheticPreviewUrl } from '../../data/demoData';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useScrollReveal<HTMLElement>();

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
    <section id="how-it-works" ref={sectionRef} className="py-36 lg:py-48 bg-geo-bg-alt relative overflow-hidden">
      {/* Section Top Divider */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      {/* Ambient Background */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[500px] bg-teal-500/3 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
          <div className="reveal reveal-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-geo-surface/70 text-geo-cyan border border-geo-border/60 text-xs font-mono backdrop-blur-md">
            <span>Sequential 4-Member Contract</span>
          </div>
          <h2 className="reveal reveal-delay-2 text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-white">
            How DepthWizard Works
          </h2>
          <p className="reveal reveal-delay-3 text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
            From single-view optical pixels to a watertight 3D terrain flight — five sequential
            milestones governed by the integration contract.
          </p>
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeStep === idx;

            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(idx)}
                className={`reveal reveal-delay-${Math.min(idx + 2, 7)} geo-panel geo-panel-hover rounded-3xl p-8 lg:p-10 border cursor-pointer transition-all duration-400 flex flex-col justify-between space-y-8 ${
                  isSelected
                    ? 'border-geo-cyan/50 bg-geo-elevated/80 shadow-geo-glow-lg -translate-y-2 animate-border-glow'
                    : 'border-geo-border/50 hover:border-geo-border/80'
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold font-mono text-slate-600/80">
                      {item.step}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                        isSelected
                          ? 'bg-geo-cyan/15 border-geo-cyan/40 text-geo-cyan shadow-geo-glow'
                          : 'bg-geo-surface/80 border-geo-border/60 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1.5">
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

                <div className="pt-6 border-t border-geo-border/40 space-y-2 text-xs font-mono">
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

          {/* 6th Card: Pipeline Guarantee */}
          <div className="reveal reveal-delay-7 geo-panel geo-panel-hover rounded-3xl p-8 lg:p-10 border border-geo-border/50 bg-geo-surface/40 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-geo-surface/80 text-geo-cyan border border-geo-border/60">
                  Single System
                </span>
                <Sparkles className="w-5 h-5 text-geo-cyan animate-float" />
              </div>

              <h3 className="text-xl font-bold text-white">
                One Cohesive Pipeline
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The objective is not four independent modules, but one working end-to-end system:
                every stage seamlessly validates and consumes upstream artifacts.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-geo-bg/80 border border-geo-border/40 text-xs font-mono text-slate-400 space-y-2">
              <p className="text-white font-semibold">Golden Pipeline Test:</p>
              <p className="text-geo-cyan text-sm">RGB → Depth → DSM → 3D → Flight</p>
            </div>
          </div>
        </div>

        {/* Deep-Dive Preview Box */}
        <div className="reveal-scale reveal-delay-5 mt-20 lg:mt-28 geo-panel rounded-3xl p-10 sm:p-14 border border-geo-border/50 bg-geo-surface/40 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-geo-cyan">
              <Sparkles className="w-4 h-4" />
              <span>Step {steps[activeStep].step} Deep Dive</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {steps[activeStep].title}:
              <span className="block text-xl sm:text-2xl text-slate-300 font-normal mt-1">
                {steps[activeStep].subtitle}
              </span>
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              {steps[activeStep].desc}
            </p>
            <div className="flex flex-wrap items-center gap-8 text-xs font-mono pt-5 border-t border-geo-border/40">
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

          <div className="w-full lg:w-96 h-56 rounded-2xl overflow-hidden border border-geo-border/40 bg-geo-bg shrink-0 shadow-geo-elevated relative group">
            <img
              src={generateSyntheticPreviewUrl(steps[activeStep].previewType)}
              alt="Stage Preview"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-geo-bg/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs font-mono text-white">
              <span>{steps[activeStep].tag}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
