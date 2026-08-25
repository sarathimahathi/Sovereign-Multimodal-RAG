# Sovereign AI Workbench 🛡️⚡

An enterprise-grade, sovereign, air-gapped capable Multimodal AI Workbench combining local LLMs, hybrid RAG (dense + sparse keyword search), multi-agent reasoning loops, multimodal document intelligence, and isolated code execution sandboxing.

---

## 🏛️ System Architecture & Monorepo Directory Structure

The repository is organized as a modular monorepo ensuring clean separation of concerns between client interfaces, API orchestration, and domain-specific AI subsystems:

```
sovereign-ai-workbench/
├── frontend/             # Vite + React + TypeScript + Tailwind CSS UI
├── backend/              # FastAPI Python backend application
├── agent/                # Autonomous agent orchestration, tool routing, planning loops
├── models/               # Local/remote LLM adapters, inference abstractions (Ollama, vLLM, GGUF)
├── rag/                  # Hybrid RAG engine, vector stores (Qdrant), embeddings, chunkers
├── multimodal/           # OCR, document parsing, vision & audio processing pipelines
├── sandbox/              # Isolated code execution environments (Docker/gVisor/eBPF sandboxing)
├── security/             # Guardrails, prompt injection filters, PII redaction, air-gap policy
├── document_generation/  # Automated report, presentation, and document export engines
├── tests/                # End-to-end and cross-module integration test suites
├── docs/                 # Architectural Decision Records (ADRs), API specs, setup docs
├── scripts/              # Developer automation, DB migrations, setup and teardown scripts
├── docker-compose.yml    # Container infrastructure (PostgreSQL, Qdrant, Ollama, backend, frontend)
├── .env.example          # Environment variable template with zero secrets
├── .gitignore            # Comprehensive ignore rules for Python, Node, caches, and storage
└── README.md             # Developer onboarding and project documentation
```

### Module Responsibilities

| Directory | Purpose |
| :--- | :--- |
| **`frontend/`** | Decoupled client-side single-page app (Vite, React, TypeScript, Tailwind, Zustand, Recharts). |
| **`backend/`** | High-performance FastAPI server providing REST/WebSocket endpoints and orchestrating services. |
| **`agent/`** | Cognitive reasoning frameworks (ReAct, multi-agent debates, task planning, tool calling). |
| **`models/`** | Pluggable LLM/VLM driver interfaces (Ollama, vLLM, GGUF, Hugging Face, custom ONNX). |
| **`rag/`** | Vector ingestion, semantic chunking, BM25 indexing, Reciprocal Rank Fusion, and Qdrant integration. |
| **`multimodal/`** | Optical Character Recognition (OCR), document layout parsing, audio transcription, image analysis. |
| **`sandbox/`** | Secure execution jail for AI-generated code, isolated from host resources and network. |
| **`security/`** | Input sanitization, prompt injection shielding, PII detection/masking, and audit log hashing. |
| **`document_generation/`** | Report synthesis engine converting AI outputs into PDF, DOCX, Markdown, and CSV briefs. |
| **`tests/`** | System-wide automated integration tests, API contract validations, and benchmark suites. |
| **`docs/`** | Architecture decision records (ADRs), system designs, compliance docs, and phase blueprints. |
| **`scripts/`** | Developer environment helpers, database seeders, migration runners, and bundle packagers. |

---

## 🚀 Quickstart Guide for New Team Members

Follow these step-by-step instructions to get the backend and frontend up and running locally.

### 1. Prerequisites
Ensure you have the following installed on your workstation:
* **Python 3.11+** (`python --version`)
* **Node.js 18+ & npm 9+** (`node -v && npm -v`)
* **Git** (`git --version`)
* *(Optional)* **Docker & Docker Compose** (for PostgreSQL, Qdrant, Ollama)

---

### 2. Clone & Enter Repository
```bash
git clone <repository-url>
cd sovereign-ai-workbench
```

---

### 3. Environment Configuration
Copy `.env.example` to create your local `.env` configuration:
```bash
# On Linux / macOS / Git Bash
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```
*(Review `.env` settings. The default values are preconfigured for local development.)*

---

### 4. Setup & Start Backend (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On Linux / macOS:
source venv/bin/activate

# Upgrade pip & install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start the FastAPI backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend will start at: **`http://localhost:8000`**  
OpenAPI Interactive Docs: **`http://localhost:8000/docs`**

---

### 5. Setup & Start Frontend (Vite + React)

Open a new terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# (Optional) Copy frontend env file
# On Linux / macOS / Git Bash: cp .env.example .env
# On Windows PowerShell: Copy-Item .env.example .env

# Start the Vite development server
npm run dev
```
The frontend UI will start at: **`http://localhost:5173`**

---

### 6. Verify System Health Endpoint

Verify that the backend is responding and collecting real process telemetry:

1. **Via cURL / Browser:**
   ```bash
   curl -X GET http://localhost:8000/api/health
   ```
   **Expected Response:**
   ```json
   {
     "status": "healthy",
     "app_name": "Sovereign AI Workbench",
     "version": "0.1.0",
     "environment": "development",
     "timestamp": "2026-08-24T14:25:00.000000Z",
     "uptime_seconds": 12.45,
     "system": {
       "cpu_usage_percent": 1.2,
       "memory_usage_mb": 48.6,
       "memory_usage_percent": 0.3
     },
     "services": {
       "api": "healthy",
       "database": "unconfigured_phase1",
       "vector_store": "unconfigured_phase1",
       "llm_engine": "unconfigured_phase1"
     }
   }
   ```

2. **Via Frontend Dashboard:**
   * Open **`http://localhost:5173`** in your browser.
   * You will see the **Live Health Telemetry Card** indicating `HEALTHY` with real-time latency ping chart, uptime counter, and system diagnostic readings.

---

### 7. Running Tests

To run the automated test suite:
```bash
# In backend virtual environment:
pytest tests/ -v
```

---

## 🗺️ 12-Phase Master Implementation Roadmap

* **Phase 1: Project Foundation (Current Phase)** 🟢
* **Phase 2: Database Layer & Persistent Storage** ⚪
* **Phase 3: Security, Guardrails & User Isolation** ⚪
* **Phase 4: Local Model Adapters (Ollama / vLLM / GGUF)** ⚪
* **Phase 5: Hybrid RAG Engine (Qdrant, BM25, RRF)** ⚪
* **Phase 6: Isolated Code Sandbox (Docker / gVisor)** ⚪
* **Phase 7: Multimodal Processing (OCR & Layout Parsing)** ⚪
* **Phase 8: Autonomous Agent Core (ReAct & Tool Orchestration)** ⚪
* **Phase 9: Document Generation & Export Engine** ⚪
* **Phase 10: Advanced Multimodal & Audio Intelligence** ⚪
* **Phase 11: Real-time Collaboration & Streaming** ⚪
* **Phase 12: Production Hardening & Air-Gap Compliance** ⚪
