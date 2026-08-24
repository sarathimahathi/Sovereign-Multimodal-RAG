from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class RetrievalFilters(BaseModel):
    document_type: Optional[str] = None
    equipment_type: Optional[str] = None
    equipment_id: Optional[str] = None
    revision: Optional[str] = None
    department: Optional[str] = None
    custom_filters: Dict[str, Any] = Field(default_factory=dict)

class RetrievalQuery(BaseModel):
    query: str
    top_k: int = 20
    rerank_top_k: int = 5
    filters: Optional[RetrievalFilters] = None
    expand_parent_context: bool = True

class RetrievalResult(BaseModel):
    chunk_id: str
    document_id: str
    parent_id: Optional[str] = None
    filename: str
    page: int
    section: str
    text: str
    dense_score: Optional[float] = None
    sparse_score: Optional[float] = None
    fusion_score: Optional[float] = None
    rerank_score: Optional[float] = None
    expanded_context: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
