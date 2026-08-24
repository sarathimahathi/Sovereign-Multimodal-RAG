import os
import shutil
from typing import List, Any
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.sandbox.executor import execute_code_safely
from app.security.airgap_monitor import check_airgap_status
from app.api.chat import router as chat_router
from app.services.document_generator import (
    generate_approval_note_docx,
    generate_calculation_sheet_xlsx,
    STORAGE_DIR
)
from app.db.database import init_db, log_event, get_recent_audit_logs

app = FastAPI(
    title="Sovereign AI Workbench Backend",
    version="1.0.0",
    description="Air-gapped backend API with sandboxed code execution, document generation, and audit logging."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat_router)
# Initialize the SQLite database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# --- Request Schemas ---
class CodeExecutionRequest(BaseModel):
    code: str
    timeout: int = 5

class ApprovalNoteRequest(BaseModel):
    title: str = "MEMORANDUM / APPROVAL NOTE"
    reference_no: str = "ENG/2026/08/99"
    summary: str
    findings: List[str]
    recommendation: str

class SpreadsheetRequest(BaseModel):
    sheet_title: str = "Engineering_Calculations"
    headers: List[str]
    rows: List[List[Any]]

class AgentChatRequest(BaseModel):
    prompt: str
    task_type: str = "general" # "general", "coding", "inspection_summary"

@app.get("/")
def root():
    return {"status": "online", "system": "Sovereign AI Workbench"}

# --- Sandboxed Code Execution ---
@app.post("/api/sandbox/execute")
def run_sandbox_code(payload: CodeExecutionRequest):
    result = execute_code_safely(payload.code, payload.timeout)
    status = "SUCCESS" if result.get("success") else "FAILED"
    log_event("SANDBOX_RUN", f"Executed code: {payload.code[:40]}...", status)
    return result

# --- Air-Gap Network Monitor ---
@app.get("/api/security/network-status")
def get_network_status():
    return check_airgap_status()

# --- File Ingestion ---
@app.post("/api/files/upload")
async def upload_document(file: UploadFile = File(...)):
    file_path = os.path.join(STORAGE_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        log_event("FILE_UPLOAD", f"Uploaded: {file.filename}", "SUCCESS")
        return {
            "filename": file.filename,
            "filepath": file_path,
            "status": "stored_locally"
        }
    except Exception as e:
        log_event("FILE_UPLOAD", f"Failed: {file.filename}", "FAILED")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

# --- Deliverables Generation ---
@app.post("/api/deliverables/generate-docx")
def create_docx(payload: ApprovalNoteRequest):
    path = generate_approval_note_docx(
        payload.title,
        payload.reference_no,
        payload.summary,
        payload.findings,
        payload.recommendation
    )
    log_event("DOC_GENERATION", f"Generated docx: {payload.reference_no}", "SUCCESS")
    return {"status": "created", "download_url": f"/api/files/download/{os.path.basename(path)}"}

@app.post("/api/deliverables/generate-xlsx")
def create_xlsx(payload: SpreadsheetRequest):
    path = generate_calculation_sheet_xlsx(
        payload.sheet_title,
        payload.headers,
        payload.rows
    )
    log_event("DOC_GENERATION", f"Generated xlsx: {payload.sheet_title}", "SUCCESS")
    return {"status": "created", "download_url": f"/api/files/download/{os.path.basename(path)}"}

@app.get("/api/files/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)

# --- Audit Logs Endpoint ---
@app.get("/api/audit/logs")
def fetch_audit_logs():
    return get_recent_audit_logs()

# --- Agent Chat Bridge ---
@app.post("/api/agent/query")
def query_agent(payload: AgentChatRequest):
    log_event("CHAT_AGENT", f"Task: {payload.task_type} | Prompt: {payload.prompt[:30]}...", "SUCCESS")
    # This endpoint is where M2 (Agent Engineer) will plug in their multi-step reasoning pipeline
    return {
        "task_type": payload.task_type,
        "response": f"Acknowledged task '{payload.task_type}'. Orchestrating agent workflow locally.",
        "air_gapped": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)