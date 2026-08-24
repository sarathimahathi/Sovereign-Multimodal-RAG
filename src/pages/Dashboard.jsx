import React, { useState } from 'react';
import Header from '../components/Header';
import Sparkline from '../components/Sparkline';
import AnimatedCount from '../components/AnimatedCount';
import StatusBadge from '../components/StatusBadge';
import TaskDetailModal from '../components/TaskDetailModal';
import { useWorkbench } from '../context/WorkbenchContext';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  CheckCircle2,
  BookOpen,
  Activity,
  Plus,
  ArrowRight,
  Search,
  Zap,
  TrendingUp,
  FileText,
  ShieldCheck,
  Sparkles,
  Server,
  Database,
  Layers,
} from 'lucide-react';

export const Dashboard = () => {
  const { tasks, applyPresetScenario } = useWorkbench();
  const navigate = useNavigate();

  const [selectedTask, setSelectedTask] = useState(null);
  const [tableSearch, setTableSearch] = useState('');
  const [activeTimeFrame, setActiveTimeFrame] = useState('24H');

  const handleLaunchScenario = (presetId) => {
    applyPresetScenario(presetId);
    navigate('/workbench');
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.type.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.model.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      <Header
        title="MRPL Sovereign AI Workbench"
        subtitle="Confidential On-Premise Industrial Operations & Multi-Color AI Telemetry Dashboard"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* TOP ROW: 4 Multi-Color Metric Cards (Sky Blue, Lavender, Indigo, Emerald) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Tasks (Light Sky Blue Theme) */}
          <div className="relative overflow-hidden bg-[#111827]/90 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-900/40 via-transparent to-transparent border border-sky-500/30 hover:border-sky-400/60 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400">
                  <Activity className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">Active Tasks</p>
                </div>
                <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                  <AnimatedCount value={4} />
                </h3>
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-500/40">
                  <TrendingUp className="w-3 h-3 text-sky-400" /> +14.2% workload
                </div>
              </div>
              <Sparkline data={[12, 18, 14, 25, 20, 32, 28, 40]} color="#38bdf8" width={80} height={38} />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2 border-t border-sky-900/40 pt-2 flex justify-between">
              <span>3 Completed</span>
              <span className="text-sky-400 font-semibold">1 Running</span>
            </p>
          </div>

          {/* Card 2: Local AI Models (Lavender / Violet Theme) */}
          <div
            className="relative overflow-hidden bg-[#111827]/90 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent border border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: '60ms' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400">
                  <Cpu className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300">Local Models</p>
                </div>
                <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                  <AnimatedCount value={3} />
                </h3>
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded-full border border-purple-500/40">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" /> 100% Ready
                </div>
              </div>
              <Sparkline data={[20, 22, 25, 24, 28, 30, 35, 38]} color="#c084fc" width={80} height={38} />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2 border-t border-purple-900/40 pt-2 truncate">
              Qwen-72B, DeepSeek-16B, Llava-34B
            </p>
          </div>

          {/* Card 3: Knowledge Docs (Indigo / Royal Blue Theme) */}
          <div
            className="relative overflow-hidden bg-[#111827]/90 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent border border-indigo-500/30 hover:border-indigo-400/60 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Knowledge Docs</p>
                </div>
                <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                  <AnimatedCount value={18} />
                </h3>
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded-full border border-indigo-500/40">
                  <Layers className="w-3 h-3 text-indigo-400" /> 12,280 Chunks
                </div>
              </div>
              <Sparkline data={[100, 105, 120, 115, 130, 140, 155, 170]} color="#818cf8" width={80} height={38} />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2 border-t border-indigo-900/40 pt-2 truncate">
              ChromaDB On-Premise Vector RAG
            </p>
          </div>

          {/* Card 4: System Status (Emerald / Teal Theme) */}
          <div
            className="relative overflow-hidden bg-[#111827]/90 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: '180ms' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">System Status</p>
                </div>
                <h3 className="text-xl font-black text-emerald-400 font-mono tracking-tight flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Air-Gapped
                </h3>
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  0.00 Outbound Leakage
                </div>
              </div>
              <Sparkline data={[50, 50, 50, 50, 50, 50, 50, 50]} color="#34d399" width={80} height={38} />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2 border-t border-emerald-900/40 pt-2 truncate">
              100% Isolated Data Center Subnet
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: MAIN MULTI-COLOR ANALYTICS CHART & BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
          {/* Left Main Telemetry Chart (~70% / 8 cols) - Light Sky Blue & Lavender Accent */}
          <div className="lg:col-span-8 bg-[#111827]/90 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-900/30 via-indigo-950/20 to-transparent border border-sky-500/30 rounded-2xl p-6 shadow-xl space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                  Industrial GPU Compute & Inference Telemetry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time TFLOPS compute load across open-weight LLM instances</p>
              </div>

              {/* Time Range Filter Buttons matching reference layout */}
              <div className="flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800">
                {['24H', '7D', '30D', '90D', 'ALL'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeFrame(tf)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      activeTimeFrame === tf
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing Multi-Color Line Chart SVG (Sky Blue -> Lavender Gradient) */}
            <div className="relative h-64 w-full pt-4">
              {/* Interactive Floating Value Badge */}
              <div className="absolute top-8 left-2/3 -translate-x-1/2 bg-[#0b0f19]/95 border border-sky-400/50 shadow-2xl rounded-xl p-3 z-20 backdrop-blur-md animate-pulse-subtle">
                <p className="text-[10px] text-sky-300 font-mono uppercase tracking-wider">Peak Local Compute Load</p>
                <p className="text-base font-black text-sky-400 font-mono">142.8 TFLOPS</p>
                <p className="text-[9px] text-slate-400 font-mono">MRPL Data Center Node-01</p>
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="skyLavenderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#c084fc" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#1e293b" strokeDasharray="4" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="#1e293b" strokeDasharray="4" />
                <line x1="0" y1="140" x2="800" y2="140" stroke="#1e293b" strokeDasharray="4" />

                {/* Area Gradient Fill */}
                <path
                  d="M 0,160 L 50,158 L 100,155 L 150,150 L 200,148 L 250,135 L 300,145 L 350,120 L 400,140 L 450,110 L 500,80 L 550,130 L 600,40 L 650,90 L 700,60 L 750,120 L 800,100 L 800,200 L 0,200 Z"
                  fill="url(#skyLavenderGrad)"
                />

                {/* Main Multi-Color Glowing Line Path */}
                <path
                  d="M 0,160 L 50,158 L 100,155 L 150,150 L 200,148 L 250,135 L 300,145 L 350,120 L 400,140 L 450,110 L 500,80 L 550,130 L 600,40 L 650,90 L 700,60 L 750,120 L 800,100"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Peak Load Dot Marker */}
                <circle cx="600" cy="40" r="6" fill="#38bdf8" className="animate-ping" />
                <circle cx="600" cy="40" r="5" fill="#ffffff" />
              </svg>

              {/* Time X-Axis Ticks */}
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>18:00</span>
                <span>20:00</span>
                <span>22:00</span>
              </div>
            </div>
          </div>

          {/* Right Performance Breakdown Card (~30% / 4 cols) - Multi-Color Pills */}
          <div className="lg:col-span-4 bg-[#111827]/90 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/30 via-indigo-950/20 to-transparent border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Model Performance Metrics
              </h3>
              <p className="text-xs text-purple-300/80 mt-0.5">Local execution accuracy & speed</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-purple-500/40 transition-colors">
                <span className="text-slate-300">Reasoning Accuracy</span>
                <span className="font-bold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-500/40">
                  +99.4%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-sky-500/40 transition-colors">
                <span className="text-slate-300">Code Verification</span>
                <span className="font-bold text-sky-300 bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-sky-500/40">
                  98.8%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-slate-300">Vector RAG Latency</span>
                <span className="font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-500/40">
                  &lt;0.6s
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-indigo-500/40 transition-colors">
                <span className="text-slate-300">Sandbox Isolation</span>
                <span className="font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-500/40">
                  100%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-emerald-500/40 transition-colors">
                <span className="text-slate-300">Outbound Data Leakage</span>
                <span className="font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/40">
                  0.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Industrial Scenarios Banner (Sky Blue & Lavender Accents) */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] rounded-2xl p-5 border border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> SIH 2026 Demonstration Scenario Presets
            </div>
            <h2 className="text-base font-bold text-white">Launch Industrial Audit & Verification Workflow</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Demonstrate multimodal PDF analysis, local model routing, vector RAG search, and automated approval note generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleLaunchScenario('preset-1')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-900/40 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Turbine Inspection Preset
            </button>
            <button
              onClick={() => handleLaunchScenario('preset-2')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-900/40 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Pipeline Code Preset
            </button>
          </div>
        </div>

        {/* BOTTOM TABLE: DATA METRICS & RECENT TASKS */}
        <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Recent Task Executions & Audit Log
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any record to inspect local sandbox execution details</p>
            </div>

            {/* Table Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search tasks, models, status..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0b0f19] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all font-sans"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0f19] border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Selected Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Deliverable</th>
                  <th className="py-3 px-4 text-right">Activity Sparkline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                      No task records found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, idx) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="hover:bg-[#1f293d]/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            idx === 0 ? 'bg-sky-400 animate-ping' : idx === 1 ? 'bg-purple-400' : 'bg-indigo-400'
                          }`}
                        ></span>
                        <span className="group-hover:text-sky-400 transition-colors">{task.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-medium text-[11px] border ${
                            task.type.includes('Coding')
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                              : 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                          }`}
                        >
                          {task.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">{task.model}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{task.date}</td>
                      <td className="py-3 px-4">
                        {task.deliverable ? (
                          <span className="inline-flex items-center gap-1 text-sky-400 font-semibold text-[11px]">
                            <FileText className="w-3 h-3 text-sky-400" />
                            {task.deliverable.length > 18 ? task.deliverable.substring(0, 16) + '...' : task.deliverable}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-block">
                          <Sparkline
                            data={
                              idx % 3 === 0
                                ? [10, 20, 15, 30, 25, 40]
                                : idx % 3 === 1
                                ? [25, 20, 35, 30, 45, 50]
                                : [35, 30, 25, 20, 15, 10]
                            }
                            color={idx % 3 === 0 ? '#38bdf8' : idx % 3 === 1 ? '#c084fc' : '#f43f5e'}
                            width={70}
                            height={24}
                            isPositive={idx % 3 !== 2}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};

export default Dashboard;
