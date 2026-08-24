import React, { useState } from 'react';
import Header from '../components/Header';
import DeliverableModal from '../components/DeliverableModal';
import { useWorkbench } from '../context/WorkbenchContext';
import { FileText, Download, Eye, Sheet, FileCode, CheckCircle2 } from 'lucide-react';

export const DocumentsPage = () => {
  const { deliverables, setSelectedDeliverable } = useWorkbench();

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      <Header
        title="Generated Documents Archive"
        subtitle="Repository of Official Approval Notes, Spreadsheets, and Verified Code Deliverables"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Banner */}
        <div className="bg-[#111827] border border-rose-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-semibold">
              <FileText className="w-3.5 h-3.5 text-rose-400" /> MRPL Official Deliverable Gallery
            </div>
            <h2 className="text-xl font-extrabold text-white">AI Engine Output Deliverables</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Inspect generated Word approval notes (`.docx`), telemetry datasets (`.xlsx`), and verified Python scripts (`.py`).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#090d16] px-4 py-2 rounded-xl border border-rose-500/30 text-xs font-mono text-rose-300 font-bold">
            <CheckCircle2 className="w-4 h-4 text-rose-400" />
            <span>On-Premise Generated & Signed</span>
          </div>
        </div>

        {/* Deliverables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliverables.map((item) => (
            <div
              key={item.id}
              className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#090d16] text-rose-300 border border-rose-500/30 text-[11px] font-mono uppercase font-bold">
                    {item.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{item.date}</span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{item.summary}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedDeliverable(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Document
                </button>
                <button
                  onClick={() => alert(`Simulated Download: ${item.title}`)}
                  className="flex items-center justify-center p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <DeliverableModal />
    </div>
  );
};

export default DocumentsPage;
