import React from 'react';
import { StageStatus, SystemStatus } from '../types';

interface StatusBadgeProps {
  status: StageStatus | SystemStatus | 'DEMO' | 'REAL';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClass = 'bg-slate-800/80 text-slate-300 border-slate-700/80';
  let dotColor = 'bg-slate-400';
  let animate = false;

  switch (status) {
    case 'READY':
      colorClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-600/40';
      dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      break;
    case 'TERRAIN READY':
      colorClass = 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40';
      dotColor = 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]';
      break;
    case 'COMPLETED':
      colorClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-600/40';
      dotColor = 'bg-emerald-400';
      break;
    case 'PROCESSING':
      colorClass = 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      dotColor = 'bg-amber-400';
      animate = true;
      break;
    case 'ERROR':
      colorClass = 'bg-rose-950/60 text-rose-400 border-rose-600/40';
      dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
      break;
    case 'WAITING':
      colorClass = 'bg-slate-900/60 text-slate-400 border-slate-700/50';
      dotColor = 'bg-slate-500';
      break;
    case 'DEMO':
      colorClass = 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      dotColor = 'bg-purple-400';
      break;
    case 'REAL':
      colorClass = 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
      dotColor = 'bg-cyan-400';
      break;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border backdrop-blur-sm ${colorClass} ${paddingClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColor} ${
          animate ? 'animate-pulse' : ''
        }`}
      />
      <span>{status}</span>
    </span>
  );
};
