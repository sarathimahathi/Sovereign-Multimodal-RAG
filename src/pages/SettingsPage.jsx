import React, { useState } from 'react';
import Header from '../components/Header';
import { Settings, Save, Server, Cpu, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SettingsPage = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [maxContextTokens, setMaxContextTokens] = useState('32768');
  const [vectorChunkSize, setVectorChunkSize] = useState('512');
  const [gpuThreads, setGpuThreads] = useState('32');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      <Header
        title="Workbench Settings"
        subtitle="Configure Local Engine Parameters, FastAPI Endpoint, and Hardware Allocation"
      />

      <main className="p-6 space-y-6 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Backend Connection */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Server className="w-4 h-4 text-sky-400" /> FastAPI On-Premise Backend Integration
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Backend Endpoint URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full p-3 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Placeholder REST/WebSocket URL for connecting to on-premise FastAPI Python backend.
              </p>
            </div>
          </div>

          {/* Section 2: Model & Vector Parameters */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-4 h-4 text-purple-400" /> Local Model & Vector RAG Engine Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Context Window</label>
                <select
                  value={maxContextTokens}
                  onChange={(e) => setMaxContextTokens(e.target.value)}
                  className="w-full p-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-all font-mono cursor-pointer"
                >
                  <option value="16384">16,384 tokens</option>
                  <option value="32768">32,768 tokens</option>
                  <option value="65536">65,536 tokens</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Vector Chunk Size</label>
                <select
                  value={vectorChunkSize}
                  onChange={(e) => setVectorChunkSize(e.target.value)}
                  className="w-full p-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono cursor-pointer"
                >
                  <option value="256">256 tokens</option>
                  <option value="512">512 tokens</option>
                  <option value="1024">1,024 tokens</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">GPU Offload Threads</label>
                <select
                  value={gpuThreads}
                  onChange={(e) => setGpuThreads(e.target.value)}
                  className="w-full p-2.5 bg-[#090d16] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono cursor-pointer"
                >
                  <option value="16">16 Cores</option>
                  <option value="32">32 Cores</option>
                  <option value="64">64 Cores</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between">
            {isSaved ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Settings saved successfully!
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SettingsPage;
