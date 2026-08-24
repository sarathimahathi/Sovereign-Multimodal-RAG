import os
import json
from typing import Optional
from rag.config import config

class ParentContextExpander:
    def __init__(self, storage_dir: str = config.STORAGE_DIR):
        self.storage_dir = storage_dir

    def get_parent_text(self, document_id: str, parent_id: str) -> Optional[str]:
        parent_file = os.path.join(self.storage_dir, f"{document_id}_parents.json")
        if not os.path.exists(parent_file):
            return None
        try:
            with open(parent_file, "r", encoding="utf-8") as f:
                parents = json.load(f)
                return parents.get(parent_id, {}).get("full_text")
        except Exception:
            return None
