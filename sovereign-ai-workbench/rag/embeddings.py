"""
Local Embedding Engine for Sovereign AI Workbench.
Dual-Mode: Ollama embeddings API (Production/Local) with High-Performance Deterministic Vectorizer fallback (Air-Gapped/Offline).
"""

import math
import hashlib
import httpx
from typing import List, Optional, Dict, Any
from collections import OrderedDict
from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.rag.embeddings")

VECTOR_DIMENSION = 384


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Compute cosine similarity between two float vectors.
    """
    if len(vec_a) != len(vec_b) or not vec_a:
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return max(-1.0, min(1.0, dot_product / (norm_a * norm_b)))


class FastDeterministicVectorizer:
    """
    Local subword & n-gram deterministic dense vectorizer (384-d normalized).
    Guarantees fast semantic semantic-hash embeddings without requiring external weights or GPU in air-gapped environments.
    """
    def __init__(self, dimension: int = VECTOR_DIMENSION):
        self.dimension = dimension

    def encode(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self.dimension

        text = text.lower().strip()
        vec = [0.0] * self.dimension

        # 1. Word n-grams and subword character n-grams
        words = text.split()
        for idx, word in enumerate(words):
            # Term weight
            w_hash = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            pos = w_hash % self.dimension
            sign = 1.0 if (w_hash >> 8) % 2 == 0 else -1.0
            vec[pos] += sign * (1.0 + math.log(1.0 + len(word)))

            # Character 3-grams
            if len(word) >= 3:
                for c_i in range(len(word) - 2):
                    trigram = word[c_i:c_i+3]
                    t_hash = int(hashlib.sha256(trigram.encode("utf-8")).hexdigest(), 16)
                    t_pos = t_hash % self.dimension
                    t_sign = 1.0 if (t_hash >> 4) % 2 == 0 else -1.0
                    vec[t_pos] += t_sign * 0.5

            # Word bigrams
            if idx > 0:
                bigram = f"{words[idx-1]}_{word}"
                b_hash = int(hashlib.md5(bigram.encode("utf-8")).hexdigest(), 16)
                b_pos = b_hash % self.dimension
                b_sign = 1.0 if (b_hash >> 6) % 2 == 0 else -1.0
                vec[b_pos] += b_sign * 0.8

        # 2. L2 Normalization
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0.0:
            return [round(v / norm, 6) for v in vec]
        return [0.0] * self.dimension


class EmbeddingEngine:
    """
    Unified Embedding Engine with Ollama API integration, LRU caching, and Deterministic Fallback.
    """
    def __init__(
        self,
        ollama_url: str = settings.OLLAMA_BASE_URL,
        model_name: str = settings.DEFAULT_EMBEDDING_MODEL,
        cache_capacity: int = 5000,
    ):
        self.ollama_url = ollama_url.rstrip("/")
        self.model_name = model_name
        self.cache_capacity = cache_capacity
        self._cache: OrderedDict[str, List[float]] = OrderedDict()
        self._fallback_vectorizer = FastDeterministicVectorizer(dimension=VECTOR_DIMENSION)
        self._last_used_engine: str = "uninitialized"

    def _get_cache_key(self, text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def get_cached(self, text: str) -> Optional[List[float]]:
        key = self._get_cache_key(text)
        if key in self._cache:
            self._cache.move_to_end(key)
            return self._cache[key]
        return None

    def put_cache(self, text: str, vector: List[float]) -> None:
        key = self._get_cache_key(text)
        if key in self._cache:
            self._cache.move_to_end(key)
        else:
            if len(self._cache) >= self.cache_capacity:
                self._cache.popitem(last=False)
            self._cache[key] = vector

    async def get_embedding(self, text: str) -> List[float]:
        """
        Get 384-d normalized dense embedding for input text.
        """
        if not text or not text.strip():
            return [0.0] * VECTOR_DIMENSION

        # Check in-memory LRU cache
        cached = self.get_cached(text)
        if cached:
            return cached

        # Attempt Ollama embeddings endpoint
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{self.ollama_url}/api/embeddings",
                    json={
                        "model": self.model_name,
                        "prompt": text,
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    raw_emb = data.get("embedding", [])
                    if raw_emb:
                        # Normalize vector to target dimension (pad/trim & L2 normalize)
                        normalized_vec = self._normalize_dimension(raw_emb, VECTOR_DIMENSION)
                        self.put_cache(text, normalized_vec)
                        self._last_used_engine = f"ollama:{self.model_name}"
                        return normalized_vec
        except Exception:
            pass  # Fall back gracefully

        # Fallback to deterministic subword vectorizer
        fallback_vec = self._fallback_vectorizer.encode(text)
        self.put_cache(text, fallback_vec)
        self._last_used_engine = "deterministic_subword_fallback"
        return fallback_vec

    async def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts in batch.
        """
        embeddings: List[List[float]] = []
        for text in texts:
            emb = await self.get_embedding(text)
            embeddings.append(emb)
        return embeddings

    def _normalize_dimension(self, vector: List[float], target_dim: int) -> List[float]:
        if len(vector) > target_dim:
            vector = vector[:target_dim]
        elif len(vector) < target_dim:
            vector = vector + [0.0] * (target_dim - len(vector))

        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0.0:
            return [round(v / norm, 6) for v in vector]
        return vector

    def get_status(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "ollama_url": self.ollama_url,
            "cache_entries": len(self._cache),
            "cache_capacity": self.cache_capacity,
            "dimension": VECTOR_DIMENSION,
            "last_used_engine": self._last_used_engine,
        }


embedding_engine = EmbeddingEngine()
