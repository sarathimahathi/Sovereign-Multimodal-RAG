"""
Hybrid Fusion Retriever for Sovereign AI Workbench.
Merges Dense Vector Search and Sparse BM25 Keyword Search using Reciprocal Rank Fusion (RRF) with Provenance Citations.
"""

import time
from typing import List, Dict, Any, Optional, Literal
from dataclasses import dataclass, asdict
from .embeddings import embedding_engine
from .vector_store import vector_store
from .bm25 import bm25_index
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.rag.retriever")


@dataclass
class RetrievedChunk:
    """
    Search result item with hybrid rank breakdown and citation provenance.
    """
    chunk_id: str
    text: str
    doc_id: Optional[str]
    session_id: Optional[str]
    filename: str
    chunk_index: int
    dense_score: float
    dense_rank: Optional[int]
    sparse_score: float
    sparse_rank: Optional[int]
    rrf_score: float
    relevance_score: float
    retrieval_lane: str # "dense_only", "sparse_only", "hybrid_dual_lane"
    section_title: Optional[str]
    classification: str
    tags: List[str]
    citation_label: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class HybridRetriever:
    """
    Multi-Lane Retriever executing parallel Dense Vector Search and Sparse BM25 Search.
    Fuses results via Reciprocal Rank Fusion (RRF).
    """
    def __init__(
        self,
        default_rrf_k: int = 60,
        default_dense_weight: float = 0.6,
        default_sparse_weight: float = 0.4
    ):
        self.default_rrf_k = default_rrf_k
        self.default_dense_weight = default_dense_weight
        self.default_sparse_weight = default_sparse_weight

    async def retrieve(
        self,
        query: str,
        session_id: Optional[str] = None,
        mode: Literal["hybrid", "dense", "sparse"] = "hybrid",
        top_k: int = 5,
        dense_weight: Optional[float] = None,
        sparse_weight: Optional[float] = None,
        rrf_k: Optional[int] = None,
        min_relevance_score: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Execute search across dense and/or sparse lanes and perform RRF rank fusion.
        """
        start_time = time.perf_counter()
        w_dense = dense_weight if dense_weight is not None else self.default_dense_weight
        w_sparse = sparse_weight if sparse_weight is not None else self.default_sparse_weight
        k_val = rrf_k if rrf_k is not None else self.default_rrf_k

        # 1. Lane 1: Dense Vector Retrieval
        dense_hits: List[Dict[str, Any]] = []
        dense_latency = 0.0
        if mode in ("hybrid", "dense"):
            dense_start = time.perf_counter()
            query_vector = await embedding_engine.get_embedding(query)
            dense_hits = await vector_store.search(
                query_vector=query_vector,
                session_id=session_id,
                top_k=top_k * 3, # Retrieve larger candidate set for fusion
            )
            dense_latency = round((time.perf_counter() - dense_start) * 1000, 2)

        # 2. Lane 2: Sparse BM25 Keyword Retrieval
        sparse_hits: List[tuple] = []
        sparse_latency = 0.0
        if mode in ("hybrid", "sparse"):
            sparse_start = time.perf_counter()
            sparse_hits = bm25_index.search(
                query=query,
                session_id=session_id,
                top_k=top_k * 3
            )
            sparse_latency = round((time.perf_counter() - sparse_start) * 1000, 2)

        # 3. Build Rank Tables
        dense_ranks: Dict[str, Tuple[int, float, Dict[str, Any]]] = {} # chunk_id -> (rank_1_based, score, payload)
        for rank_idx, hit in enumerate(dense_hits, 1):
            p_id = str(hit["id"])
            dense_ranks[p_id] = (rank_idx, hit["score"], hit.get("payload", {}))

        sparse_ranks: Dict[str, Tuple[int, float, Dict[str, Any]]] = {} # chunk_id -> (rank_1_based, score, metadata)
        for rank_idx, (doc_id, score, meta) in enumerate(sparse_hits, 1):
            sparse_ranks[doc_id] = (rank_idx, score, meta)

        # 4. Reciprocal Rank Fusion (RRF) Calculation
        all_candidate_ids = set(dense_ranks.keys()).union(set(sparse_ranks.keys()))
        fused_items: List[RetrievedChunk] = []

        max_possible_rrf = (w_dense / (k_val + 1)) + (w_sparse / (k_val + 1))

        for chunk_id in all_candidate_ids:
            dense_info = dense_ranks.get(chunk_id)
            sparse_info = sparse_ranks.get(chunk_id)

            d_rank = dense_info[0] if dense_info else None
            d_score = dense_info[1] if dense_info else 0.0
            s_rank = sparse_info[0] if sparse_info else None
            s_score = sparse_info[1] if sparse_info else 0.0

            # Compute RRF score based on mode
            if mode == "dense":
                rrf = 1.0 / (k_val + d_rank) if d_rank else 0.0
            elif mode == "sparse":
                rrf = 1.0 / (k_val + s_rank) if s_rank else 0.0
            else: # hybrid
                dense_part = (w_dense / (k_val + d_rank)) if d_rank else 0.0
                sparse_part = (w_sparse / (k_val + s_rank)) if s_rank else 0.0
                rrf = dense_part + sparse_part

            # Normalized relevance score (0.0 to 1.0)
            norm_relevance = min(1.0, max(0.0, rrf / max_possible_rrf)) if max_possible_rrf > 0 else 0.0

            if norm_relevance < min_relevance_score:
                continue

            # Determine lane categorization
            if d_rank and s_rank:
                retrieval_lane = "hybrid_dual_lane"
            elif d_rank:
                retrieval_lane = "dense_only"
            else:
                retrieval_lane = "sparse_only"

            # Extract payload metadata
            payload = (dense_info[2] if dense_info else (sparse_info[2] if sparse_info else {}))
            filename = payload.get("filename", "unknown_doc")
            chunk_idx = payload.get("chunk_index", 0)
            citation_label = f"[{filename} #Chunk-{chunk_idx}]"

            fused_items.append(RetrievedChunk(
                chunk_id=chunk_id,
                text=payload.get("text", ""),
                doc_id=payload.get("doc_id"),
                session_id=payload.get("session_id"),
                filename=filename,
                chunk_index=chunk_idx,
                dense_score=d_score,
                dense_rank=d_rank,
                sparse_score=s_score,
                sparse_rank=s_rank,
                rrf_score=round(rrf, 6),
                relevance_score=round(norm_relevance, 4),
                retrieval_lane=retrieval_lane,
                section_title=payload.get("section_title"),
                classification=payload.get("classification", "CONFIDENTIAL - INTERNAL USE"),
                tags=payload.get("tags", []),
                citation_label=citation_label
            ))

        # 5. Sort final results by RRF score descending
        fused_items.sort(key=lambda x: x.rrf_score, reverse=True)
        final_top_results = fused_items[:top_k]

        total_latency = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "query": query,
            "mode": mode,
            "session_id": session_id,
            "dense_weight": w_dense,
            "sparse_weight": w_sparse,
            "rrf_k": k_val,
            "total_candidates": len(all_candidate_ids),
            "returned_count": len(final_top_results),
            "latency_ms": {
                "total": total_latency,
                "dense_lane": dense_latency,
                "sparse_lane": sparse_latency,
            },
            "results": [r.to_dict() for r in final_top_results],
            "citations": [
                {
                    "citation_label": r.citation_label,
                    "filename": r.filename,
                    "chunk_id": r.chunk_id,
                    "relevance_score": r.relevance_score,
                    "lane": r.retrieval_lane,
                    "excerpt": r.text[:180] + ("..." if len(r.text) > 180 else ""),
                }
                for r in final_top_results
            ]
        }


hybrid_retriever = HybridRetriever()
