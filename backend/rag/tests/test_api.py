import io
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from rag.api.routes import router
from rag.schemas.response import RAGResponse, RetrievalStats, Citation
from rag.config import config

@pytest.fixture
def api_client():
    app = FastAPI(title="Industrial RAG API")
    app.include_router(router)
    return TestClient(app)

class TestRAGApiEndpoints:
    def test_health_check_success(self, api_client):
        """Test GET /rag/health returns status and air_gapped flag."""
        response = api_client.get("/rag/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "HEALTHY"
        assert "air_gapped" in data
        assert isinstance(data["air_gapped"], bool)

    def test_query_endpoint_success(self, api_client):
        """Test POST /rag/query with a valid payload."""
        with patch("rag.api.routes.retriever.execute") as mock_execute:
            mock_execute.return_value = RAGResponse(
                query="What is the inspection procedure for valve V-204?",
                answer="Inspect seal seat for cavitation.",
                sources=[
                    Citation(
                        citation_id=1,
                        document_id="SOP-042",
                        document_title="SOP-042 Valve Manual",
                        filename="SOP-042.pdf",
                        page=1,
                        section="1.0 Inspection",
                        chunk_id="SOP-042_c0",
                        text_snippet="Inspect seal seat for cavitation..."
                    )
                ],
                retrieval=RetrievalStats(
                    strategy="hybrid_rrf_rerank",
                    dense_results_count=10,
                    sparse_results_count=10,
                    fused_results_count=10,
                    reranked_results_count=5,
                    latency_ms={"retrieval_ms": 15.2, "reranking_ms": 5.1}
                ),
                confidence=0.92,
                grounded=True,
                context_used="Inspect seal seat for cavitation."
            )

            payload = {
                "query": "What is the inspection procedure for valve V-204?",
                "top_k": 20,
                "rerank_top_k": 5,
                "filters": {
                    "equipment_id": "V-204",
                    "document_type": "SOP"
                },
                "expand_parent_context": True
            }

            response = api_client.post("/rag/query", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["grounded"] is True
            assert data["confidence"] == 0.92
            assert len(data["sources"]) == 1
            assert data["sources"][0]["document_id"] == "SOP-042"
            assert "hybrid_rrf_rerank" in data["retrieval"]["strategy"]

    def test_query_endpoint_abstention(self, api_client):
        """Test POST /rag/query returns ungrounded response on low confidence."""
        with patch("rag.api.routes.retriever.execute") as mock_execute:
            mock_execute.return_value = RAGResponse(
                query="Unknown out-of-domain topic",
                answer="I could not find sufficient evidence in the indexed documents to answer this question.",
                sources=[],
                retrieval=RetrievalStats(
                    strategy="hybrid_rrf_rerank",
                    dense_results_count=0,
                    sparse_results_count=0,
                    fused_results_count=0,
                    reranked_results_count=0,
                    latency_ms={}
                ),
                confidence=0.0,
                grounded=False,
                context_used=""
            )

            response = api_client.post("/rag/query", json={"query": "Unknown out-of-domain topic"})
            assert response.status_code == 200
            data = response.json()
            assert data["grounded"] is False
            assert data["confidence"] == 0.0
            assert len(data["sources"]) == 0

    def test_query_endpoint_validation_error(self, api_client):
        """Test POST /rag/query returns 422 on invalid missing query field."""
        response = api_client.post("/rag/query", json={"invalid_field": "test"})
        assert response.status_code == 422

    def test_ingest_endpoint_success(self, api_client, tmp_path):
        """Test POST /rag/ingest with valid file upload and metadata form fields."""
        with patch("rag.api.routes.ingestor.ingest_file") as mock_ingest:
            mock_ingest.return_value = {
                "status": "SUCCESS",
                "document_id": "SOP-042",
                "filename": "SOP-042_Valve_Procedure.pdf",
                "total_pages": 3,
                "chunks_indexed": 12
            }

            fake_file = io.BytesIO(b"%PDF-1.4 dummy pdf content for ingestion testing")
            response = api_client.post(
                "/rag/ingest",
                files={"file": ("SOP-042_Valve_Procedure.pdf", fake_file, "application/pdf")},
                data={
                    "document_type": "SOP",
                    "equipment_id": "V-204",
                    "revision": "v3"
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "SUCCESS"
            assert data["document_id"] == "SOP-042"
            assert data["chunks_indexed"] == 12

    def test_ingest_endpoint_duplicate_skip(self, api_client):
        """Test POST /rag/ingest returns SKIPPED status for duplicate uploads."""
        with patch("rag.api.routes.ingestor.ingest_file") as mock_ingest:
            mock_ingest.return_value = {
                "status": "SKIPPED",
                "reason": "Duplicate content detected via SHA-256 hash match.",
                "document_id": "SOP-042"
            }

            fake_file = io.BytesIO(b"duplicate file content")
            response = api_client.post(
                "/rag/ingest",
                files={"file": ("duplicate.txt", fake_file, "text/plain")},
                data={"document_type": "MANUAL"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "SKIPPED"
            assert "Duplicate" in data["reason"]

    def test_ingest_endpoint_missing_file(self, api_client):
        """Test POST /rag/ingest returns 422 when file parameter is missing."""
        response = api_client.post(
            "/rag/ingest",
            data={"document_type": "SOP"}
        )
        assert response.status_code == 422
