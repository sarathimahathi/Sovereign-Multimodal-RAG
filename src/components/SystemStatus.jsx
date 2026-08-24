import React from 'react';
import { ShieldCheck, HardDrive, WifiOff, Radio } from 'lucide-react';

export const SystemStatus = ({ security = {} }) => {
  const items = [
    { label: 'Inference', value: security.inference || 'Local (On-Prem GPU)', icon: <HardDrive className="w-4 h-4 text-emerald-600" /> },
    { label: 'Knowledge Base', value: security.knowledgeBase || 'Local Vector RAG', icon: <ShieldCheck className="w-4 h-4 text-blue-600" /> },
    { label: 'External API', value: security.externalApi || 'Disabled', icon: <WifiOff className="w-4 h-4 text-rose-600" /> },
    { label: 'Network', value: security.network || 'Air-Gapped', icon: <Radio className="w-4 h-4 text-purple-600" /> },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          System Status (Local)
        </h3>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          UI Indicator
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-white border border-slate-200 shadow-2xs">
                {item.icon}
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">{item.label}</p>
                <p className="text-xs font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemStatus;
