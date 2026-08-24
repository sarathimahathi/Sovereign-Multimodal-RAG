# Sovereign AI Workbench - Backend & Security (M5)

## Quick Start
1. Install dependencies: `pip install -r requirements.txt`
2. Start server: `uvicorn app.main:app --reload --port 8000`
3. API Documentation: `http://127.0.0.1:8000/docs`

## Primary Endpoints
- **Chat & Tool Stream:** `ws://127.0.0.1:8000/api/chat/ws`
- **Air-Gap Verification:** `GET /api/security/network-status`
- **Audit Logs:** `GET /api/audit/logs`
- **Document Ingestion:** `POST /api/files/upload`
- **Deliverables Download:** `GET /api/files/download/{filename}`