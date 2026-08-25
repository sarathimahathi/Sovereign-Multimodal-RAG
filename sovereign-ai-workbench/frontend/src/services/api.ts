import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime_seconds: number;
  system: {
    cpu_usage_percent: number;
    memory_usage_mb: number;
    memory_usage_percent: number;
  };
  services: {
    api: string;
    database: string;
    vector_store: string;
    llm_engine: string;
  };
}

export interface DocumentItem {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  status: string;
  session_id: string | null;
  storage_path: string;
  metadata_info: Record<string, any>;
  created_at: string;
}

export interface DocumentListResponse {
  total: number;
  items: DocumentItem[];
}

export interface MessageItem {
  id: string;
  session_id: string;
  role: 'user' | 'agent' | 'tool' | 'system';
  content: string;
  model_used?: string | null;
  tool_calls?: Record<string, any>[] | null;
  latency_ms?: number | null;
  created_at: string;
}

export interface SessionItem {
  id: string;
  title: string;
  classification: string;
  model_preference?: string | null;
  metadata_info: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SessionDetailItem extends SessionItem {
  documents: DocumentItem[];
  messages: MessageItem[];
  deliverables: any[];
}

export interface SessionListResponse {
  total: number;
  items: SessionItem[];
}

// Security Schemas
export interface SocketConnectionItem {
  pid: number;
  process_name: string;
  local_address: string;
  remote_address: string;
  status: string;
  protocol: string;
  verdict: string;
  is_safe: boolean;
}

export interface NetworkStatusResponse {
  air_gap_status: string;
  is_air_gapped: boolean;
  external_egress_count: number;
  outbound_internet_bytes: number;
  total_local_bytes_sent: number;
  total_local_bytes_recv: number;
  active_sockets_count: number;
  connections: SocketConnectionItem[];
  policy: {
    allowed_subnets: string[];
    cloud_api_egress_blocked: boolean;
    telemetry_egress_blocked: boolean;
    firewall_enforcement: string;
  };
}

export interface PromptThreatItem {
  threat_type: string;
  score: number;
  description: string;
}

export interface PromptScanResponse {
  is_safe: boolean;
  threat_level: string;
  risk_score: number;
  detected_threats: PromptThreatItem[];
  character_count: number;
  action_taken: string;
}

export interface TextSanitizeResponse {
  original_length: number;
  sanitized_text: string;
  redacted_count: number;
  redacted_types: string[];
}

export interface AuditLogItem {
  id: string;
  block_index?: number;
  event_type: string;
  entity_type: string;
  entity_id: string;
  sha256_checksum: string;
  event_data: Record<string, any>;
  timestamp: string;
}

export interface AuditLogListResponse {
  total: number;
  items: AuditLogItem[];
}

export interface AuditChainVerifyResponse {
  chain_valid: boolean;
  total_blocks: number;
  genesis_hash: string;
  latest_hash: string;
  broken_block_id?: string | null;
  verification_status: string;
  verification_timestamp: string;
}

// Model Schemas
export interface ModelItem {
  model_id: string;
  name: string;
  domain: string;
  param_size: string;
  quantization: string;
  vram_estimate_gb: number;
  context_window: string;
  description: string;
  status: string;
  is_air_gapped: boolean;
}

export interface ModelListResponse {
  total: number;
  models: ModelItem[];
}

export interface TaskRouteResponse {
  domain: string;
  selected_model_id: string;
  model_name: string;
  specialization: string;
  context_window: string;
  confidence_score: number;
  decision_rationale: string;
  matched_keywords: string[];
}

export interface GenerateResponse {
  model_used: string;
  model_name: string;
  engine: string;
  domain: string;
  decision_rationale: string;
  confidence_score: number;
  matched_keywords: string[];
  content: string;
  latency_ms: number;
  tokens_generated: number;
  tokens_per_sec: number;
  is_air_gapped: boolean;
}

export const API_BASE_URL = 'http://127.0.0.1:8000';

// API Methods
export const fetchHealth = async (): Promise<{ data: HealthResponse; latencyMs: number }> => {
  const start = performance.now();
  const response = await api.get<HealthResponse>('/health');
  const latencyMs = Math.round(performance.now() - start);
  return { data: response.data, latencyMs };
};

export const fetchDocuments = async (skip = 0, limit = 50): Promise<DocumentListResponse> => {
  const response = await api.get<DocumentListResponse>('/documents', { params: { skip, limit } });
  return response.data;
};

export const uploadDocument = async (file: File, classification: string, sessionId?: string): Promise<DocumentItem> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('classification', classification);
  if (sessionId) {
    formData.append('session_id', sessionId);
  }
  const response = await api.post<DocumentItem>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/documents/${id}`);
};

export const fetchSessions = async (skip = 0, limit = 50): Promise<SessionListResponse> => {
  const response = await api.get<SessionListResponse>('/sessions', { params: { skip, limit } });
  return response.data;
};

export const createSession = async (title: string, classification: string, modelPreference = 'auto'): Promise<SessionItem> => {
  const response = await api.post<SessionItem>('/sessions', {
    title,
    classification,
    model_preference: modelPreference,
  });
  return response.data;
};

export const fetchSessionDetail = async (id: string): Promise<SessionDetailItem> => {
  const response = await api.get<SessionDetailItem>(`/sessions/${id}`);
  return response.data;
};

export const addMessageToSession = async (
  sessionId: string,
  role: 'user' | 'agent',
  content: string,
  modelUsed?: string
): Promise<MessageItem> => {
  const response = await api.post<MessageItem>(`/sessions/${sessionId}/messages`, {
    role,
    content,
    model_used: modelUsed,
  });
  return response.data;
};

export const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/sessions/${id}`);
};

