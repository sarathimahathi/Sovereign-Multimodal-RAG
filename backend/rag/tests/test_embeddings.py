import pytest
import numpy as np
from unittest.mock import MagicMock, patch
from rag.embeddings.embedder import LocalEmbeddingService
from rag.config import config

class TestEmbeddingService:
    def test_singleton_instance(self):
        with patch("rag.embeddings.embedder.SentenceTransformer") as mock_st:
            LocalEmbeddingService._instance = None
            inst1 = LocalEmbeddingService.get_instance()
            inst2 = LocalEmbeddingService.get_instance()
            assert inst1 is inst2

    def test_embed_text_dimension_and_normalization(self):
        with patch("rag.embeddings.embedder.SentenceTransformer") as mock_st:
            LocalEmbeddingService._instance = None
            # Return normalized dummy embedding
            dummy_vec = np.random.randn(config.EMBEDDING_DIM)
            dummy_vec = dummy_vec / np.linalg.norm(dummy_vec)
            
            mock_model = MagicMock()
            mock_model.encode.return_value = dummy_vec
            mock_st.return_value = mock_model

            service = LocalEmbeddingService("dummy-model")
            vec = service.embed_text("Sample valve maintenance text")

            assert isinstance(vec, list)
            assert len(vec) == config.EMBEDDING_DIM
            norm = sum(x * x for x in vec) ** 0.5
            assert abs(norm - 1.0) < 1e-4

    def test_embed_batch_handling(self):
        with patch("rag.embeddings.embedder.SentenceTransformer") as mock_st:
            LocalEmbeddingService._instance = None
            mock_model = MagicMock()
            
            # Batch of 3
            batch_vecs = np.random.randn(3, config.EMBEDDING_DIM)
            mock_model.encode.return_value = batch_vecs
            mock_st.return_value = mock_model

            service = LocalEmbeddingService("dummy-model")
            
            # Non-empty batch
            res = service.embed_batch(["text1", "text2", "text3"])
            assert len(res) == 3
            assert len(res[0]) == config.EMBEDDING_DIM

            # Empty batch
            empty_res = service.embed_batch([])
            assert empty_res == []
