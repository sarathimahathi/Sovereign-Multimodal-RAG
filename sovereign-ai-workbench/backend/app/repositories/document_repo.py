"""
Document Repository for managing confidential industrial files in the database.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from .base import BaseRepository
from ..database.models import DocumentModel


class DocumentRepository(BaseRepository[DocumentModel]):
    def __init__(self, session: AsyncSession):
        super().__init__(DocumentModel, session)

    async def get_by_hash(self, sha256_hash: str) -> Optional[DocumentModel]:
        """Find an existing document by its SHA-256 checksum."""
        result = await self.session.execute(
            select(DocumentModel).where(DocumentModel.sha256_hash == sha256_hash)
        )
        return result.scalars().first()

    async def get_by_session(self, session_id: str) -> List[DocumentModel]:
        """Get all documents associated with a specific workspace session."""
        result = await self.session.execute(
            select(DocumentModel)
            .where(DocumentModel.session_id == session_id)
            .order_by(DocumentModel.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_status(
        self, document_id: str, status: str, metadata_info: Optional[Dict[str, Any]] = None
    ) -> Optional[DocumentModel]:
        """Update processing status and metadata of a document."""
        doc = await self.get_by_id(document_id)
        if not doc:
            return None
        doc.status = status
        if metadata_info:
            current_meta = dict(doc.metadata_info or {})
            current_meta.update(metadata_info)
            doc.metadata_info = current_meta
        await self.session.flush()
        return doc
