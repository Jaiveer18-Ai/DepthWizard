import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { ImageUploader } from '../components/ImageUploader';
import { ProcessingPipeline } from '../components/ProcessingPipeline';
import { TerrainViewer } from '../components/TerrainViewer';
import { TerrainControls } from '../components/TerrainControls';
import { ResultCards } from '../components/ResultCards';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { FlythroughControls } from '../components/FlythroughControls';
import {
  PipelineOutputs,
  PipelineStageInfo,
  SystemStatus,
  TerrainMetadata,
  TerrainPointInspection,
} from '../types';
import {
  INITIAL_PIPELINE_STAGES,
  DEMO_TERRAIN_METADATA,
  generateSyntheticPreviewUrl,
  CONTRACT_PATHS,
} from '../data/demoData';
import { checkPipelineOutputs, parseNpyStats } from '../services/api';

export const Dashboard: React.FC = () => {
  // System State
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('READY');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pipeline Output State
  const [outputs, setOutputs] = useState<PipelineOutputs>({
    originalImage: null,
    depthImage: null,
    dsmImage: null,
    terrainGlb: null,
    terrainHtml: null,
    depthNpy: null,
    dsmNpy: null,
    dsmTif: null,
    isRealData: false,
    source: 'none',
  });

  // Terrain 3D Viewer Controls State
  const [isWireframe, setIsWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [verticalScale, setVerticalScale] = useState(1.2);
  const [colorMode, setColorMode] = useState<'texture' | 'elevation'>('texture');
  const [sunIntensity, setSunIntensity] = useState(1.0);
  const [isFlythrough, setIsFlythrough] = useState(false);
  const [flythroughSpeed, setFlythroughSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inspectedPoint, setInspectedPoint] = useState<TerrainPointInspection | null>(null);

  // Elevation Analysis Metadata State
  const [metadata, setMetadata] = useState<TerrainMetadata>(DEMO_TERRAIN_METADATA);

  // Pipeline Stages Tracking
  const [stages, setStages] = useState<PipelineStageInfo[]>(INITIAL_PIPELINE_STAGES);

  // Active view tab for results
  const [selectedStage, setSelectedStage] = useState<'rgb' | 'depth' | 'dsm' | '3d'>('3d');

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Initial scan of outputs/ folder to detect upstream member files
  const scanOutputs = async () => {
    setIsScanning(true);
    try {
      const liveOutputs = await checkPipelineOutputs();
      if (liveOutputs.isRealData) {
        setOutputs(liveOutputs);
        setIsDemoMode(false);
        setSystemStatus('TERRAIN READY');

        // Check for real DSM npy stats
        if (liveOutputs.dsmNpy) {
          const stats = await parseNpyStats(liveOutputs.dsmNpy);
          if (stats) {
            setMetadata((prev) => ({
              ...prev,
              ...stats,
              isDemoData: false,
            }));
          }
        }
      } else {
        // Prepare synthetic fallback previews for immediate demo presentation
        loadDemoSampleFallback();
      }
    } catch (err) {
      console.warn('Scan outputs check failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const loadDemoSampleFallback = () => {
    const syntheticRgb = generateSyntheticPreviewUrl('rgb');
    const syntheticDepth = generateSyntheticPreviewUrl('depth');
    const syntheticDsm = generateSyntheticPreviewUrl('dsm');

    setPreviewUrl(syntheticRgb);
    setOutputs({
      originalImage: syntheticRgb,
      depthImage: syntheticDepth,
      dsmImage: syntheticDsm,
      terrainGlb: null, // Fallback to procedural mesh
      terrainHtml: null,
      depthNpy: null,
      dsmNpy: null,
      dsmTif: null,
      isRealData: false,
      source: 'demo',
    });
    setMetadata(DEMO_TERRAIN_METADATA);
    setSystemStatus('READY');
  };

  useEffect(() => {
    scanOutputs();
  }, []);

  // Keyboard navigation for Flythrough (ESC to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFlythrough) {
        setIsFlythrough(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlythrough]);

  // Handle image upload from user
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSystemStatus('READY');

    // Update Stage 1 in pipeline
    setStages((prev) =>
      prev.map((s) => (s.id === 'rgb' ? { ...s, status: 'COMPLETED' } : s))
    );
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSystemStatus('READY');
    setStages(INITIAL_PIPELINE_STAGES);
  };

  const handleLoadSample = () => {
    loadDemoSampleFallback();
    setStages((prev) =>
      prev.map((s) => (s.id === 'rgb' ? { ...s, status: 'COMPLETED' } : s))
    );
  };

  // Run the sequential pipeline simulation / live execution
  const handleGenerate = async () => {
    if (!previewUrl) return;

    setIsProcessing(true);
    setSystemStatus('PROCESSING');

    // Stage 1: RGB
    setActiveStageId('rgb');
    setStages((prev) =>
      prev.map((s) => (s.id === 'rgb' ? { ...s, status: 'PROCESSING' } : s))
    );
    await new Promise((r) => setTimeout(r, 600));
    setStages((prev) =>
      prev.map((s) => (s.id === 'rgb' ? { ...s, status: 'COMPLETED' } : s))
    );

    // Stage 2: Depth (Member 1)
    setActiveStageId('depth');
    setStages((prev) =>
      prev.map((s) => (s.id === 'depth' ? { ...s, status: 'PROCESSING' } : s))
    );
    await new Promise((r) => setTimeout(r, 800));
    setStages((prev) =>
      prev.map((s) => (s.id === 'depth' ? { ...s, status: 'COMPLETED' } : s))
    );

    // Stage 3: DSM (Member 2)
    setActiveStageId('dsm');
    setStages((prev) =>
      prev.map((s) => (s.id === 'dsm' ? { ...s, status: 'PROCESSING' } : s))
    );
    await new Promise((r) => setTimeout(r, 800));
    setStages((prev) =>
      prev.map((s) => (s.id === 'dsm' ? { ...s, status: 'COMPLETED' } : s))
    );

    // Stage 4: 3D Terrain (Member 3)
    setActiveStageId('terrain');
    setStages((prev) =>
      prev.map((s) => (s.id === 'terrain' ? { ...s, status: 'PROCESSING' } : s))
    );
    await new Promise((r) => setTimeout(r, 700));
    setStages((prev) =>
      prev.map((s) => (s.id === 'terrain' ? { ...s, status: 'COMPLETED' } : s))
    );

    // Stage 5: Demo Integration (Member 4)
    setActiveStageId('demo');
    setStages((prev) =>
      prev.map((s) => (s.id === 'demo' ? { ...s, status: 'COMPLETED' } : s))
    );

    setIsProcessing(false);
    setSystemStatus('TERRAIN READY');
    setSelectedStage('3d');
  };

  const handleResetCamera = () => {
    // Re-trigger viewer reset by cycling scale or resetting flythrough
    setIsFlythrough(false);
    setVerticalScale(1.2);
  };

  const handleToggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 bg-grid-pattern flex flex-col selection:bg-gis-cyan/20 selection:text-gis-cyan">
      {/* Top Navbar */}
      <Navbar
        status={systemStatus}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode((v) => !v)}
        onRefresh={scanOutputs}
        isScanning={isScanning}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Workspace Layout: Left (Controls/Pipeline) | Right (Large 3D Focus) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Input & Pipeline Controls) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Image Uploader & Trigger */}
            <ImageUploader
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              onRemove={handleRemoveImage}
              onLoadSample={handleLoadSample}
              onGenerate={handleGenerate}
              isProcessing={isProcessing}
            />

            {/* Sequential 4-Member Pipeline Status */}
            <ProcessingPipeline
              stages={stages}
              activeStageId={activeStageId}
            />
          </div>

          {/* Right Column (Large 3D Terrain Viewer Focus) */}
          <div
            ref={viewerContainerRef}
            className="lg:col-span-7 flex flex-col space-y-3 min-h-[500px]"
          >
            {/* 3D Viewer Container */}
            <div className="relative flex-1">
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

            {/* Terrain Viewer Action Controls */}
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

        {/* Lower Results Section: Artifacts Grid & Elevation Analysis */}
        <div className="space-y-6 pt-2">
          {/* Output Artifacts Cards */}
          <ResultCards
            outputs={outputs}
            isProcessing={isProcessing}
            onSelectViewStage={setSelectedStage}
            selectedStage={selectedStage}
          />

          {/* Geospatial Elevation Analysis Panel */}
          <AnalysisPanel metadata={metadata} />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-space-800 bg-space-950/90 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <p>
          DepthWizard SIH 2026 (PS 26175) — Member 4 (Frontend / Demo Integration) • Primary Contract:{' '}
          <span className="text-slate-400">contract.md</span>
        </p>
      </footer>
    </div>
  );
};
