import time
from typing import Dict, Any, Optional
from rag.vectorstore.qdrant_client import QdrantStore
from rag.embeddings.embedder import LocalEmbeddingService
from rag.retrieval.dense import DenseRetriever
from rag.retrieval.hybrid import HybridRetriever
from rag.reranking.reranker import LocalReranker
from rag.context.parent_context import ParentContextExpander
from rag.context.builder import ContextBuilder
from rag.citations.citation_builder import CitationBuilder
from rag.schemas.retrieval import RetrievalQuery
from rag.schemas.response import RAGResponse, RetrievalStats
from rag.config import config

class RAGPipeline:
    def __init__(self):
        self.store = QdrantStore()
        self.embedder = LocalEmbeddingService.get_instance()
        self.dense = DenseRetriever(self.store, self.embedder)
        self.hybrid = HybridRetriever(self.dense)
        self.reranker = LocalReranker.get_instance()
        self.expander = ParentContextExpander()
        self.context_builder = ContextBuilder(self.expander)

    def execute(self, query_input: RetrievalQuery) -> RAGResponse:
        latencies = {}
        
        # 1. Hybrid Retrieval (Dense + BM25 Fusion)
        t0 = time.perf_counter()
        hybrid_results = self.hybrid.search(
            query=query_input.query,
            top_k=query_input.top_k,
            filters=query_input.filters
        )
        latencies["hybrid_retrieval_ms"] = (time.perf_counter() - t0) * 1000

        # 2. Cross-Encoder Reranking
        t1 = time.perf_counter()
        reranked_results = self.reranker.rerank(
            query=query_input.query,
            documents=hybrid_results,
            top_k=query_input.rerank_top_k
        )
        latencies["reranking_ms"] = (time.perf_counter() - t1) * 1000

        # 3. Abstention Validation
        passed_results = [
            r for r in reranked_results 
            if (r.rerank_score is not None and r.rerank_score >= config.MIN_RERANK_SCORE)
        ]

        if not passed_results:
            return RAGResponse(
                query=query_input.query,
                answer="I could not find sufficient evidence in the indexed documents to answer this question.",
                sources=[],
                retrieval=RetrievalStats(
                    strategy="hybrid_rrf_rerank",
                    dense_results_count=len(hybrid_results),
                    sparse_results_count=len(hybrid_results),
                    fused_results_count=len(hybrid_results),
                    reranked_results_count=0,
                    latency_ms=latencies
                ),
                confidence=0.0,
                grounded=False,
                context_used=""
            )

        # 4. Context Assembly & Citations
        context_str = self.context_builder.build_context(
            passed_results,
            expand_parent=query_input.expand_parent_context
        )
        citations = CitationBuilder.build_citations(passed_results)

        # Composite Grounding Confidence Heuristic
        avg_rerank = sum([r.rerank_score for r in passed_results]) / len(passed_results)
        confidence = round(min(0.99, max(0.5, (avg_rerank + 4.0) / 8.0)), 2)

        return RAGResponse(
            query=query_input.query,
            answer="",  # Populated downstream by Agent/LLM Module using context_used
            sources=citations,
            retrieval=RetrievalStats(
                strategy="hybrid_rrf_rerank",
                dense_results_count=len(hybrid_results),
                sparse_results_count=len(hybrid_results),
                fused_results_count=len(hybrid_results),
                reranked_results_count=len(passed_results),
                latency_ms=latencies
            ),
            confidence=confidence,
            grounded=True,
            context_used=context_str
        )
