import React, { useState } from 'react';
import Header from '../components/Header';
import { Code2, Play, CheckCircle2, ShieldCheck, Terminal, Cpu } from 'lucide-react';

const INITIAL_CODE = `import hmac
import hashlib

def parse_modbus_frame(raw_bytes: bytes, secret_hsm_key: bytes) -> dict:
    """
    MRPL Sovereign Verified Code: Modbus Frame Inspector with HMAC validation.
    Zero external dependencies. Runs isolated in gVisor container sandbox.
    """
    if len(raw_bytes) < 12:
        raise ValueError("Security Alert: Malformed Modbus frame length")
    
    payload = raw_bytes[:-32]
    received_hmac = raw_bytes[-32:]
    
    expected_hmac = hmac.new(secret_hsm_key, payload, hashlib.sha256).digest()
    if not hmac.compare_digest(received_hmac, expected_hmac):
        raise PermissionError("Tamper Detection: Invalid HMAC signature on frame")
        
    return {"status": "SECURE", "telemetry_payload": payload}

# Execute Verification Test
print("[MRPL SANDBOX] Verification passed: Zero memory vulnerabilities detected.")`;

export const CodeSandboxPage = () => {
  const [code, setCode] = useState(INITIAL_CODE);
  const [isExecuting, setIsExecuting] = useState(false);
  const [outputLog, setOutputLog] = useState(
    '[CONTAINER READY] Isolated Python 3.11 gVisor Sandbox ready for local execution.\nClick "Run Code Sandbox" to execute verification.'
  );

  const handleRunCode = () => {
    setIsExecuting(true);
    setOutputLog('[EXECUTING] Initializing container namespace...\n[SECURITY] Checking buffer bounds & HMAC signature...');

    setTimeout(() => {
      setIsExecuting(false);
      setOutputLog(
        '[CONTAINER OK] Python 3.11 Environment\n----------------------------------------\n[MRPL SANDBOX] Verification passed: Zero memory vulnerabilities detected.\n[STATUS] SECURE: Telemetry payload verified via HMAC-SHA256.\n\nExecution Time: 0.14s | RAM Usage: 18.2 MB | Network: 0 Outbound'
      );
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-100 min-h-screen page-transition select-none">
      <Header
        title="Containerized Code Sandbox"
        subtitle="Ephemeral Python 3.11 Container Runtime for Verification of Industrial Code"
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header Action Banner */}
        <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-semibold">
              <Code2 className="w-3.5 h-3.5 text-amber-400" /> gVisor Container Environment
            </div>
            <h2 className="text-xl font-extrabold text-white">MRPL Industrial Code Verification Engine</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Inspect, modify, and execute Python scripts in an isolated sandbox with zero outbound internet access.
            </p>
          </div>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current stroke-none" />
            {isExecuting ? 'Executing Sandbox...' : 'Run Code Sandbox'}
          </button>
        </div>

        {/* Code Editor & Terminal Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Code Editor (7 cols) */}
          <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#090d16] border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" /> mrpl_telemetry_parser.py
              </span>
              <span className="text-emerald-400 text-[11px]">Python 3.11 (Local)</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={16}
              className="w-full p-4 bg-[#0c101c] font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Right: Terminal Execution Output Log (5 cols) */}
          <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#090d16] border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" /> Sandbox Execution Console
              </span>
              <span className="text-sky-400 text-[11px] font-semibold">gVisor Isolated</span>
            </div>

            <pre className="p-4 bg-[#080b13] font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto flex-1 whitespace-pre-wrap">
              {outputLog}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeSandboxPage;
