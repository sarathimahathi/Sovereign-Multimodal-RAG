import React from 'react';
import Header from '../components/Header';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  Server,
  HardDrive,
  Activity,
} from 'lucide-react';

export const Security = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      <Header
        title="Security & System Status"
        subtitle="On-Premise Infrastructure Isolation & Real-Time Hardware Telemetry"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Air-Gapped Verification Banner */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              AIR-GAPPED COMPLIANCE 100% PASS
            </div>
            <h2 className="text-xl font-extrabold text-white">MRPL Data Center Isolation Active</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Zero outbound network routes enabled. All LLM weights, document chunking, PyPDF parsing, and code verification run strictly on MRPL's internal hardware.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#090d16] px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 font-bold shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>0 Outbound Packets</span>
          </div>
        </div>

        {/* 6 Security Isolation Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Local LLM Inference */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#090d16] text-purple-400 flex items-center justify-center border border-slate-800">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Local LLM Inference</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Qwen-72B and DeepSeek-16B running locally on NVIDIA H100 GPUs via vLLM / llama.cpp.
            </p>
          </div>

          {/* 2. On-Premise Vector RAG */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#090d16] text-indigo-400 flex items-center justify-center border border-slate-800">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">On-Premise Vector RAG</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ChromaDB vector database hosted locally with bge-large embeddings. Zero external API calls.
            </p>
          </div>

          {/* 3. Containerized Code Sandbox */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#090d16] text-sky-400 flex items-center justify-center border border-slate-800">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Container Sandbox Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Python telemetry code executed inside gVisor container runtime with strict memory limits.
            </p>
          </div>

          {/* 4. Local File Ingestion */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#090d16] text-blue-400 flex items-center justify-center border border-slate-800">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Local File Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PDFs, DOCX, and images parsed directly via PyPDF2 and Tesseract OCR with zero cloud uploads.
            </p>
          </div>

          {/* 5. Hardware Security Module */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#090d16] text-purple-400 flex items-center justify-center border border-slate-800">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">HMAC Key Encryption</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All generated deliverables signed with SHA-256 HMAC keys stored in MRPL hardware modules.
            </p>
          </div>

          {/* 6. Air-Gapped Network Firewall */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#090d16] text-emerald-400 flex items-center justify-center border border-slate-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Air-Gapped Network Guard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict iptables firewall blocks all outbound IP routing to external public networks.
            </p>
          </div>
        </div>

        {/* Real-Time Hardware Telemetry Meters */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" /> MRPL Data Center Hardware Telemetry
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* GPU Usage Meter */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">GPU Usage</span>
                <span className="text-purple-300 font-bold">78% (62.4 GB)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[78%]"></div>
              </div>
            </div>

            {/* Memory Usage Meter */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-sky-300 font-bold">62% (158 GB)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full w-[62%]"></div>
              </div>
            </div>

            {/* CPU Usage Meter */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">CPU Usage</span>
                <span className="text-slate-300 font-bold">41% (32 Cores)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full w-[41%]"></div>
              </div>
            </div>

            {/* SSD Storage Meter */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">NVMe Vector Storage</span>
                <span className="text-emerald-400 font-bold">54% (2.1 TB)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[54%]"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Security;