// Security API
export const fetchNetworkStatus = async (): Promise<NetworkStatusResponse> => {
  const response = await api.get<NetworkStatusResponse>('/security/network-status');
  return response.data;
};

export const scanPrompt = async (prompt: string): Promise<PromptScanResponse> => {
  const response = await api.post<PromptScanResponse>('/security/scan-prompt', { prompt });
  return response.data;
};

export const sanitizeText = async (text: string): Promise<TextSanitizeResponse> => {
  const response = await api.post<TextSanitizeResponse>('/security/sanitize-text', { text });
  return response.data;
};

export const fetchAuditLogs = async (skip = 0, limit = 50): Promise<AuditLogListResponse> => {
  const response = await api.get<AuditLogListResponse>('/security/audit-logs', { params: { skip, limit } });
  return response.data;
};

export const verifyAuditChain = async (): Promise<AuditChainVerifyResponse> => {
  const response = await api.get<AuditChainVerifyResponse>('/security/verify-audit-chain');
  return response.data;
};

// Models & Intent Router API
export const fetchModels = async (): Promise<ModelListResponse> => {
  const response = await api.get<ModelListResponse>('/models');
  return response.data;
};

export const routeTaskPrompt = async (prompt: string, userPreference = 'auto'): Promise<TaskRouteResponse> => {
  const response = await api.post<TaskRouteResponse>('/models/route', {
    prompt,
    user_preference: userPreference,
  });
  return response.data;
};

export const generateModelCompletion = async (
  prompt: string,
  modelPreference = 'auto',
  systemPrompt?: string,
  temperature = 0.2
): Promise<GenerateResponse> => {
  const response = await api.post<GenerateResponse>('/models/generate', {
    prompt,
    model_preference: modelPreference,
    system_prompt: systemPrompt,
    temperature,
  });
  return response.data;
};

// ============================================================================
// Phase 5: Hybrid RAG Engine Schemas & API
// ============================================================================

export interface RagIngestRequest {
  text: string;
  filename?: string;
  session_id?: string;
  doc_id?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  classification?: string;
  metadata?: Record<string, any>;
}

export interface ChunkPreviewItem {
  chunk_id: string;
  chunk_index: number;
  token_count: number;
  tags: string[];
  section: string;
  excerpt: string;
}

export interface RagIngestResponse {
  status: string;
  filename: string;
  doc_id?: string;
  session_id?: string;
  chunks_ingested: number;
  total_tokens: number;
  tags_extracted: string[];
  vector_points_upserted: number;
  bm25_documents_indexed: number;
  latency_ms: number;
  chunk_previews: ChunkPreviewItem[];
}

