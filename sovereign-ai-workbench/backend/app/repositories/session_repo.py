"""
Session & Conversation Repository.
Manages isolated workspaces and multi-step agent reasoning messages.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from .base import BaseRepository
from ..database.models import SessionModel, MessageModel, DeliverableModel


class SessionRepository(BaseRepository[SessionModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(SessionModel, session)

    async def get_with_details(self, session_id: str) -> Optional[SessionModel]:
        """Fetch session with eager loaded documents, messages, and deliverables."""
        result = await self.session.execute(
            select(SessionModel)
            .options(
                selectinload(SessionModel.documents),
                selectinload(SessionModel.messages),
                selectinload(SessionModel.deliverables),
            )
            .where(SessionModel.id == session_id)
        )
        return result.scalars().first()

    async def list_recent_sessions(self, limit: int = 50) -> List[SessionModel]:
        """Get latest sessions ordered by updated timestamp."""
        result = await self.session.execute(
            select(SessionModel)
            .order_by(SessionModel.updated_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        model_used: Optional[str] = None,
        tool_calls: Optional[List[Dict[str, Any]]] = None,
        latency_ms: Optional[float] = None,
    ) -> MessageModel:
        """Append a message or agent reasoning step to a session."""
        msg = MessageModel(
            session_id=session_id,
            role=role,
            content=content,
            model_used=model_used,
            tool_calls=tool_calls,
            latency_ms=latency_ms,
        )
        self.session.add(msg)
        await self.session.flush()
        return msg

    async def get_messages(self, session_id: str) -> List[MessageModel]:
        """Get all messages for a session ordered chronologically."""
        result = await self.session.execute(
            select(MessageModel)
            .where(MessageModel.session_id == session_id)
            .order_by(MessageModel.created_at.asc())
        )
        return list(result.scalars().all())
