import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Send,
  Terminal,
  Calculator,
  Eye,
  FileText,
  RefreshCw
} from 'lucide-react';
import {
  fetchModels,
  routeTaskPrompt,
  generateModelCompletion,
  ModelItem,
  TaskRouteResponse,
  GenerateResponse
} from '../services/api';

export const Models: React.FC = () => {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Router Tester State
  const [routerInput, setRouterInput] = useState('');
  const [routeResult, setRouteResult] = useState<TaskRouteResponse | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Inference Playground State
  const [genPrompt, setGenPrompt] = useState('');
  const [genModelPreference, setGenModelPreference] = useState('auto');
  const [genResult, setGenResult] = useState<GenerateResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadModelList = async () => {
    setIsLoadingModels(true);
    try {
      const res = await fetchModels();
      setModels(res.models);
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    loadModelList();
  }, []);

  const handleTestRoute = async (promptText: string) => {
    setRouterInput(promptText);
    setIsRouting(true);
    try {
      const res = await routeTaskPrompt(promptText, 'auto');
      setRouteResult(res);
    } catch (err: any) {
      alert(`Routing evaluation failed: ${err.message}`);
    } finally {
      setIsRouting(false);
    }
  };

  const handleManualRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routerInput.trim()) return;
    setIsRouting(true);
    try {
      const res = await routeTaskPrompt(routerInput, 'auto');
      setRouteResult(res);
    } catch (err: any) {
      alert(`Routing evaluation failed: ${err.message}`);
    } finally {
      setIsRouting(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await generateModelCompletion(genPrompt, genModelPreference);
      setGenResult(res);
    } catch (err: any) {
      alert(`Inference failed: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'CODE_ENGINEERING':
        return <Terminal className="h-4 w-4 text-emerald-400" />;
      case 'REASONING_MATH_CALCULATION':
        return <Calculator className="h-4 w-4 text-purple-400" />;
      case 'MULTIMODAL_VISION':
        return <Eye className="h-4 w-4 text-cyan-400" />;
      default:
        return <FileText className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center space-x-1.5">
              <Cpu className="h-3.5 w-3.5" />
              <span>Phase 4 Active: Multi-Model Manager & Dynamic Intent Router</span>
            </span>
            <span className="text-xs text-slate-400">• On-Premise Open-Weight LLMs</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Local Open-Weight Model Management & Task Routing
          </h1>
        </div>

        <button
          onClick={loadModelList}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 w-fit transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
          <span>Refresh Model Registry</span>
        </button>
      </div>

      {/* 1. MODEL REGISTRY GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Registered Industrial Models (4 Local Engines)
          </span>
          <span className="text-xs text-slate-500 font-mono">Zero-Cloud Egress • Air-Gapped VRAM Verified</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {models.map((m) => (
            <div
              key={m.model_id}
              className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-indigo-500/30 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getDomainIcon(m.domain)}
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {m.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {m.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-[10px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Parameter Size:</span>
                  <span className="text-slate-200">{m.param_size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantization:</span>
                  <span className="text-slate-200">{m.quantization}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated VRAM:</span>
                  <span className="text-indigo-400 font-bold">{m.vram_estimate_gb} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Context Window:</span>
                  <span className="text-slate-300">{m.context_window}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DYNAMIC INTENT ROUTER INTERACTIVE LAB */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-[#0B0F19]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Dynamic Intent Router & Auto-Selection Lab</h2>
              <p className="text-xs text-slate-400">
                Automatically routes incoming tasks to specialized models (Qwen 2.5 Coder vs DeepSeek R1 vs Llama 3).
              </p>
            </div>
          </div>
        </div>

        {/* Quick Task Presets */}
        <div className="space-y-2 mb-4">
          <span className="text-xs font-mono text-slate-400">Click a sample task to evaluate dynamic auto-routing:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() =>
                handleTestRoute('Write a Python script with pandas to parse refinery pump vibration logs and flag anomalies.')
              }
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/20 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 mb-1">
                <Terminal className="h-3.5 w-3.5" />
                <span>Code Automation</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Python scripting, regex parsing & internal tooling $\rightarrow$ Qwen 2.5 Coder
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                handleTestRoute(
                  'Calculate pressure drop and valve Cv coefficient for 350 gpm crude oil per API 520 standard equations.'
                )
              }
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/20 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400 mb-1">
                <Calculator className="h-3.5 w-3.5" />
                <span>Engineering Math</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Thermodynamic formulas & API 520 physics $\rightarrow$ DeepSeek R1
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                handleTestRoute('Examine scanned P&ID piping drawing and inspect fail-closed valve TAG #PV-401A.')
              }
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/20 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400 mb-1">
                <Eye className="h-3.5 w-3.5" />
                <span>P&ID Blueprint Vision</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Drawing OCR & piping diagram review $\rightarrow$ Llama 3.2 Vision
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                handleTestRoute('Draft a formal executive approval note for the Board of Directors regarding valve replacement.')
              }
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/20 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 mb-1">
                <FileText className="h-3.5 w-3.5" />
                <span>Board Approval Note</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                PSU compliance note & executive memo $\rightarrow$ Llama 3.1
              </p>
            </button>
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleManualRouteSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Type any custom industrial instruction to test dynamic classifier..."
            value={routerInput}
            onChange={(e) => setRouterInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isRouting || !routerInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isRouting ? 'Classifying...' : 'Evaluate Route'}</span>
          </button>
        </form>

        {/* Dynamic Route Results Banner */}
        {routeResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Selected Model:</span>
                <span className="text-sm font-bold text-emerald-400">{routeResult.model_name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {routeResult.domain}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Confidence:</span>
                <span className="text-xs font-bold text-white">{(routeResult.confidence_score * 100).toFixed(0)}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Routing Rationale:</strong> {routeResult.decision_rationale}
            </p>

            {routeResult.matched_keywords.length > 0 && (
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <span>Matched Domain Triggers:</span>
                <div className="flex flex-wrap gap-1">
                  {routeResult.matched_keywords.map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. LOCAL INFERENCE PLAYGROUND */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Local Sovereign Inference Console</h2>
              <p className="text-xs text-slate-400">
                Execute prompts with auto-routing or manually selected local models under zero-egress guards.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={genModelPreference}
              onChange={(e) => setGenModelPreference(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 sm:w-72"
            >
              <option value="auto">Auto (Dynamic Task Router - Recommended)</option>
              <option value="qwen2.5-coder:14b">Qwen 2.5 Coder (14B) - Code & Automation</option>
              <option value="deepseek-r1:14b">DeepSeek R1 (14B) - Reasoning & Math</option>
              <option value="llama3.2-vision:11b">Llama 3.2 Vision (11B) - P&ID Vision</option>
              <option value="llama3.1:8b">Llama 3.1 (8B) - Executive Briefing</option>
            </select>

            <input
              type="text"
              required
              placeholder="Enter prompt for local AI generation..."
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={isGenerating || !genPrompt.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 whitespace-nowrap disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Execute Local'}</span>
            </button>
          </div>
        </form>

        {/* Inference Output Preview */}
        {genResult ? (
          <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Model Executed:</span>
                <span className="text-xs font-bold text-indigo-300">{genResult.model_name}</span>
                <span className="text-[10px] text-slate-500">({genResult.engine})</span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span>
                  Latency: <strong className="text-white">{genResult.latency_ms} ms</strong>
                </span>
                <span>
                  Generated: <strong className="text-emerald-400">{genResult.tokens_generated} tokens</strong>
                </span>
                <span>
                  Speed: <strong className="text-indigo-400">{genResult.tokens_per_sec} t/s</strong>
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto max-h-96">
              {genResult.content}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            Execute a prompt above to view local generation traces and token metrics.
          </div>
        )}
      </div>
    </div>
  );
};
