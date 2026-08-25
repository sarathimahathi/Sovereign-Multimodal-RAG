"""
Automated Integration & Unit Test Suite for Phase 6: Isolated Code Execution Sandbox.
Tests AST Security Scanner, Process Watchdogs, Timeout Enforcement, Artifact Capture, and API Endpoints.
"""

import pytest
from httpx import AsyncClient
from sandbox.security_filters import ast_security_scanner
from sandbox.limits import ResourceLimits
from sandbox.isolated_runner import subprocess_runner
from sandbox.engine import sandbox_engine


def test_ast_security_scanner_blocks_malicious_code():
    """
    Verify AST Security Scanner blocks dangerous imports, syscalls, eval/exec, and reflection breakouts.
    """
    # 1. Blocked Module: socket (Air-Gap Protection)
    res_sock = ast_security_scanner.scan_code("import socket\ns = socket.socket()")
    assert res_sock["is_safe"] is False
    assert res_sock["threat_level"] == "CRITICAL_EXECUTION_BLOCKED"
    assert any(v["target_name"] == "socket" for v in res_sock["violations"])

    # 2. Blocked Module: subprocess
    res_sub = ast_security_scanner.scan_code("from subprocess import Popen\nPopen(['ls'])")
    assert res_sub["is_safe"] is False
    assert any(v["target_name"] == "subprocess" for v in res_sub["violations"])

    # 3. Blocked Call: os.system
    res_os = ast_security_scanner.scan_code("import os\nos.system('rm -rf /')")
    assert res_os["is_safe"] is False
    assert any("os.system" in v["target_name"] for v in res_os["violations"])

    # 4. Blocked Dynamic Code Injection: eval()
    res_eval = ast_security_scanner.scan_code("result = eval('2 + 2')")
    assert res_eval["is_safe"] is False
    assert any(v["target_name"] == "eval" for v in res_eval["violations"])

    # 5. Blocked Reflection Breakout: __subclasses__
    res_refl = ast_security_scanner.scan_code("classes = ().__class__.__bases__[0].__subclasses__()")
    assert res_refl["is_safe"] is False
    assert any("__subclasses__" in v["target_name"] for v in res_refl["violations"])


def test_ast_security_scanner_allows_safe_engineering_code():
    """
    Verify AST scanner permits legitimate scientific and computational code.
    """
    safe_code = (
        "import math\n"
        "def calc_pipe_flow(diameter_m: float, velocity_m_s: float) -> float:\n"
        "    area = math.pi * ((diameter_m / 2.0) ** 2)\n"
        "    return area * velocity_m_s\n"
        "q = calc_pipe_flow(0.15, 2.5)\n"
        "print(f'Flow Rate: {round(q, 4)} m3/s')\n"
    )
    res = ast_security_scanner.scan_code(safe_code)
    assert res["is_safe"] is True
    assert res["threat_level"] == "SAFE"
    assert len(res["violations"]) == 0


@pytest.mark.asyncio
async def test_sandbox_safe_script_execution():
    """
    Verify isolated subprocess runner successfully executes safe computational code and captures stdout.
    """
    code = (
        "flow_gpm = 350.0\n"
        "cv = 65.0\n"
        "sg = 0.85\n"
        "delta_p = sg * ((flow_gpm / cv) ** 2)\n"
        "print(f'Calculated Delta P: {round(delta_p, 2)} psi')\n"
    )
    result = await subprocess_runner.execute_code(code, limits=ResourceLimits(timeout_seconds=5.0))
    assert result.status == "COMPLETED"
    assert result.exit_code == 0
    assert "Calculated Delta P: 24.64 psi" in result.stdout
    assert result.execution_time_ms > 0.0
    assert result.is_air_gapped is True


@pytest.mark.asyncio
async def test_sandbox_timeout_watchdog_enforcement():
    """
    Verify sandbox watchdog terminates infinite loops when exceeding timeout.
    """
    infinite_loop_code = (
        "import time\n"
        "while True:\n"
        "    time.sleep(0.1)\n"
    )
    limits = ResourceLimits(timeout_seconds=1.5)
    result = await subprocess_runner.execute_code(infinite_loop_code, limits=limits)
    assert result.status == "TIMEOUT"
    assert result.exit_code == -1
    assert "timed out" in result.stderr.lower()


@pytest.mark.asyncio
async def test_sandbox_file_artifact_generation():
    """
    Verify code generating file artifacts (e.g. CSV report) has artifacts captured.
    """
    artifact_code = (
        "with open('summary_table.csv', 'w') as f:\n"
        "    f.write('Tag,Pressure_psig,Status\\n')\n"
        "    f.write('PV-401A,150,NORMAL\\n')\n"
        "print('CSV Report Generated')\n"
    )
    result = await subprocess_runner.execute_code(artifact_code, limits=ResourceLimits(timeout_seconds=5.0))
    assert result.status == "COMPLETED"
    assert len(result.artifacts_generated) >= 1
    csv_art = next((a for a in result.artifacts_generated if a["filename"] == "summary_table.csv"), None)
    assert csv_art is not None
    assert "PV-401A" in csv_art["preview"]


@pytest.mark.asyncio
async def test_sandbox_api_endpoints(async_client: AsyncClient):
    """
    Verify /api/sandbox/validate, /api/sandbox/execute, and /api/sandbox/status API endpoints.
    """
    # 1. Validation Endpoint (Safe Code)
    safe_code = "x = [i**2 for i in range(10)]\nprint(sum(x))"
    val_res = await async_client.post("/api/sandbox/validate", json={"code": safe_code})
    assert val_res.status_code == 200
    assert val_res.json()["is_safe"] is True

    # 2. Validation Endpoint (Malicious Code Blocked)
    mal_code = "import socket\ns = socket.socket()"
    val_mal = await async_client.post("/api/sandbox/validate", json={"code": mal_code})
    assert val_mal.status_code == 200
    assert val_mal.json()["is_safe"] is False

    # 3. Execution Endpoint (Safe Code)
    exec_res = await async_client.post(
        "/api/sandbox/execute",
        json={"code": safe_code, "timeout_seconds": 5.0}
    )
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["status"] == "COMPLETED"
    assert "285" in exec_data["stdout"]

    # 4. Execution Endpoint (Blocked Attack)
    exec_block = await async_client.post(
        "/api/sandbox/execute",
        json={"code": "import os\nos.system('echo hacked')", "timeout_seconds": 5.0}
    )
    assert exec_block.status_code == 200
    block_data = exec_block.json()
    assert block_data["status"] == "BLOCKED_SECURITY"
    assert "Execution blocked by static AST guardrail" in block_data["stderr"]

    # 5. Status Endpoint
    status_res = await async_client.get("/api/sandbox/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "operational"
    assert "active_runner_mode" in status_data
    assert status_data["features"]["ast_static_code_inspection"] is True
