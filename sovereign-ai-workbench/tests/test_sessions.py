"""
Automated tests for Sessions, Workspaces, and Reasoning Messages.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_session_lifecycle_and_messages(async_client: AsyncClient):
    """
    Test creating a session, appending agent reasoning steps, and fetching details.
    """
    # 1. Create Workspace Session
    payload = {
        "title": "Pipeline Corrosion Analysis - Unit 12",
        "classification": "RESTRICTED - DEFENSE OPERATIONS",
        "model_preference": "deepseek-r1:14b",
    }
    create_res = await async_client.post("/api/sessions", json=payload)
    assert create_res.status_code == 201
    session = create_res.json()
    assert session["title"] == "Pipeline Corrosion Analysis - Unit 12"
    assert session["classification"] == "RESTRICTED - DEFENSE OPERATIONS"
    session_id = session["id"]

    # 2. Append User Message
    msg1_payload = {
        "role": "user",
        "content": "Analyze wall thickness measurements from yesterday's ultrasonic test.",
    }
    msg1_res = await async_client.post(f"/api/sessions/{session_id}/messages", json=msg1_payload)
    assert msg1_res.status_code == 201
    msg1 = msg1_res.json()
    assert msg1["role"] == "user"
    assert msg1["content"] == msg1_payload["content"]

    # 3. Append Agent Thought & Tool Step
    msg2_payload = {
        "role": "agent",
        "content": "Calculating minimum allowable wall thickness according to ASME B31.3 Standard.",
        "model_used": "deepseek-r1:14b",
        "tool_calls": [
            {"tool": "sandbox_python_calc", "input": {"formula": "P*D/(2*(S*E + P*Y))"}}
        ],
        "latency_ms": 145.2,
    }
    msg2_res = await async_client.post(f"/api/sessions/{session_id}/messages", json=msg2_payload)
    assert msg2_res.status_code == 201
    msg2 = msg2_res.json()
    assert msg2["role"] == "agent"
    assert msg2["tool_calls"] is not None

    # 4. Fetch Session Details
    detail_res = await async_client.get(f"/api/sessions/{session_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == session_id
    assert len(detail["messages"]) == 2

    # 5. List Sessions
    list_res = await async_client.get("/api/sessions")
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 6. Delete Session
    del_res = await async_client.delete(f"/api/sessions/{session_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"
