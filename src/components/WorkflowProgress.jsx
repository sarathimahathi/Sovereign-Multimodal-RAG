import React from 'react';
import { WORKFLOW_STEPS, useWorkbench } from '../context/WorkbenchContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const WorkflowProgress = () => {
  const { activeStep, isRunning } = useWorkbench();

  return (
    <div className="bg-[#0e1320] border-b border-slate-800 px-6 py-3 shadow-md">
      <div className="flex items-center justify-between max-w-6xl mx-auto overflow-x-auto py-1 scrollbar-none">
        {WORKFLOW_STEPS.map((step, index) => {
          const isDone = activeStep > step.id || activeStep === 6;
          const isActive = activeStep === step.id && isRunning;
          const isPast = activeStep >= step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2.5 shrink-0 transition-all duration-300">
                {/* Step Circle Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-md scale-100'
                      : isActive
                      ? 'bg-sky-500 text-white ring-4 ring-sky-500/30 shadow-lg animate-pulse scale-105'
                      : isPast
                      ? 'bg-sky-600 text-white'
                      : 'bg-[#111827] text-slate-500 border border-slate-800'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5] animate-scale-in" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step Label & Status */}
                <div className="flex flex-col">
                  <span
                    className={`text-xs transition-colors duration-200 ${
                      isActive
                        ? 'text-sky-400 font-bold tracking-tight'
                        : isDone
                        ? 'text-white font-semibold'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>

                  <span className="text-[10px] font-mono leading-none mt-0.5">
                    {isDone ? (
                      <span className="text-emerald-400 font-medium">Completed</span>
                    ) : isActive ? (
                      <span className="text-sky-400 font-semibold animate-pulse">Running...</span>
                    ) : (
                      <span className="text-slate-500">Pending</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Connected Animated Workflow Line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="flex-1 max-w-[40px] mx-2 flex items-center">
                  <div
                    className={`h-0.5 w-full rounded-full transition-all duration-500 ${
                      activeStep > step.id
                        ? 'bg-emerald-500'
                        : activeStep === step.id && isRunning
                        ? 'animated-flow-line h-1'
                        : 'bg-slate-800'
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowProgress;
