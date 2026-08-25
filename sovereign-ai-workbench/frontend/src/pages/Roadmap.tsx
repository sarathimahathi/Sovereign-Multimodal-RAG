import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const Roadmap: React.FC = () => {
  const phases = [
    {
      num: 1,
      title: 'Project Foundation',
      status: 'completed',
      desc: 'Monorepo architecture, FastAPI backend with /api/health, Vite React frontend, Docker Compose baseline, and strict decoupled module scaffolding.',
    },
    {
      num: 2,
      title: 'Database Layer & Persistent Storage',
      status: 'completed',
      desc: 'PostgreSQL 16 integration with zero-config SQLite dual-mode fallback, Async SQLAlchemy ORM, SHA-256 hashed document storage, and session workspaces.',
    },
    {
      num: 3,
      title: 'Security, Guardrails & User Isolation',
      status: 'completed',
      desc: 'Zero-egress socket inspection, PII & industrial asset tag redactor, prompt injection shield, and cryptographic hash-chained audit trails.',
    },
    {
      num: 4,
      title: 'Local Model Adapters & Dynamic Intent Router',
      status: 'completed',
      desc: 'Unified inference abstraction layer supporting Ollama, dynamic task classification (Qwen 2.5 Coder vs DeepSeek R1 vs Llama 3), and deterministic fallback.',
    },
    {
      num: 5,
      title: 'Hybrid RAG Engine (Dense + Sparse BM25 + RRF)',
      status: 'completed',
      desc: 'Qdrant vector store integration with local cosine fallback, semantic chunking, BM25 sparse keyword indexing, Reciprocal Rank Fusion, and grounded verifiable citations.',
    },
    {
      num: 6,
      title: 'Isolated Code Execution Sandbox',
      status: 'completed',
      desc: 'Pre-execution AST static analysis, process watchdogs, timeout limits, and zero-egress sandboxed code execution.',
    },
    {
      num: 7,
      title: 'Multimodal Processing (OCR & Layout)',
      status: 'completed',
      desc: 'Visual layout parsing, P&ID drawing OCR extraction, structured table parsing to JSON/CSV, and automatic RAG indexing.',
    },
    {
      num: 8,
      title: 'Autonomous Agent Core',
      status: 'pending',
      desc: 'ReAct cognitive loops, Plan-and-Solve orchestration, tool calling framework, dynamic replanning, and memory management.',
    },
    {
      num: 9,
      title: 'Document Generation & Export Engine',
      status: 'pending',
      desc: 'Automated synthesis of executive PDF briefings, DOCX briefs, Markdown reports, and chart visual generation.',
    },
    {
      num: 10,
      title: 'Advanced Multimodal & Audio Intelligence',
      status: 'pending',
      desc: 'Local Whisper speech-to-text, visual question answering (VQA) with local vision models, and video frame extraction.',
    },
    {
      num: 11,
      title: 'Real-time Collaboration & Streaming',
      status: 'pending',
      desc: 'WebSocket token streaming, collaborative document workspaces, live agent trace visualization, and human-in-the-loop approvals.',
    },
    {
      num: 12,
      title: 'Production Hardening & Air-Gap Compliance',
      status: 'pending',
      desc: 'Offline air-gap bundle packaging, full load testing, backup/restore routines, and enterprise security compliance audits.',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">12-Phase Master Implementation Roadmap</h1>
        <p className="text-xs text-slate-400 mt-1">
          Full execution lifecycle for the Sovereign Multimodal AI Workbench.
        </p>
      </div>

      <div className="relative border-l border-slate-800 ml-4 space-y-6">
        {phases.map((phase) => {
          const isComplete = phase.status === 'completed';
          return (
            <div key={phase.num} className="relative pl-8 group">
              {/* Timeline Bullet */}
              <div
                className={`absolute -left-3 top-1.5 h-6 w-6 rounded-full flex items-center justify-center border text-xs font-mono font-bold ${
                  isComplete
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isComplete ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : phase.num}
              </div>

              {/* Card */}
              <div
                className={`glass-panel p-5 rounded-xl border transition-all ${
                  isComplete
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-slate-800/80 bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-white">
                      Phase {phase.num}: {phase.title}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold w-fit ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isComplete ? 'Completed (Current)' : 'Planned'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{phase.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
