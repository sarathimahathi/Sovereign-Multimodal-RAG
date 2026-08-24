import sys
from unittest.mock import MagicMock

# Graceful mock fallback for sentence_transformers if not installed in offline/lightweight test env
if "sentence_transformers" not in sys.modules:
    try:
        import sentence_transformers
    except ImportError:
        dummy_st = MagicMock()
        dummy_st.SentenceTransformer = MagicMock
        dummy_st.CrossEncoder = MagicMock
        sys.modules["sentence_transformers"] = dummy_st

# Automatically redirect QdrantClient to in-memory mode for tests and ensure backward compatibility
import qdrant_client
_original_qdrant_init = qdrant_client.QdrantClient.__init__

def _patched_qdrant_init(self, *args, **kwargs):
    if kwargs.get("host") in ("localhost", "127.0.0.1") or (not args and not kwargs):
        kwargs = {"location": ":memory:"}
        args = ()
    elif "location" not in kwargs and "path" not in kwargs and "url" not in kwargs and not args:
        kwargs = {"location": ":memory:"}
    return _original_qdrant_init(self, *args, **kwargs)

qdrant_client.QdrantClient.__init__ = _patched_qdrant_init

# Compatibility adapter for QdrantClient.search in newer qdrant-client versions
if not hasattr(qdrant_client.QdrantClient, "search"):
    def _search_compat(self, collection_name, query_vector, query_filter=None, limit=10, **kwargs):
        res = self.query_points(
            collection_name=collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=limit,
            **kwargs
        )
        return res.points
    qdrant_client.QdrantClient.search = _search_compat

import pytest
import os
import numpy as np
from unittest.mock import patch
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from rag.config import config
from rag.pipeline.ingestion_pipeline import IngestionPipeline
from rag.pipeline.retrieval_pipeline import RAGPipeline
from rag.vectorstore.qdrant_client import QdrantStore
from rag.embeddings.embedder import LocalEmbeddingService
from rag.reranking.reranker import LocalReranker

class InMemoryQdrantStore(QdrantStore):
    """In-memory Qdrant store for fast and isolated unit/integration tests."""
    def __init__(self, collection_name: str = "test_collection"):
        self.client = QdrantClient(location=":memory:")
        self.collection_name = collection_name
        self.ensure_collection()

@pytest.fixture
def in_memory_store():
    return InMemoryQdrantStore()

@pytest.fixture
def mock_embedder():
    """Generates consistent mock embeddings based on text hashing."""
    service = MagicMock(spec=LocalEmbeddingService)
    
    def _mock_embed_text(text: str):
        seed = sum(ord(c) for c in text) % 10000
        rng = np.random.RandomState(seed)
        vec = rng.randn(config.EMBEDDING_DIM)
        vec = vec / np.linalg.norm(vec)
        return vec.tolist()

    def _mock_embed_batch(texts, batch_size=32):
        return [_mock_embed_text(t) for t in texts]

    service.embed_text.side_effect = _mock_embed_text
    service.embed_batch.side_effect = _mock_embed_batch
    return service

@pytest.fixture
def mock_reranker():
    """Deterministic mock cross-encoder reranker."""
    reranker = MagicMock(spec=LocalReranker)
    
    def _mock_rerank(query, documents, top_k=config.RERANK_TOP_K):
        query_words = set(query.lower().split())
        for doc in documents:
            doc_words = set(doc.text.lower().split())
            overlap = len(query_words.intersection(doc_words))
            if overlap > 0:
                doc.rerank_score = 1.0 + (overlap * 2.0)
            else:
                doc.rerank_score = -5.0  # Below threshold to trigger abstention gate
        ranked = sorted(documents, key=lambda x: x.rerank_score if x.rerank_score is not None else -999.0, reverse=True)
        return ranked[:top_k]

    reranker.rerank.side_effect = _mock_rerank
    return reranker

@pytest.fixture
def isolated_pipeline(tmp_path, mock_embedder, mock_reranker):
    store = InMemoryQdrantStore(collection_name="test_pipeline_collection")
    storage_dir = str(tmp_path / "storage")
    os.makedirs(storage_dir, exist_ok=True)

    with patch("rag.pipeline.ingestion_pipeline.config.STORAGE_DIR", storage_dir), \
         patch("rag.context.parent_context.config.STORAGE_DIR", storage_dir):
        
        ingestor = IngestionPipeline()
        ingestor.store = store
        ingestor.embedder = mock_embedder

        retriever = RAGPipeline()
        retriever.store = store
        retriever.embedder = mock_embedder
        retriever.dense.store = store
        retriever.dense.embedder = mock_embedder
        retriever.reranker = mock_reranker
        retriever.expander.storage_dir = storage_dir

        yield ingestor, retriever
