import sys
import subprocess
from typing import Dict, Any

def execute_code_safely(code: str, timeout_seconds: int = 5) -> Dict[str, Any]:
    try:
        process = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=timeout_seconds
        )
        return {
            "success": process.returncode == 0,
            "exit_code": process.returncode,
            "output": process.stdout if process.returncode == 0 else process.stderr
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "exit_code": -1, "output": f"Execution timed out after {timeout_seconds}s"}
    except Exception as e:
        return {"success": False, "exit_code": -1, "output": f"Execution error: {str(e)}"}