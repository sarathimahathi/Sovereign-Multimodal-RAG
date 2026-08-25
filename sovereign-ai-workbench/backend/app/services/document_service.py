"""
Document Service: Orchestrates business logic for uploading, indexing, and managing industrial confidential documents.
"""

from typing import List, Optional, Tuple
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..repositories.document_repo import DocumentRepository
from ..database.models import DocumentModel
from .storage_service import storage_service
from ..core.logging import get_logger

logger = get_logger("sovereign_workbench.documents")


class DocumentService:
    async def upload_document(
        self,
        db_session: AsyncSession,
        file: UploadFile,
        session_id: Optional[str] = None,
        classification: str = "CONFIDENTIAL - INTERNAL USE",
    ) -> DocumentModel:
        """
        Handle multi-part file upload, calculate SHA-256 hash, detect duplicates, and persist record.
        """
        storage_path, original_filename, file_type, mime_type, file_size, sha256_hash = (
            await storage_service.save_uploaded_file(file)
        )

        repo = DocumentRepository(db_session)

        # Check if identical file was already uploaded
        existing = await repo.get_by_hash(sha256_hash)
        if existing:
            logger.info(f"Duplicate document detected (SHA-256: {sha256_hash[:10]}...). Returning existing record.")
            return existing

        doc = await repo.create(
            session_id=session_id,
            filename=Path(storage_path).name,
            original_filename=original_filename,
            file_type=file_type,
            mime_type=mime_type,
            file_size_bytes=file_size,
            sha256_hash=sha256_hash,
            storage_path=storage_path,
            status="uploaded",
            metadata_info={"classification": classification},
        )
        return doc

    async def list_documents(
        self, db_session: AsyncSession, skip: int = 0, limit: int = 100
    ) -> Tuple[int, List[DocumentModel]]:
        """List documents with count."""
        repo = DocumentRepository(db_session)
        total = await repo.count()
        items = await repo.get_all(skip=skip, limit=limit)
        return total, items

    async def get_document(self, db_session: AsyncSession, document_id: str) -> Optional[DocumentModel]:
        """Fetch document by primary key."""
        repo = DocumentRepository(db_session)
        return await repo.get_by_id(document_id)

    async def delete_document(self, db_session: AsyncSession, document_id: str) -> bool:
        """Delete document record and file from disk."""
        repo = DocumentRepository(db_session)
        doc = await repo.get_by_id(document_id)
        if not doc:
            return False

        # Remove file from disk
        try:
            p = Path(doc.storage_path)
            if p.exists():
                p.unlink(missing_ok=True)
        except Exception as e:
            logger.warning(f"Failed to delete disk file {doc.storage_path}: {e}")

        return await repo.delete_by_id(document_id)


document_service = DocumentService()
