from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class Chunk(BaseModel):
    chunk_id: str
    document_id: str
    parent_id: Optional[str] = None
    page: int
    section: str = "General"
    chunk_index: int
    text: str
    token_count: int
    equipment_tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ParentSection(BaseModel):
    parent_id: str
    document_id: str
    page: int
    section: str
    full_text: str
    child_chunk_ids: List[str] = Field(default_factory=list)
