import os
from typing import List
from sentence_transformers import SentenceTransformer
from rag.config import config

class LocalEmbeddingService:
    _instance = None

    def __init__(self, model_path: str = config.EMBEDDING_MODEL_PATH):
        # In air-gapped scenarios, model_path points to an on-disk folder
        self.model = SentenceTransformer(model_path)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def embed_text(self, text: str) -> List[float]:
        vector = self.model.encode(text, normalize_embeddings=True)
        return vector.tolist()

    def embed_batch(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        if not texts:
            return []
        vectors = self.model.encode(
            texts,
            batch_size=batch_size,
            normalize_embeddings=True,
            show_progress_bar=False
        )
        return vectors.tolist()
