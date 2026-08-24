import React from 'react';
import { CheckCircle2, Loader2, XCircle, Clock, AlertCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'completed' || normalized === 'ready' || normalized === 'indexed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.2]" />
        {status}
      </span>
    );
  }

  if (normalized === 'running' || normalized === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-950/80 text-sky-300 border border-sky-500/40">
        <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
        {status}
      </span>
    );
  }

  if (normalized === 'failed' || normalized === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
        <XCircle className="w-3.5 h-3.5 text-rose-400 stroke-[2.2]" />
        {status}
      </span>
    );
  }

  if (normalized === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#111827] text-slate-400 border border-slate-800">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#111827] text-purple-300 border border-purple-500/30">
      <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
      {status}
    </span>
  );
};

export default StatusBadge;
