import React, { useRef } from 'react';
import { ImageUploader } from '../ImageUploader';
import { ProcessingPipeline } from '../ProcessingPipeline';
import { TerrainViewer } from '../TerrainViewer';
import { TerrainControls } from '../TerrainControls';
import { ResultCards } from '../ResultCards';
import { AnalysisPanel } from '../AnalysisPanel';
import { FlythroughControls } from '../FlythroughControls';
import { StatusBadge } from '../StatusBadge';
import { RefreshCw, Sparkles, Sliders, Box, Layers } from 'lucide-react';
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

  return (
    <section id="demo-workspace" className="py-20 lg:py-28 bg-geo-bg border-t border-geo-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Workspace Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-geo-border/70">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-geo-surface text-geo-cyan border border-geo-border text-xs font-mono">
              <Box className="w-3.5 h-3.5" />
              <span>Full Interactive Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-geo-text">
              Terrain Reconstruction Workspace
            </h2>
            <p className="text-xs sm:text-sm text-geo-muted">
              Upload single-view optical imagery to generate depth, calibrated elevation, and interact with the 3D flythrough.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={isScanning}
              title="Scan outputs/ directory for upstream member artifacts"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono text-geo-text bg-geo-surface hover:bg-geo-elevated border border-geo-border transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-geo-cyan' : 'text-geo-muted'}`} />
              <span>Scan outputs/</span>
            </button>

            <button
              onClick={onToggleDemoMode}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium border transition-colors ${
                isDemoMode
                  ? 'bg-geo-surface text-geo-muted border-geo-border hover:border-geo-cyan/40'
                  : 'bg-geo-cyan/15 text-geo-cyan border-geo-cyan/40 shadow-sm'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-geo-cyan" />
              <span>{isDemoMode ? 'Demo Fallback ON' : 'Live Outputs Mode'}</span>
            </button>

            <div className="pl-2 border-l border-geo-border hidden sm:block">
              <StatusBadge status={systemStatus} />
            </div>
          </div>
        </div>

        {/* Top/Left Input & Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Spacious Image Uploader Area */}
          <div className="lg:col-span-5 space-y-6">
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

          {/* Right: Sequential Horizontal Pipeline Steps */}
          <div className="lg:col-span-7">
            <ProcessingPipeline
              stages={stages}
              activeStageId={activeStageId}
            />
          </div>
        </div>

        {/* Centerpiece: Large 3D Terrain Viewer Focus */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-geo-cyan animate-pulse" />
              <h3 className="text-sm font-bold font-mono tracking-wider text-geo-text uppercase">
                Interactive 3D Terrain Flight
              </h3>
            </div>
            <span className="text-xs font-mono text-geo-muted">
              Left Click: Orbit • Right Click: Pan • Scroll: Zoom
            </span>
          </div>

          <div
            ref={viewerContainerRef}
            className="relative flex flex-col space-y-3"
          >
            {/* Viewer Canvas Container */}
            <div className="relative">
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

            {/* Unified 3D Viewer Toolbar */}
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

        {/* Results & Analysis Section */}
        <div className="space-y-8 pt-4">
          {/* Tabbed Result Artifacts */}
          <ResultCards
            outputs={outputs}
            isProcessing={isProcessing}
            onSelectViewStage={setSelectedStage}
            selectedStage={selectedStage}
          />

          {/* Elevation Analysis Panel */}
          <AnalysisPanel metadata={metadata} />
        </div>
      </div>
    </section>
  );
};
