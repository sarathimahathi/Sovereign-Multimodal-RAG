import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Sparkles,
  Database,
  Cpu,
  Hash,
  FileText,
  CheckCircle2,
  RefreshCw,
  Quote,
  Tag,
  Zap,
  ArrowRight,
  SlidersHorizontal,
  FileCode,
  Info
} from 'lucide-react';
import {
  fetchRagStatus,
  ingestRagDocument,
  queryRag,
  fetchRagChunks,
  RagStatusResponse,
  RagQueryResponse,
  RagIngestResponse,
  RetrievedChunkItem,
  RagChunkItem
} from '../services/api';

export const RagEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'ingest' | 'diagnostics'>('search');
  const [statusData, setStatusData] = useState<RagStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'hybrid' | 'dense' | 'sparse'>('hybrid');
  const [topK, setTopK] = useState(4);
  const [denseWeight, setDenseWeight] = useState(0.6);
  const [sparseWeight, setSparseWeight] = useState(0.4);
  const [rrfK, setRrfK] = useState(60);
  const [synthesizeAnswer, setSynthesizeAnswer] = useState(true);
  const [searching, setSearching] = useState(false);
  const [queryResult, setQueryResult] = useState<RagQueryResponse | null>(null);

  // Ingestion State
  const [ingestFilename, setIngestFilename] = useState('Refinery_Unit4_Technical_Spec.md');
  const [ingestText, setIngestText] = useState('');
  const [chunkSize, setChunkSize] = useState(350);
  const [chunkOverlap, setChunkOverlap] = useState(70);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<RagIngestResponse | null>(null);
  const [indexedChunks, setIndexedChunks] = useState<RagChunkItem[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Sample Documents & Presets
  const SAMPLE_PRESET_DOC = `# Crude Distillation Unit (CDU-4) Process Specification
Confidential Industrial Operating Document - Standard API 520 & ASME Section VIII.

## 1. Overpressure Protection & Safety Valves
Pressure safety relief valve TAG #PV-401A is installed on the main overhead reflux drum V-401.
The certified set point is 150 psig with relieving capacity of 45,000 lb/hr at 200 C, conforming to API 520 / API 526 guidelines.
High pressure alarm PAH-401 triggers supervisory DCS notification at 135 psig.

| Equipment Tag | Description | Operating Pressure | Design Pressure (MAWP) | Design Temp |
| :--- | :--- | :--- | :--- | :--- |
| V-401 | Reflux Drum | 95 psig | 165 psig | 220 C |
| V-402 | Stabilizer Column Vessel | 8.5 bar g | 12.5 bar g | 250 C |
| E-401A/B | Overhead Condenser | 110 psig | 180 psig | 190 C |
| P-401A/B | Crude Feed Charge Pump | 45 psig suction | 380 psig discharge | 140 C |

## 2. Emergency Shutdown (ESD) Matrix
Emergency interlock ESD-401 immediately trips motor breakers for Crude Pump P-401A upon cooling water pressure loss below 1.8 bar gauge.
Flare header header diameter is 36 inches schedule 40 carbon steel (ASTM A106 Grade B) with continuous nitrogen purging.`;

  const SAMPLE_QUERIES = [
    'What is the MAWP design pressure for vessel V-402?',
    'What is the certified set point and standard for safety valve PV-401A?',
    'Explain the emergency shutdown ESD-401 trigger condition for cooling water.',
    'What is the flare header pipe size and carbon steel specification?',
  ];

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await fetchRagStatus();
      setStatusData(data);
    } catch (e) {
      console.error('Failed to fetch RAG status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadChunks = async () => {
    setLoadingChunks(true);
    try {
      const data = await fetchRagChunks();
      setIndexedChunks(data.chunks || []);
    } catch (e) {
      console.error('Failed to load chunks:', e);
    } finally {
      setLoadingChunks(false);
    }
  };

  useEffect(() => {
    loadStatus();
    loadChunks();
    // Pre-populate sample text if empty
    setIngestText(SAMPLE_PRESET_DOC);
  }, []);

  const handleIngest = async () => {
    if (!ingestText.trim()) return;
    setIngesting(true);
    try {
      const res = await ingestRagDocument({
        text: ingestText,
        filename: ingestFilename,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        classification: 'CONFIDENTIAL - REFINERY UNIT 4',
      });
      setIngestResult(res);
      await loadStatus();
      await loadChunks();
    } catch (e: any) {
      alert(`Ingestion failed: ${e?.response?.data?.detail?.error || e.message}`);
    } finally {
      setIngesting(false);
    }
  };

  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery || searchQuery;
    if (!q.trim()) return;
    if (overrideQuery) setSearchQuery(overrideQuery);

    setSearching(true);
    try {
      const res = await queryRag({
        query: q,
        mode: searchMode,
        top_k: topK,
        dense_weight: denseWeight,
        sparse_weight: sparseWeight,
        rrf_k: rrfK,
        synthesize_answer: synthesizeAnswer,
      });
      setQueryResult(res);
    } catch (e: any) {
      alert(`Search failed: ${e?.response?.data?.detail?.error || e.message}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-100">Hybrid RAG Engine</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PHASE 5 ACTIVE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  RRF FUSED
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Dense Vector Search (Qdrant) + Sparse BM25 Keyword Search + Reciprocal Rank Fusion & Grounded Citations
              </p>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Store:</span>
              <span className="text-emerald-300 font-semibold">
                {statusData?.vector_store.mode === 'qdrant_cluster' ? 'Qdrant Vector DB' : 'Local Cosine Fallback'}
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 border-l border-slate-800 pl-3">
              <span className="text-slate-400">Indexed:</span>
              <span className="text-indigo-300 font-semibold">{statusData?.total_registered_chunks || 0} Chunks</span>
            </div>
          </div>
          <button
            onClick={() => {
              loadStatus();
              loadChunks();
            }}
            disabled={loadingStatus}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="Refresh Status"
          >
            <RefreshCw className={`h-4 w-4 ${loadingStatus ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'search'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Hybrid Search & Synthesis</span>
        </button>
        <button
          onClick={() => setActiveTab('ingest')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'ingest'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>Document Ingestion & Chunking</span>
          {indexedChunks.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 text-slate-300 rounded-full font-mono">
              {indexedChunks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'diagnostics'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Engine Telemetry & Parameters</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HYBRID SEARCH & GROUNDED SYNTHESIS SANDBOX */}
      {/* ========================================================================= */}
      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Search Config & Input */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-base font-semibold text-slate-200 flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                <span>RRF Fusion Parameters</span>
              </h2>

              {/* Search Mode Toggle */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Retrieval Mode</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setSearchMode('hybrid')}
                    className={`py-1.5 rounded text-center transition-all ${
                      searchMode === 'hybrid'
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Hybrid RRF
                  </button>
                  <button
                    onClick={() => setSearchMode('dense')}
                    className={`py-1.5 rounded text-center transition-all ${
                      searchMode === 'dense'
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Dense Vector
                  </button>
                  <button
                    onClick={() => setSearchMode('sparse')}
                    className={`py-1.5 rounded text-center transition-all ${
                      searchMode === 'sparse'
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sparse BM25
                  </button>
                </div>
              </div>

              {/* RRF Weight Sliders */}
              {searchMode === 'hybrid' && (
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Dense Vector Weight ($w_{'{'}dense{'}'}$)</span>
                      <span className="font-mono text-indigo-300">{denseWeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={denseWeight}
                      onChange={(e) => setDenseWeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Sparse BM25 Weight ($w_{'{'}sparse{'}'}$)</span>
                      <span className="font-mono text-indigo-300">{sparseWeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={sparseWeight}
                      onChange={(e) => setSparseWeight(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">RRF Smoothing Constant ($k$)</span>
                      <span className="font-mono text-indigo-300">{rrfK}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={rrfK}
                      onChange={(e) => setRrfK(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Top-K Slider */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Top Candidates (K)</span>
                  <span className="font-mono text-indigo-300">{topK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Grounded Synthesis Checkbox */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={synthesizeAnswer}
                    onChange={(e) => setSynthesizeAnswer(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <div>
                    <span className="text-slate-200 font-medium">Grounded AI Synthesis</span>
                    <p className="text-slate-500 text-[11px]">Generate cited answer via Local LLM engine</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 1-Click Preset Queries */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Test Inquiries
              </span>
              <div className="space-y-1.5">
                {SAMPLE_QUERIES.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(sq)}
                    className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-indigo-950/30 border border-slate-800/60 hover:border-indigo-500/30 text-xs text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span className="truncate mr-2">{sq}</span>
                    <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Search Query & Results */}
          <div className="lg:col-span-2 space-y-5">
            {/* Search Input Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="pl-2 text-slate-500">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter technical query or equipment tag (e.g. PV-401A, V-402 MAWP, ESD-401)..."
                  className="flex-1 bg-transparent border-0 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0"
                />
                <button
                  onClick={() => handleSearch()}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center space-x-1.5"
                >
                  {searching ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Retrieving...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" />
                      <span>Execute Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Display */}
            {queryResult && (
              <div className="space-y-4">
                {/* Telemetry Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span>
                      Mode: <strong className="text-indigo-300 uppercase">{queryResult.mode || searchMode}</strong>
                    </span>
                    <span>
                      Total Latency:{' '}
                      <strong className="text-emerald-400">
                        {typeof queryResult.latency_ms === 'object'
                          ? queryResult.latency_ms.total
                          : queryResult.total_latency_ms || queryResult.latency_ms || 0}
                        ms
                      </strong>
                    </span>
                    <span>
                      Hits: <strong className="text-slate-200">{queryResult.results?.length || queryResult.retrieved_chunks?.length || 0}</strong>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                    AIR-GAP VERIFIED
                  </span>
                </div>

                {/* Grounded AI Answer Box (if synthesis enabled) */}
                {queryResult.answer && (
                  <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        <h3 className="text-sm font-semibold text-indigo-200">Grounded Technical Answer</h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Model: {queryResult.model_name || queryResult.model_used}
                      </span>
                    </div>

                    <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                      {queryResult.answer}
                    </div>

                    {/* Citations list */}
                    {queryResult.citations && queryResult.citations.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Verified Source Citations
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {queryResult.citations.map((cit, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1 bg-slate-900 border border-indigo-500/30 rounded text-xs text-indigo-300 flex items-center space-x-1.5"
                            >
                              <Quote className="h-3 w-3 text-indigo-400" />
                              <span className="font-mono font-medium">{cit.citation_label}</span>
                              <span className="text-[10px] text-slate-400">
                                (Score: {Math.round(cit.relevance_score * 100)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ranked Chunks & Multi-Lane Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Retrieved Chunks & Lane Provenance
                  </h3>

                  {(queryResult.results || queryResult.retrieved_chunks || []).map((chunk: RetrievedChunkItem, idx: number) => {
                    const isDualLane = chunk.retrieval_lane === 'hybrid_dual_lane';
                    return (
                      <div
                        key={chunk.chunk_id || idx}
                        className={`bg-slate-900/80 border rounded-xl p-4 space-y-3 transition-all ${
                          isDualLane
                            ? 'border-indigo-500/40 bg-indigo-950/10'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <span className="font-mono font-semibold text-xs text-indigo-300">
                              {chunk.citation_label || `[${chunk.filename} #Chunk-${chunk.chunk_index}]`}
                            </span>
                            {chunk.section_title && (
                              <span className="text-xs text-slate-400">• {chunk.section_title}</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Lane Badge */}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                isDualLane
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : chunk.retrieval_lane === 'dense_only'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {isDualLane ? 'DUAL-LANE MATCH' : chunk.retrieval_lane.toUpperCase()}
                            </span>

                            {/* Relevance Score Badge */}
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                              RRF: {chunk.rrf_score?.toFixed(5) || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Chunk Excerpt */}
                        <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                          {chunk.text}
                        </p>

                        {/* Multi-Lane Score Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1 text-slate-400">
                          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[9px]">DENSE RANK</span>
                            <span className="text-blue-300 font-semibold">{chunk.dense_rank ? `#${chunk.dense_rank}` : 'N/A'}</span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[9px]">SPARSE BM25 RANK</span>
                            <span className="text-amber-300 font-semibold">{chunk.sparse_rank ? `#${chunk.sparse_rank}` : 'N/A'}</span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[9px]">COSINE SIMILARITY</span>
                            <span className="text-slate-200">{chunk.dense_score?.toFixed(4) || '0.0000'}</span>
                          </div>
                          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[9px]">TAGS IDENTIFIED</span>
                            <span className="text-indigo-300 truncate block">
                              {chunk.tags?.length ? chunk.tags.join(', ') : 'None'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!queryResult && !searching && (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-300">Ready to Query Knowledge Base</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Select a test query above or enter a search term to test dense semantic search, sparse BM25 keyword matching, and Reciprocal Rank Fusion.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INGESTION & CHUNKING INSPECTOR */}
      {/* ========================================================================= */}
      {activeTab === 'ingest' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingest Form */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-base font-semibold text-slate-200 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Ingest Document</span>
              </h2>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Document Identifier / Filename</label>
                <input
                  type="text"
                  value={ingestFilename}
                  onChange={(e) => setIngestFilename(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Target Chunk Size</label>
                  <input
                    type="number"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(parseInt(e.target.value) || 350)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Overlap Tokens</label>
                  <input
                    type="number"
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 70)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400 font-medium">Document Content</label>
                  <button
                    onClick={() => setIngestText(SAMPLE_PRESET_DOC)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Reset to Preset Spec
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={ingestText}
                  onChange={(e) => setIngestText(e.target.value)}
                  placeholder="Paste technical text, markdown, or P&ID equipment tags here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleIngest}
                disabled={ingesting || !ingestText.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center justify-center space-x-2"
              >
                {ingesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Chunking & Indexing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Chunk & Index into Hybrid Store</span>
                  </>
                )}
              </button>
            </div>

            {/* Ingest Result Card */}
            {ingestResult && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Ingestion Successful</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono pt-1">
                  <div>Chunks: <strong className="text-emerald-300">{ingestResult.chunks_ingested}</strong></div>
                  <div>Tokens: <strong className="text-emerald-300">{ingestResult.total_tokens}</strong></div>
                  <div>Vectors: <strong className="text-emerald-300">{ingestResult.vector_points_upserted}</strong></div>
                  <div>Latency: <strong className="text-emerald-300">{ingestResult.latency_ms}ms</strong></div>
                </div>
                {ingestResult.tags_extracted?.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block mb-1">Tags Extracted:</span>
                    <div className="flex flex-wrap gap-1">
                      {ingestResult.tags_extracted.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-slate-900 text-indigo-300 rounded text-[10px] font-mono border border-indigo-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chunk Visualizer / Inspector */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                <span>Indexed Chunks Registry ({indexedChunks.length})</span>
              </h3>
              <button
                onClick={loadChunks}
                disabled={loadingChunks}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                <RefreshCw className={`h-3 w-3 ${loadingChunks ? 'animate-spin' : ''}`} />
                <span>Refresh Chunks</span>
              </button>
            </div>

            <div className="space-y-3">
              {indexedChunks.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-2">
                  <p className="text-sm text-slate-400">No chunks registered yet.</p>
                  <p className="text-xs text-slate-500">Ingest a sample document to inspect semantic chunk splits.</p>
                </div>
              ) : (
                indexedChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5 font-mono text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-bold border border-indigo-500/20">
                          Chunk #{chunk.chunk_index}
                        </span>
                        <span className="text-slate-300 font-semibold">{chunk.filename}</span>
                        {chunk.section_title && (
                          <span className="text-slate-500">• {chunk.section_title}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                        <span>{chunk.token_count} Tokens</span>
                        <span>{chunk.char_count} Chars</span>
                      </div>
                    </div>

                    <p className="text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/70 whitespace-pre-wrap">
                      {chunk.text}
                    </p>

                    {chunk.tags?.length > 0 && (
                      <div className="flex items-center space-x-2 pt-1">
                        <Tag className="h-3 w-3 text-indigo-400 shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {chunk.tags.map((t) => (
                            <span key={t} className="px-1.5 py-0.2 bg-slate-950 text-indigo-300 rounded text-[10px] border border-indigo-500/20">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ENGINE TELEMETRY & DIAGNOSTICS */}
      {/* ========================================================================= */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Vector Store Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Database className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Vector Store</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Engine Mode:</span>
                  <span className="text-slate-100">{statusData?.vector_store.mode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Qdrant Live:</span>
                  <span className={statusData?.vector_store.qdrant_connected ? 'text-emerald-400' : 'text-amber-400'}>
                    {statusData?.vector_store.qdrant_connected ? 'Connected' : 'Fallback Active'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Indexed Vectors:</span>
                  <span className="text-indigo-300 font-bold">{statusData?.vector_store.indexed_vectors_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dimension:</span>
                  <span className="text-slate-100">{statusData?.vector_store.vector_dimension}d</span>
                </div>
              </div>
            </div>

            {/* BM25 Index Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Hash className="h-5 w-5 text-amber-400" />
                  <h3 className="text-sm font-semibold text-slate-200">BM25 Sparse Index</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  READY
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Vocabulary Terms:</span>
                  <span className="text-amber-300 font-bold">{statusData?.bm25_index.vocabulary_size}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Indexed Docs:</span>
                  <span className="text-slate-100">{statusData?.bm25_index.total_documents}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Avg Doc Length:</span>
                  <span className="text-slate-100">{statusData?.bm25_index.average_doc_length} words</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parameters:</span>
                  <span className="text-slate-100">k1={statusData?.bm25_index.k1}, b={statusData?.bm25_index.b}</span>
                </div>
              </div>
            </div>

            {/* Embedding Engine Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Embedding Engine</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Configured Model:</span>
                  <span className="text-purple-300 font-bold">{statusData?.embedding_engine.model_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Active Engine:</span>
                  <span className="text-slate-100 truncate">{statusData?.embedding_engine.last_used_engine}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Cache Entries:</span>
                  <span className="text-slate-100">{statusData?.embedding_engine.cache_entries} / {statusData?.embedding_engine.cache_capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Air-Gap Policy:</span>
                  <span className="text-emerald-400">Zero-Egress</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Formulation Reference Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Info className="h-4 w-4 text-indigo-400" />
              <span>Sovereign Reciprocal Rank Fusion (RRF) Formulation</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hybrid retrieval merges dense semantic vector similarity with sparse BM25 keyword matching to prevent catastrophic vocabulary mismatch in technical engineering specifications:
            </p>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
              RRF_Score(d) = (w_dense / (k + rank_dense(d))) + (w_sparse / (k + rank_sparse(d)))
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RagEngine;
