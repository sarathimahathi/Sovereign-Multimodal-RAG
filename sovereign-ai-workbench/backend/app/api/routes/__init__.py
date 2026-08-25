"""
API Router Aggregation.
Combines all versioned and domain route handlers under the /api prefix.
"""

from fastapi import APIRouter
from .health import router as health_router
from .documents import router as documents_router
from .sessions import router as sessions_router
from .security import router as security_router
from .models import router as models_router
from .rag import router as rag_router
from .sandbox import router as sandbox_router
from .multimodal import router as multimodal_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(documents_router)
api_router.include_router(sessions_router)
api_router.include_router(security_router)
api_router.include_router(models_router)
api_router.include_router(rag_router)
api_router.include_router(sandbox_router)
api_router.include_router(multimodal_router)

__all__ = ["api_router"]
