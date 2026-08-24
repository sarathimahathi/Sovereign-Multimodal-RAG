import React, { useState } from 'react';
import { useWorkbench } from '../context/WorkbenchContext';
import { X, Download, FileText, CheckCircle2, Copy, Check } from 'lucide-react';

export const DeliverableModal = () => {
  const { selectedDeliverable, setSelectedDeliverable } = useWorkbench();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!selectedDeliverable) return null;

  const handleCopy = () => {
    if (selectedDeliverable.previewText) {
      navigator.clipboard.writeText(selectedDeliverable.previewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    // Create a mock text file download trigger
    const element = document.createElement('a');
    const file = new Blob([selectedDeliverable.previewText || 'Deliverable Content'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedDeliverable.title;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">{selectedDeliverable.title}</h2>
              <p className="text-xs text-slate-400 font-mono">
                {selectedDeliverable.size} | {selectedDeliverable.date || 'Generated On-Premise'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDeliverable(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 font-sans text-sm">
          {selectedDeliverable.summary && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Summary & Verification Outcome</p>
                <p className="text-blue-800 mt-0.5">{selectedDeliverable.summary}</p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Document Preview Content
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Content'}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre-wrap">
              {selectedDeliverable.previewText || 'No text preview available.'}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Air-Gapped Local Verification: 100% Passed</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDeliverable(null)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              {downloadSuccess ? 'Downloaded!' : 'Download File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverableModal;
