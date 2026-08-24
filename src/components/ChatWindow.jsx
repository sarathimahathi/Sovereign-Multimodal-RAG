import React from 'react';
import { Bot, User, FileText, Download, Eye, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';

export const ChatWindow = () => {
  const { chatMessages, isRunning, setSelectedDeliverable, activeStep } = useWorkbench();

  const getStepDescription = (step) => {
    switch (step) {
      case 1:
        return 'Task Analysis — Analyzing prompt & extracting requirements...';
      case 2:
        return 'Model Router — Selecting optimal local open-weight model...';
      case 3:
        return 'File Processing — Parsing attached files & OCR extraction...';
      case 4:
        return 'Knowledge Base — Searching local ChromaDB vector RAG store...';
      case 5:
        return 'Tool Execution — Running gVisor sandbox & document generator...';
      case 6:
        return 'Verification — Validating compliance & generating signed deliverable...';
      default:
        return 'Executing task on local model engine...';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans bg-[#0b0f19] text-slate-100">
      {chatMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-[#111827] border border-slate-800 text-sky-400 flex items-center justify-center mb-3 shadow-xl">
            <Bot className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">MRPL Sovereign AI Agent Ready</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            Select a demo scenario or enter your confidential industrial prompt below to run local inference.
          </p>
        </div>
      ) : (
        chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar Badge */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white border border-sky-400'
                  : 'bg-[#111827] text-emerald-400 border border-slate-800'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Card Bubble */}
            <div
              className={`space-y-2.5 rounded-2xl p-4.5 text-xs leading-relaxed shadow-lg transition-all duration-200 ${
                msg.sender === 'user'
                  ? 'bg-[#111827] text-slate-100 border border-sky-500/30 rounded-tr-xs font-semibold'
                  : 'bg-[#101726] border border-slate-800 text-slate-200 rounded-tl-xs hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 mb-1">
                <span className={`font-bold tracking-tight ${msg.sender === 'user' ? 'text-sky-300' : 'text-purple-400 flex items-center gap-1.5'}`}>
                  {msg.sender === 'user' ? 'Operator (Local Request)' : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      MRPL Sovereign Agent
                    </>
                  )}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {msg.timestamp}
                </span>
              </div>

              <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{msg.text}</p>

              {/* User attached files list */}
              {msg.files && msg.files.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {msg.files.map((fname, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090d16] text-slate-300 text-[10px] font-mono border border-slate-800"
                    >
                      <FileText className="w-3 h-3 text-sky-400" />
                      {fname}
                    </span>
                  ))}
                </div>
              )}

              {/* Assistant Generated Deliverable Card Embed */}
              {msg.deliverable && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#090d16] border border-slate-800 text-slate-100 space-y-2 shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate" title={msg.deliverable.title}>
                          {msg.deliverable.title}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-mono">Verified Deliverable Output</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setSelectedDeliverable(msg.deliverable)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-all active:scale-95 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button
                        onClick={() => setSelectedDeliverable(msg.deliverable)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>

                  {msg.deliverable.summary && (
                    <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-1.5">
                      {msg.deliverable.summary}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Live Execution Progress Bar indicator */}
      {isRunning && (
        <div className="flex gap-3 max-w-xl mr-auto">
          <div className="w-8 h-8 rounded-xl bg-[#111827] text-purple-400 border border-slate-800 flex items-center justify-center shrink-0 shadow-md">
            <Bot className="w-4 h-4 animate-bounce" />
          </div>
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl shadow-xl text-xs text-slate-100 space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
              <span className="font-bold text-white">{getStepDescription(activeStep)}</span>
            </div>
            <div className="w-full bg-[#090d16] h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-sky-500 to-purple-500 h-full transition-all duration-500 rounded-full shadow-sm"
                style={{ width: `${(activeStep / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
