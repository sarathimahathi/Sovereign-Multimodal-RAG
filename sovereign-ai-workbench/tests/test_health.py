"""
Automated tests for health and diagnostic endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint_success(async_client: AsyncClient):
    """
    Verify GET /api/health returns 200 OK and conforms to the HealthResponse schema.
    """
    response = await async_client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "Sovereign AI Workbench"
    assert "version" in data
    assert "environment" in data
    assert "uptime_seconds" in data
    assert data["uptime_seconds"] >= 0

    # Verify system metrics
    assert "system" in data
    system_metrics = data["system"]
    assert "cpu_usage_percent" in system_metrics
    assert "memory_usage_mb" in system_metrics
    assert "memory_usage_percent" in system_metrics

    # Verify subsystem placeholders for future phases
    assert "services" in data
    services = data["services"]
    assert services["api"] == "healthy"
    assert "database" in services
    assert "vector_store" in services
    assert "llm_engine" in services

    # Verify timing middleware header
    assert "x-process-time-ms" in response.headers


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """
    Verify GET / returns application information and endpoint references.
    """
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["health"] == "/api/health"
    assert data["documentation"] == "/docs"
