# System Architecture Documentation

## 1. High-Level Topology

```
┌────────────────────────────────────────────────────────┐
│             Frontend UI (Vite + React + TS)            │
│         Zustand State | Recharts | Tailwind CSS        │
└───────────────────────────┬────────────────────────────┘
                            │ REST / WebSocket (Axios)
┌───────────────────────────▼────────────────────────────┐
│              FastAPI Backend Gateway                   │
│   Middleware | Schemas (DTO) | Core Config | Logging   │
└──────┬──────────────┬──────────────┬─────────────┬─────┘
       │              │              │             │
┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐┌─────▼─────┐
│    Models   ││     RAG     ││    Agent    ││  Sandbox  │
│(Ollama/vLLM)││  (Qdrant)   ││   (ReAct)   ││  (Docker) │
└─────────────┘└─────────────┘└─────────────┘└───────────┘
```

## 2. Decoupled Modular Architecture
The sovereign AI workbench is built with independent modular subsystems to enable air-gapped deployment, local inference sovereignty, and high maintainability.

## 3. Data Flow
1. Client requests hit the **FastAPI Backend Gateway**.
2. **Middleware** verifies CORS, records latency metrics, and logs requests.
3. **Route Handlers** parse inputs into Pydantic Schemas.
4. **Services** execute domain logic by calling respective subsystems (RAG, Models, Agent, Sandbox).
5. **Repositories** manage database persistence with PostgreSQL.
