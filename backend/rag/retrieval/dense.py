from typing import List, Optional
from rag.vectorstore.qdrant_client import QdrantStore
from rag.embeddings.embedder import LocalEmbeddingService
from rag.schemas.retrieval import RetrievalResult, RetrievalFilters
from rag.retrieval.filters import FilterBuilder
from rag.config import config

class DenseRetriever:
    def __init__(self, store: QdrantStore, embedder: LocalEmbeddingService):
        self.store = store
        self.embedder = embedder

    def search(self, query: str, top_k: int = config.TOP_K, filters: Optional[RetrievalFilters] = None) -> List[RetrievalResult]:
        query_vector = self.embedder.embed_text(query)
        qdrant_filter = FilterBuilder.build_qdrant_filter(filters)

        hits = self.store.client.search(
            collection_name=self.store.collection_name,
            query_vector=query_vector,
            query_filter=qdrant_filter,
            limit=top_k
        )

        results = []
        for hit in hits:
            p = hit.payload
            results.append(RetrievalResult(
                chunk_id=p["chunk_id"],
                document_id=p["document_id"],
                parent_id=p.get("parent_id"),
                filename=p["filename"],
                page=p["page"],
                section=p["section"],
                text=p["text"],
                dense_score=hit.score,
                metadata=p.get("metadata", {})
            ))
        return results
