"""
Resource Limits & Execution Watchdog Configuration for Sovereign Sandbox.
Defines quotas for execution timeout, maximum memory, and output size.
"""

from dataclasses import dataclass, asdict
from typing import Dict, Any


@dataclass
class ResourceLimits:
    """
    Resource boundary enforcement configuration for sandbox execution.
    """
    timeout_seconds: float = 30.0
    max_memory_mb: int = 512
    max_output_bytes: int = 100_000
    max_file_writes: int = 20
    max_cpu_cores: float = 1.0
    network_enabled: bool = False # Zero-Egress Air-Gap Guarantee

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


DEFAULT_LIMITS = ResourceLimits()
