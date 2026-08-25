"""
Sovereign AI Workbench - Backend Application Package
"""

import sys
from pathlib import Path

# Automatically ensure monorepo root and backend directories are in sys.path
_ROOT_DIR = Path(__file__).resolve().parent.parent.parent
_BACKEND_DIR = Path(__file__).resolve().parent.parent

for _p in [str(_ROOT_DIR), str(_BACKEND_DIR)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

__version__ = "0.1.0"
