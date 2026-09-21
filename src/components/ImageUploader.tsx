import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, FileCheck, ArrowRight } from 'lucide-react';

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
      setErrorMessage('Unsupported file format. Please upload PNG, JPG, JPEG, or TIFF.');
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
    <div className="glass-panel rounded-xl p-5 border border-space-700/80 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gis-cyan" />
            Upload RGB Image
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload a single optical image to generate depth, calibrated elevation and a 3D terrain model.
          </p>
        </div>
        <button
          onClick={onLoadSample}
          disabled={isProcessing}
          className="text-xs font-mono text-gis-cyan hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          Use Golden Sample
        </button>
      </div>

      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-600/40 text-rose-300 text-xs font-mono">
          {errorMessage}
        </div>
      )}

      {/* Upload Zone / Preview */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-gis-cyan bg-gis-cyan/5 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
              : 'border-space-700 hover:border-slate-500 hover:bg-space-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.tif,.tiff,image/png,image/jpeg,image/tiff"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-space-800/80 border border-space-700 flex items-center justify-center text-slate-300 group-hover:text-gis-cyan">
            <UploadCloud className="w-6 h-6 text-gis-cyan" />
          </div>
          <p className="text-xs font-medium text-slate-200">
            Click to browse or drag & drop single RGB image
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Supported: PNG, JPG, JPEG, TIFF (Max 25MB)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Image Preview Card */}
          <div className="relative rounded-lg overflow-hidden border border-space-700/80 bg-space-950 group">
            <img
              src={previewUrl}
              alt="Uploaded RGB preview"
              className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-space-950/90 via-transparent to-transparent pointer-events-none" />
            
            {/* File info overlay */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileCheck className="w-4 h-4 text-gis-cyan shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-mono text-white truncate">
                    {selectedFile?.name || 'golden-sample-input.png'}
                  </p>
                  {selectedFile && (
                    <p className="text-[10px] font-mono text-slate-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Replace image"
                  disabled={isProcessing}
                  className="p-1.5 rounded-md bg-space-900/80 hover:bg-space-800 text-slate-300 hover:text-white border border-space-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onRemove}
                  title="Remove image"
                  disabled={isProcessing}
                  className="p-1.5 rounded-md bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition-colors disabled:opacity-50"
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

          {/* Process / Generate Button */}
          <button
            onClick={onGenerate}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              isProcessing
                ? 'bg-space-800 text-amber-300 border border-amber-500/40 cursor-wait'
                : 'bg-gradient-to-r from-gis-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]'
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
