import React from 'react';
import { Cpu, HardDrive, Zap, Server } from 'lucide-react';

export const MetricCard = ({ title, percentage, detail, temp, type = 'gpu' }) => {
  const getIcon = () => {
    if (type === 'gpu') return <Zap className="w-5 h-5 text-emerald-600" />;
    if (type === 'memory') return <Server className="w-5 h-5 text-blue-600" />;
    if (type === 'cpu') return <Cpu className="w-5 h-5 text-purple-600" />;
    return <HardDrive className="w-5 h-5 text-amber-600" />;
  };

  const getBarColor = () => {
    if (percentage > 85) return 'bg-rose-500';
    if (percentage > 70) return 'bg-amber-500';
    return 'bg-emerald-600';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
            {getIcon()}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h4>
            {detail && <p className="text-[11px] text-slate-400 font-mono">{detail}</p>}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-black text-slate-900 font-mono">{percentage}%</span>
          {temp && <p className="text-[10px] text-slate-400 font-mono">{temp}</p>}
        </div>
      </div>

      {/* Resource Gauge Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MetricCard;
