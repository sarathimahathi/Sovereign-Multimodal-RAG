import React from 'react';
import { Bot, User, FileText, Download, Eye, Loader2 } from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';

export const ChatWindow = () => {
  const { chatMessages, isRunning, setSelectedDeliverable, activeStep } = useWorkbench();

  const getStepDescription = (step) => {
    switch (step) {
      case 1:
        return 'Step 1: Task Analysis — Analyzing task and extracting requirements...';
      case 2:
        return 'Step 2: Model Router — Selecting optimal local GGUF model...';
      case 3:
        return 'Step 3: File Processing — Ingesting and performing local document OCR...';
      case 4:
        return 'Step 4: Knowledge Base — Searching local vector RAG store...';
      case 5:
        return 'Step 5: Tool Execution — Running sandbox and generating deliverable...';
      case 6:
        return 'Step 6: Verification — Verifying output compliance and integrity...';
      default:
        return 'Executing task on local model engine...';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans bg-slate-50/50">
      {chatMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 animate-fade-in">
          <Bot className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No agent conversations yet.</p>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Describe your task below and click "Run Task" to execute on-premise.
          </p>
        </div>
      ) : (
        chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl animate-fade-in-up ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-transform duration-200 hover:scale-105 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`space-y-2 rounded-xl p-4 text-sm leading-relaxed transition-all duration-200 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-100/20 pb-1 mb-1">
                <span className={`text-[11px] font-semibold tracking-wide ${msg.sender === 'user' ? 'text-slate-300' : 'text-slate-900'}`}>
                  {msg.sender === 'user' ? 'Operator (Local Request)' : 'Local Sovereign Agent'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {msg.timestamp}
                </span>
              </div>

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* User attached files list */}
              {msg.files && msg.files.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/40 flex flex-wrap gap-1.5">
                  {msg.files.map((fname, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-mono"
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      {fname}
                    </span>
                  ))}
                </div>
              )}

              {/* Assistant Generated Deliverable Card Embed */}
              {msg.deliverable && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-50/90 border border-emerald-200 text-slate-900 space-y-2 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-950">{msg.deliverable.title}</p>
                        <p className="text-[10px] text-emerald-700 font-mono">Generated Output Deliverable</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedDeliverable(msg.deliverable)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-300 transition-all duration-150 shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button
                        onClick={() => setSelectedDeliverable(msg.deliverable)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition-all duration-150 shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>
                  {msg.deliverable.summary && (
                    <p className="text-xs text-slate-700 leading-normal">{msg.deliverable.summary}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Live Execution Progress Bar indicator */}
      {isRunning && (
        <div className="flex gap-3 max-w-xl mr-auto animate-fade-in-up">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bot className="w-4 h-4 animate-bounce" />
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <span className="font-semibold text-slate-900">{getStepDescription(activeStep)}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 rounded-full"
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
