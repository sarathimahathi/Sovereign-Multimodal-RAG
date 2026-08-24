from typing import List, Optional
from rag.retrieval.dense import DenseRetriever
from rag.retrieval.sparse import SparseRetriever
from rag.retrieval.fusion import ReciprocalRankFusion
from rag.schemas.retrieval import RetrievalResult, RetrievalFilters

class HybridRetriever:
    def __init__(self, dense_retriever: DenseRetriever):
        self.dense = dense_retriever
        self.sparse = SparseRetriever()

    def search(self, query: str, top_k: int = 20, filters: Optional[RetrievalFilters] = None) -> List[RetrievalResult]:
        dense_results = self.dense.search(query, top_k=top_k, filters=filters)
        sparse_results = self.sparse.search_over_corpus(query, dense_results, top_k=top_k)
        fused_results = ReciprocalRankFusion.fuse(dense_results, sparse_results)
        return fused_results[:top_k]
