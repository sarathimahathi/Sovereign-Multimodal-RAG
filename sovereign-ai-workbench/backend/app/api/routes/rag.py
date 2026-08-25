"""
Hybrid RAG Engine API Routes for Sovereign AI Workbench.
Endpoints for document chunking, hybrid dense/sparse search, RRF rank fusion, and grounded answer synthesis.
"""

from typing import List, Dict, Any, Optional, Literal
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from rag.engine import rag_engine
from security.guardrails import prompt_guardrail
from security.audit_logger import audit_ledger
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.api.rag")

router = APIRouter(prefix="/rag", tags=["Hybrid RAG Engine"])


# ============================================================================
# Request / Response Models (DTOs)
# ============================================================================

class RagIngestRequest(BaseModel):
    text: str = Field(..., min_length=5, description="Raw text or document content to ingest")
    filename: Optional[str] = Field("document.txt", description="Origin filename")
    session_id: Optional[str] = Field(None, description="Optional workspace session ID")
    doc_id: Optional[str] = Field(None, description="Optional database document record ID")
    chunk_size: Optional[int] = Field(400, ge=50, le=2000, description="Target token chunk size")
    chunk_overlap: Optional[int] = Field(80, ge=0, le=500, description="Sliding window overlap tokens")
    classification: Optional[str] = Field("CONFIDENTIAL - INTERNAL USE", description="Security classification")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom metadata tags")


class RagQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Natural language search query or technical inquiry")
    session_id: Optional[str] = Field(None, description="Scope search to specific session or global")
    mode: Literal["hybrid", "dense", "sparse"] = Field("hybrid", description="Retrieval mode")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Number of results to return")
    dense_weight: Optional[float] = Field(0.6, ge=0.0, le=1.0, description="RRF Dense vector weight")
    sparse_weight: Optional[float] = Field(0.4, ge=0.0, le=1.0, description="RRF Sparse BM25 weight")
    rrf_k: Optional[int] = Field(60, ge=1, le=100, description="Reciprocal Rank Fusion smoothing constant")
    min_relevance_score: Optional[float] = Field(0.0, ge=0.0, le=1.0, description="Minimum relevance score threshold")
    synthesize_answer: Optional[bool] = Field(False, description="Synthesize grounded response via local LLM")
    model_preference: Optional[str] = Field("auto", description="Preferred model for grounded generation")


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("/ingest", summary="Ingest Text into Hybrid Vector & BM25 Index")
async def ingest_document(req: RagIngestRequest):
    """
    Ingest text content into the Sovereign Hybrid RAG index.
    Performs semantic chunking, dense vector embedding, Qdrant upsert, and BM25 inverted index updates.
    """
    # Guardrail scan for prompt injections in incoming text
    scan_res = prompt_guardrail.scan_prompt(req.text[:2000])
    if not scan_res.get("is_safe", True) and scan_res.get("risk_score", 0) >= 0.85:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Adversarial Injection Detected in Ingest Payload",
                "threat_level": scan_res.get("threat_level"),
                "detected_threats": scan_res.get("detected_threats"),
            }
        )

    result = await rag_engine.ingest_text(
        text=req.text,
        filename=req.filename or "document.txt",
        session_id=req.session_id,
        doc_id=req.doc_id,
        chunk_size=req.chunk_size or 400,
        chunk_overlap=req.chunk_overlap or 80,
        classification=req.classification or "CONFIDENTIAL - INTERNAL USE",
        metadata=req.metadata or {}
    )

    return result


@router.post("/query", summary="Execute Hybrid Search or Grounded Synthesis")
async def query_hybrid_rag(req: RagQueryRequest):
    """
    Execute multi-lane hybrid retrieval with Reciprocal Rank Fusion (RRF) and optional grounded synthesis.
    """
    # 1. Guardrail validation on query
    scan_res = prompt_guardrail.scan_prompt(req.query)
    if not scan_res.get("is_safe", True) and scan_res.get("risk_score", 0) >= 0.75:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Query blocked by prompt security guardrail.",
                "threat_level": scan_res.get("threat_level"),
                "detected_threats": scan_res.get("detected_threats"),
            }
        )

    # 2. If synthesis requested, run grounded generation pipeline
    if req.synthesize_answer:
        synthesis_result = await rag_engine.generate_grounded_answer(
            query=req.query,
            session_id=req.session_id,
            model_preference=req.model_preference or "auto",
            top_k=req.top_k or 4
        )
        return synthesis_result

    # 3. Otherwise return hybrid retrieval results and citations
    retrieval_result = await rag_engine.query(
        query_text=req.query,
        session_id=req.session_id,
        mode=req.mode,
        top_k=req.top_k or 5,
        dense_weight=req.dense_weight,
        sparse_weight=req.sparse_weight,
        rrf_k=req.rrf_k,
        min_relevance_score=req.min_relevance_score or 0.0
    )

    return retrieval_result


@router.get("/status", summary="Get Hybrid RAG Engine Health & Telemetry")
async def get_rag_status():
    """
    Returns real-time status of Vector Store, BM25 Index, and Local Embedding Engine.
    """
    return await rag_engine.get_status()


@router.get("/chunks", summary="List Indexed Document Chunks")
async def list_indexed_chunks(
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200)
):
    """
    List registered chunks with provenance tags and token counts.
    """
    chunks = rag_engine.list_chunks(session_id=session_id, skip=skip, limit=limit)
    return {
        "total": len(chunks),
        "skip": skip,
        "limit": limit,
        "chunks": chunks
    }


@router.delete("/collections/{session_id}", summary="Clear Session Collection")
async def clear_session_collection(session_id: str):
    """
    Clear all vector points and BM25 index terms for a specific session.
    """
    result = await rag_engine.clear_collection(session_id=session_id)
    return result