export interface RetrievedChunkItem {
  chunk_id: string;
  text: string;
  doc_id?: string | null;
  session_id?: string | null;
  filename: string;
  chunk_index: number;
  dense_score: number;
  dense_rank?: number | null;
  sparse_score: number;
  sparse_rank?: number | null;
  rrf_score: number;
  relevance_score: number;
  retrieval_lane: 'dense_only' | 'sparse_only' | 'hybrid_dual_lane';
  section_title?: string | null;
  classification: string;
  tags: string[];
  citation_label: string;
}

export interface CitationItem {
  citation_label: string;
  filename: string;
  chunk_id: string;
  relevance_score: number;
  lane: string;
  excerpt: string;
}

export interface RagQueryRequest {
  query: string;
  session_id?: string;
  mode?: 'hybrid' | 'dense' | 'sparse';
  top_k?: number;
  dense_weight?: number;
  sparse_weight?: number;
  rrf_k?: number;
  min_relevance_score?: number;
  synthesize_answer?: boolean;
  model_preference?: string;
}

export interface RagQueryResponse {
  query: string;
  mode?: string;
  session_id?: string | null;
  dense_weight?: number;
  sparse_weight?: number;
  rrf_k?: number;
  total_candidates?: number;
  returned_count?: number;
  latency_ms?: {
    total: number;
    dense_lane: number;
    sparse_lane: number;
  } | number;
  results?: RetrievedChunkItem[];
  citations?: CitationItem[];
  // When synthesize_answer is true
  answer?: string;
  model_used?: string;
  model_name?: string;
  domain?: string;
  retrieved_chunks?: RetrievedChunkItem[];
  retrieval_latency_ms?: number;
  generation_latency_ms?: number;
  total_latency_ms?: number;
  tokens_generated?: number;
  is_air_gapped?: boolean;
}

export interface RagStatusResponse {
  status: string;
  vector_store: {
    mode: string;
    qdrant_connected: boolean;
    qdrant_url: string;
    active_collection: string;
    indexed_vectors_count: number;
    vector_dimension: number;
  };
  bm25_index: {
    total_documents: number;
    vocabulary_size: number;
    average_doc_length: number;
    k1: number;
    b: number;
  };
  embedding_engine: {
    model_name: string;
    ollama_url: string;
    cache_entries: number;
    cache_capacity: number;
    dimension: number;
    last_used_engine: string;
  };
  total_registered_chunks: number;
  features: Record<string, boolean>;
}

export interface RagChunkItem {
  id: string;
  text: string;
  doc_id?: string;
  session_id?: string;
  filename: string;
  chunk_index: number;
  token_count: number;
  char_count: number;
  section_title?: string;
  classification: string;
  tags: string[];
  sha256_hash: string;
  metadata: Record<string, any>;
}

export interface RagChunkListResponse {
  total: number;
  skip: number;
  limit: number;
  chunks: RagChunkItem[];
}

export const ingestRagDocument = async (payload: RagIngestRequest): Promise<RagIngestResponse> => {
  const response = await api.post<RagIngestResponse>('/rag/ingest', payload);
  return response.data;
};

export const queryRag = async (payload: RagQueryRequest): Promise<RagQueryResponse> => {
  const response = await api.post<RagQueryResponse>('/rag/query', payload);
  return response.data;
};

export const fetchRagStatus = async (): Promise<RagStatusResponse> => {
  const response = await api.get<RagStatusResponse>('/rag/status');
  return response.data;
};

export const fetchRagChunks = async (sessionId?: string, skip = 0, limit = 50): Promise<RagChunkListResponse> => {
  const response = await api.get<RagChunkListResponse>('/rag/chunks', {
    params: { session_id: sessionId, skip, limit },
  });
  return response.data;
};

export const clearRagCollection = async (sessionId: string): Promise<any> => {
  const response = await api.delete(`/rag/collections/${sessionId}`);
  return response.data;
};

// ============================================================================
// Phase 6: Isolated Code Sandbox Schemas & API
// ============================================================================

export interface SecurityViolationItem {
  line_number: number;
  violation_type: string;
  target_name: string;
  description: string;
  severity: string;
}

