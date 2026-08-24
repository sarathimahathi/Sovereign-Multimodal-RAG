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
    """Synchronous execution endpoint for testing and API integration."""
    result = SovereignWorkbenchOrchestrator.process_industrial_task(payload.prompt, payload.task_type)
    log_event("REST_TASK_EXEC", f"Task: {payload.task_type} | Prompt: {payload.prompt[:30]}", "SUCCESS")
    return result

@router.websocket("/ws")
async def websocket_agent_stream(websocket: WebSocket):
    """
    Live streaming WebSocket connection for React frontend.
    Streams thought steps, tool executions, and deliverable links.
    """
    await websocket.accept()
    log_event("WS_CONNECTED", "Frontend connected to live stream", "SUCCESS")
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            user_prompt = data.get("prompt", "")
            task_type = data.get("task_type", "general")

            # Stream initial thought
            await websocket.send_json({
                "type": "thought",
                "message": f"Analyzing task: '{user_prompt}' under strict on-premise governance..."
            })
            await asyncio.sleep(0.4)

            # Process task
            result = SovereignWorkbenchOrchestrator.process_industrial_task(user_prompt, task_type)

            # Stream intermediate steps / tool executions
            for step in result.get("steps", []):
                await websocket.send_json({
                    "type": "tool_step",
                    "step": step
                })
                await asyncio.sleep(0.5)

            # Stream final message and any deliverable URLs
            await websocket.send_json({
                "type": "message",
                "content": result.get("final_reply"),
                "deliverable_url": result.get("deliverable_url")
            })

            await websocket.send_json({"type": "done"})
            log_event("WS_TASK_COMPLETED", f"Completed: {user_prompt[:30]}", "SUCCESS")

    except WebSocketDisconnect:
        log_event("WS_DISCONNECTED", "Stream disconnected", "SUCCESS")
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})