"""
Unified Sandbox Execution Engine for Sovereign AI Workbench.
Coordinates pre-execution AST static analysis, dual-mode runner execution, resource limits, and audit logging.
"""

from typing import Dict, Any, Optional
from .security_filters import ast_security_scanner, ASTSecurityScanner
from .limits import ResourceLimits, DEFAULT_LIMITS
from .isolated_runner import subprocess_runner
from .docker_runner import docker_runner
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.sandbox.engine")


class SandboxExecutionEngine:
    """
    High-assurance isolated execution engine.
    """
    def __init__(self):
        self.scanner = ast_security_scanner
        self.runner = docker_runner
        self.subprocess_runner = subprocess_runner

    def validate_code(self, source_code: str) -> Dict[str, Any]:
        """
        Perform static AST security analysis without executing.
        """
        return self.scanner.scan_code(source_code)

    async def execute_code(
        self,
        source_code: str,
        limits: Optional[ResourceLimits] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes Python code in isolated sandbox after AST safety screening.
        """
        limits = limits or DEFAULT_LIMITS

        # 1. Pre-execution AST static analysis
        security_scan = self.scanner.scan_code(source_code)

        if not security_scan["is_safe"]:
            # If critical security violation detected, reject execution immediately
            logger.warning(
                f"Blocked dangerous sandbox execution: {security_scan['threat_level']} "
                f"({len(security_scan['violations'])} violations)"
            )
            return {
                "status": "BLOCKED_SECURITY",
                "exit_code": -1,
                "stdout": "",
                "stderr": (
                    f"SOVEREIGN SECURITY JAIL: Execution blocked by static AST guardrail.\n"
                    f"Threat Level: {security_scan['threat_level']}\n"
                    f"Violations:\n" +
                    "\n".join([f" • Line {v['line_number']}: {v['description']}" for v in security_scan['violations']])
                ),
                "execution_time_ms": 0.0,
                "memory_used_mb": 0.0,
                "runner_mode": "static_ast_guardrail_jail",
                "security_scan": security_scan,
                "artifacts_generated": [],
                "is_air_gapped": True
            }

        # 2. Execute in isolated environment
        exec_result = await self.runner.execute_code(
            source_code=source_code,
            limits=limits,
            session_id=session_id
        )

        res_dict = exec_result.to_dict()
        res_dict["security_scan"] = security_scan
        return res_dict

    async def get_status(self) -> Dict[str, Any]:
        """
        Get real-time sandbox status, runner mode, and security policy.
        """
        docker_available = await docker_runner.is_docker_available()
        return {
            "status": "operational",
            "active_runner_mode": "docker_micro_container" if docker_available else "isolated_subprocess_jail",
            "docker_available": docker_available,
            "air_gap_network_policy": "ZERO_EGRESS_BLOCKED (Network: None)",
            "default_timeout_seconds": DEFAULT_LIMITS.timeout_seconds,
            "default_memory_limit_mb": DEFAULT_LIMITS.max_memory_mb,
            "features": {
                "ast_static_code_inspection": True,
                "dangerous_syscall_interception": True,
                "hard_timeout_watchdogs": True,
                "ephemeral_workspace_isolation": True,
                "artifact_capture": True,
            }
        }


sandbox_engine = SandboxExecutionEngine()
