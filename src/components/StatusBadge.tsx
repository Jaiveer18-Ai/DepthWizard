import React from 'react';
import { StageStatus, SystemStatus } from '../types';

interface StatusBadgeProps {
  status: StageStatus | SystemStatus | 'DEMO' | 'REAL';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClass = 'bg-geo-surface text-geo-muted border-geo-border';
  let dotColor = 'bg-geo-subtle';
  let animate = false;

  switch (status) {
    case 'READY':
      colorClass = 'bg-geo-surface text-emerald-300 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
      break;
    case 'TERRAIN READY':
      colorClass = 'bg-geo-surface text-geo-cyan border-geo-cyan/30';
      dotColor = 'bg-geo-cyan shadow-[0_0_6px_rgba(6,182,212,0.8)]';
      break;
    case 'COMPLETED':
      colorClass = 'bg-geo-surface text-emerald-300 border-emerald-500/30';
      dotColor = 'bg-emerald-400';
      break;
    case 'PROCESSING':
      colorClass = 'bg-geo-surface text-amber-300 border-amber-500/40';
      dotColor = 'bg-amber-400';
      animate = true;
      break;
    case 'ERROR':
      colorClass = 'bg-geo-surface text-rose-300 border-rose-500/40';
      dotColor = 'bg-rose-400';
      break;
    case 'WAITING':
      colorClass = 'bg-geo-surface text-geo-subtle border-geo-border';
      dotColor = 'bg-geo-subtle';
      break;
    case 'DEMO':
      colorClass = 'bg-geo-surface text-geo-muted border-geo-border';
      dotColor = 'bg-geo-muted';
      break;
    case 'REAL':
      colorClass = 'bg-geo-surface text-geo-cyan border-geo-cyan/30';
      dotColor = 'bg-geo-cyan';
      break;
  }

  const paddingClass = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

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
