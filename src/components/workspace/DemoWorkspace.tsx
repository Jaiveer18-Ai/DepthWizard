import React, { useRef } from 'react';
import { ImageUploader } from '../ImageUploader';
import { ProcessingPipeline } from '../ProcessingPipeline';
import { TerrainViewer } from '../TerrainViewer';
import { TerrainControls } from '../TerrainControls';
import { ResultCards } from '../ResultCards';
import { AnalysisPanel } from '../AnalysisPanel';
import { FlythroughControls } from '../FlythroughControls';
import { StatusBadge } from '../StatusBadge';
import { RefreshCw, Sparkles, Box } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import {
  PipelineOutputs,
  PipelineStageInfo,
  SystemStatus,
  TerrainMetadata,
  TerrainPointInspection,
} from '../../types';

interface DemoWorkspaceProps {
  systemStatus: SystemStatus;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onRefresh: () => void;
  isScanning: boolean;

  selectedFile: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onLoadSample: () => void;
  onGenerate: () => void;
  isProcessing: boolean;

  stages: PipelineStageInfo[];
  activeStageId: string | null;

  outputs: PipelineOutputs;

  isWireframe: boolean;
  setIsWireframe: React.Dispatch<React.SetStateAction<boolean>>;
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  verticalScale: number;
  setVerticalScale: (scale: number) => void;
  colorMode: 'texture' | 'elevation';
  setColorMode: React.Dispatch<React.SetStateAction<'texture' | 'elevation'>>;
  sunIntensity: number;
  setSunIntensity: (val: number) => void;
  isFlythrough: boolean;
  setIsFlythrough: React.Dispatch<React.SetStateAction<boolean>>;
  flythroughSpeed: number;
  setFlythroughSpeed: (speed: number) => void;
  isFullscreen: boolean;
  handleToggleFullscreen: () => void;
  inspectedPoint: TerrainPointInspection | null;
  setInspectedPoint: (point: TerrainPointInspection | null) => void;
  handleResetCamera: () => void;

  selectedStage: 'rgb' | 'depth' | 'dsm' | '3d';
  setSelectedStage: (stage: 'rgb' | 'depth' | 'dsm' | '3d') => void;

  metadata: TerrainMetadata;
}

