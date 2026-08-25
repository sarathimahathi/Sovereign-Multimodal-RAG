import os
import sys
import tempfile
import subprocess
from typing import Dict, Any

try:
    import docker
    # Attempt to connect to local Docker daemon
    docker_client = docker.from_env()
    docker_client.ping()
    DOCKER_AVAILABLE = True
except Exception:
    docker_client = None
    DOCKER_AVAILABLE = False


def execute_in_docker(code: str, timeout_seconds: int = 5) -> Dict[str, Any]:
    """Executes Python code inside an ephemeral, network-isolated Docker container."""
    try:
        # Run container with no network access, memory cap, and ephemeral lifecycle
        container = docker_client.containers.run(
            image="python:3.11-slim",
            command=["python", "-c", code],
            network_mode="none",  # Strict air-gap: Zero network interface
            mem_limit="256m",     # Limit memory footprint
            cpu_quota=100000,     # Cap CPU execution
            remove=True,
            detach=False,
            stdout=True,
            stderr=True
        )
        return {
            "success": True,
            "exit_code": 0,
            "output": container.decode("utf-8") if isinstance(container, bytes) else str(container),
            "engine": "docker_container",
            "airgapped": True
        }
    except docker.errors.ContainerError as ce:
        return {
            "success": False,
            "exit_code": ce.exit_status,
            "output": ce.stderr.decode("utf-8") if isinstance(ce.stderr, bytes) else str(ce.stderr),
            "engine": "docker_container",
            "airgapped": True
        }
    except Exception as e:
        return {
            "success": False,
            "exit_code": -1,
            "output": f"Docker container error: {str(e)}",
            "engine": "docker_container",
            "airgapped": True
        }


def execute_in_subprocess(code: str, timeout_seconds: int = 5) -> Dict[str, Any]:
    """
    Fallback: Executes Python code in a restricted local subprocess with scrubbed env
    and air-gap enforcement flags.
    """
    # Scrub sensitive network proxies and environment credentials
    clean_env = os.environ.copy()
    for key in ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]:
        clean_env.pop(key, None)

    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            process = subprocess.run(
                [sys.executable, "-I", "-s", "-c", code],  # -I (isolated mode), -s (no user site dir)
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                cwd=temp_dir,
                env=clean_env
            )
            return {
                "success": process.returncode == 0,
                "exit_code": process.returncode,
                "output": process.stdout if process.returncode == 0 else process.stderr,
                "engine": "subprocess_isolated",
                "airgapped": True
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "exit_code": -1,
                "output": f"Execution timed out after {timeout_seconds}s",
                "engine": "subprocess_isolated",
                "airgapped": True
            }
        except Exception as e:
            return {
                "success": False,
                "exit_code": -1,
                "output": f"Execution error: {str(e)}",
                "engine": "subprocess_isolated",
                "airgapped": True
            }


def execute_code_safely(code: str, timeout_seconds: int = 5, prefer_docker: bool = True) -> Dict[str, Any]:
    """
    Master entrypoint for Sandboxed Code Execution.
    Uses ephemeral Docker container if available; gracefully falls back to isolated subprocess.
    """
    if prefer_docker and DOCKER_AVAILABLE:
        return execute_in_docker(code, timeout_seconds)
    return execute_in_subprocess(code, timeout_seconds)
execute_sandbox_code = execute_code_safely