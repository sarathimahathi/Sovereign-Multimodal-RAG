import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  Table as TableIcon,
  Tag,
  RefreshCw,
  Eye,
  Download,
  Sparkles,
  Database
} from 'lucide-react';
import {
  parseMultimodalDocument,
  fetchMultimodalStatus,
  ParseDocumentResponse,
  ExtractedTableItem,
  MultimodalStatusResponse
} from '../services/api';

export const Multimodal: React.FC = () => {
  const [textContent, setTextContent] = useState('');
  const [filename, setFilename] = useState('P_AND_ID_CDU_401.md');
  const [autoIndexRag, setAutoIndexRag] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ParseDocumentResponse | null>(null);
  const [statusData, setStatusData] = useState<MultimodalStatusResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'layout' | 'tables' | 'ocr' | 'raw'>('layout');
  const [segmentFilter, setSegmentFilter] = useState<string>('ALL');
  const [selectedTable, setSelectedTable] = useState<ExtractedTableItem | null>(null);

  // Preset Industrial Engineering Documents
  const PRESETS = [
    {
      name: 'Scanned P&ID Diagram & Relief Valve Schedule',
      desc: 'Piping & Instrumentation Diagram with ASME/API relief valves & instruments.',
      filename: 'PID_DWG_401_RELIEF.md',
      content: `# Piping & Instrumentation Diagram: Crude Stabilizer Unit (P&ID-401-A)
Project: Sovereign Industrial Facility #4
Standard Compliance: API 520, API 521, ASME Section VIII Division 1

## Process Description & Safety Interlocks
The crude stabilizer column (TAG #V-401) receives stabilized naphtha at 8.5 bar g. Overpressure protection is provided by dual thermal relief valves TAG #PV-401A and TAG #PV-401B leading to the low-pressure flare header.
Emergency shutdown valve TAG #ESD-401 is interlocked with high-level switch TAG #LSH-402 on the overhead accumulator drum TAG #D-401.

| Tag Number | Service Description | Design Pressure | Set Pressure | Orifice | Standard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| PV-401A | Column Overhead Relief | 12.5 bar g | 9.5 bar g | 4P6 | API 520 |
| PV-401B | Standby Relief Valve | 12.5 bar g | 9.8 bar g | 4P6 | API 520 |
| ESD-401 | Column Bottom Feed Shutoff | 16.0 bar g | Trip on LSH | 6" Class 300 | IEC 61511 |
| BDV-401 | Flare Depressuring Valve | 20.0 bar g | Manual / Auto | 3" Class 600 | API 521 |

### Instrument & Electrical Loop Specification
- Temperature Transmitter TAG #TT-401: 0 - 300 C (4-20mA HART)
- Differential Pressure Cell TAG #DPT-405: 0 - 500 mbar across packing bed
- Level Controller TAG #LIC-402: Modulates reflux valve TAG #FCV-402 to maintain 50% drum level
`
    },
    {
      name: 'CDU-4 Column Operating & Inspection Log',
      desc: 'Process operating log with tray temperatures, pressure drops, and NDT thickness inspection.',
      filename: 'CDU4_INSPECTION_LOG.md',
      content: `# Unit CDU-4 Overhead Column Turnaround Inspection Report
Inspection Date: 2026-08-20
Inspector Certification: API 510 Certified Inspector #84920
Asset: Atmospheric Distillation Column TAG #C-101

## Vessel Thickness & Corrosion Monitoring
Ultrasonic thickness testing (UTT) performed on column shells, nozzles, and trays. Minimum required thickness per ASME Section VIII calculated based on design pressure 4.5 bar g.

| Measurement Location | Original Thickness (mm) | Measured (mm) | Min Required (mm) | Corrosion Rate (mm/yr) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Shell Course 1 (Bottom) | 22.0 | 20.8 | 16.5 | 0.12 | ACCEPTABLE |
| Flash Zone (Tray 1-4) | 24.0 | 21.2 | 18.0 | 0.28 | MONITOR |
| Middle Section (Tray 15) | 16.0 | 15.4 | 12.0 | 0.06 | ACCEPTABLE |
| Overhead Vapor Nozzle N1 | 14.0 | 13.1 | 9.5 | 0.09 | ACCEPTABLE |

## Key Findings & Recommendations
1. Flash zone impingement baffles show localized thinning. Install 316L stainless steel cladding overlay during next scheduled shutdown.
2. Safety relief valve TAG #PV-101 pop test verified within +/- 1% tolerance per ASME code.
`
    },
    {
      name: 'Centrifugal Pump Performance & Mechanical Seal Matrix',
      desc: 'Pump curves, NPSH margins, and API 682 mechanical seal specifications.',
      filename: 'PUMP_SPEC_P401A.md',
      content: `# Heavy Naphtha Booster Pump Technical Data Sheet
Equipment Tag: P-401A/B
Service: Overhead Stabilized Naphtha Transfer
Standard: API 610 12th Edition (OH2 Single Stage Overhung)

## Hydraulic Operating Parameters
- Rated Flow: 180 m3/h (792 US GPM)
- Differential Head: 145 m (14.2 bar)
- Suction Pressure: 2.1 bar g
- Discharge Pressure: 16.3 bar g
- NPSH Required: 3.2 m (Available: 5.8 m, Margin: 2.6 m)

| Parameter | Suction | Discharge | Unit |
| :--- | :--- | :--- | :--- |
| Flange Rating | Class 300 RF | Class 600 RF | ANSI |
| Pipe Size | 6" | 4" | Sch 40 |
| Operating Temp | 65 | 72 | Deg C |
| Specific Gravity | 0.72 | 0.72 | - |

## Mechanical Seal Flush Plan
Mechanical seal configuration conforms to API 682 Plan 11 + Plan 52 with tandem unpressurized barrier fluid reservoir TAG #TK-401.
`
    }
  ];

  const loadStatus = async () => {
    try {
      const data = await fetchMultimodalStatus();
      setStatusData(data);
    } catch (e) {
      console.error('Failed to fetch multimodal status:', e);
    }
  };

  useEffect(() => {
    loadStatus();
    // Default to preset 0
    setTextContent(PRESETS[0].content);
    setFilename(PRESETS[0].filename);
  }, []);

  const handleProcess = async () => {
    if (!textContent.trim()) return;
    setProcessing(true);
    setResult(null);
    setSelectedTable(null);

    try {
      const res = await parseMultimodalDocument({
        text_content: textContent,
        filename: filename,
        mime_type: 'text/markdown',
        auto_index_to_rag: autoIndexRag,
        session_id: 'multimodal_session_workspace'
      });
      setResult(res);
      if (res.tables && res.tables.length > 0) {
        setSelectedTable(res.tables[0]);
      }
    } catch (e: any) {
      alert(`Processing failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const downloadCSV = (table: ExtractedTableItem) => {
    const blob = new Blob([table.csv_content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${table.title?.replace(/\s+/g, '_') || 'extracted_table'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSegments = result?.layout.segments.filter(s => {
    if (segmentFilter === 'ALL') return true;
    return s.segment_type === segmentFilter;
  }) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-xl border border-cyan-500/30 text-cyan-400">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-100">Multimodal Document Intelligence</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PHASE 7 ACTIVE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  OCR & LAYOUT
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Structured Layout Parsing, Bounding Box Visual Segmenting, OCR Extraction, and Direct RAG Knowledge Indexing
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Telemetry Pill */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">OCR Engine:</span>
              <span className="text-emerald-300 font-semibold">
                {statusData?.ocr_engine === 'dual_mode_vlm_and_rasterizer' ? 'Dual VLM & Rasterizer' : 'Local Raster OCR'}
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 border-l border-slate-800 pl-3">
              <TableIcon className="h-3 w-3 text-cyan-400" />
              <span className="text-cyan-300">Table to JSON/CSV</span>
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

      {/* Main Grid: Document Input (Left 5 Cols) vs Layout & Table Inspector (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Presets & Document Input */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Engineering Documents */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Preset Engineering & P&ID Documents
            </span>
            <div className="space-y-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTextContent(p.content);
                    setFilename(p.filename);
                    setResult(null);
                  }}
                  className="w-full text-left p-2 bg-slate-950 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/30 rounded-lg transition-all"
                >
                  <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Document Content Input Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="bg-transparent border-0 text-xs font-mono text-slate-300 font-semibold focus:outline-none focus:ring-0 p-0 w-48"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500">{textContent.length} chars</span>
            </div>

            <textarea
              rows={14}
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                setResult(null);
              }}
              placeholder="Paste engineering text, P&ID schedules, markdown, or data sheets to parse..."
              className="w-full bg-[#070A12] text-slate-200 font-mono text-xs p-4 focus:outline-none focus:ring-0 leading-relaxed resize-none border-0"
              spellCheck={false}
            />

            {/* Ingestion & Action Controls */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center space-x-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoIndexRag}
                  onChange={(e) => setAutoIndexRag(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center space-x-1">
                  <Database className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Index into Phase 5 RAG</span>
                </span>
              </label>

              <button
                onClick={handleProcess}
                disabled={processing || !textContent.trim()}
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing Layout...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Parse Document</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Layout, Tables & Tags Explorer */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('layout')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'layout'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Visual Segments ({result?.total_segments || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('tables')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'tables'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Extracted Tables ({result?.tables_count || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'raw'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Raw Markdown</span>
              </button>
            </div>

            {/* Tag & RAG Status Indicator */}
            {result && (
              <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 pr-2">
                <span>Latency: <strong className="text-cyan-400">{result.processing_time_ms}ms</strong></span>
                {result.rag_ingestion && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    RAG INDEXED ({result.rag_ingestion.total_chunks} chunks)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Detected Industrial Tags Banner */}
          {result && result.tags_detected.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex items-center space-x-3 overflow-x-auto">
              <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 shrink-0">
                <Tag className="h-3.5 w-3.5" />
                <span>Detected Asset Tags:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.tags_detected.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 1: Visual Layout Segments */}
          {activeTab === 'layout' && (
            <div className="space-y-3">
              {/* Segment Type Filter */}
              <div className="flex items-center space-x-1 text-xs font-mono">
                <span className="text-slate-500 mr-2">Filter:</span>
                {['ALL', 'HEADER', 'TABLE', 'KEY_VALUE_PAIR', 'PARAGRAPH'].map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setSegmentFilter(filterVal)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                      segmentFilter === filterVal
                        ? 'bg-slate-700 text-slate-100 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filterVal}
                  </button>
                ))}
              </div>

              {/* Segments Stream */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {result ? (
                  filteredSegments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-all font-mono"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/60 pb-1.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              seg.segment_type === 'HEADER'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : seg.segment_type === 'TABLE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : seg.segment_type === 'KEY_VALUE_PAIR'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {seg.segment_type}
                          </span>
                          <span>Page {seg.page_number}</span>
                          <span>Conf: {(seg.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <span className="text-slate-500">
                          BBox: [{seg.bounding_box.x0}, {seg.bounding_box.y0}, {seg.bounding_box.x1}, {seg.bounding_box.y1}]
                        </span>
                      </div>

                      <pre className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
                        {seg.text}
                      </pre>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 py-20 text-center space-y-2 font-mono">
                    <Layers className="h-8 w-8 mx-auto text-slate-700" />
                    <p>No parsed layout available.</p>
                    <p className="text-[11px] text-slate-700">Click 'Parse Document' to extract visual blocks.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content 2: Extracted Tables Explorer */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              {result && result.tables.length > 0 ? (
                <>
                  {/* Table Selector */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {result.tables.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTable(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            selectedTable?.table_id === t.table_id
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {t.title || `Table ${idx + 1}`} ({t.row_count} rows)
                        </button>
                      ))}
                    </div>

                    {selectedTable && (
                      <button
                        onClick={() => downloadCSV(selectedTable)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1.5 border border-slate-700"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Download CSV</span>
                      </button>
                    )}
                  </div>

                  {/* Rendered Data Grid */}
                  {selectedTable && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 sticky top-0">
                            <tr>
                              {selectedTable.headers.map((h, i) => (
                                <th key={i} className="px-3.5 py-2.5 font-semibold tracking-wider text-slate-200">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {selectedTable.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-600 py-20 text-center space-y-2 font-mono">
                  <TableIcon className="h-8 w-8 mx-auto text-slate-700" />
                  <p>No structured tables detected.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content 3: Raw Markdown */}
          {activeTab === 'raw' && (
            <div className="bg-[#070A12] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {result?.layout.raw_markdown || textContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Multimodal;
