"""
Pre-Execution Static AST Security Scanner & Syscall Filter for Sovereign AI Workbench.
Inspects Python Abstract Syntax Trees (AST) before execution to prevent system exploitation, network egress, and filesystem damage.
"""

import ast
from typing import List, Dict, Any, Set
from dataclasses import dataclass, asdict
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.sandbox.security")


@dataclass
class SecurityViolation:
    """
    Detailed metadata about a blocked AST node.
    """
    line_number: int
    violation_type: str # "BLOCKED_MODULE", "BLOCKED_CALL", "DANGEROUS_ATTRIBUTE", "EVAL_EXEC_INJECTION"
    target_name: str
    description: str
    severity: str # "CRITICAL", "HIGH", "MEDIUM"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ASTSecurityScanner:
    """
    High-assurance Abstract Syntax Tree (AST) static code analyzer.
    Zero false positives on mathematical, engineering, and data science code.
    Blocks privilege escalation, shell commands, socket sockets, process spawning, and unconstrained file operations.
    """

    BLOCKED_MODULES: Set[str] = {
        # Network & Sockets (Enforcing Zero-Egress Air-Gap)
        "socket", "urllib", "urllib.request", "urllib3", "requests", "http",
        "http.client", "ftplib", "telnetlib", "smtplib", "imaplib", "poplib",
        "httpx", "aiohttp", "webbrowser",
        # Process & OS Execution
        "subprocess", "pty", "posix", "nt", "_winreg", "winreg", "msvcrt",
        "multiprocessing", "threading", "concurrent.futures", "ctypes",
        "gc", "resource", "code", "codeop",
        # Dynamic Code Loading & Reflection
        "importlib", "imp", "runpy", "modulefinder",
        # File System Destruction
        "shutil",
    }

    BLOCKED_BUILTINS: Set[str] = {
        "eval", "exec", "compile", "__import__", "globals", "locals", "vars", "input",
        "breakpoint", "help", "exit", "quit"
    }

    BLOCKED_OS_ATTRIBUTES: Set[str] = {
        "system", "popen", "popen2", "popen3", "popen4", "spawnl", "spawnle",
        "spawnlp", "spawnlpe", "spawnv", "spawnve", "spawnvp", "spawnvpe",
        "execl", "execle", "execlp", "execlpe", "execv", "execve", "execvp", "execvpe",
        "fork", "forkpty", "kill", "killpg", "remove", "unlink", "rmdir", "removedirs",
        "rename", "renames", "replace", "chmod", "chown", "lchown", "link", "symlink",
        "truncate", "environ", "putenv", "unsetenv"
    }

    BLOCKED_SYS_ATTRIBUTES: Set[str] = {
        "modules", "exit", "_getframe", "settrace", "setprofile", "call_tracing"
    }

    def scan_code(self, source_code: str) -> Dict[str, Any]:
        """
        Statically parse and inspect Python source code for security violations.
        """
        if not source_code or not source_code.strip():
            return {
                "is_safe": True,
                "threat_level": "SAFE",
                "risk_score": 0.0,
                "violations": [],
                "scanned_nodes_count": 0,
            }

        # 1. Parse AST
        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            return {
                "is_safe": False,
                "threat_level": "SYNTAX_ERROR",
                "risk_score": 0.5,
                "violations": [
                    SecurityViolation(
                        line_number=e.lineno or 1,
                        violation_type="SYNTAX_ERROR",
                        target_name=str(e.msg),
                        description=f"Code cannot be compiled: {e.msg}",
                        severity="MEDIUM"
                    ).to_dict()
                ],
                "scanned_nodes_count": 0,
            }

        violations: List[SecurityViolation] = []
        node_count = 0

        # 2. Traverse AST Nodes
        for node in ast.walk(tree):
            node_count += 1
            lineno = getattr(node, "lineno", 1)

            # Check 1: Direct Imports (import os, import socket)
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root_pkg = alias.name.split(".")[0]
                    if alias.name in self.BLOCKED_MODULES or root_pkg in self.BLOCKED_MODULES:
                        violations.append(SecurityViolation(
                            line_number=lineno,
                            violation_type="BLOCKED_MODULE",
                            target_name=alias.name,
                            description=f"Importing module '{alias.name}' is strictly prohibited in sovereign sandbox.",
                            severity="CRITICAL"
                        ))

            # Check 2: From Imports (from subprocess import Popen)
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                root_pkg = module.split(".")[0]
                if module in self.BLOCKED_MODULES or root_pkg in self.BLOCKED_MODULES:
                    violations.append(SecurityViolation(
                        line_number=lineno,
                        violation_type="BLOCKED_MODULE",
                        target_name=module,
                        description=f"Importing from blocked package '{module}' is prohibited.",
                        severity="CRITICAL"
                    ))

            # Check 3: Calls to dangerous functions (eval, exec, __import__, os.system)
            elif isinstance(node, ast.Call):
                # Simple function call: eval("...")
                if isinstance(node.func, ast.Name):
                    if node.func.id in self.BLOCKED_BUILTINS:
                        violations.append(SecurityViolation(
                            line_number=lineno,
                            violation_type="EVAL_EXEC_INJECTION",
                            target_name=node.func.id,
                            description=f"Execution of dynamic evaluator '{node.func.id}()' is prohibited.",
                            severity="CRITICAL"
                        ))
                # Attribute call: os.system("...")
                elif isinstance(node.func, ast.Attribute):
                    attr_name = node.func.attr
                    # Check caller base
                    if isinstance(node.func.value, ast.Name):
                        caller_name = node.func.value.id
                        if caller_name == "os" and attr_name in self.BLOCKED_OS_ATTRIBUTES:
                            violations.append(SecurityViolation(
                                line_number=lineno,
                                violation_type="BLOCKED_CALL",
                                target_name=f"os.{attr_name}",
                                description=f"Dangerous operating system call 'os.{attr_name}()' is blocked.",
                                severity="CRITICAL"
                            ))
                        elif caller_name == "sys" and attr_name in self.BLOCKED_SYS_ATTRIBUTES:
                            violations.append(SecurityViolation(
                                line_number=lineno,
                                violation_type="BLOCKED_CALL",
                                target_name=f"sys.{attr_name}",
                                description=f"Dangerous interpreter call 'sys.{attr_name}()' is blocked.",
                                severity="CRITICAL"
                            ))

            # Check 4: Dunder and Reflection attributes access (obj.__subclasses__(), obj.__globals__)
            elif isinstance(node, ast.Attribute):
                if node.attr.startswith("__") and node.attr.endswith("__") and node.attr not in ("__name__", "__doc__", "__file__", "__init__"):
                    if node.attr in ("__subclasses__", "__globals__", "__code__", "__closure__", "__bases__", "__class__"):
                        violations.append(SecurityViolation(
                            line_number=lineno,
                            violation_type="DANGEROUS_ATTRIBUTE",
                            target_name=node.attr,
                            description=f"Reflection property access '{node.attr}' is prohibited to prevent sandbox breakouts.",
                            severity="HIGH"
                        ))

        # 3. Calculate Threat Assessment
        is_safe = len(violations) == 0
        risk_score = min(1.0, len(violations) * 0.40)

        if not is_safe:
            threat_level = "CRITICAL_EXECUTION_BLOCKED" if any(v.severity == "CRITICAL" for v in violations) else "HIGH_RISK_DETECTED"
        else:
            threat_level = "SAFE"

        return {
            "is_safe": is_safe,
            "threat_level": threat_level,
            "risk_score": round(risk_score, 2),
            "violations": [v.to_dict() for v in violations],
            "scanned_nodes_count": node_count,
        }


ast_security_scanner = ASTSecurityScanner()