export interface ASTScanResponse {
  is_safe: boolean;
  threat_level: string;
  risk_score: number;
  violations: SecurityViolationItem[];
  scanned_nodes_count: number;
}

export interface SandboxArtifactItem {
  filename: string;
  file_size_bytes: number;
  preview: string;
  storage_path: string;
}

export interface ExecuteCodeRequest {
  code: string;
  timeout_seconds?: number;
  max_memory_mb?: number;
  session_id?: string;
}

export interface ExecuteCodeResponse {
  execution_id: string;
  status: 'COMPLETED' | 'TIMEOUT' | 'FAILED' | 'BLOCKED_SECURITY';
  exit_code: number;
  stdout: string;
  stderr: string;
  execution_time_ms: number;
  memory_used_mb: number;
  runner_mode: string;
  security_scan: ASTScanResponse;
  artifacts_generated: SandboxArtifactItem[];
  is_air_gapped: boolean;
}

export interface SandboxStatusResponse {
  status: string;
  active_runner_mode: string;
  docker_available: boolean;
  air_gap_network_policy: string;
  default_timeout_seconds: number;
  default_memory_limit_mb: number;
  features: Record<string, boolean>;
}

export const executeSandboxCode = async (payload: ExecuteCodeRequest): Promise<ExecuteCodeResponse> => {
  const response = await api.post<ExecuteCodeResponse>('/sandbox/execute', payload);
  return response.data;
};

export const validateSandboxCode = async (code: string): Promise<ASTScanResponse> => {
  const response = await api.post<ASTScanResponse>('/sandbox/validate', { code });
  return response.data;
};

export const fetchSandboxStatus = async (): Promise<SandboxStatusResponse> => {
  const response = await api.get<SandboxStatusResponse>('/sandbox/status');
  return response.data;
};

// ============================================================================
// Phase 7: Multimodal Processing Schemas & API
// ============================================================================

export interface VisualSegmentItem {
  id: string;
  segment_type: string;
  text: string;
  page_number: number;
  bounding_box: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
  section_title?: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface ExtractedTableItem {
  table_id: string;
  title?: string;
  headers: string[];
  rows: string[][];
  raw_markdown: string;
  json_records: Record<string, any>[];
  csv_content: string;
  row_count: number;
  column_count: number;
}

export interface OCRTelemetryItem {
  text: string;
  confidence: number;
  word_count: number;
  tags_found: string[];
  engine_used: string;
  processing_time_ms: number;
  is_air_gapped: boolean;
  image_metadata: Record<string, any>;
}

export interface ParseDocumentRequest {
  text_content?: string;
  image_base64?: string;
  filename?: string;
  mime_type?: string;
  auto_index_to_rag?: boolean;
  session_id?: string;
}

export interface ParseDocumentResponse {
  filename: string;
  mime_type: string;
  total_pages: number;
  total_segments: number;
  tables_count: number;
  tags_detected: string[];
  layout: {
    document_id: string;
    filename: string;
    total_pages: number;
    segments: VisualSegmentItem[];
    tables_count: number;
    tags_detected: string[];
    raw_markdown: string;
    metadata: Record<string, any>;
  };
  tables: ExtractedTableItem[];
  ocr_telemetry: OCRTelemetryItem | null;
  rag_ingestion: any | null;
  raw_text_length: number;
  processing_time_ms: number;
  is_air_gapped: boolean;
}

export interface MultimodalStatusResponse {
  status: string;
  ocr_engine: string;
  layout_parser: string;
  table_extractor: string;
  supported_formats: string[];
  features: Record<string, boolean>;
}

export const parseMultimodalDocument = async (payload: ParseDocumentRequest): Promise<ParseDocumentResponse> => {
  const response = await api.post<ParseDocumentResponse>('/multimodal/parse', payload);
  return response.data;
};

export const extractMultimodalTables = async (text: string): Promise<{ tables_count: number; tables: ExtractedTableItem[] }> => {
  const response = await api.post<{ tables_count: number; tables: ExtractedTableItem[] }>('/multimodal/extract-tables', { text });
  return response.data;
};

export const fetchMultimodalStatus = async (): Promise<MultimodalStatusResponse> => {
  const response = await api.get<MultimodalStatusResponse>('/multimodal/status');
  return response.data;
};

export default api;



