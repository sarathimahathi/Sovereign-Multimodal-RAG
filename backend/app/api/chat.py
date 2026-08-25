import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from app.db.database import log_event
from app.services.agent_orchestrator import SovereignWorkbenchOrchestrator

router = APIRouter(prefix="/api/chat", tags=["Agent Chat & Streaming"])

class ChatQuery(BaseModel):
    prompt: str
    task_type: str = "general"

@router.post("/query")
async def handle_chat_query(payload: ChatQuery):
    """Synchronous execution endpoint for testing and REST API integration."""
    result = await SovereignWorkbenchOrchestrator.process_industrial_task(
        prompt=payload.prompt,
        task_type=payload.task_type
    )
    log_event("REST_TASK_EXEC", f"Task: {payload.task_type} | Prompt: {payload.prompt[:30]}", "SUCCESS")
    return result

@router.websocket("/ws")
async def websocket_agent_stream(websocket: WebSocket):
    """
    Live streaming WebSocket connection for UI dashboard.
    Streams thought steps, sandbox tool executions, and deliverable download links in real time.
    """
    await websocket.accept()
    log_event("WS_CONNECTED", "Frontend connected to live stream", "SUCCESS")
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            user_prompt = data.get("prompt", "")
            task_type = data.get("task_type", "general")

            if not user_prompt.strip():
                continue

            # Process task, streaming steps and deliverables via websocket
            result = await SovereignWorkbenchOrchestrator.process_industrial_task(
                prompt=user_prompt,
                task_type=task_type,
                websocket=websocket
            )
            log_event("WS_TASK_COMPLETED", f"Completed: {user_prompt[:30]}", "SUCCESS")

    except WebSocketDisconnect:
        log_event("WS_DISCONNECTED", "Stream disconnected", "SUCCESS")
    except Exception as e:
        try:
            await websocket.send_json({
                "sender": "Agent",
                "message": f"Execution error: {str(e)}",
                "type": "system"
            })
        except Exception:
            pass