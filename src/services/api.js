import axios from 'axios';

// Base API Client configured for FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Flag to control mock fallback mode
export const IS_MOCK_FALLBACK = true;

// Mock Data Presets
export const MOCK_MODELS = [
  {
    id: 'local-reasoning-v1',
    name: 'Local Reasoning Model',
    type: 'Reasoning & Synthesis',
    architecture: 'Qwen2.5-72B-Instruct-GGUF',
    contextLength: '32k',
    status: 'Ready (Local GPU)',
    quantization: 'Q4_K_M',
  },
  {
    id: 'local-code-v1',
    name: 'Local Code Model',
    type: 'Code Analysis & Logic Verification',
    architecture: 'DeepSeek-Coder-V2-Lite-16B-GGUF',
    contextLength: '64k',
    status: 'Ready (Local GPU)',
    quantization: 'Q5_K_M',
  },
  {
    id: 'local-vision-v1',
    name: 'Local Vision Model',
    type: 'Multimodal / OCR / Visual Inspection',
    architecture: 'Llava-v1.6-34B-GGUF',
    contextLength: '16k',
    status: 'Ready (Local GPU)',
    quantization: 'Q4_K_M',
  },
];

export const MOCK_TASKS = [
  {
    id: 'TSK-2026-0842',
    name: 'Turbine Inspection Report Analysis',
    type: 'Document Analysis',
    model: 'Local Reasoning Model',
    status: 'Completed',
    date: '2026-08-24 11:30',
    duration: '4.2s',
    user: 'Operator (Confidential)',
    fileCount: 2,
    deliverable: 'Approval_Note_Turbine_042.docx',
    deliverableType: 'docx',
  },
  {
    id: 'TSK-2026-0841',
    name: 'Code Verification - Gas Pipeline Monitor',
    type: 'Coding',
    model: 'Local Code Model',
    status: 'Completed',
    date: '2026-08-24 10:15',
    duration: '6.8s',
    user: 'Senior Dev (Air-Gapped)',
    fileCount: 1,
    deliverable: 'Verified_Pipeline_Sensor_Logic.py',
    deliverableType: 'code',
  },
  {
    id: 'TSK-2026-0840',
    name: 'SOP Compliance Review & Safety Note',
    type: 'Document Analysis',
    model: 'Local Reasoning Model',
    status: 'Completed',
    date: '2026-08-24 09:45',
    duration: '3.9s',
    user: 'Compliance Auditor',
    fileCount: 3,
    deliverable: 'Safety_Audit_Summary_2026.pdf',
    deliverableType: 'pdf',
  },
  {
    id: 'TSK-2026-0839',
    name: 'Pressure Valve Maintenance Data Check',
    type: 'Data Analysis',
    model: 'Local Reasoning Model',
    status: 'Failed',
    date: '2026-08-23 16:20',
    duration: '1.2s',
    user: 'Operator',
    fileCount: 1,
    deliverable: null,
    error: 'Malformed CSV Header in row 42',
  },
];

export const MOCK_KNOWLEDGE = [
  {
    id: 'DOC-SOP-01',
    name: 'Safety_SOP_HighPressure_2026.pdf',
    category: 'SOPs',
    size: '3.4 MB',
    vectors: 1240,
    status: 'Indexed',
    date: '2026-08-01',
    snippet: 'Section 4.2: Maximum operational pressure for Stage-3 compressor unit shall not exceed 450 PSI without dual sign-off from Plant Manager and Safety Chief.',
  },
  {
    id: 'DOC-MAN-02',
    name: 'Turbine_Generator_Maintenance_Manual.pdf',
    category: 'Manuals',
    size: '14.8 MB',
    vectors: 5820,
    status: 'Indexed',
    date: '2026-07-15',
    snippet: 'Boring inspection protocol requires thermal acoustic imaging every 500 operating hours. Discrepancies > 0.05mm trigger mandatory shutdown.',
  },
  {
    id: 'DOC-REP-03',
    name: 'Inspection_Report_042_Unit3.pdf',
    category: 'Inspection Reports',
    size: '4.2 MB',
    vectors: 890,
    status: 'Indexed',
    date: '2026-08-20',
    snippet: 'Vibration frequency anomaly detected on Bearing-2 during load surge test. Recommended bearing replacement within next 120 operational hours.',
  },
  {
    id: 'DOC-ENG-04',
    name: 'Substation_Telemetry_Architecture_Draft.pdf',
    category: 'Engineering Documents',
    size: '8.1 MB',
    vectors: 3100,
    status: 'Indexed',
    date: '2026-06-10',
    snippet: 'PLC Modbus over TCP telemetry protocol specification. All control frames must be verified via HMAC-SHA256 hardware security module.',
  },
  {
    id: 'DOC-COR-05',
    name: 'Ministry_Compliance_Directive_2026.pdf',
    category: 'Previous Correspondence',
    size: '1.9 MB',
    vectors: 430,
    status: 'Indexed',
    date: '2026-08-05',
    snippet: 'Mandatory zero-cloud data leak policy for critical infrastructure. All AI evaluation models must run entirely within local air-gapped data centers.',
  },
];

