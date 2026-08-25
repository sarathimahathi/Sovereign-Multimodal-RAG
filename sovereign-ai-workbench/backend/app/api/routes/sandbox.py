"""
Isolated Code Execution Sandbox API Routes for Sovereign AI Workbench.
Endpoints for pre-execution AST static analysis, sandboxed script execution, and resource policy inspection.
"""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from sandbox.engine import sandbox_engine
from sandbox.limits import ResourceLimits
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.api.sandbox")

router = APIRouter(prefix="/sandbox", tags=["Code Execution Sandbox"])


# ============================================================================
# Request / Response Schemas
# ============================================================================

class ExecuteCodeRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Python source code to execute")
    timeout_seconds: Optional[float] = Field(30.0, ge=1.0, le=120.0, description="Execution timeout limit in seconds")
    max_memory_mb: Optional[int] = Field(512, ge=64, le=2048, description="Memory limit in megabytes")
    session_id: Optional[str] = Field(None, description="Optional associated workspace session")


class ValidateCodeRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Python code to statically inspect")


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("/execute", summary="Execute Python Code in Isolated Sandbox")
async def execute_code(req: ExecuteCodeRequest):
    """
    Executes Python script in isolated security jail.
    Performs pre-execution AST static analysis and process watchdog timeout enforcement.
    """
    limits = ResourceLimits(
        timeout_seconds=req.timeout_seconds or 30.0,
        max_memory_mb=req.max_memory_mb or 512,
    )

    result = await sandbox_engine.execute_code(
        source_code=req.code,
        limits=limits,
        session_id=req.session_id
    )

    return result


@router.post("/validate", summary="Statically Validate Python Code via AST")
async def validate_code(req: ValidateCodeRequest):
    """
    Performs pre-execution AST security screening without running the code.
    Identifies dangerous imports, blocked syscalls, and reflection breakout attempts.
    """
    return sandbox_engine.validate_code(req.code)


@router.get("/status", summary="Get Sandbox Health & Resource Limits")
async def get_sandbox_status():
    """
    Returns real-time status of Sandbox runtime, Docker container availability, and zero-egress policy.
    """
    return await sandbox_engine.get_status()
