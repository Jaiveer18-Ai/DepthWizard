import React from 'react';
import { CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="geo-panel rounded-2xl p-6 border border-geo-border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-geo-border/60">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-geo-text">
            Pipeline Architecture
          </h3>
          <p className="text-xs text-geo-muted">
            Sequential 4-Member Hand-off Contract
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-geo-surface text-geo-muted border border-geo-border self-start sm:self-auto">
          contract.md verified
        </span>
      </div>

      {/* Horizontal Steps on Desktop, Vertical on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((stage, idx) => {
          const isActive = stage.id === activeStageId;
          const isCompleted = stage.status === 'COMPLETED';
          const isProcessing = stage.status === 'PROCESSING';

          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-xl border transition-all relative ${
                isActive
                  ? 'bg-geo-elevated border-geo-cyan/50 shadow-geo-glow'
                  : isCompleted
                  ? 'bg-geo-surface/80 border-emerald-500/30'
                  : isProcessing
                  ? 'bg-geo-elevated border-amber-500/40'
                  : 'bg-geo-surface/40 border-geo-border/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-geo-bg border border-geo-border text-geo-muted">
                  {stage.stepNumber}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isProcessing ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-geo-subtle shrink-0" />
                )}
              </div>

              <h4 className="text-xs font-bold text-geo-text truncate">
                {stage.title}
              </h4>
              <p className="text-[11px] text-geo-muted mt-0.5 line-clamp-1">
                {stage.subtitle}
              </p>

              <div className="mt-2.5 pt-2 border-t border-geo-border/60 flex items-center justify-between text-[10px] font-mono">
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
