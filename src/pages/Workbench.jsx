import React, { useState } from 'react';
import Header from '../components/Header';
import WorkflowProgress from '../components/WorkflowProgress';
import FileUpload from '../components/FileUpload';
import FileCard from '../components/FileCard';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import AgentActivity from '../components/AgentActivity';
import ModelRouter from '../components/ModelRouter';
import ToolActivity from '../components/ToolActivity';
import DeliverableCard from '../components/DeliverableCard';
import SourceCard from '../components/SourceCard';
import DeliverableModal from '../components/DeliverableModal';
import { useWorkbench } from '../context/WorkbenchContext';
import {
  Paperclip,
  SlidersHorizontal,
  Bot,
  FileCheck,
  Zap,
  FolderUp,
  X,
} from 'lucide-react';

export const Workbench = () => {
  const {
    currentTaskName,
    uploadedFiles,
    applyPresetScenario,
    PRESET_SCENARIOS,
  } = useWorkbench();

  // Sidebar toggle state & right panel tab state
  const [showInspector, setShowInspector] = useState(true);
  const [showFileDrawer, setShowFileDrawer] = useState(false);
  const [inspectorTab, setInspectorTab] = useState('agent'); // 'agent', 'deliverables', 'telemetry'

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      {/* Top Main Header */}
      <Header
        title="AI Workbench"
        subtitle="Confidential On-Premise Industrial AI Task Execution Sandbox"
      />

      {/* Connected Step Workflow Progress Bar */}
      <WorkflowProgress />

      {/* EXPANSIVE CHATBOT & INSPECTOR LAYOUT */}
      <div className="flex-1 flex min-h-[calc(100vh-130px)] relative overflow-hidden">
        {/* MAIN SPACIOUS CHATBOT CENTER PANEL */}
        <main className="flex-1 flex flex-col bg-[#0b0f19] justify-between relative min-w-0">
          {/* Top Chat Control Bar */}
          <div className="p-3 bg-[#0e1320] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 px-6 shadow-sm">
            {/* Left Task Title & Demo Scenario Pills */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Task</span>
                <h2 className="text-xs font-extrabold text-white truncate max-w-xs sm:max-w-md" title={currentTaskName}>
                  {currentTaskName}
                </h2>
              </div>

              {/* Demo Scenario Pill Quick Selector */}
              <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-3">
                {PRESET_SCENARIOS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPresetScenario(p.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#090d16] hover:bg-[#182235] text-sky-300 border border-slate-800 text-[11px] font-medium transition-all cursor-pointer truncate max-w-[140px]"
                    title={p.title}
                  >
                    🎯 {p.title.split(' ')[1] || p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* File Attachment Pill Drawer Toggle */}
              <button
                onClick={() => setShowFileDrawer(!showFileDrawer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  uploadedFiles.length > 0 || showFileDrawer
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-[#090d16] text-slate-300 border-slate-800 hover:bg-[#182235]'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Files ({uploadedFiles.length})</span>
              </button>

              {/* Inspector Panel Toggle Button */}
              <button
                onClick={() => setShowInspector(!showInspector)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  showInspector
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-[#090d16] text-slate-300 border-slate-800 hover:bg-[#182235]'
                }`}
                title={showInspector ? 'Hide Inspector Panel' : 'Show Inspector Panel'}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showInspector ? 'Hide Inspector' : 'Show Inspector'}</span>
              </button>
            </div>
          </div>

          {/* Slide-Down Compact File Attachment Drawer */}
          {showFileDrawer && (
            <div className="bg-[#0e1320] border-b border-slate-800 p-4 space-y-3 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FolderUp className="w-4 h-4 text-sky-400" /> Workspace File Ingestion
                </span>
                <button
                  onClick={() => setShowFileDrawer(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <FileUpload />

              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {uploadedFiles.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPANSIVE SPACIOUS CHAT CONVERSATION WINDOW */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <ChatWindow />
            <ChatInput />
          </div>
        </main>

        {/* COMPACT DE-CLUTTERED RIGHT INSPECTOR SIDEBAR */}
        {showInspector && (
          <aside className="w-80 lg:w-96 bg-[#0e1320] border-l border-slate-800 p-4 flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-130px)] shrink-0 transition-all duration-200 shadow-2xl">
            {/* Tab Header Switcher */}
            <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setInspectorTab('agent')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  inspectorTab === 'agent'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" /> Agent & Tools
              </button>
              <button
                onClick={() => setInspectorTab('deliverables')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  inspectorTab === 'deliverables'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" /> Outputs & RAG
              </button>
              <button
                onClick={() => setInspectorTab('telemetry')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  inspectorTab === 'telemetry'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Telemetry
              </button>
            </div>

            {/* TAB 1: AGENT & TOOLS */}
            {inspectorTab === 'agent' && (
              <div className="space-y-4 animate-fade-in">
                <AgentActivity />
                <ModelRouter />
                <ToolActivity />
              </div>
            )}

            {/* TAB 2: OUTPUTS & RAG */}
            {inspectorTab === 'deliverables' && (
              <div className="space-y-4 animate-fade-in">
                <DeliverableCard />
                <SourceCard />
              </div>
            )}

            {/* TAB 3: REAL-TIME TELEMETRY */}
            {inspectorTab === 'telemetry' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-sky-400" /> Live Telemetry
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                      AIR-GAPPED
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 flex justify-between">
                      <span className="text-slate-400">GPU VRAM Allocated</span>
                      <span className="text-sky-400 font-bold">14.2 GB</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 flex justify-between">
                      <span className="text-slate-400">gVisor Container RAM</span>
                      <span className="text-purple-400 font-bold">18.2 MB</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Vector RAG Latency</span>
                      <span className="text-indigo-400 font-bold">0.42s</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 flex justify-between">
                      <span className="text-slate-400">HMAC Security Signature</span>
                      <span className="text-emerald-400 font-bold">SHA-256 Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Deliverable Preview & Download Modal */}
      <DeliverableModal />
    </div>
  );
};

export default Workbench;
