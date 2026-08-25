"""
Sovereign AI Workbench - Retrieval-Augmented Generation (RAG) Module
Hybrid Dense + Sparse BM25 + Reciprocal Rank Fusion Engine
"""

from .chunking import Chunk, SemanticChunker, IndustrialMarkdownChunker, semantic_chunker, industrial_chunker
from .embeddings import EmbeddingEngine, embedding_engine, cosine_similarity
from .bm25 import BM25Index, bm25_index
from .vector_store import QdrantVectorStore, vector_store
from .hybrid_retriever import HybridRetriever, hybrid_retriever, RetrievedChunk
from .engine import HybridRAGEngine, rag_engine

__all__ = [
    "Chunk",
    "SemanticChunker",
    "IndustrialMarkdownChunker",
    "semantic_chunker",
    "industrial_chunker",
    "EmbeddingEngine",
    "embedding_engine",
    "cosine_similarity",
    "BM25Index",
    "bm25_index",
    "QdrantVectorStore",
    "vector_store",
    "HybridRetriever",
    "hybrid_retriever",
    "RetrievedChunk",
    "HybridRAGEngine",
    "rag_engine",
]

__version__ = "0.1.0"

