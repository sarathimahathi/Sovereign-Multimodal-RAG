"""
Health Service: Business logic for calculating system uptime, process health, and subsystem status.
"""

import time
import os
from datetime import datetime, timezone
from typing import Dict
from ..core.config import settings
from ..schemas.health import HealthResponse, SystemMetrics
from ..database.session import check_database_health
from models.ollama_client import ollama_client

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False


class HealthService:
    """
    Encapsulates diagnostic checks and telemetry collection for the application.
    """
    def __init__(self):
        self._start_time = time.time()
        self._process = psutil.Process(os.getpid()) if PSUTIL_AVAILABLE else None

    @property
    def uptime_seconds(self) -> float:
        """Calculate elapsed process uptime."""
        return round(time.time() - self._start_time, 2)

    def get_system_metrics(self) -> SystemMetrics:
        """
        Collect real process and host system resource utilization metrics.
        """
        if PSUTIL_AVAILABLE and self._process:
            try:
                # Process-level CPU and memory
                cpu_pct = round(self._process.cpu_percent(interval=None), 2)
                mem_info = self._process.memory_info()
                mem_mb = round(mem_info.rss / (1024 * 1024), 2)
                sys_mem = psutil.virtual_memory()
                sys_mem_pct = round(sys_mem.percent, 2)
                return SystemMetrics(
                    cpu_usage_percent=cpu_pct,
                    memory_usage_mb=mem_mb,
                    memory_usage_percent=sys_mem_pct
                )
            except Exception:
                pass

        # Fallback metrics if psutil is not available
        return SystemMetrics(
            cpu_usage_percent=0.0,
            memory_usage_mb=0.0,
            memory_usage_percent=0.0
        )

    async def check_health(self) -> HealthResponse:
        """
        Compile full health status response with live database and LLM checks.
        """
        metrics = self.get_system_metrics()
        
        # Real Database connection check
        db_health = await check_database_health()
        db_status = f"healthy ({db_health['dialect']})" if db_health.get("connected") else "offline"

        # Check local LLM engine
        is_ollama_up = await ollama_client.is_available()
        llm_status = "healthy (ollama: online)" if is_ollama_up else "healthy (sovereign_runtime)"

        services: Dict[str, str] = {
            "api": "healthy",
            "database": db_status,
            "vector_store": "unconfigured_phase1",
            "llm_engine": llm_status,
        }

        overall_status = "healthy" if db_health.get("connected") else "degraded"

        return HealthResponse(
            status=overall_status,
            app_name=settings.APP_NAME,
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            timestamp=datetime.now(timezone.utc),
            uptime_seconds=self.uptime_seconds,
            system=metrics,
            services=services
        )


# Singleton instance for application lifecycle
health_service = HealthService()
