"""
Storage Service: Manages physical file storage on the local filesystem with path sanitization and SHA-256 hashing.
"""

import os
import hashlib
import mimetypes
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from ..core.config import settings
from ..core.logging import get_logger

logger = get_logger("sovereign_workbench.storage")


class StorageService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIRECTORY).resolve()
        self.workspace_dir = Path(settings.WORKSPACE_DIRECTORY).resolve()
        
        # Ensure directories exist
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.workspace_dir.mkdir(parents=True, exist_ok=True)

    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename to prevent directory traversal vulnerabilities."""
        base = os.path.basename(filename)
        # Strip dangerous characters
        safe_chars = "".join(c for c in base if c.isalnum() or c in (".", "_", "-", " "))
        return safe_chars if safe_chars else f"file_{uuid.uuid4().hex[:8]}"

    def _detect_file_type(self, filename: str, mime_type: str) -> str:
        """Categorize industrial document type."""
        lower = filename.lower()
        if lower.endswith(".pdf"):
            return "pdf"
        elif lower.endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff")):
            return "image"
        elif lower.endswith((".docx", ".doc")):
            return "docx"
        elif lower.endswith((".xlsx", ".xls", ".csv")):
            return "spreadsheet"
        elif lower.endswith((".dwg", ".dxf", ".svg")) or "p&id" in lower or "pid" in lower:
            return "pid"
        elif lower.endswith((".py", ".sh", ".sql", ".json", ".txt")):
            return "code"
        return "document"

    async def save_uploaded_file(self, file: UploadFile) -> Tuple[str, str, str, str, int, str]:
        """
        Save an incoming UploadFile to disk, calculating its SHA-256 hash streamingly.
        Returns: (saved_filename, original_filename, file_type, mime_type, file_size_bytes, sha256_hash)
        """
        original_filename = file.filename or "unknown_file"
        safe_name = self._sanitize_filename(original_filename)
        
        # Prefix with unique ID to prevent collisions while preserving extension
        ext = Path(safe_name).suffix
        stem = Path(safe_name).stem
        saved_filename = f"{stem}_{uuid.uuid4().hex[:8]}{ext}"
        target_path = self.upload_dir / saved_filename

        hasher = hashlib.sha256()
        file_size = 0

        try:
            with open(target_path, "wb") as buffer:
                while chunk := await file.read(64 * 1024):  # 64 KB chunks
                    file_size += len(chunk)
                    if file_size > (settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024):
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB",
                        )
                    hasher.update(chunk)
                    buffer.write(chunk)
        except Exception as e:
            if target_path.exists():
                target_path.unlink(missing_ok=True)
            raise e

        sha256_hash = hasher.hexdigest()
        mime_type = file.content_type or mimetypes.guess_type(original_filename)[0] or "application/octet-stream"
        file_type = self._detect_file_type(original_filename, mime_type)

        logger.info(f"File stored: {saved_filename} ({file_size} bytes, SHA-256: {sha256_hash[:12]}...)")
        return str(target_path), original_filename, file_type, mime_type, file_size, sha256_hash


storage_service = StorageService()
