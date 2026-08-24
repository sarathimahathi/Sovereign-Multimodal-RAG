import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import { Cpu, Zap, ShieldCheck } from 'lucide-react';

export const ModelRouter = () => {
  const { selectedModel } = useWorkbench();

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 transition-all duration-300 hover:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
          Model Router
        </h3>
        <span className="text-[10px] font-mono bg-[#090d16] text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-semibold">
          Auto-Selected
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center bg-[#090d16] p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 font-medium">Task Type:</span>
          <span className="font-semibold text-white bg-[#111827] px-2 py-0.5 rounded border border-slate-800">
            {selectedModel.taskType}
          </span>
        </div>

        {/* Selected Model Card */}
        <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/40 shadow-md space-y-1.5 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-purple-300 font-medium">Selected Local Model:</span>
            <span className="text-[10px] font-mono font-extrabold bg-purple-600 text-white px-1.5 py-0.2 rounded">
              LOCAL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-bold text-white text-xs">{selectedModel.name}</span>
          </div>

          <p className="text-[10px] font-mono text-slate-400">
            {selectedModel.architecture}
          </p>
        </div>

        <div className="flex justify-between items-center bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/30 text-emerald-300">
          <span className="font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Status:
          </span>
          <span className="font-semibold flex items-center gap-1.5 text-emerald-400">
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
