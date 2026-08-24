import React from 'react';
import { FileText, Sheet, FileCode, Eye, Download, Package, CheckCircle2 } from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';

export const DeliverableCard = () => {
  const { deliverables, setSelectedDeliverable } = useWorkbench();

  const getDeliverableIcon = (type) => {
    if (type === 'code') return <FileCode className="w-4 h-4 text-purple-400 shrink-0" />;
    if (type === 'xlsx') return <Sheet className="w-4 h-4 text-[#10b981] shrink-0" />;
    return <FileText className="w-4 h-4 text-sky-400 shrink-0" />;
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 transition-all duration-200 hover:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <Package className="w-4 h-4 text-emerald-400" />
          Deliverables
        </h3>
        <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-semibold">
          {deliverables.length} Verified
        </span>
      </div>

      {deliverables.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-3 bg-[#090d16] rounded-lg border border-slate-800">
          No deliverables generated yet.
        </p>
      ) : (
        <div className="space-y-2.5">
          {deliverables.map((item, idx) => {
            const isNewest = idx === 0;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border transition-all duration-300 space-y-2 animate-scale-in ${
                  isNewest
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md'
                    : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {getDeliverableIcon(item.type)}
                    <span className="text-xs font-bold text-white truncate" title={item.title}>
                      {item.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-0.5 bg-[#111827] px-1.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Generated
                  </span>
                </div>

                {item.summary && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedDeliverable(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-[#111827] hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-sky-400" /> Preview
                  </button>
                  <button
                    onClick={() => setSelectedDeliverable(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3 h-3 text-white" /> Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliverableCard;
