"""
Health and diagnostic route handlers.
"""

from fastapi import APIRouter, status
from ...schemas.health import HealthResponse
from ...services.health_service import health_service

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get System Health and Telemetry",
    description=(
        "Returns application operational status, process uptime, system resource metrics "
        "(CPU/Memory), and connected subsystem availability (including Database connectivity)."
    ),
)
async def get_health() -> HealthResponse:
    """
    Health check endpoint returning real process and system telemetry with live DB check.
    """
    return await health_service.check_health()