export const MOCK_SECURITY_STATUS = {
  inference: 'Local (On-Premise GPU)',
  knowledgeBase: 'Local Vector Store (ChromaDB / Qdrant On-Prem)',
  externalApi: 'Disabled (Hard-blocked)',
  network: 'Air-Gapped (Isolated Subnet)',
  fileProcessing: 'Local Sandbox',
  codeSandbox: 'Isolated Container',
  resources: {
    gpuUsage: 78,
    gpuVram: '18.4 / 24.0 GB',
    gpuTemp: '64°C',
    memoryUsage: 62,
    ram: '39.6 / 64.0 GB',
    cpuUsage: 41,
    cpuCores: '16 Cores / 32 Threads',
    storageUsage: 54,
    diskSpace: '486 / 900 GB SSD',
  },
};

// API Service Methods
export const apiService = {
  // Tasks
  async getTasks() {
    try {
      const response = await apiClient.get('/api/tasks');
      return response.data;
    } catch {
      return MOCK_TASKS;
    }
  },

  async getTaskById(taskId) {
    try {
      const response = await apiClient.get(`/api/tasks/${taskId}`);
      return response.data;
    } catch {
      const found = MOCK_TASKS.find((t) => t.id === taskId);
      return found || MOCK_TASKS[0];
    }
  },

  async submitTask(payload) {
    try {
      const response = await apiClient.post('/api/tasks', payload);
      return response.data;
    } catch {
      // Mock successful task creation response
      return {
        success: true,
        taskId: `TSK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Started',
        message: 'Task initiated in local sandbox',
      };
    }
  },

  // Upload
  async uploadFile(formData, onProgress) {
    try {
      const response = await apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
      return response.data;
    } catch {
      // Mock progress simulation
      if (onProgress) onProgress(100);
      return {
        success: true,
        fileId: `FILE-${Math.random().toString(36).substring(7)}`,
        status: 'Ready',
      };
    }
  },

  // Models
  async getModels() {
    try {
      const response = await apiClient.get('/api/models');
      return response.data;
    } catch {
      return MOCK_MODELS;
    }
  },

  // Knowledge Base RAG
  async getKnowledge() {
    try {
      const response = await apiClient.get('/api/knowledge');
      return response.data;
    } catch {
      return MOCK_KNOWLEDGE;
    }
  },

  async searchKnowledge(query) {
    try {
      const response = await apiClient.post('/api/knowledge/search', { query });
      return response.data;
    } catch {
      const lower = query.toLowerCase();
      const filtered = MOCK_KNOWLEDGE.filter(
        (k) =>
          k.name.toLowerCase().includes(lower) ||
          k.snippet.toLowerCase().includes(lower) ||
          k.category.toLowerCase().includes(lower)
      );
      return filtered.length > 0 ? filtered : MOCK_KNOWLEDGE.slice(0, 2);
    }
  },

  // Security Status
  async getSecurityStatus() {
    try {
      const response = await apiClient.get('/api/security/status');
      return response.data;
    } catch {
      return MOCK_SECURITY_STATUS;
    }
  },

  // Artifacts / Deliverables
  async getArtifacts() {
    try {
      const response = await apiClient.get('/api/artifacts');
      return response.data;
    } catch {
      return [
        {
          id: 'art-1',
          name: 'Approval_Note_Turbine_042.docx',
          size: '1.2 MB',
          type: 'docx',
          generatedDate: '2026-08-24 11:30',
        },
        {
          id: 'art-2',
          name: 'Verified_Pipeline_Sensor_Logic.py',
          size: '24 KB',
          type: 'code',
          generatedDate: '2026-08-24 10:15',
        },
        {
          id: 'art-3',
          name: 'Safety_Audit_Summary_2026.pdf',
          size: '3.8 MB',
          type: 'pdf',
          generatedDate: '2026-08-24 09:45',
        },
      ];
    }
  },
};

export default apiService;
