import sys
import os
import time
import subprocess

def run_tests():
    print("=" * 70)
    print(" INDUSTRIAL MULTIMODAL SEMANTIC RAG SYSTEM - TEST SUITE RUNNER")
    print("=" * 70)
    
    test_dir = os.path.abspath(os.path.dirname(__file__))
    backend_dir = os.path.abspath(os.path.join(test_dir, "..", ".."))
    repo_root = os.path.abspath(os.path.join(backend_dir, ".."))

    # Look for virtualenv in repo root or backend dir
    possible_venvs = [
        os.path.join(repo_root, ".venv"),
        os.path.join(backend_dir, ".venv"),
        os.path.join(repo_root, "venv"),
        os.path.join(backend_dir, "venv")
    ]

    python_cmd = sys.executable
    pytest_cmd = "pytest"

    for venv_path in possible_venvs:
        py_exe = os.path.join(venv_path, "Scripts", "python.exe")
        pt_exe = os.path.join(venv_path, "Scripts", "pytest.exe")
        if os.path.exists(py_exe):
            python_cmd = py_exe
            pytest_cmd = pt_exe if os.path.exists(pt_exe) else py_exe
            break

    start_time = time.time()
    print(f"[*] Test Directory: {test_dir}")
    print(f"[*] Backend Root:   {backend_dir}")
    print(f"[*] Python Binary:  {python_cmd}")
    print("-" * 70)

    # Set PYTHONPATH so 'rag' package is importable
    env = os.environ.copy()
    python_paths = [backend_dir, repo_root]
    if "PYTHONPATH" in env:
        python_paths.append(env["PYTHONPATH"])
    env["PYTHONPATH"] = os.pathsep.join(python_paths)

    cmd = [python_cmd, "-m", "pytest", test_dir, "-v", "--tb=short"]

    process = subprocess.Popen(
        cmd,
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=env
    )

    passed_count = 0
    failed_count = 0

    for line in iter(process.stdout.readline, ""):
        print(line, end="")
        if "PASSED" in line:
            passed_count += 1
        elif "FAILED" in line:
            failed_count += 1

    process.wait()
    total_time = time.time() - start_time

    print("=" * 70)
    print(f" SUMMARY: Passed: {passed_count} | Failed: {failed_count} | Duration: {total_time:.2f}s")
    print("=" * 70)
    
    return process.returncode

if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)
