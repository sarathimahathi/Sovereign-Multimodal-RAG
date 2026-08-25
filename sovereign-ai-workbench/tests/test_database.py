"""
Automated tests for Database Engine & Session Management.
"""

import pytest
from app.database.session import get_sessionmaker, check_database_health, init_db
from app.database.models import SessionModel, DocumentModel
from sqlalchemy import select


@pytest.mark.asyncio
async def test_database_initialization_and_health():
    """Verify database schema initializes and health check reports connected."""
    await init_db()
    health = await check_database_health()
    assert health["connected"] is True
    assert health["status"] == "healthy"
    assert "latency_ms" in health
    assert health["latency_ms"] >= 0


@pytest.mark.asyncio
async def test_session_model_persistence():
    """Verify creating and retrieving a session model record."""
    session_factory = get_sessionmaker()
    async with session_factory() as session:
        new_session = SessionModel(
            title="Refinery Unit 4 Inspection",
            classification="CONFIDENTIAL - REFINERY OPERATIONS",
            model_preference="qwen2.5-coder",
        )
        session.add(new_session)
        await session.commit()
        session_id = new_session.id

    async with session_factory() as session:
        result = await session.execute(select(SessionModel).where(SessionModel.id == session_id))
        fetched = result.scalars().first()
        assert fetched is not None
        assert fetched.title == "Refinery Unit 4 Inspection"
        assert fetched.classification == "CONFIDENTIAL - REFINERY OPERATIONS"
