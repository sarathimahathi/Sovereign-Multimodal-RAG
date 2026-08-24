import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import StatusBadge from './StatusBadge';
import { Wrench } from 'lucide-react';

export const ToolActivity = () => {
  const { toolCalls } = useWorkbench();

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 transition-all duration-200 hover:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-sky-400" />
          Tool Calls
        </h3>
        <span className="text-[10px] font-mono text-slate-500">Isolated Sandbox</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {toolCalls.map((tool, idx) => {
          const isRunning = tool.status === 'Running';
          const isPending = tool.status === 'Pending';
          const isCompleted = tool.status === 'Completed';

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all duration-200 ${
                isRunning
                  ? 'bg-sky-950/40 border-sky-500/50 shadow-md animate-pulse'
                  : isCompleted
                  ? 'bg-[#090d16] border-slate-800 hover:border-emerald-500/40'
                  : isPending
                  ? 'bg-[#090d16]/50 border-slate-800/60 opacity-50'
                  : 'bg-[#090d16] border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${
                    isRunning ? 'text-sky-400 font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {tool.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {tool.time && tool.time !== '-' && (
                  <span className="text-[10px] text-slate-500 font-mono">{tool.time}</span>
                )}
                <StatusBadge status={tool.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToolActivity;
