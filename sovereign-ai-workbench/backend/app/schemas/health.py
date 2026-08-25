"""
Health and telemetry Pydantic schemas (DTOs).
"""

from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, Field


class SystemMetrics(BaseModel):
    """Host process and system resource utilization metrics."""
    cpu_usage_percent: float = Field(..., description="Current process/system CPU usage %")
    memory_usage_mb: float = Field(..., description="Resident process memory consumption in MB")
    memory_usage_percent: float = Field(..., description="System memory usage %")


class HealthResponse(BaseModel):
    """System health check response schema."""
    status: str = Field(default="healthy", description="Overall health status: healthy, degraded, or down")
    app_name: str = Field(..., description="Application name")
    version: str = Field(..., description="Semantic version of the application")
    environment: str = Field(..., description="Current runtime environment (development, staging, production)")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the health check")
    uptime_seconds: float = Field(..., description="Backend process uptime in seconds")
    system: SystemMetrics = Field(..., description="System and process telemetry diagnostics")
    services: Dict[str, str] = Field(
        default_factory=lambda: {
            "api": "healthy",
            "database": "unconfigured_phase1",
            "vector_store": "unconfigured_phase1",
            "llm_engine": "unconfigured_phase1"
        },
        description="Individual status of connected subsystems"
    )
