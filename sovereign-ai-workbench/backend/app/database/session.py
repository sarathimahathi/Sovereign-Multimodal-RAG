"""
Async Database Engine & Session Management for Sovereign AI Workbench.
Dual-Mode Engine: High-performance PostgreSQL (Production) with automatic zero-config Async SQLite fallback (Development/Air-Gapped).
"""

import os
import time
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import text
from ..core.config import settings
from ..core.logging import get_logger

logger = get_logger("sovereign_workbench.database")

# Ensure data directory exists for SQLite fallback
DATA_DIR = os.path.join(os.getcwd(), "data")
os.makedirs(DATA_DIR, exist_ok=True)
SQLITE_FALLBACK_URL = f"sqlite+aiosqlite:///{os.path.join(DATA_DIR, 'sovereign.db')}"

_engine: Optional[AsyncEngine] = None
_sessionmaker: Optional[async_sessionmaker[AsyncSession]] = None
_active_db_url: str = settings.DATABASE_URL


def get_engine() -> AsyncEngine:
    """
    Get or create the global async database engine.
    """
    global _engine, _sessionmaker, _active_db_url
    if _engine is None:
        db_url = settings.DATABASE_URL
        # If postgres is specified, attempt it; otherwise use SQLite
        if "sqlite" in db_url:
            _engine = create_async_engine(
                db_url,
                echo=False,
                connect_args={"check_same_thread": False},
            )
            _active_db_url = db_url
        else:
            _engine = create_async_engine(
                db_url,
                echo=False,
                pool_size=settings.DATABASE_POOL_SIZE,
                max_overflow=settings.DATABASE_MAX_OVERFLOW,
            )
            _active_db_url = db_url

        _sessionmaker = async_sessionmaker(
            bind=_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    """
    Get the configured sessionmaker.
    """
    if _sessionmaker is None:
        get_engine()
    assert _sessionmaker is not None
    return _sessionmaker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an async database session per request.
    """
    session_factory = get_sessionmaker()
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db(drop_existing: bool = False) -> None:
    """
    Initialize database schema tables.
    """
    from .models import Base
    global _engine, _sessionmaker, _active_db_url
    engine = get_engine()
    logger.info("Verifying and creating database tables...")
    try:
        async with engine.begin() as conn:
            if drop_existing:
                await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Primary database connection failed: {e}. Switching to SQLite fallback...")
        _engine = create_async_engine(
            SQLITE_FALLBACK_URL,
            echo=False,
            connect_args={"check_same_thread": False},
        )
        _active_db_url = SQLITE_FALLBACK_URL
        _sessionmaker = async_sessionmaker(
            bind=_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        async with _engine.begin() as conn:
            if drop_existing:
                await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        logger.info("SQLite fallback tables initialized successfully.")


async def check_database_health() -> dict:
    """
    Check database connection and return real latency telemetry.
    """
    start_time = time.perf_counter()
    try:
        engine = get_engine()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        dialect = "sqlite" if "sqlite" in _active_db_url else "postgresql"
        return {
            "status": "healthy",
            "dialect": dialect,
            "latency_ms": latency_ms,
            "connected": True
        }
    except Exception as e:
        return {
            "status": "degraded",
            "dialect": "offline",
            "latency_ms": 0.0,
            "connected": False,
            "error": str(e)
        }
