"""
Main FastAPI Application Entrypoint for Sovereign AI Workbench.
"""

import sys
from pathlib import Path

# Ensure root directory and backend directory are in sys.path
_ROOT_DIR = Path(__file__).resolve().parent.parent.parent
_BACKEND_DIR = Path(__file__).resolve().parent.parent
for _p in [str(_ROOT_DIR), str(_BACKEND_DIR)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.logging import setup_logging, get_logger
from .middleware.timing import ProcessTimeMiddleware
from .api.routes import api_router
from .database.session import init_db

# Initialize structured logging
setup_logging(settings.LOG_LEVEL)
logger = get_logger("sovereign_workbench.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes database schema and handles graceful shutdown events.
    """
    logger.info(
        f"Starting {settings.APP_NAME} v{settings.VERSION} "
        f"[Environment: {settings.ENVIRONMENT}] [Log Level: {settings.LOG_LEVEL}]"
    )
    # Initialize database tables
    try:
        await init_db()
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")

    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


def create_application() -> FastAPI:
    """
    Application factory initializing FastAPI with middleware, routes, and OpenAPI metadata.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description=(
            "Enterprise Sovereign Multimodal AI Workbench API Gateway. "
            "Enables air-gapped local LLMs, hybrid RAG, multi-agent reasoning, "
            "and secure sandboxed code execution for confidential industrial workflows."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # 1. Custom Execution Timing Middleware
    app.add_middleware(ProcessTimeMiddleware)

    # 2. CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Process-Time-Ms"],
    )

    # 3. Mount API Routes
    app.include_router(api_router)

    # 4. Root Welcome Route
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.VERSION,
            "status": "operational",
            "documentation": "/docs",
            "health": "/api/health",
            "documents": "/api/documents",
            "sessions": "/api/sessions"
        }

    return app


app = create_application()
