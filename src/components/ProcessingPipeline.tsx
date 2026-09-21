import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { PipelineStageInfo, StageStatus } from '../types';

interface ProcessingPipelineProps {
  stages: PipelineStageInfo[];
  activeStageId: string | null;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  stages,
  activeStageId,
}) => {
  const renderStatusIcon = (status: StageStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'PROCESSING':
        return <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'WAITING':
      default:
        return <Clock className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-space-700/80 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">
            Pipeline Architecture
          </h2>
          <p className="text-xs text-slate-400">
            Sequential 4-Member Hand-off Contract
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-slate-400 border border-space-700">
          contract.md verified
        </span>
      </div>

      <div className="relative space-y-2.5">
        {stages.map((stage, idx) => {
          const isActive = stage.id === activeStageId;
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.id} className="relative">
              {/* Connecting line */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 -bottom-2.5 w-0.5 z-0 transition-colors ${
                    stage.status === 'COMPLETED' ? 'bg-emerald-500/40' : 'bg-space-800'
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-space-900/90 border-gis-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.08)]'
                    : stage.status === 'COMPLETED'
                    ? 'bg-space-900/40 border-space-700/60'
                    : 'bg-space-950/40 border-space-800/60 opacity-80'
                }`}
              >
                {/* Step number badge & status icon */}
                <div className="w-8 h-8 rounded-md bg-space-800 border border-space-700 flex items-center justify-center shrink-0">
                  {stage.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : stage.status === 'PROCESSING' ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {stage.stepNumber}
                    </span>
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-mono font-bold text-white tracking-wide truncate">
                      {stage.title}
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                        stage.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                          : stage.status === 'PROCESSING'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : stage.status === 'ERROR'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-600/40'
                          : 'bg-space-900 text-slate-500 border-space-800'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-0.5">{stage.subtitle}</p>
                  
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-500">
                    <span className="text-gis-cyan/80">{stage.member}</span>
                    {stage.outputName && (
                      <span className="text-slate-400 bg-space-800/80 px-1.5 py-0.5 rounded">
                        {stage.outputName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
