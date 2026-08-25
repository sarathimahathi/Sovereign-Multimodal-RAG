"""
High-Level Hybrid RAG Pipeline Orchestrator for Sovereign AI Workbench.
Connects Chunking, Dual-Mode Embeddings, Qdrant Vector Store, BM25 Index, and Local LLM Grounded Synthesis.
"""

import time
from typing import List, Dict, Any, Optional, Literal
from .chunking import semantic_chunker, industrial_chunker, Chunk
from .embeddings import embedding_engine
from .vector_store import vector_store
from .bm25 import bm25_index
from .hybrid_retriever import hybrid_retriever
from models.engine import local_model_engine
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.rag.engine")


class HybridRAGEngine:
    """
    Enterprise Sovereign Hybrid RAG Engine Orchestrator.
    """
    def __init__(self):
        self.chunker = industrial_chunker
        self.embeddings = embedding_engine
        self.vector_store = vector_store
        self.bm25 = bm25_index
        self.retriever = hybrid_retriever
        self._indexed_chunks_registry: Dict[str, Chunk] = {} # chunk_id -> Chunk

    async def ingest_text(
        self,
        text: str,
        filename: str = "document.txt",
        session_id: Optional[str] = None,
        doc_id: Optional[str] = None,
        chunk_size: int = 400,
        chunk_overlap: int = 80,
        classification: str = "CONFIDENTIAL - INTERNAL USE",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Ingest raw text or document content into both Dense Vector Store and Sparse BM25 Index.
        """
        start_time = time.perf_counter()
        metadata = metadata or {}

        # 1. Chunk document
        custom_chunker = (
            industrial_chunker if (chunk_size == 400 and chunk_overlap == 80)
            else industrial_chunker.__class__(target_chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        )
        chunks: List[Chunk] = custom_chunker.chunk_text(
            text=text,
            filename=filename,
            doc_id=doc_id,
            session_id=session_id,
            classification=classification,
            metadata=metadata
        )

        if not chunks:
            return {
                "status": "empty",
                "chunks_ingested": 0,
                "total_tokens": 0,
                "latency_ms": 0.0,
            }

        # 2. Generate embeddings for chunks
        chunk_texts = [c.text for c in chunks]
        embeddings = await self.embeddings.get_batch_embeddings(chunk_texts)

        # 3. Prepare vector store points
        vector_points: List[Dict[str, Any]] = []
        all_extracted_tags = set()
        total_tokens = 0

        for chunk, emb in zip(chunks, embeddings):
            total_tokens += chunk.token_count
            all_extracted_tags.update(chunk.tags)
            self._indexed_chunks_registry[chunk.id] = chunk

            vector_points.append({
                "id": chunk.id,
                "vector": emb,
                "payload": {
                    "chunk_id": chunk.id,
                    "doc_id": chunk.doc_id,
                    "session_id": chunk.session_id,
                    "filename": chunk.filename,
                    "chunk_index": chunk.chunk_index,
                    "text": chunk.text,
                    "section_title": chunk.section_title,
                    "classification": chunk.classification,
                    "tags": chunk.tags,
                    "token_count": chunk.token_count,
                    "sha256_hash": chunk.sha256_hash,
                    "metadata": chunk.metadata,
                }
            })

            # 4. Insert into BM25 Index
            self.bm25.add_document(
                doc_id=chunk.id,
                text=f"{chunk.section_title or ''} {chunk.text} {' '.join(chunk.tags)}",
                session_id=session_id,
                metadata={
                    "chunk_id": chunk.id,
                    "doc_id": chunk.doc_id,
                    "session_id": chunk.session_id,
                    "filename": chunk.filename,
                    "chunk_index": chunk.chunk_index,
                    "text": chunk.text,
                    "section_title": chunk.section_title,
                    "classification": chunk.classification,
                    "tags": chunk.tags,
                }
            )

        # 5. Upsert points into Vector Store (Qdrant + Local Fallback)
        upserted_count = await self.vector_store.upsert_points(vector_points)

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(
            f"RAG Ingestion complete: {len(chunks)} chunks, {total_tokens} tokens, "
            f"tags: {list(all_extracted_tags)[:5]} [{latency_ms}ms]"
        )

        return {
            "status": "success",
            "filename": filename,
            "doc_id": doc_id,
            "session_id": session_id,
            "chunks_ingested": len(chunks),
            "total_tokens": total_tokens,
            "tags_extracted": sorted(list(all_extracted_tags)),
            "vector_points_upserted": upserted_count,
            "bm25_documents_indexed": len(chunks),
            "latency_ms": latency_ms,
            "chunk_previews": [
                {
                    "chunk_id": c.id,
                    "chunk_index": c.chunk_index,
                    "token_count": c.token_count,
                    "tags": c.tags,
                    "section": c.section_title,
                    "excerpt": c.text[:120] + ("..." if len(c.text) > 120 else ""),
                }
                for c in chunks[:5]
            ]
        }

    async def query(
        self,
        query_text: str,
        session_id: Optional[str] = None,
        mode: Literal["hybrid", "dense", "sparse"] = "hybrid",
        top_k: int = 5,
        dense_weight: Optional[float] = None,
        sparse_weight: Optional[float] = None,
        rrf_k: Optional[int] = None,
        min_relevance_score: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Execute Hybrid Search with Reciprocal Rank Fusion.
        """
        return await self.retriever.retrieve(
            query=query_text,
            session_id=session_id,
            mode=mode,
            top_k=top_k,
            dense_weight=dense_weight,
            sparse_weight=sparse_weight,
            rrf_k=rrf_k,
            min_relevance_score=min_relevance_score
        )

    async def generate_grounded_answer(
        self,
        query: str,
        session_id: Optional[str] = None,
        model_preference: str = "auto",
        top_k: int = 4,
        temperature: float = 0.1,
    ) -> Dict[str, Any]:
        """
        Execute Hybrid RAG search and synthesize a strictly grounded answer with verifiable source citations.
        """
        start_time = time.perf_counter()

        # 1. Retrieve hybrid context
        search_result = await self.query(
            query_text=query,
            session_id=session_id,
            mode="hybrid",
            top_k=top_k
        )

        retrieved_results = search_result.get("results", [])

        # 2. Build Grounded Context Prompt
        if not retrieved_results:
            context_block = "NO VERIFIABLE SOURCE DOCUMENTS FOUND IN KNOWLEDGE BASE."
        else:
            context_pieces = []
            for idx, item in enumerate(retrieved_results, 1):
                label = item.get("citation_label", f"[Citation #{idx}]")
                filename = item.get("filename", "Doc")
                tags = f" (Tags: {', '.join(item.get('tags', []))})" if item.get('tags') else ""
                context_pieces.append(
                    f"--- SOURCE ENTRY {idx} {label} [File: {filename}{tags}] ---\n"
                    f"{item.get('text', '')}"
                )
            context_block = "\n\n".join(context_pieces)

        system_instruction = (
            "You are the Sovereign Industrial AI Technical Assistant. "
            "Your objective is to provide strictly grounded technical responses based ONLY on the provided verified context. "
            "Rules:\n"
            "1. Cite the exact source labels (e.g. [PID_01.pdf #Chunk-0]) for every factual claim or technical parameter.\n"
            "2. Never hallucinate sensor tags, operating limits, or standards not present in the verified context.\n"
            "3. If the answer is not in the source documents, clearly state: 'Insufficient context in sovereign repository.'\n"
            "4. Format formulas, tags, and parameters in clean markdown tables or lists."
        )

        user_prompt = (
            f"=== VERIFIED SOVEREIGN REPOSITORY CONTEXT ===\n"
            f"{context_block}\n\n"
            f"=== TECHNICAL USER QUERY ===\n"
            f"{query}\n\n"
            f"Provide a verified, cited technical analysis:"
        )

        # 3. Generate completion with local LLM engine
        generation_res = await local_model_engine.generate(
            prompt=user_prompt,
            model_preference=model_preference,
            system_prompt=system_instruction,
            temperature=temperature,
            session_id=session_id
        )

        total_latency = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "query": query,
            "answer": generation_res.get("content", ""),
            "model_used": generation_res.get("model_used", ""),
            "model_name": generation_res.get("model_name", ""),
            "domain": generation_res.get("domain", ""),
            "citations": search_result.get("citations", []),
            "retrieved_chunks": retrieved_results,
            "retrieval_latency_ms": search_result.get("latency_ms", {}).get("total", 0.0),
            "generation_latency_ms": generation_res.get("latency_ms", 0.0),
            "total_latency_ms": total_latency,
            "tokens_generated": generation_res.get("tokens_generated", 0),
            "is_air_gapped": True
        }

    async def get_status(self) -> Dict[str, Any]:
        """
        Aggregate RAG system metrics and telemetry.
        """
        v_status = await self.vector_store.get_status()
        bm25_stats = self.bm25.get_stats()
        emb_status = self.embeddings.get_status()

        return {
            "status": "operational",
            "vector_store": v_status,
            "bm25_index": bm25_stats,
            "embedding_engine": emb_status,
            "total_registered_chunks": len(self._indexed_chunks_registry),
            "features": {
                "dense_vector_search": True,
                "sparse_bm25_search": True,
                "reciprocal_rank_fusion": True,
                "industrial_tag_preservation": True,
                "grounded_citation_provenance": True,
                "zero_config_fallback": True,
            }
        }

    def list_chunks(
        self,
        session_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        List indexed chunks with optional session filtering.
        """
        all_chunks = list(self._indexed_chunks_registry.values())
        if session_id:
            all_chunks = [c for c in all_chunks if c.session_id == session_id]
        
        sliced = all_chunks[skip : skip + limit]
        return [c.to_dict() for c in sliced]

    async def clear_collection(self, session_id: str) -> Dict[str, Any]:
        """
        Clear all vector and BM25 records for a specific session.
        """
        vectors_deleted = await self.vector_store.delete_by_session(session_id)
        bm25_deleted = self.bm25.clear_session(session_id)

        # Remove from registry
        to_del = [cid for cid, c in self._indexed_chunks_registry.items() if c.session_id == session_id]
        for cid in to_del:
            del self._indexed_chunks_registry[cid]

        return {
            "session_id": session_id,
            "vectors_deleted": vectors_deleted,
            "bm25_documents_deleted": bm25_deleted,
            "status": "cleared"
        }


rag_engine = HybridRAGEngine()
