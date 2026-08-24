import os
import json
import pytest
from unittest.mock import MagicMock, patch

from rag.agent_interface import RAGTool
from rag.multimodal_interface import MultimodalIngestAdapter
from rag.schemas.response import RAGResponse, RetrievalStats

class TestAgentInterface:
    def test_rag_tool_search(self):
        with patch("rag.agent_interface.RAGPipeline") as mock_pipeline_cls:
            mock_pipeline = MagicMock()
            mock_response = RAGResponse(
                query="Check valve pressure",
                answer="Nominal pressure is 15 bar.",
                sources=[],
                retrieval=RetrievalStats(
                    strategy="hybrid_rrf_rerank",
                    dense_results_count=1,
                    sparse_results_count=1,
                    fused_results_count=1,
                    reranked_results_count=1,
                    latency_ms={}
                ),
                confidence=0.95,
                grounded=True,
                context_used="Nominal pressure is 15 bar."
            )
            mock_pipeline.execute.return_value = mock_response
            mock_pipeline_cls.return_value = mock_pipeline

            tool = RAGTool()
            res = tool.search("Check valve pressure", filters={"equipment_id": "V-204"}, top_k=3)

            assert res.grounded is True
            assert res.confidence == 0.95
            assert mock_pipeline.execute.called


class TestMultimodalInterface:
    def test_adapt_multimodal_page(self):
        sample_page_data = {
            "page": 2,
            "text": "P&ID diagram showing pressure transmitter PT-101",
            "content_type": "scanned_pdf",
            "objects": [
                {
                    "label": "transmitter",
                    "type": "instrument",
                    "bounding_box": [100.0, 150.0, 250.0, 300.0],
                    "confidence": 0.98
                }
            ]
        }

        page_content = MultimodalIngestAdapter.adapt_multimodal_page(sample_page_data)
        assert page_content.page_number == 2
        assert "PT-101" in page_content.text
        assert len(page_content.multimodal_objects) == 1
        assert page_content.multimodal_objects[0].label == "transmitter"
        assert page_content.multimodal_objects[0].confidence == 0.98
        assert page_content.metadata["content_type"] == "scanned_pdf"


class TestEvaluationLogic:
    def test_evaluation_metric_computation(self, tmp_path):
        from rag.evaluation.evaluate import run_evaluation
        
        benchmarks = [
            {"query": "Valve inspection", "expected_document_id": "SOP-042"}
        ]
        bench_file = tmp_path / "evaluation_data.json"
        bench_file.write_text(json.dumps(benchmarks), encoding="utf-8")

        with patch("rag.evaluation.evaluate.RAGPipeline") as mock_pipeline_cls, \
             patch("builtins.open", MagicMock(return_value=open(str(bench_file), "r", encoding="utf-8"))):
            
            mock_pipeline = MagicMock()
            mock_response = MagicMock()
            mock_citation = MagicMock()
            mock_citation.document_id = "SOP-042"
            mock_citation.filename = "SOP-042.pdf"
            mock_response.sources = [mock_citation]
            mock_pipeline.execute.return_value = mock_response
            mock_pipeline_cls.return_value = mock_pipeline

            # Should run without error
            run_evaluation()
