import React from 'react';
import { Lock } from 'lucide-react';

export const SecurityBadge = () => {
  return (
    <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-md border border-slate-700 shadow-xs text-xs font-mono select-none transition-all duration-200 hover:border-slate-600">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
      </span>
      <span className="font-semibold text-emerald-400 tracking-wider">LOCAL</span>
      <span className="text-slate-500">|</span>
      <span className="text-slate-300 font-medium tracking-wide flex items-center gap-1">
        <Lock className="w-3 h-3 text-emerald-400" /> AIR-GAPPED
      </span>
    </div>
  );
};

export default SecurityBadge;
