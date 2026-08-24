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
  Search,
  Zap,
  TrendingUp,
  FileText,
  ShieldCheck,
  Sparkles,
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
        subtitle="Confidential On-Premise Industrial Operations & AI Telemetry Dashboard"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* TOP ROW: 4 Metric Cards with 2px Top-Border Accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Tasks */}
          <div className="relative overflow-hidden bg-[#111827] rounded-2xl p-4 shadow-xl border border-slate-800 border-t-2 border-t-sky-500 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400">
                  <Activity className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Tasks</p>
                </div>
                <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                  <AnimatedCount value={4} />
                </h3>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                  <TrendingUp className="w-3 h-3 text-sky-400" /> +14.2% workload
                </div>
              </div>
              <Sparkline data={[12, 18, 14, 25, 20, 32, 28, 40]} color="#38bdf8" width={75} height={32} trendText="Workload: Increasing" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2 border-t border-slate-800/80 pt-2 flex justify-between">
              <span>3 Completed</span>
              <span className="text-sky-400 font-semibold">1 Running</span>
            </p>
          </div>

          {/* Card 2: Local AI Models */}
          <div
            className="relative overflow-hidden bg-[#111827] rounded-2xl p-4 shadow-xl border border-slate-800 border-t-2 border-t-purple-500 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: '60ms' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400">
                  <Cpu className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Local Models</p>
                </div>
                <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                  <AnimatedCount value={3} />
                </h3>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Ready
                </div>
              </div>
              <Sparkline data={[20, 22, 25, 24, 28, 30, 35, 38]} color="#c084fc" width={75} height={32} trendText="Models: Stable" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2 border-t border-slate-800/80 pt-2 truncate">
              Qwen-72B, DeepSeek-16B, Llava-34B
            </p>
          </div>

          {/* Card 3: Knowledge Docs */}
          <div
            className="relative overflow-hidden bg-[#111827] rounded-2xl p-4 shadow-xl border border-slate-800 border-t-2 border-t-indigo-500 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Knowledge Docs</p>
                </div>
                <h3 className="text-3xl font-black text-white font-mono tracking-tight">
                  <AnimatedCount value={18} />
                </h3>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  <Layers className="w-3 h-3 text-indigo-400" /> 12,280 Chunks
                </div>
              </div>
              <Sparkline data={[100, 105, 120, 115, 130, 140, 155, 170]} color="#818cf8" width={75} height={32} trendText="RAG Index: Growing" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2 border-t border-slate-800/80 pt-2 truncate">
              ChromaDB On-Premise Vector RAG
            </p>
          </div>

          {/* Card 4: System Status */}
          <div
            className="relative overflow-hidden bg-[#111827] rounded-2xl p-4 shadow-xl border border-slate-800 border-t-2 border-t-emerald-500 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: '180ms' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">System Status</p>
                </div>
                <h3 className="text-xl font-black text-emerald-400 font-mono tracking-tight flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Air-Gapped
                </h3>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  0.00 Outbound Leakage
                </div>
              </div>
              <Sparkline data={[50, 50, 50, 50, 50, 50, 50, 50]} color="#34d399" width={75} height={32} trendText="Security: Air-Gapped Stable" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2 border-t border-slate-800/80 pt-2 truncate">
              100% Isolated Data Center Subnet
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: MAIN TELEMETRY CHART & BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
          {/* Left Main Telemetry Chart (~70% / 8 cols) */}
          <div className="lg:col-span-8 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                  Industrial GPU Compute & Inference Telemetry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time TFLOPS compute load across open-weight LLM instances</p>
              </div>

              {/* Time Range Filter Buttons */}
              <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-slate-800">
                {['24H', '7D', '30D', '90D', 'ALL'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeFrame(tf)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
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

            {/* Main Area Line Chart with NON-OVERLAPPING Tooltip */}
            <div className="relative h-64 w-full pt-6 overflow-visible">
              {/* Tooltip Fix: Solid Dark Navy backdrop, Sky-Blue border */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#090d16] border border-sky-400/50 shadow-2xl rounded-xl px-4 py-2 z-30 pointer-events-none flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Peak Local Load</p>
                  <p className="text-sm font-black text-sky-400 font-mono">142.8 TFLOPS</p>
                </div>
                <div className="border-l border-slate-800 pl-3">
                  <p className="text-[10px] text-slate-300 font-mono">MRPL Data Center Node-01</p>
                  <p className="text-[9px] text-emerald-400 font-mono font-bold">100% Operational</p>
                </div>
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="skyChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="800" y2="30" stroke="#1e293b" strokeDasharray="4" />
                <line x1="0" y1="80" x2="800" y2="80" stroke="#1e293b" strokeDasharray="4" />
                <line x1="0" y1="130" x2="800" y2="130" stroke="#1e293b" strokeDasharray="4" />

                {/* Area Gradient Fill */}
                <path
                  d="M 0,140 L 50,138 L 100,135 L 150,130 L 200,128 L 250,115 L 300,125 L 350,100 L 400,120 L 450,90 L 500,60 L 550,110 L 600,30 L 650,70 L 700,50 L 750,100 L 800,80 L 800,180 L 0,180 Z"
                  fill="url(#skyChartGrad)"
                />

                {/* Main Glowing Line Path */}
                <path
                  d="M 0,140 L 50,138 L 100,135 L 150,130 L 200,128 L 250,115 L 300,125 L 350,100 L 400,120 L 450,90 L 500,60 L 550,110 L 600,30 L 650,70 L 700,50 L 750,100 L 800,80"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Peak Load Dot Marker */}
                <circle cx="600" cy="30" r="6" fill="#38bdf8" className="animate-ping" />
                <circle cx="600" cy="30" r="5" fill="#090d16" />
              </svg>

              {/* Time X-Axis Ticks */}
              <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800">
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

          {/* Right Performance Breakdown Card (~30% / 4 cols) */}
          <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Model Performance & Metrics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Local execution benchmarks</p>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-colors">
                <span className="text-slate-300 font-medium">Reasoning Accuracy</span>
                <span className="h-7 px-3 inline-flex items-center justify-center rounded-lg text-xs font-mono font-bold text-purple-300 bg-purple-950/80 border border-purple-500/40">
                  99.4%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-colors">
                <span className="text-slate-300 font-medium">Code Verification Rate</span>
                <span className="h-7 px-3 inline-flex items-center justify-center rounded-lg text-xs font-mono font-bold text-[#10b981] bg-emerald-950/80 border border-emerald-500/40">
                  98.8%
                </span>
              </div>

              {/* Standardized KPI Badge 1: Vector RAG Latency */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-colors">
                <span className="text-slate-300 font-medium">Vector RAG Latency</span>
                <span className="h-7 px-3 inline-flex items-center justify-center rounded-lg text-xs font-mono font-bold text-blue-300 bg-blue-950/80 border border-blue-500/40">
                  &lt;0.6s
                </span>
              </div>

              {/* Standardized KPI Badge 2: Sandbox Isolation */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-colors">
                <span className="text-slate-300 font-medium">Sandbox Isolation</span>
                <span className="h-7 px-3 inline-flex items-center justify-center rounded-lg text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40">
                  100%
                </span>
              </div>

              {/* Standardized KPI Badge 3: Outbound Data Leakage */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-colors">
                <span className="text-slate-300 font-medium">Outbound Data Leakage</span>
                <span className="h-7 px-3 inline-flex items-center justify-center rounded-lg text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40">
                  0.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SIH 2026 DEMONSTRATION SCENARIO PRESETS BANNER */}
        <div className="bg-[#111827] rounded-2xl p-4 border border-purple-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-semibold">
                SIH 2026 Demonstration Scenario Presets
              </div>
              <h2 className="text-sm font-bold text-white">Launch Industrial Audit & Verification Workflow</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Demonstrate multimodal PDF analysis, local model routing, vector RAG search, and automated approval note generation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleLaunchScenario('preset-1')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Turbine Inspection
            </button>
            <button
              onClick={() => handleLaunchScenario('preset-2')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 font-bold text-xs transition-all duration-200 border border-purple-500/40 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Pipeline Code
            </button>
          </div>
        </div>

        {/* RECENT TASK EXECUTIONS TABLE */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
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
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#090d16] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all font-sans"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#090d16] border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Task Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Selected Model</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Deliverable</th>
                  <th className="py-3.5 px-4 text-right">Trend Sparkline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 font-medium">
                      No task records found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, idx) => {
                    const isFailed = (task.status || '').toLowerCase() === 'failed';
                    return (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`transition-all duration-200 cursor-pointer ${
                          isFailed
                            ? 'bg-rose-950/20 hover:bg-rose-950/35 border-l-2 border-l-rose-500'
                            : 'hover:bg-[#182338]'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isFailed
                                  ? 'bg-rose-500'
                                  : idx === 0
                                  ? 'bg-sky-400 animate-ping'
                                  : 'bg-emerald-400'
                              }`}
                            ></span>
                            <span className="hover:text-sky-300 transition-colors">{task.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-md font-semibold text-[11px] bg-[#090d16] text-slate-300 border border-slate-800">
                            {task.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-purple-300">{task.model}</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{task.date}</td>
                        <td className="py-3.5 px-4">
                          {task.deliverable ? (
                            <div className="relative group/tooltip inline-block">
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] cursor-pointer hover:underline">
                                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                {task.deliverable.length > 18
                                  ? task.deliverable.substring(0, 16) + '...'
                                  : task.deliverable}
                              </span>

                              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/tooltip:block bg-[#090d16] text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-sky-400/50 shadow-2xl whitespace-nowrap z-30 pointer-events-none">
                                📄 {task.deliverable}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-block">
                            <Sparkline
                              data={
                                idx % 3 === 0
                                  ? [10, 20, 15, 30, 25, 40]
                                  : idx % 3 === 1
                                  ? [25, 20, 35, 30, 45, 50]
                                  : [35, 30, 25, 20, 15, 10]
                              }
                              color={idx % 3 === 0 ? '#38bdf8' : idx % 3 === 1 ? '#10b981' : '#f43f5e'}
                              width={70}
                              height={24}
                              isPositive={idx % 3 !== 2}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
