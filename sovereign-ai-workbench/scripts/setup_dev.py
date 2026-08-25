"""
Developer environment verification script for Sovereign AI Workbench.
Checks Python version, Node.js version, and environment configuration.
"""

import sys
import os
import shutil

def check_environment():
    print("========================================")
    print("Sovereign AI Workbench - Dev Check")
    print("========================================")
    
    # 1. Python Check
    py_version = sys.version_info
    print(f"Python Version: {py_version.major}.{py_version.minor}.{py_version.micro}", end=" ")
    if py_version >= (3, 11):
        print("✅ [OK]")
    else:
        print("⚠️ [Warning: Recommended Python >= 3.11]")
        
    # 2. Node & NPM Check
    node_path = shutil.which("node")
    npm_path = shutil.which("npm")
    print(f"Node.js: {node_path if node_path else 'Not Found'} {'✅ [OK]' if node_path else '❌ [Missing]'}")
    print(f"npm: {npm_path if npm_path else 'Not Found'} {'✅ [OK]' if npm_path else '❌ [Missing]'}")
    
    # 3. .env check
    env_exists = os.path.exists(".env")
    print(f".env file: {'✅ Found' if env_exists else '⚠️ Not found (copy .env.example to .env)'}")
    
    print("========================================")
    print("Ready to start development.")

if __name__ == "__main__":
    check_environment()
