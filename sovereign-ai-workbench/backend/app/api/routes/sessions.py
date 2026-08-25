"""
API Route Handlers for Workbench Sessions & Workspaces.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...database.session import get_db
from ...services.session_service import session_service
from ...schemas.sessions import (
    SessionCreate,
    SessionResponse,
    SessionDetailResponse,
    SessionListResponse,
    MessageCreate,
    MessageResponse,
)

router = APIRouter(prefix="/sessions", tags=["Workspace Sessions"])


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Workspace Session",
    description="Initiate an isolated workspace session tagged with confidentiality classification."
)
async def create_session(
    data: SessionCreate,
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    session = await session_service.create_session(db, data)
    return SessionResponse.model_validate(session)


@router.get(
    "",
    response_model=SessionListResponse,
    summary="List Workspace Sessions",
    description="Get list of recent confidential workspace sessions."
)
async def list_sessions(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
) -> SessionListResponse:
    total, items = await session_service.list_sessions(db, limit=limit)
    return SessionListResponse(
        total=total,
        items=[SessionResponse.model_validate(s) for s in items]
    )


@router.get(
    "/{session_id}",
    response_model=SessionDetailResponse,
    summary="Get Workspace Session Details",
    description="Fetch session metadata, attached confidential documents, and multi-step conversation/agent history."
)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionDetailResponse:
    session = await session_service.get_session_detail(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )
    return SessionDetailResponse.model_validate(session)


@router.post(
    "/{session_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Append Message or Agent Reasoning Step",
    description="Records a user prompt, agent thought, tool execution output, or system response."
)
async def add_message(
    session_id: str,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    session = await session_service.get_session_detail(db, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )
    msg = await session_service.add_message_to_session(db, session_id, data)
    return MessageResponse.model_validate(msg)


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Session",
    description="Delete a workspace session and cascade delete its conversation messages."
)
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    success = await session_service.delete_session(db, session_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found.",
        )
    return {"status": "deleted", "id": session_id}
