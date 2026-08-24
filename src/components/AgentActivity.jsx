import React from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export const AgentActivity = () => {
  const { agentActivity } = useWorkbench();

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 transition-all duration-200 hover:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Agent Activity Timeline
        </h3>
        <span className="text-[10px] font-mono text-slate-500">Execution Stream</span>
      </div>

      <div className="space-y-2 relative pl-2">
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-800 -z-0"></div>

        {agentActivity.map((item) => {
          const isDone = item.status === 'completed';
          const isRunning = item.status === 'running';

          return (
            <div key={item.id} className="flex items-center gap-2.5 text-xs relative z-10 transition-all duration-200">
              <div className="bg-[#111827] p-0.5 rounded-full">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.2] shrink-0 animate-scale-in" />
                ) : isRunning ? (
                  <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-700 shrink-0" />
                )}
              </div>

              <span
                className={`font-medium transition-colors duration-200 ${
                  isDone
                    ? 'text-slate-200 font-medium'
                    : isRunning
                    ? 'text-sky-400 font-bold animate-pulse'
                    : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentActivity;
