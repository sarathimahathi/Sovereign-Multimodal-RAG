import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  name: string;
  category: string;
  status: 'healthy' | 'unconfigured' | 'offline' | 'pending';
  phase: string;
  description: string;
  icon: LucideIcon;
  endpoint?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  category,
  status,
  phase,
  description,
  icon: Icon,
  endpoint,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Operational
          </span>
        );
      case 'unconfigured':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mr-1.5" />
            Ready for {phase}
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5" />
            Offline
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-400">
            {phase}
          </span>
        );
    }
  };

  return (
    <div className="glass-panel-interactive rounded-xl p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm tracking-tight">{name}</h3>
              <p className="text-[11px] font-mono text-slate-400">{category}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>Target: <strong className="text-slate-300">{phase}</strong></span>
        {endpoint && <span className="text-indigo-400/80 truncate max-w-[120px]">{endpoint}</span>}
      </div>
    </div>
  );
};
