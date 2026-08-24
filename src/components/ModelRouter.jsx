import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import { Cpu, Zap, ShieldCheck } from 'lucide-react';

export const ModelRouter = () => {
  const { selectedModel } = useWorkbench();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 transition-all duration-300 hover:border-blue-300 hover:shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
          Model Router
        </h3>
        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
          Auto-Selected
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-slate-500 font-medium">Task Type:</span>
          <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
            {selectedModel.taskType}
          </span>
        </div>

        {/* Selected Model Card with Subtle Glow & Animation */}
        <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 ring-2 ring-blue-100/60 shadow-2xs space-y-1.5 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-blue-900 font-medium">Selected Local Model:</span>
            <span className="text-[10px] font-mono font-extrabold bg-blue-700 text-white px-1.5 py-0.2 rounded">
              LOCAL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold text-blue-950 text-xs">{selectedModel.name}</span>
          </div>

          <p className="text-[10px] font-mono text-blue-800">
            {selectedModel.architecture}
          </p>
        </div>

        <div className="flex justify-between items-center bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 text-emerald-900">
          <span className="font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Status:
          </span>
          <span className="font-semibold flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Running Locally
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModelRouter;
