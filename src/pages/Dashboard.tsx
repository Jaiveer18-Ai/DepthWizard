import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { WhyDepthWizard } from '../components/landing/WhyDepthWizard';
import { HowItWorks } from '../components/landing/HowItWorks';
import { TechnologySection } from '../components/landing/TechnologySection';
import { TerrainPreviewSection } from '../components/landing/TerrainPreviewSection';
import { DemoWorkspace } from '../components/workspace/DemoWorkspace';
import { Footer } from '../components/Footer';
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

  // Initial scan of outputs/ folder to detect upstream member files
  const scanOutputs = async () => {
    setIsScanning(true);
    try {
      const liveOutputs = await checkPipelineOutputs();
      if (liveOutputs.isRealData) {
        setOutputs(liveOutputs);
        setIsDemoMode(false);
        setSystemStatus('TERRAIN READY');

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
      terrainGlb: null,
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

  // Run the sequential pipeline simulation
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
    setIsFlythrough(false);
    setVerticalScale(1.2);
  };

  const handleToggleFullscreen = () => {
    const el = document.getElementById('demo-workspace');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-geo-bg text-geo-text flex flex-col font-sans selection:bg-geo-cyan/20 selection:text-geo-cyan noise-overlay">
      {/* Sticky Header Navbar */}
      <Navbar
        status={systemStatus}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode((v) => !v)}
        onRefresh={scanOutputs}
        isScanning={isScanning}
      />

      {/* 1. Landing Page: Hero Section */}
      <HeroSection />

      {/* 2. Landing Page: Why DepthWizard Problem / Solution */}
      <WhyDepthWizard />

      {/* 3. Landing Page: 5-Stage How It Works Story */}
      <HowItWorks />

      {/* 4. Landing Page: Built as a Geospatial AI Pipeline */}
      <TechnologySection />

      {/* 5. Landing Page: 3D Terrain Interactive Preview */}
      <TerrainPreviewSection />

      {/* 6. Interactive Demo Workspace Section */}
      <DemoWorkspace
        systemStatus={systemStatus}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode((v) => !v)}
        onRefresh={scanOutputs}
        isScanning={isScanning}
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        onFileSelect={handleFileSelect}
        onRemove={handleRemoveImage}
        onLoadSample={handleLoadSample}
        onGenerate={handleGenerate}
        isProcessing={isProcessing}
        stages={stages}
        activeStageId={activeStageId}
        outputs={outputs}
        isWireframe={isWireframe}
        setIsWireframe={setIsWireframe}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        verticalScale={verticalScale}
        setVerticalScale={setVerticalScale}
        colorMode={colorMode}
        setColorMode={setColorMode}
        sunIntensity={sunIntensity}
        setSunIntensity={setSunIntensity}
        isFlythrough={isFlythrough}
        setIsFlythrough={setIsFlythrough}
        flythroughSpeed={flythroughSpeed}
        setFlythroughSpeed={setFlythroughSpeed}
        isFullscreen={isFullscreen}
        handleToggleFullscreen={handleToggleFullscreen}
        inspectedPoint={inspectedPoint}
        setInspectedPoint={setInspectedPoint}
        handleResetCamera={handleResetCamera}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        metadata={metadata}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};
