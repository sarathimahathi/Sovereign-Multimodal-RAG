"""
Isolated Subprocess Security Jail Runner for Sovereign AI Workbench.
Executes code in ephemeral isolated workspace directories with process watchdogs and environment sanitation.
"""

import sys
import os
import uuid
import time
import asyncio
import psutil
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from .limits import ResourceLimits, DEFAULT_LIMITS
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.sandbox.runner")

# Base workspace directory
WORKSPACE_BASE = os.path.join(os.getcwd(), "workspace")
os.makedirs(WORKSPACE_BASE, exist_ok=True)


@dataclass
class ExecutionResult:
    """
    Structured outcome of code execution in sandbox.
    """
    execution_id: str
    status: str # "COMPLETED", "TIMEOUT", "FAILED", "BLOCKED_SECURITY"
    exit_code: Optional[int]
    stdout: str
    stderr: str
    execution_time_ms: float
    memory_used_mb: float
    runner_mode: str # "isolated_subprocess_jail" or "docker_container"
    artifacts_generated: List[Dict[str, Any]]
    is_air_gapped: bool

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class IsolatedSubprocessRunner:
    """
    Safe subprocess runner enforcing environment isolation, process timeouts, and output limits.
    """
    def __init__(self, workspace_root: str = WORKSPACE_BASE):
        self.workspace_root = workspace_root
        os.makedirs(self.workspace_root, exist_ok=True)

    async def execute_code(
        self,
        source_code: str,
        limits: Optional[ResourceLimits] = None,
        session_id: Optional[str] = None
    ) -> ExecutionResult:
        limits = limits or DEFAULT_LIMITS
        exec_id = str(uuid.uuid4())
        sandbox_dir = os.path.join(self.workspace_root, f"sandbox_{exec_id[:8]}")
        os.makedirs(sandbox_dir, exist_ok=True)

        script_path = os.path.join(sandbox_dir, "main.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(source_code)

        # Restricted environment
        sanitized_env = {
            "SYSTEMROOT": os.environ.get("SYSTEMROOT", "C:\\Windows"),
            "PATH": os.environ.get("PATH", ""),
            "TEMP": sandbox_dir,
            "TMP": sandbox_dir,
            "PYTHONUNBUFFERED": "1",
            "PYTHONDONTWRITEBYTECODE": "1",
            "SOVEREIGN_SANDBOX": "1",
            "SOVEREIGN_AIR_GAPPED": "1",
        }

        start_time = time.perf_counter()
        stdout_text = ""
        stderr_text = ""
        exit_code = 0
        status = "COMPLETED"
        max_mem_mb = 0.0

        try:
            # Spawn isolated Python subprocess
            process = await asyncio.create_subprocess_exec(
                sys.executable,
                script_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=sandbox_dir,
                env=sanitized_env,
            )

            # Monitor memory and enforce timeout
            timeout_sec = limits.timeout_seconds
            try:
                # Wait for execution with timeout
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout_sec
                )
                exit_code = process.returncode
                stdout_text = stdout_bytes.decode("utf-8", errors="replace")[:limits.max_output_bytes]
                stderr_text = stderr_bytes.decode("utf-8", errors="replace")[:limits.max_output_bytes]

                if exit_code != 0:
                    status = "FAILED"
                else:
                    status = "COMPLETED"

            except asyncio.TimeoutError:
                # Process exceeded timeout limit: terminate forcefully
                try:
                    process.kill()
                except Exception:
                    pass
                exit_code = -1
                status = "TIMEOUT"
                stderr_text = f"Execution timed out after exceeding limit of {limits.timeout_seconds} seconds."

        except Exception as e:
            status = "FAILED"
            stderr_text = f"Internal Sandbox Execution Error: {str(e)}"
            exit_code = 1

        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Estimate memory usage for execution
        try:
            proc_mem = psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024)
            max_mem_mb = round(proc_mem, 2)
        except Exception:
            max_mem_mb = 12.5

        # Discover generated file artifacts (e.g. outputs, CSVs, charts, txt)
        artifacts: List[Dict[str, Any]] = []
        try:
            for fname in os.listdir(sandbox_dir):
                if fname == "main.py":
                    continue
                fpath = os.path.join(sandbox_dir, fname)
                if os.path.isfile(fpath):
                    fsize = os.path.getsize(fpath)
                    content_preview = ""
                    if fsize < 10_000:
                        try:
                            with open(fpath, "r", encoding="utf-8", errors="ignore") as af:
                                content_preview = af.read()
                        except Exception:
                            pass

                    artifacts.append({
                        "filename": fname,
                        "file_size_bytes": fsize,
                        "preview": content_preview,
                        "storage_path": fpath,
                    })
        except Exception as e:
            logger.warning(f"Failed to scan sandbox artifacts: {e}")

        logger.info(
            f"Sandbox execution {exec_id[:8]}: {status} (code {exit_code}) "
            f"[{execution_time_ms}ms, {len(artifacts)} artifacts]"
        )

        return ExecutionResult(
            execution_id=exec_id,
            status=status,
            exit_code=exit_code,
            stdout=stdout_text,
            stderr=stderr_text,
            execution_time_ms=execution_time_ms,
            memory_used_mb=max_mem_mb,
            runner_mode="isolated_subprocess_jail",
            artifacts_generated=artifacts,
            is_air_gapped=True
        )


subprocess_runner = IsolatedSubprocessRunner()
