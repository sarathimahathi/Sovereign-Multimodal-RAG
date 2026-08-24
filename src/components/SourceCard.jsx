import React from 'react';
import { BookOpen } from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';

export const SourceCard = () => {
  const { sourcesUsed } = useWorkbench();

  if (!sourcesUsed || sourcesUsed.length === 0) return null;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-md space-y-3 transition-all duration-200 hover:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Sources Used (Local RAG)
        </h3>
        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/40 font-semibold">
          Air-Gapped Index
        </span>
      </div>

      <div className="space-y-2">
        {sourcesUsed.map((source) => (
          <div
            key={source.id}
            className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-xs space-y-1 hover:border-indigo-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 truncate max-w-[180px]" title={source.title}>
                📄 {source.title}
              </span>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded font-semibold border border-indigo-500/30">
                {source.score}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 italic line-clamp-2 leading-relaxed">
              "{source.snippet}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceCard;
