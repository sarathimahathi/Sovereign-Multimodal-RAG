import React from 'react';
import { 
  FolderTree, 
  Layers, 
  Database, 
  Terminal,
  CheckCircle2,
  Workflow
} from 'lucide-react';

export const Architecture: React.FC = () => {
  const backendLayers = [
    {
      title: '1. Route Handlers (HTTP Presentation)',
      path: 'backend/app/api/routes/',
      desc: 'Handles HTTP requests, path/query params, HTTP status codes, and headers. Contains zero business logic.',
      icon: Terminal,
      color: 'text-indigo-400',
    },
    {
      title: '2. Schemas / DTOs (Data Contracts)',
      path: 'backend/app/schemas/',
      desc: 'Type-safe Pydantic models defining input validation and response contracts. Prevents leaking internal data.',
      icon: CheckCircle2,
      color: 'text-cyan-400',
    },
    {
      title: '3. Domain Services (Business Logic)',
      path: 'backend/app/services/',
      desc: 'Pure business logic and workflow orchestration. Completely decoupled from HTTP request/response objects.',
      icon: Workflow,
      color: 'text-emerald-400',
    },
    {
      title: '4. Repositories (Data Access)',
      path: 'backend/app/repositories/',
      desc: 'Encapsulates data persistence and queries. Decouples business logic from specific database engines.',
      icon: Database,
      color: 'text-amber-400',
    },
    {
      title: '5. Database Engine & Sessions',
      path: 'backend/app/database/',
      desc: 'Manages SQLAlchemy async engines, connection pools, migrations, and session lifecycles.',
      icon: Layers,
      color: 'text-purple-400',
    },
  ];

  const modules = [
    { name: 'frontend/', desc: 'Vite React TypeScript UI, Tailwind CSS, Zustand, Recharts', phase: 'Phase 1' },
    { name: 'backend/', desc: 'FastAPI gateway, async middleware, Pydantic settings, telemetry', phase: 'Phase 1' },
    { name: 'agent/', desc: 'Autonomous agent loops, ReAct planning, and multi-tool execution', phase: 'Phase 8' },
    { name: 'models/', desc: 'Inference drivers for Ollama, vLLM, and local GGUF quantized models', phase: 'Phase 4' },
    { name: 'rag/', desc: 'Hybrid RAG engine: Qdrant dense vectors, BM25 sparse index, RRF ranking', phase: 'Phase 5' },
    { name: 'multimodal/', desc: 'OCR (PaddleOCR/Tesseract), PDF layout parsing, Audio (Whisper)', phase: 'Phase 7, 10' },
    { name: 'sandbox/', desc: 'Isolated code execution jail for AI-generated scripts', phase: 'Phase 6' },
    { name: 'security/', desc: 'Prompt injection detection, PII redaction, air-gap policy', phase: 'Phase 3' },
    { name: 'document_generation/', desc: 'Automated executive PDF briefing and DOCX synthesis engine', phase: 'Phase 9' },
    { name: 'tests/', desc: 'End-to-end and cross-module integration test suites', phase: 'Phase 1-12' },
    { name: 'docs/', desc: 'System architecture specifications and decision records', phase: 'Phase 1-12' },
    { name: 'scripts/', desc: 'Developer environment setup, seeders, and automation scripts', phase: 'Phase 1-12' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Architecture & Monorepo Topology</h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed breakdown of module responsibilities and backend separation of concerns.
        </p>
      </div>

      {/* Backend 5-Layer Separation Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Backend Layered Architecture (Separation of Concerns)</h2>
            <p className="text-xs text-slate-400">
              Strict isolation between presentation, data contracts, business rules, and storage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {backendLayers.map((layer) => {
            const Icon = layer.icon;
            return (
              <div key={layer.title} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${layer.color}`} />
                  <h3 className="text-xs font-bold text-slate-200">{layer.title}</h3>
                </div>
                <p className="text-[11px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 w-fit">
                  {layer.path}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">{layer.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monorepo Directory Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Monorepo Modules Overview</h2>
            <p className="text-xs text-slate-400">
              Each top-level directory serves an independent, isolated architectural responsibility.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((m) => (
            <div key={m.name} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {m.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800/60">
                    {m.phase}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
