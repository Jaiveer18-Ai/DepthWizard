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
    <div className="geo-panel rounded-2xl p-6 sm:p-7 border border-geo-border space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold tracking-wide text-geo-text flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-geo-cyan" />
            Upload RGB Image
          </h3>
          <p className="text-xs text-geo-muted mt-0.5">
            Upload a single optical image to generate depth, calibrated elevation, and a 3D terrain model.
          </p>
        </div>
        <button
          onClick={onLoadSample}
          disabled={isProcessing}
          className="text-xs font-mono text-geo-cyan hover:text-cyan-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto py-1 px-2.5 rounded-lg bg-geo-surface border border-geo-border hover:border-geo-cyan/40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Golden Sample</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-mono">
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
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-geo-cyan bg-geo-cyan/5 shadow-geo-glow'
              : 'border-geo-border hover:border-geo-border/80 hover:bg-geo-surface/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.tif,.tiff,image/png,image/jpeg,image/tiff"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-geo-surface border border-geo-border flex items-center justify-center text-geo-muted group-hover:text-geo-cyan">
            <UploadCloud className="w-7 h-7 text-geo-cyan" />
          </div>
          <p className="text-sm font-semibold text-geo-text">
            Click to browse or drag & drop single RGB image
          </p>
          <p className="text-xs text-geo-muted mt-1 font-mono">
            Supported: PNG, JPG, JPEG, TIFF (Max 25MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-geo-border bg-geo-bg group">
            <img
              src={previewUrl}
              alt="Uploaded RGB preview"
              className="w-full h-52 sm:h-60 object-cover object-center group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-geo-bg/90 via-transparent to-transparent pointer-events-none" />

            {/* Overlay detail info */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Replace image"
                  disabled={isProcessing}
                  className="p-2 rounded-lg bg-geo-surface/80 hover:bg-geo-elevated text-geo-text border border-geo-border transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onRemove}
                  title="Remove image"
                  disabled={isProcessing}
                  className="p-2 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors disabled:opacity-50"
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
            className={`w-full py-3.5 px-5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md ${
              isProcessing
                ? 'bg-geo-elevated text-amber-300 border border-amber-500/40 cursor-wait'
                : 'bg-geo-cyan text-geo-bg hover:bg-cyan-400 shadow-geo-glow hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]'
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
