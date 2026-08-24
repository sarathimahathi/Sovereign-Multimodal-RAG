import React, { useState } from 'react';
import { Paperclip, Mic, Play, Loader2, Sparkles } from 'lucide-react';
import { useWorkbench } from '../context/WorkbenchContext';

export const ChatInput = () => {
  const { taskPrompt, setTaskPrompt, isRunning, runDemoTask, uploadedFiles } = useWorkbench();
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canRun) runDemoTask();
    }
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      setTaskPrompt((prev) => (prev ? prev + ' [Voice Input: Audio transcribed]' : 'Read this inspection report and generate approval note.'));
    }
  };

  const canRun = !isRunning && (taskPrompt.trim().length > 0 || uploadedFiles.length > 0);

  return (
    <div className="p-4 bg-[#0e1320] border-t border-slate-800 shadow-xl sticky bottom-0 z-10">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="relative rounded-xl border border-slate-800 focus-within:border-sky-500 bg-[#111827] transition-all shadow-md">
          <textarea
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder="Ask the local AI to analyze, create or execute confidential tasks..."
            rows={3}
            className="w-full p-3.5 pr-24 text-sm text-slate-100 placeholder-slate-500 bg-transparent resize-none focus:outline-none font-sans"
          />

          {/* Buttons Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#090d16] border-t border-slate-800 rounded-b-xl">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors">
                <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                Attach
                <input type="file" multiple className="hidden" />
              </label>

              <button
                type="button"
                onClick={toggleVoice}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isVoiceActive
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-sky-400" />
                {isVoiceActive ? 'Listening...' : 'Voice'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runDemoTask}
                disabled={!canRun}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                  canRun
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/50 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current stroke-none" />
                    Run Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span>Target Mode: On-Premise Air-Gapped Sandbox</span>
          <span className="flex items-center gap-1 text-purple-400 font-semibold">
            <Sparkles className="w-3 h-3 text-purple-400" /> Multi-Model Auto Router Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
