import os
from pydantic_settings import BaseSettings

class RAGConfig(BaseSettings):
    # Air-Gapped / Environment Flag
    AIR_GAPPED: bool = True
    
    # Qdrant Vector DB
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "industrial_rag_chunks")
    
    # Local Model Weights (Must point to local disk paths in air-gapped deployments)
    EMBEDDING_MODEL_PATH: str = os.getenv("EMBEDDING_MODEL_PATH", "BAAI/bge-small-en-v1.5")
    RERANKER_MODEL_PATH: str = os.getenv("RERANKER_MODEL_PATH", "cross-encoder/ms-marco-MiniLM-L-6-v2")
    EMBEDDING_DIM: int = int(os.getenv("EMBEDDING_DIM", "384"))
    
    # Chunking Configuration
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "512"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "80"))
    
    # Retrieval Configuration
    TOP_K: int = int(os.getenv("TOP_K", "20"))
    RERANK_TOP_K: int = int(os.getenv("RERANK_TOP_K", "5"))
    MIN_RELEVANCE_SCORE: float = float(os.getenv("MIN_RELEVANCE_SCORE", "0.35"))
    MIN_RERANK_SCORE: float = float(os.getenv("MIN_RERANK_SCORE", "-2.5"))
    
    # Storage
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./data/storage")

    class Config:
        env_file = ".env"
        extra = "ignore"

config = RAGConfig()
