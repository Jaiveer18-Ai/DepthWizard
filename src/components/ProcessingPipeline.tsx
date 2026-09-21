import React from 'react';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { PipelineStageInfo } from '../types';

interface ProcessingPipelineProps {
  stages: PipelineStageInfo[];
  activeStageId: string | null;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  stages,
  activeStageId,
}) => {
  return (
    <div className="geo-panel rounded-3xl p-8 sm:p-10 border border-geo-border/50 space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-geo-border/40">
        <div>
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-geo-text">
            Pipeline Architecture
          </h3>
          <p className="text-xs text-geo-muted mt-1.5">
            Sequential 4-Member Hand-off Contract
          </p>
        </div>
        <span className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-geo-surface/80 text-geo-muted border border-geo-border/60 self-start sm:self-auto">
          contract.md verified
        </span>
      </div>

      {/* Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage, idx) => {
          const isActive = stage.id === activeStageId;
          const isCompleted = stage.status === 'COMPLETED';
          const isProcessing = stage.status === 'PROCESSING';

          return (
            <div
              key={stage.id}
              className={`p-5 rounded-2xl border transition-all duration-400 relative ${
                isActive
                  ? 'bg-geo-elevated/80 border-geo-cyan/40 shadow-geo-glow animate-border-glow'
                  : isCompleted
                  ? 'bg-geo-surface/60 border-emerald-500/25'
                  : isProcessing
                  ? 'bg-geo-elevated/80 border-amber-500/30'
                  : 'bg-geo-surface/30 border-geo-border/40 hover:border-geo-border/60'
              }`}
            >
              {/* Connecting arrow between steps (hidden on mobile) */}
              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-geo-border">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-geo-bg/80 border border-geo-border/40 text-geo-muted">
                  {stage.stepNumber}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : isProcessing ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-geo-subtle shrink-0" />
                )}
              </div>

              <h4 className="text-sm font-bold text-geo-text truncate">
                {stage.title}
              </h4>
              <p className="text-[11px] text-geo-muted mt-1 line-clamp-1">
                {stage.subtitle}
              </p>

              <div className="mt-4 pt-3 border-t border-geo-border/40 flex items-center justify-between text-[10px] font-mono">
                <span className="text-geo-subtle truncate">
                  {stage.member.split('—')[0].trim()}
                </span>
                <span
                  className={`font-medium ${
                    isCompleted
                      ? 'text-emerald-400'
                      : isProcessing
                      ? 'text-amber-400'
                      : 'text-geo-subtle'
                  }`}
                >
                  {stage.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
