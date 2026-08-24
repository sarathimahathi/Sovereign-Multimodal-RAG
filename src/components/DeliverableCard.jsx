import React from 'react';
import { FileText, Sheet, FileCode, Eye, Download, Package, CheckCircle2 } from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';

export const DeliverableCard = () => {
  const { deliverables, setSelectedDeliverable } = useWorkbench();

  const getDeliverableIcon = (type) => {
    if (type === 'code') return <FileCode className="w-4 h-4 text-purple-600 shrink-0" />;
    if (type === 'xlsx') return <Sheet className="w-4 h-4 text-blue-600 shrink-0" />;
    return <FileText className="w-4 h-4 text-emerald-600 shrink-0" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 transition-all duration-200 hover:border-slate-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-emerald-600" />
          Deliverables
        </h3>
        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
          {deliverables.length} Verified
        </span>
      </div>

      {deliverables.length === 0 ? (
        <p className="text-xs text-slate-400 italic text-center py-3 bg-slate-50 rounded-lg border border-slate-200/60">
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
                    ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200/80 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {getDeliverableIcon(item.type)}
                    <span className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                      {item.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Generated
                  </span>
                </div>

                {item.summary && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <button
                    onClick={() => setSelectedDeliverable(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-white hover:bg-slate-200/70 border border-slate-300 text-slate-800 text-[11px] font-semibold transition-all duration-150 hover:shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-blue-600" /> Preview
                  </button>
                  <button
                    onClick={() => setSelectedDeliverable(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition-all duration-150 shadow-2xs hover:shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> Download
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
