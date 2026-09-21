import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, FileCheck, ArrowRight, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  selectedFile: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onLoadSample: () => void;
  onGenerate: () => void;
  isProcessing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedFile,
  previewUrl,
  onFileSelect,
  onRemove,
  onLoadSample,
  onGenerate,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSelect = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff'];
    const validExts = ['.png', '.jpg', '.jpeg', '.tif', '.tiff'];
    const hasValidExt = validExts.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setErrorMessage('Unsupported format. Please upload a single PNG, JPG, JPEG, or TIFF image.');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="geo-panel rounded-3xl p-8 sm:p-10 border border-geo-border/50 space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold tracking-wide text-geo-text flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-geo-cyan" />
            Upload RGB Image
          </h3>
          <p className="text-xs text-geo-muted mt-1.5 leading-relaxed">
            Upload a single optical image to generate depth, calibrated elevation, and a 3D terrain model.
          </p>
        </div>
        <button
          onClick={onLoadSample}
          disabled={isProcessing}
          className="text-xs font-mono text-geo-cyan hover:text-cyan-300 flex items-center gap-2 transition-all duration-300 self-start sm:self-auto py-2 px-4 rounded-xl bg-geo-surface/80 border border-geo-border/60 hover:border-geo-cyan/40 hover:-translate-y-0.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Golden Sample</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/30 text-rose-300 text-xs font-mono">
          {errorMessage}
        </div>
      )}

      {/* Upload Zone / Active Preview */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-400 ${
            isDragging
              ? 'upload-zone-active border-geo-cyan scale-[1.01]'
              : 'border-geo-border/60 hover:border-geo-border hover:bg-geo-surface/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.tif,.tiff,image/png,image/jpeg,image/tiff"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-geo-surface/80 border border-geo-border/60 flex items-center justify-center animate-float">
            <UploadCloud className="w-8 h-8 text-geo-cyan" />
          </div>
          <p className="text-base font-semibold text-geo-text">
            Click to browse or drag & drop
          </p>
          <p className="text-sm text-geo-muted mt-2">
            Single RGB image
          </p>
          <p className="text-xs text-geo-subtle mt-3 font-mono">
            Supported: PNG, JPG, JPEG, TIFF (Max 25MB)
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-geo-border/60 bg-geo-bg group">
            <img
              src={previewUrl}
              alt="Uploaded RGB preview"
              className="w-full h-56 sm:h-64 object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-geo-bg/85 via-transparent to-transparent pointer-events-none" />

            {/* Overlay detail info */}
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileCheck className="w-4 h-4 text-geo-cyan shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-mono font-medium text-white truncate">
                    {selectedFile?.name || 'golden-sample-input.png'}
                  </p>
                  {selectedFile && (
                    <p className="text-[10px] font-mono text-geo-muted">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Replace image"
                  disabled={isProcessing}
                  className="p-2.5 rounded-xl bg-geo-surface/80 hover:bg-geo-elevated text-geo-text border border-geo-border/60 transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onRemove}
                  title="Remove image"
                  disabled={isProcessing}
                  className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.tif,.tiff,image/png,image/jpeg,image/tiff"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onGenerate}
            disabled={isProcessing}
            className={`btn-shimmer w-full py-4 px-6 rounded-xl font-mono text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-md ${
              isProcessing
                ? 'bg-geo-elevated text-amber-300 border border-amber-500/30 cursor-wait'
                : 'bg-geo-cyan text-geo-bg hover:bg-cyan-400 shadow-geo-glow hover:shadow-geo-glow-lg hover:-translate-y-0.5'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Processing Pipeline...</span>
              </>
            ) : (
              <>
                <span>GENERATE 3D TERRAIN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
