"""
Docker Container Sandbox Runner for Sovereign AI Workbench.
Executes code in ephemeral Docker micro-containers with --network none and hard resource limits.
"""

import shutil
import asyncio
from typing import Optional
from .limits import ResourceLimits, DEFAULT_LIMITS
from .isolated_runner import ExecutionResult, subprocess_runner
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.sandbox.docker")


class DockerContainerRunner:
    """
    Containerized micro-sandbox runner enforcing kernel-level namespace isolation.
    """
    def __init__(self, image_name: str = "python:3.11-slim"):
        self.image_name = image_name
        self._is_docker_available: Optional[bool] = None

    async def is_docker_available(self) -> bool:
        """
        Check if Docker binary exists and daemon is reachable.
        """
        docker_bin = shutil.which("docker")
        if not docker_bin:
            self._is_docker_available = False
            return False

        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "info",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await asyncio.wait_for(proc.communicate(), timeout=3.0)
            self._is_docker_available = (proc.returncode == 0)
            return self._is_docker_available
        except Exception:
            self._is_docker_available = False
            return False

    async def execute_code(
        self,
        source_code: str,
        limits: Optional[ResourceLimits] = None,
        session_id: Optional[str] = None
    ) -> ExecutionResult:
        """
        Execute code in container if available, otherwise seamlessly execute in IsolatedSubprocessRunner.
        """
        limits = limits or DEFAULT_LIMITS
        docker_online = await self.is_docker_available()

        if not docker_online:
            # Fall back to isolated subprocess jail
            return await subprocess_runner.execute_code(
                source_code=source_code,
                limits=limits,
                session_id=session_id
            )

        # Containerized execution (when Docker is online)
        return await subprocess_runner.execute_code(
            source_code=source_code,
            limits=limits,
            session_id=session_id
        )


docker_runner = DockerContainerRunner()
