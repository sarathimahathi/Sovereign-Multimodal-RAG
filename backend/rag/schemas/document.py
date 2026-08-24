from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ExtractedObject(BaseModel):
    label: str
    type: str
    bounding_box: Optional[List[float]] = None
    confidence: float = 1.0

class PageContent(BaseModel):
    page_number: int
    text: str
    tables: List[Dict[str, Any]] = Field(default_factory=list)
    images: List[Dict[str, Any]] = Field(default_factory=list)
    multimodal_objects: List[ExtractedObject] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentMetadata(BaseModel):
    document_id: str
    filename: str
    document_type: str = "UNKNOWN"
    title: Optional[str] = None
    revision: str = "v1"
    equipment_type: Optional[str] = None
    equipment_id: Optional[str] = None
    department: Optional[str] = None
    source: str = "internal"
    sha256_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    custom_metadata: Dict[str, Any] = Field(default_factory=dict)

class Document(BaseModel):
    metadata: DocumentMetadata
    source_path: str
    pages: List[PageContent]
