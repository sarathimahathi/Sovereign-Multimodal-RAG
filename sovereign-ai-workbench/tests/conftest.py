"""
Pytest fixtures for Sovereign AI Workbench test suite.
"""

import sys
import os
from pathlib import Path
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Ensure backend and root modules are in Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(ROOT_DIR))

from app.main import app
from app.database.session import init_db


@pytest_asyncio.fixture(autouse=True)
async def ensure_db_initialized():
    """
    Ensure tables exist and are cleanly initialized for test isolation.
    """
    await init_db(drop_existing=True)
    yield


@pytest_asyncio.fixture
async def async_client():
    """
    Asynchronous HTTP test client for testing FastAPI endpoints.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
