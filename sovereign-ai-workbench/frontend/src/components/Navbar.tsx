import React from 'react';
import { ShieldCheck, RefreshCw, Activity, Server } from 'lucide-react';
import { useHealthStore } from '../store/useHealthStore';
import { API_BASE_URL } from '../services/api';

export const Navbar: React.FC = () => {
  const { healthData, latency, isLoading, error, checkHealth, isAutoPolling, toggleAutoPolling } = useHealthStore();

  const isHealthy = !error && healthData?.status === 'healthy';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="h-full w-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-100 tracking-tight text-lg">Sovereign AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
              v{healthData?.version || '0.1.0'}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Air-Gapped Multimodal AI Workbench</p>
        </div>
      </div>

      {/* Center Server Diagnostics */}
      <div className="hidden md:flex items-center space-x-4 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <Server className="h-3.5 w-3.5 text-slate-400" />
          <span>API:</span>
          <span className="text-slate-200 font-semibold">{API_BASE_URL}</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Latency:</span>
          <span className={`font-semibold ${latency && latency < 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {latency !== null ? `${latency} ms` : '--'}
          </span>
        </div>
      </div>

      {/* Right Controls & Health Status */}
      <div className="flex items-center space-x-3">
        {/* Real-time Health Status Pill */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
            isHealthy
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isHealthy && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span>{isHealthy ? 'BACKEND ONLINE' : error ? 'UNREACHABLE' : 'CONNECTING...'}</span>
        </div>

        {/* Auto Polling Toggle */}
        <button
          onClick={toggleAutoPolling}
          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
            isAutoPolling
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
          title={isAutoPolling ? 'Auto-polling every 3s (Active)' : 'Auto-polling paused'}
        >
          <Activity className="h-3.5 w-3.5 inline mr-1" />
          <span className="hidden sm:inline">{isAutoPolling ? 'Live' : 'Paused'}</span>
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={() => checkHealth()}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors disabled:opacity-50"
          title="Refresh Health Now"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
