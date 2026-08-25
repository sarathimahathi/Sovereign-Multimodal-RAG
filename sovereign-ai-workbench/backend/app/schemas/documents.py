"""
Pydantic Schemas for Industrial Documents.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class DocumentBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    filename: str
    original_filename: str
    file_type: str
    mime_type: str
    file_size_bytes: int
    sha256_hash: str
    status: str = "uploaded"
    metadata_info: Dict[str, Any] = Field(default_factory=dict)


class DocumentCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    session_id: Optional[str] = None
    file_type: Optional[str] = None
    classification: Optional[str] = "CONFIDENTIAL - INTERNAL USE"


class DocumentResponse(DocumentBase):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: str
    session_id: Optional[str] = None
    storage_path: str
    created_at: datetime


class DocumentListResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    total: int
    items: List[DocumentResponse]
