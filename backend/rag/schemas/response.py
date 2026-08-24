from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class Citation(BaseModel):
    citation_id: int
    document_id: str
    document_title: str
    filename: str
    page: int
    section: str
    chunk_id: str
    text_snippet: str

class RetrievalStats(BaseModel):
    strategy: str = "hybrid_rrf_rerank"
    dense_results_count: int
    sparse_results_count: int
    fused_results_count: int
    reranked_results_count: int
    latency_ms: Dict[str, float]

class RAGResponse(BaseModel):
    query: str
    answer: str
    sources: List[Citation]
    retrieval: RetrievalStats
    confidence: float
    grounded: bool
    context_used: str
