import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import StatusBadge from './StatusBadge';
import { Wrench } from 'lucide-react';

export const ToolActivity = () => {
  const { toolCalls } = useWorkbench();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 transition-all duration-200 hover:border-slate-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-purple-600" />
          Tool Calls
        </h3>
        <span className="text-[10px] font-mono text-slate-400">Isolated Sandbox</span>
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
                  ? 'bg-blue-50/90 border-blue-300 shadow-2xs animate-pulse ring-1 ring-blue-200'
                  : isCompleted
                  ? 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                  : isPending
                  ? 'bg-slate-50/40 border-slate-100 opacity-50'
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${
                    isRunning ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {tool.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {tool.time && tool.time !== '-' && (
                  <span className="text-[10px] text-slate-400 font-mono">{tool.time}</span>
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
