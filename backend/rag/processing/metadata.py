import re
import hashlib
from typing import Dict, Any, Optional
from datetime import datetime
from rag.schemas.document import DocumentMetadata

class MetadataExtractor:
    @staticmethod
    def compute_sha256(file_path: str) -> str:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(65536), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    @staticmethod
    def extract_metadata(file_path: str, filename: str, override_meta: Optional[Dict[str, Any]] = None) -> DocumentMetadata:
        sha256 = MetadataExtractor.compute_sha256(file_path)
        override = override_meta or {}
        
        # Regex heuristics for standard industrial tags (e.g., SOP-042, V-204, P-101)
        doc_id_match = re.search(r'\b[A-Z]{2,4}-\d{2,4}\b', filename)
        doc_id = override.get("document_id") or (doc_id_match.group(0) if doc_id_match else filename)
        
        equip_match = re.search(r'\b[VPTKE]-\d{2,4}\b', filename)
        equip_id = override.get("equipment_id") or (equip_match.group(0) if equip_match else None)

        doc_type = override.get("document_type", "TECHNICAL_DOCUMENT")
        if "sop" in filename.lower():
            doc_type = "SOP"
        elif "manual" in filename.lower():
            doc_type = "MANUAL"
        elif "inspection" in filename.lower():
            doc_type = "INSPECTION_REPORT"

        return DocumentMetadata(
            document_id=doc_id,
            filename=filename,
            document_type=doc_type,
            title=override.get("title", filename.replace("_", " ").replace("-", " ")),
            revision=override.get("revision", "v1"),
            equipment_type=override.get("equipment_type"),
            equipment_id=equip_id,
            department=override.get("department", "operations"),
            source=override.get("source", "internal"),
            sha256_hash=sha256,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            custom_metadata=override
        )