export const DemoWorkspace: React.FC<DemoWorkspaceProps> = ({
  systemStatus,
  isDemoMode,
  onToggleDemoMode,
  onRefresh,
  isScanning,

  selectedFile,
  previewUrl,
  onFileSelect,
  onRemove,
  onLoadSample,
  onGenerate,
  isProcessing,

  stages,
  activeStageId,

  outputs,

  isWireframe,
  setIsWireframe,
  showGrid,
  setShowGrid,
  verticalScale,
  setVerticalScale,
  colorMode,
  setColorMode,
  sunIntensity,
  setSunIntensity,
  isFlythrough,
  setIsFlythrough,
  flythroughSpeed,
  setFlythroughSpeed,
  isFullscreen,
  handleToggleFullscreen,
  inspectedPoint,
  setInspectedPoint,
  handleResetCamera,

  selectedStage,
  setSelectedStage,

  metadata,
}) => {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section id="demo-workspace" ref={sectionRef} className="py-36 lg:py-48 bg-geo-bg relative overflow-hidden">
      {/* Section Top Divider */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      {/* Ambient Background */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[400px] bg-geo-cyan/3 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[400px] bg-blue-500/3 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 lg:space-y-28">
        {/* Workspace Section Header */}
        <div className="reveal flex flex-col md:flex-row md:items-center justify-between gap-10 pb-10 border-b border-geo-border/40">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-geo-surface/70 text-geo-cyan border border-geo-border/60 text-xs font-mono backdrop-blur-md">
              <Box className="w-3.5 h-3.5" />
              <span>Full Interactive Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-white">
              Terrain Reconstruction
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-slate-400 font-semibold mt-2">Workspace</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-400 font-normal leading-relaxed">
              Upload single-view optical imagery to run depth estimation, generate a calibrated Digital Surface Model,
              and interact with the 3D flythrough.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isScanning}
              title="Scan outputs/ directory for upstream member artifacts"
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-mono text-slate-200 bg-geo-surface/80 hover:bg-geo-elevated border border-geo-border/60 transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-geo-cyan' : 'text-slate-400'}`} />
              <span>Scan outputs/</span>
            </button>

            <button
              onClick={onToggleDemoMode}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-mono font-medium border transition-all duration-300 hover:-translate-y-0.5 ${
                isDemoMode
                  ? 'bg-geo-surface/80 text-slate-400 border-geo-border/60 hover:border-geo-cyan/30 hover:text-white'
                  : 'bg-geo-cyan/15 text-geo-cyan border-geo-cyan/30 shadow-sm'
              }`}
            >
              <Sparkles className="w-4 h-4 text-geo-cyan" />
              <span>{isDemoMode ? 'Demo Fallback ON' : 'Live Outputs Mode'}</span>
            </button>

            <div className="pl-4 border-l border-geo-border/40 hidden sm:block">
              <StatusBadge status={systemStatus} />
            </div>
          </div>
        </div>

        {/* Input & Pipeline Section */}
        <div className="reveal reveal-delay-2 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left: Spacious Image Uploader */}
          <div className="lg:col-span-5 space-y-8">
            <ImageUploader
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              onFileSelect={onFileSelect}
              onRemove={onRemove}
              onLoadSample={onLoadSample}
              onGenerate={onGenerate}
              isProcessing={isProcessing}
            />
          </div>

          {/* Right: Pipeline Steps */}
          <div className="lg:col-span-7">
            <ProcessingPipeline
              stages={stages}
              activeStageId={activeStageId}
            />
          </div>
        </div>

        {/* 3D Terrain Viewer */}
        <div className="reveal-scale reveal-delay-3 space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-geo-border/40">
            <div className="flex items-center gap-4">
              <span className="w-3 h-3 rounded-full bg-geo-cyan animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
              <h3 className="text-xl font-bold font-mono tracking-wider text-white uppercase">
                Interactive 3D Terrain Stage
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Left Click: Orbit • Right Click: Pan • Scroll: Zoom • Click Mesh to Inspect
            </span>
          </div>

          <div
            ref={viewerContainerRef}
            className="relative flex flex-col space-y-6"
          >
            {/* Viewer Canvas Container */}
            <div className="relative w-full gradient-border rounded-2xl animate-pulse-glow">
              <TerrainViewer
                glbUrl={outputs.terrainGlb}
                htmlUrl={outputs.terrainHtml}
                isRealData={!isDemoMode && outputs.isRealData}
                isWireframe={isWireframe}
                showGrid={showGrid}
                verticalScale={verticalScale}
                colorMode={colorMode}
                sunIntensity={sunIntensity}
                isFlythrough={isFlythrough}
                flythroughSpeed={flythroughSpeed}
                onInspectPoint={setInspectedPoint}
                inspectedPoint={inspectedPoint}
              />

              {/* Flythrough overlay */}
              <FlythroughControls
                isActive={isFlythrough}
                onExit={() => setIsFlythrough(false)}
                speed={flythroughSpeed}
                onChangeSpeed={setFlythroughSpeed}
              />
            </div>

            {/* 3D Viewer Toolbar */}
            <TerrainControls
              onResetView={handleResetCamera}
              isFlythrough={isFlythrough}
              onToggleFlythrough={() => setIsFlythrough((v) => !v)}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid((v) => !v)}
              isWireframe={isWireframe}
              onToggleWireframe={() => setIsWireframe((v) => !v)}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              verticalScale={verticalScale}
              onChangeVerticalScale={setVerticalScale}
              colorMode={colorMode}
              onToggleColorMode={() =>
                setColorMode((m) => (m === 'texture' ? 'elevation' : 'texture'))
              }
              sunIntensity={sunIntensity}
              onChangeSunIntensity={setSunIntensity}
            />
          </div>
        </div>

        {/* Results & Analysis */}
        <div className="space-y-20 pt-8">
          <div className="reveal reveal-delay-2">
            <ResultCards
              outputs={outputs}
              isProcessing={isProcessing}
              onSelectViewStage={setSelectedStage}
              selectedStage={selectedStage}
            />
          </div>

          <div className="reveal reveal-delay-3">
            <AnalysisPanel metadata={metadata} />
          </div>
        </div>
      </div>
    </section>
  );
};
