import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  HardDrive, 
  Server, 
  Code, 
  Terminal, 
  Zap, 
  Boxes,
  Database,
  ShieldCheck,
  FolderLock,
  Eye
} from 'lucide-react';
import { useHealthStore } from '../store/useHealthStore';
import { ServiceCard } from '../components/ServiceCard';
import { TelemetryChart } from '../components/TelemetryChart';
import { API_BASE_URL } from '../services/api';

export const Dashboard: React.FC = () => {
  const { 
    healthData, 
    latency, 
    latencyHistory, 
    isLoading, 
    error, 
    lastChecked, 
    isAutoPolling, 
    checkHealth 
  } = useHealthStore();

  const [showRawJson, setShowRawJson] = useState(false);

  // Initial fetch and auto-polling loop
  useEffect(() => {
    checkHealth();

    let interval: any;
    if (isAutoPolling) {
      interval = setInterval(() => {
        checkHealth();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPolling, checkHealth]);

  const isHealthy = !error && healthData?.status === 'healthy';
  const isDbHealthy = healthData?.services?.database?.startsWith('healthy');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-6 sm:p-8 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-[#0B0F19]">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Phase 5 Active: Hybrid RAG Engine (Dense + Sparse BM25 + RRF)
              </span>
              <span className="text-xs text-slate-400">• Environment: {healthData?.environment || 'Development'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sovereign AI Workbench Gateway
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Decoupled, air-gapped multimodal AI system with dynamic task routing across open-weight models (Qwen 2.5 Coder vs DeepSeek R1 vs Llama 3), zero-egress verification, and cryptographic audit trails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => checkHealth()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>Ping Health Endpoint</span>
            </button>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Code className="h-4 w-4" />
              <span>{showRawJson ? 'Hide JSON' : 'Inspect JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend Status Metric */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">FastAPI Backend</span>
            <Server className={`h-4 w-4 ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isHealthy ? 'Operational' : error ? 'Offline' : 'Connecting'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate font-mono">
            {API_BASE_URL}/api/health
          </p>
        </div>

        {/* Latency Metric */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Response Latency</span>
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {latency !== null ? latency : '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Last ping: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
          </p>
        </div>

        {/* Database Status */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Database Engine</span>
            <Database className={`h-4 w-4 ${isDbHealthy ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-xl font-bold ${isDbHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
              {healthData?.services?.database || 'Checking...'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Async SQLAlchemy Engine
          </p>
        </div>

        {/* Memory Footprint */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Process Memory</span>
            <HardDrive className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">
              {healthData?.system?.memory_usage_mb ? `${healthData.system.memory_usage_mb}` : '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">MB RSS</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            CPU: {healthData?.system?.cpu_usage_percent ?? 0}%
          </p>
        </div>
      </div>

      {/* Latency History Chart & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">Live API Latency Telemetry</h2>
              <p className="text-xs text-slate-400">Real-time round-trip latency (ms) for <code className="text-indigo-400 font-mono">GET /api/health</code></p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
              {latencyHistory.length} data points
            </span>
          </div>
          <TelemetryChart data={latencyHistory} />
        </div>

        {/* Monorepo Architecture Overview Widget */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Boxes className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Monorepo Isolation</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All modular subsystems have been scaffolded with strict separation between API routing, domain business logic, data persistence, and AI reasoning.
            </p>
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Database Layer</span>
                <span className="text-emerald-400 font-semibold">Async SQLAlchemy (Dual Mode)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Document Storage</span>
                <span className="text-emerald-400 font-semibold">SHA-256 Hashed Local</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Session Contexts</span>
                <span className="text-emerald-400 font-semibold">Classification-Tagged</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Backend API</span>
                <span className="text-emerald-400 font-semibold">FastAPI + Uvicorn</span>
              </div>
            </div>
          </div>

          <a
            href="/documents"
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors flex items-center justify-center space-x-2"
          >
            <FolderLock className="h-3.5 w-3.5" />
            <span>Open Document Repository</span>
          </a>
        </div>
      </div>

      {/* Raw JSON Inspector Modal / Accordion */}
      {showRawJson && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-950/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono font-semibold text-slate-200">
                Raw GET /api/health Response Payload
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Status: 200 OK</span>
          </div>
          <pre className="p-4 rounded-xl bg-[#0B0F19] text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 max-h-80">
            {JSON.stringify(healthData || { error: error || 'No data' }, null, 2)}
          </pre>
        </div>
      )}

      {/* Subsystem Readiness Matrix */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Subsystem Infrastructure Grid</h2>
          <p className="text-xs text-slate-400">
            Modular components readiness status across the 12-phase development roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ServiceCard
            name="FastAPI Gateway"
            category="REST & WebSocket API"
            status={isHealthy ? 'healthy' : 'offline'}
            phase="Phase 1 (Complete)"
            description="Core HTTP application server, request timing middleware, structured logging, and Pydantic configuration."
            icon={Server}
            endpoint="/api/health"
          />

          <ServiceCard
            name="Database & Persistent Storage"
            category="Async SQLAlchemy 2.0"
            status={isDbHealthy ? 'healthy' : 'unconfigured'}
            phase="Phase 2 (Active)"
            description="Async SQLAlchemy session management, connection pooling, SHA-256 hashed document storage, and session state tracking."
            icon={Database}
            endpoint="/api/documents"
          />

          <ServiceCard
            name="Security & Guardrails"
            category="Defense-in-Depth"
            status="unconfigured"
            phase="Phase 3"
            description="PII redactor, prompt injection classifier, hash-chained audit trails, and air-gap egress validation."
            icon={ShieldCheck}
          />

          <ServiceCard
            name="Ollama Local LLM"
            category="Inference Engine"
            status="unconfigured"
            phase="Phase 4"
            description="Local quantized inference adapter supporting Llama 3, Mistral, and local embeddings without cloud dependency."
            icon={Activity}
            endpoint="port 11434"
          />

          <ServiceCard
            name="Hybrid RAG Engine (Qdrant + BM25)"
            category="Dense + Sparse Fusion"
            status="healthy"
            phase="Phase 5 (Active)"
            description="Dense vector collections, sparse BM25 indices, Reciprocal Rank Fusion (RRF), and verifiable source citations."
            icon={Boxes}
            endpoint="/api/rag/query"
          />

          <ServiceCard
            name="Isolated Code Sandbox Jail"
            category="Security & Jails"
            status="healthy"
            phase="Phase 6 (Active)"
            description="Pre-execution AST static analysis, process watchdogs, timeout limits, and zero-egress sandboxed code execution."
            icon={Code}
            endpoint="/api/sandbox/execute"
          />

          <ServiceCard
            name="Multimodal Processing & OCR"
            category="Vision & Layout"
            status="healthy"
            phase="Phase 7 (Active)"
            description="Visual layout parsing, P&ID drawing OCR extraction, structured table parsing to JSON/CSV, and automatic RAG indexing."
            icon={Eye}
            endpoint="/api/multimodal/parse"
          />
        </div>
      </div>
    </div>
  );
};
