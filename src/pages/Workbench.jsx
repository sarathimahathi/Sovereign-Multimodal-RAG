import React from 'react';
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
import { Plus, Sparkles, FolderUp } from 'lucide-react';

export const Workbench = () => {
  const {
    currentTaskName,
    uploadedFiles,
    applyPresetScenario,
    PRESET_SCENARIOS,
  } = useWorkbench();

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      {/* Top Header */}
      <Header
        title="AI Workbench"
        subtitle="3-Column Confidential On-Premise Industrial AI Task Execution Sandbox"
      />

      {/* Workflow Step Tracker */}
      <WorkflowProgress />

      {/* MAIN 3-COLUMN WORKBENCH GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[calc(100vh-130px)]">
        {/* LEFT PANEL: Task & Files (3 cols) */}
        <aside className="lg:col-span-3 bg-[#0e1320] border-r border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Title & New Task Button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Current Task</h2>
                <p className="text-[11px] text-sky-400 font-mono truncate max-w-[170px]" title={currentTaskName}>
                  {currentTaskName}
                </p>
              </div>
              <button
                onClick={() => applyPresetScenario('preset-1')}
                className="flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 text-sky-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-sky-500/40 transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
                title="Reset to New Task"
              >
                <Plus className="w-3.5 h-3.5" /> New Task
              </button>
            </div>

            {/* Industrial Scenario Presets for SIH Jury */}
            <div className="space-y-1.5 bg-[#111827] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> Demo Scenarios
              </span>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {PRESET_SCENARIOS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPresetScenario(p.id)}
                    className="text-left text-xs p-2 rounded-lg bg-[#090d16] hover:bg-[#182235] border border-slate-800 hover:border-purple-500/40 transition-all duration-150 font-medium text-slate-200 line-clamp-1 hover:translate-x-0.5 cursor-pointer"
                  >
                    🎯 {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Component */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FolderUp className="w-3.5 h-3.5 text-sky-400" /> Attached Files ({uploadedFiles.length})
              </label>
              <FileUpload />
            </div>

            {/* Ready Files List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {uploadedFiles.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4 bg-[#111827] rounded-xl border border-slate-800">
                  No files attached yet.
                </p>
              ) : (
                uploadedFiles.map((file) => <FileCard key={file.id} file={file} />)
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-white text-[11px] font-mono space-y-1">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              LOCAL ISOLATION ACTIVE
            </span>
            <p className="text-slate-400">All uploaded bytes parsed locally via PyPDF2 / pdf2image in isolated Docker sandbox.</p>
          </div>
        </aside>

        {/* CENTER PANEL: Execution & Conversation (6 cols) */}
        <main className="lg:col-span-6 bg-[#090d16] flex flex-col justify-between border-r border-slate-800 relative">
          <div className="p-3 bg-[#0e1320] border-b border-slate-800 flex items-center justify-between px-6">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              AI Workbench Execution Log
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Confidential Industrial AI Engine
            </span>
          </div>

          {/* Chat / Assistant Conversation */}
          <ChatWindow />

          {/* Task Input Box */}
          <ChatInput />
        </main>

        {/* RIGHT PANEL: Agent Operations & Deliverables (3 cols) */}
        <aside className="lg:col-span-3 bg-[#0e1320] p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-130px)]">
          {/* SECTION 1: AGENT ACTIVITY */}
          <AgentActivity />

          {/* SECTION 2: MODEL ROUTER */}
          <ModelRouter />

          {/* SECTION 3: TOOL CALLS */}
          <ToolActivity />

          {/* SECTION 4: DELIVERABLES */}
          <DeliverableCard />

          {/* SOURCES USED (RAG) */}
          <SourceCard />
        </aside>
      </div>

      {/* Deliverable Preview & Download Modal */}
      <DeliverableModal />
    </div>
  );
};

export default Workbench;
