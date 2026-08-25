"""
Session Service: Manages conversation sessions, multi-step agent reasoning contexts, and message history.
"""

from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from ..repositories.session_repo import SessionRepository
from ..database.models import SessionModel, MessageModel
from ..schemas.sessions import SessionCreate, MessageCreate
from ..core.logging import get_logger

logger = get_logger("sovereign_workbench.sessions")


class SessionService:
    async def create_session(self, db_session: AsyncSession, data: SessionCreate) -> SessionModel:
        """Create a new workbench workspace session."""
        repo = SessionRepository(db_session)
        session = await repo.create(
            title=data.title,
            classification=data.classification,
            model_preference=data.model_preference,
            metadata_info=data.metadata_info,
        )
        logger.info(f"Created workspace session: {session.id} ({session.title}) [{session.classification}]")
        return session

    async def list_sessions(self, db_session: AsyncSession, limit: int = 50) -> Tuple[int, List[SessionModel]]:
        """List active workspace sessions."""
        repo = SessionRepository(db_session)
        total = await repo.count()
        items = await repo.list_recent_sessions(limit=limit)
        return total, items

    async def get_session_detail(self, db_session: AsyncSession, session_id: str) -> Optional[SessionModel]:
        """Fetch session with eager loaded documents and messages."""
        repo = SessionRepository(db_session)
        return await repo.get_with_details(session_id)

    async def add_message_to_session(
        self, db_session: AsyncSession, session_id: str, data: MessageCreate
    ) -> MessageModel:
        """Record a conversation turn or agent reasoning step."""
        repo = SessionRepository(db_session)
        msg = await repo.add_message(
            session_id=session_id,
            role=data.role,
            content=data.content,
            model_used=data.model_used,
            tool_calls=data.tool_calls,
            latency_ms=data.latency_ms,
        )
        return msg

    async def delete_session(self, db_session: AsyncSession, session_id: str) -> bool:
        """Delete a workspace session."""
        repo = SessionRepository(db_session)
        return await repo.delete_by_id(session_id)


session_service = SessionService()
