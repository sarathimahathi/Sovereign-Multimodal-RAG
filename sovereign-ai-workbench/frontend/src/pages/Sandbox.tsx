import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  ShieldCheck,
  AlertTriangle,
  Clock,
  HardDrive,
  RefreshCw,
  FileCode,
  Sliders,
  FileText,
  Lock
} from 'lucide-react';
import {
  executeSandboxCode,
  validateSandboxCode,
  fetchSandboxStatus,
  ExecuteCodeResponse,
  ASTScanResponse,
  SandboxStatusResponse,
  SandboxArtifactItem
} from '../services/api';

export const Sandbox: React.FC = () => {
  const [sourceCode, setSourceCode] = useState('');
  const [timeoutSec, setTimeoutSec] = useState(15.0);
  const [memoryLimitMb, setMemoryLimitMb] = useState(512);
  const [executing, setExecuting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [execResult, setExecResult] = useState<ExecuteCodeResponse | null>(null);
  const [validationResult, setValidationResult] = useState<ASTScanResponse | null>(null);
  const [statusData, setStatusData] = useState<SandboxStatusResponse | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<SandboxArtifactItem | null>(null);

  // Preset Engineering & Security Scripts
  const PRESETS = [
    {
      name: 'Heat Exchanger LMTD & Thermal Duty',
      desc: 'Thermodynamic calculations for counter-current heat exchangers (API 660 / TEMA).',
      code: `# ============================================================================
# Sovereign AI Workbench - Heat Exchanger Thermal Duty & LMTD Calculation
# Conforms to TEMA Standard & API 660
# ============================================================================
import math

def calculate_lmtd(t_hot_in: float, t_hot_out: float, t_cold_in: float, t_cold_out: float) -> float:
    delta_t1 = t_hot_in - t_cold_out
    delta_t2 = t_hot_out - t_cold_in
    if delta_t1 == delta_t2:
        return delta_t1
    return (delta_t1 - delta_t2) / math.log(delta_t1 / delta_t2)

def calculate_thermal_duty(mass_flow_kg_s: float, cp_kj_kg_k: float, t_in: float, t_out: float) -> float:
    return mass_flow_kg_s * cp_kj_kg_k * (t_in - t_out)

# Process Parameters for Heavy Naphtha Cooler (E-401A)
t_hot_in = 165.0   # C (Naphtha inlet)
t_hot_out = 60.0   # C (Naphtha outlet)
t_cold_in = 28.0   # C (Cooling water inlet)
t_cold_out = 42.0  # C (Cooling water outlet)

mass_flow = 22.5   # kg/s
cp_fluid = 2.15    # kJ/kg-K

duty_kw = calculate_thermal_duty(mass_flow, cp_fluid, t_hot_in, t_hot_out)
lmtd = calculate_lmtd(t_hot_in, t_hot_out, t_cold_in, t_cold_out)
u_val = 450.0      # W/m2-K (Overall heat transfer coefficient)
area_req_m2 = (duty_kw * 1000.0) / (u_val * lmtd)

print("==========================================================")
print("Sovereign AI Sandbox - Thermal Sizing Verification Report")
print("==========================================================")
print(f"Hot Stream Inlet/Outlet:  {t_hot_in:.1f} C -> {t_hot_out:.1f} C")
print(f"Cold Stream Inlet/Outlet: {t_cold_in:.1f} C -> {t_cold_out:.1f} C")
print("----------------------------------------------------------")
print(f"Calculated Thermal Duty:  {duty_kw:.2f} kW ({duty_kw/1000.0:.3f} MW)")
print(f"Log Mean Temp Difference: {lmtd:.2f} C (LMTD)")
print(f"Required Exchanger Area:  {area_req_m2:.2f} m2")
print("==========================================================")
print("Status: AIR-GAP EXECUTION VERIFIED [No external network calls]")
`
    },
    {
      name: 'Pipe Flow Reynolds Number & Friction',
      desc: 'Hydraulic flow regime analysis & Darcy-Weisbach pressure gradient.',
      code: `# ============================================================================
# Hydraulic Pipe Flow & Reynolds Number Regime Analysis
# ============================================================================
import math

density = 850.0       # kg/m3 (Crude Oil)
viscosity = 0.0032    # Pa-s (Dynamic viscosity)
pipe_diam = 0.2032    # m (8 inch Sch 40 pipe)
flow_rate_m3_h = 180  # m3/h

velocity = (flow_rate_m3_h / 3600.0) / (math.pi * ((pipe_diam / 2.0) ** 2))
reynolds = (density * velocity * pipe_diam) / viscosity

if reynolds < 2300:
    regime = "LAMINAR"
    f_darcy = 64.0 / reynolds
elif reynolds < 4000:
    regime = "TRANSITIONAL"
    f_darcy = 0.035
else:
    regime = "FULLY TURBULENT"
    # Swamee-Jain approximation
    roughness = 0.000045 # Commercial steel
    f_darcy = 0.25 / (math.log10((roughness / (3.7 * pipe_diam)) + (5.74 / (reynolds ** 0.9))) ** 2)

length = 150.0 # m
head_loss = f_darcy * (length / pipe_diam) * ((velocity ** 2) / (2 * 9.81))
delta_p_bar = (density * 9.81 * head_loss) / 100000.0

print(f"Mean Velocity:       {velocity:.3f} m/s")
print(f"Reynolds Number:     {reynolds:.0f} [{regime}]")
print(f"Darcy Friction (f):  {f_darcy:.4f}")
print(f"Head Loss (150m):    {head_loss:.2f} m")
print(f"Pressure Drop:       {delta_p_bar:.3f} bar")
`
    },
    {
      name: 'Data Analysis & CSV Artifact Generation',
      desc: 'Generates tabular engineering inspection reports with downloadable artifact.',
      code: `# ============================================================================
# Equipment Inspection Matrix & CSV Artifact Generation
# ============================================================================
import csv

tags_data = [
    {"Tag": "PV-401A", "Service": "Reflux Drum Relief", "Pressure_psig": 150, "Status": "PASS"},
    {"Tag": "PV-401B", "Service": "Stabilizer Overpressure", "Pressure_psig": 180, "Status": "PASS"},
    {"Tag": "TIC-204", "Service": "Tower Top Temperature", "Pressure_psig": 95, "Status": "PASS"},
    {"Tag": "P-401A",  "Service": "Crude Charge Pump", "Pressure_psig": 380, "Status": "INSPECT_SEAL"},
]

filename = "inspection_summary.csv"
with open(filename, mode="w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["Tag", "Service", "Pressure_psig", "Status"])
    writer.writeheader()
    for row in tags_data:
        writer.writerow(row)

print(f"Successfully generated artifact: {filename}")
print(f"Total Rows Written: {len(tags_data)}")
for r in tags_data:
    print(f" • [{r['Tag']}] {r['Service']}: {r['Pressure_psig']} psig -> {r['Status']}")
`
    },
    {
      name: 'Adversarial Breakout Test (Blocked by AST)',
      desc: 'Simulates shell injection and socket creation to verify AST security jail.',
      code: `# ============================================================================
# ADVERSARIAL TEST: Attempting prohibited OS calls and socket creation
# The AST Security Scanner will intercept and block this script before execution.
# ============================================================================
import os
import socket
import subprocess

# Prohibited Attempt 1: System Command
os.system("whoami")

# Prohibited Attempt 2: Network Socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Prohibited Attempt 3: Dynamic Evaluation
eval("print('Injected!')")
`
    },
    {
      name: 'Watchdog Timeout Test (Infinite Loop)',
      desc: 'Simulates hung process to verify process watchdog timer enforcement.',
      code: `# ============================================================================
# WATCHDOG TEST: Infinite Loop
# Process watchdog will terminate this process after the timeout threshold.
# ============================================================================
import time

print("Starting infinite computational cycle...")
count = 0
while True:
    count += 1
    time.sleep(0.2)
`
    }
  ];

  const loadStatus = async () => {
    try {
      const data = await fetchSandboxStatus();
      setStatusData(data);
    } catch (e) {
      console.error('Failed to fetch sandbox status:', e);
    }
  };

  useEffect(() => {
    loadStatus();
    // Default to preset 0
    setSourceCode(PRESETS[0].code);
  }, []);

  const handleValidate = async () => {
    if (!sourceCode.trim()) return;
    setValidating(true);
    try {
      const scan = await validateSandboxCode(sourceCode);
      setValidationResult(scan);
    } catch (e) {
      console.error('Validation failed:', e);
    } finally {
      setValidating(false);
    }
  };

  const handleExecute = async () => {
    if (!sourceCode.trim()) return;
    setExecuting(true);
    setExecResult(null);
    setSelectedArtifact(null);
    try {
      const res = await executeSandboxCode({
        code: sourceCode,
        timeout_seconds: timeoutSec,
        max_memory_mb: memoryLimitMb,
      });
      setExecResult(res);
      setValidationResult(res.security_scan);
    } catch (e: any) {
      alert(`Execution failed: ${e?.response?.data?.detail?.error || e.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-100">Isolated Code Sandbox</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PHASE 6 ACTIVE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  AST GUARDED
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Micro-Container & Subprocess Security Jail with AST Static Inspection, Syscall Interception, and Zero-Egress Air-Gap
              </p>
            </div>
          </div>
        </div>

        {/* Live Runner Status Badge */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Runner:</span>
              <span className="text-emerald-300 font-semibold">
                {statusData?.active_runner_mode === 'docker_micro_container' ? 'Docker Sandbox' : 'Isolated Subprocess Jail'}
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 border-l border-slate-800 pl-3">
              <Lock className="h-3 w-3 text-cyan-400" />
              <span className="text-cyan-300">Network: None</span>
            </div>
          </div>
          <button
            onClick={loadStatus}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="Refresh Status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Code Editor & Controls (Left) vs Terminal Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Preset Buttons */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Preset Engineering & Security Scripts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSourceCode(p.code);
                    setExecResult(null);
                    setValidationResult(null);
                  }}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-slate-300 rounded-lg text-xs font-medium transition-all"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-mono text-slate-300 font-semibold">main.py (Python 3.11)</span>
              </div>

              {/* Pre-Execution AST Badge */}
              {validationResult && (
                <div className="flex items-center space-x-1.5">
                  {validationResult.is_safe ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold flex items-center space-x-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>AST APPROVED (0 Threat)</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-semibold flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>AST BLOCKED ({validationResult.threat_level})</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <textarea
              rows={16}
              value={sourceCode}
              onChange={(e) => {
                setSourceCode(e.target.value);
                setValidationResult(null);
              }}
              placeholder="Write or paste Python code to execute safely in sandbox..."
              className="w-full bg-[#070A12] text-slate-200 font-mono text-xs p-4 focus:outline-none focus:ring-0 leading-relaxed resize-none border-0"
              spellCheck={false}
            />

            {/* Editor Action Bar */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Timeout: {timeoutSec}s</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                  <span>Limit: {memoryLimitMb}MB</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleValidate}
                  disabled={validating || !sourceCode.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{validating ? 'Validating...' : 'Validate AST'}</span>
                </button>
                <button
                  onClick={handleExecute}
                  disabled={executing || !sourceCode.trim()}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {executing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Execute Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Resource & Timeout Limits Config */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              <span>Resource Quotas & Watchdog Limits</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Execution Timeout Threshold</span>
                  <span className="font-mono text-indigo-300">{timeoutSec} seconds</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  step="1"
                  value={timeoutSec}
                  onChange={(e) => setTimeoutSec(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Memory Cap Limit</span>
                  <span className="font-mono text-indigo-300">{memoryLimitMb} MB</span>
                </div>
                <input
                  type="range"
                  min="128"
                  max="1024"
                  step="64"
                  value={memoryLimitMb}
                  onChange={(e) => setMemoryLimitMb(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Console Output & Artifacts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Terminal Console */}
          <div className="bg-[#05070D] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[460px]">
            {/* Terminal Header Bar */}
            <div className="bg-[#0B0F19] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 pl-2">execution_console</span>
              </div>

              {execResult && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    execResult.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : execResult.status === 'TIMEOUT'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {execResult.status} (exit {execResult.exit_code})
                </span>
              )}
            </div>

            {/* Terminal Output Area */}
            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-3 leading-relaxed">
              {executing ? (
                <div className="text-cyan-400 flex items-center space-x-2 py-8 justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Executing script in isolated sandbox...</span>
                </div>
              ) : execResult ? (
                <>
                  {/* STDOUT */}
                  {execResult.stdout && (
                    <div>
                      <span className="text-slate-500 text-[10px] block mb-1">--- STDOUT ---</span>
                      <pre className="text-slate-200 whitespace-pre-wrap">{execResult.stdout}</pre>
                    </div>
                  )}

                  {/* STDERR */}
                  {execResult.stderr && (
                    <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/30">
                      <span className="text-rose-400 text-[10px] font-bold block mb-1">--- STDERR / SECURITY VIOLATION ---</span>
                      <pre className="text-rose-300 whitespace-pre-wrap text-[11px]">{execResult.stderr}</pre>
                    </div>
                  )}

                  {!execResult.stdout && !execResult.stderr && (
                    <span className="text-slate-500 italic">Program executed with empty output stream.</span>
                  )}
                </>
              ) : (
                <div className="text-slate-600 py-16 text-center space-y-2">
                  <Terminal className="h-8 w-8 mx-auto text-slate-700" />
                  <p>Awaiting execution run.</p>
                  <p className="text-[11px] text-slate-700">Click 'Execute Code' to run script in security jail.</p>
                </div>
              )}
            </div>

            {/* Console Footer Telemetry Bar */}
            {execResult && (
              <div className="bg-[#090D17] px-4 py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <div className="flex items-center space-x-3">
                  <span>Duration: <strong className="text-emerald-400">{execResult.execution_time_ms}ms</strong></span>
                  <span>Memory: <strong className="text-indigo-300">{execResult.memory_used_mb} MB</strong></span>
                </div>
                <span className="text-cyan-400">Mode: {execResult.runner_mode}</span>
              </div>
            )}
          </div>

          {/* Generated Artifacts Card */}
          {execResult && execResult.artifacts_generated && execResult.artifacts_generated.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span>Generated Artifacts ({execResult.artifacts_generated.length})</span>
                </h3>
              </div>

              <div className="space-y-1.5">
                {execResult.artifacts_generated.map((art, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedArtifact(art)}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/30 cursor-pointer transition-all flex items-center justify-between text-xs font-mono text-slate-300"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{art.filename}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] shrink-0">{art.file_size_bytes} B</span>
                  </div>
                ))}
              </div>

              {selectedArtifact && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                  <span className="text-emerald-400 text-[10px] block font-bold">Artifact Preview: {selectedArtifact.filename}</span>
                  <pre className="text-slate-300 text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto p-2 bg-slate-900/60 rounded">
                    {selectedArtifact.preview || 'Binary or empty file.'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
