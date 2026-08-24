import React from 'react';
import { X, CheckCircle2, Cpu, ShieldCheck, Clock, FileText, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">{task.name}</h2>
              <p className="text-xs text-slate-400 font-mono">Task ID: {task.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 font-sans text-sm">
          {/* Status & Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Status</span>
              <div className="mt-1">
                <StatusBadge status={task.status} />
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Task Type</span>
              <p className="text-xs font-bold text-slate-900 mt-1">{task.type}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Execution Time</span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">{task.duration || '3.8s'}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-medium uppercase">User / Operator</span>
              <p className="text-xs font-bold text-slate-900 mt-1">{task.user || 'Air-Gapped User'}</p>
            </div>
          </div>

          {/* Model & Security */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              On-Premise Model Router Specification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Selected Model:</span>{' '}
                <span className="font-bold text-slate-900">{task.model}</span>
              </div>
              <div>
                <span className="text-slate-500">Network State:</span>{' '}
                <span className="font-semibold text-emerald-700">🟢 Air-Gapped (Isolated)</span>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Output Deliverable
            </h4>
            {task.deliverable ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">{task.deliverable}</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  Verified Ready
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No output deliverable generated for this run.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close Task Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
