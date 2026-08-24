import pytest
from unittest.mock import MagicMock, patch
from rag.reranking.reranker import LocalReranker
from rag.schemas.retrieval import RetrievalResult

class TestLocalReranker:
    def test_singleton_pattern(self):
        with patch("rag.reranking.reranker.CrossEncoder") as mock_ce:
            LocalReranker._instance = None
            inst1 = LocalReranker.get_instance()
            inst2 = LocalReranker.get_instance()
            assert inst1 is inst2

    def test_empty_documents_rerank(self):
        with patch("rag.reranking.reranker.CrossEncoder") as mock_ce:
            LocalReranker._instance = None
            reranker = LocalReranker("dummy-model")
            res = reranker.rerank(query="test query", documents=[], top_k=5)
            assert res == []

    def test_rerank_scoring_and_sorting(self):
        with patch("rag.reranking.reranker.CrossEncoder") as mock_ce:
            LocalReranker._instance = None
            mock_model = MagicMock()
            # 3 documents with scores: doc0 -> 1.2, doc1 -> 5.8, doc2 -> -0.5
            mock_model.predict.return_value = [1.2, 5.8, -0.5]
            mock_ce.return_value = mock_model

            reranker = LocalReranker("dummy-model")

            docs = [
                RetrievalResult(chunk_id="c0", document_id="d1", filename="f1.pdf", page=1, section="s1", text="Medium match"),
                RetrievalResult(chunk_id="c1", document_id="d1", filename="f1.pdf", page=1, section="s2", text="Best match"),
                RetrievalResult(chunk_id="c2", document_id="d1", filename="f1.pdf", page=1, section="s3", text="Poor match"),
            ]

            results = reranker.rerank(query="Find best match", documents=docs, top_k=2)

            assert len(results) == 2
            assert results[0].chunk_id == "c1"
            assert results[0].rerank_score == 5.8
            assert results[1].chunk_id == "c0"
            assert results[1].rerank_score == 1.2
