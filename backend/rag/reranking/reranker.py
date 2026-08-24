from typing import List
from sentence_transformers import CrossEncoder
from rag.schemas.retrieval import RetrievalResult
from rag.config import config

class LocalReranker:
    _instance = None

    def __init__(self, model_path: str = config.RERANKER_MODEL_PATH):
        self.model = CrossEncoder(model_path)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def rerank(self, query: str, documents: List[RetrievalResult], top_k: int = config.RERANK_TOP_K) -> List[RetrievalResult]:
        if not documents:
            return []

        pairs = [[query, doc.text] for doc in documents]
        scores = self.model.predict(pairs)

        for idx, doc in enumerate(documents):
            doc.rerank_score = float(scores[idx])

        ranked = sorted(documents, key=lambda x: x.rerank_score or -999.0, reverse=True)
        return ranked[:top_k]
