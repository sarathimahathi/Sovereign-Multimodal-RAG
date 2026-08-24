import os
import json
import pytest
from unittest.mock import MagicMock
from rag.retrieval.filters import FilterBuilder
from rag.retrieval.sparse import SparseRetriever
from rag.retrieval.fusion import ReciprocalRankFusion
from rag.context.parent_context import ParentContextExpander
from rag.context.builder import ContextBuilder
from rag.citations.citation_builder import CitationBuilder
from rag.schemas.retrieval import RetrievalFilters, RetrievalResult
from rag.schemas.response import Citation

class TestFilterBuilder:
    def test_empty_filters(self):
        assert FilterBuilder.build_qdrant_filter(None) is None
        assert FilterBuilder.build_qdrant_filter(RetrievalFilters()) is None

    def test_standard_filters(self):
        f = RetrievalFilters(
            document_type="SOP",
            equipment_type="VALVE",
            equipment_id="V-204",
            revision="v2",
            department="operations",
            custom_filters={"status": "active"}
        )
        qfilter = FilterBuilder.build_qdrant_filter(f)
        assert qfilter is not None
        assert len(qfilter.must) == 6
        keys = [cond.key for cond in qfilter.must]
        assert "document_type" in keys
        assert "equipment_id" in keys
        assert "status" in keys


class TestSparseRetriever:
    def test_bm25_empty_candidates(self):
        sparse = SparseRetriever()
        res = sparse.search_over_corpus("query", [], top_k=5)
        assert res == []

    def test_bm25_ranking(self):
        sparse = SparseRetriever()
        docs = [
            RetrievalResult(chunk_id="c1", document_id="d1", filename="f1.pdf", page=1, section="s1", text="Pump motor oil temperature"),
            RetrievalResult(chunk_id="c2", document_id="d1", filename="f1.pdf", page=1, section="s2", text="Valve V-204 seal inspection pressure"),
            RetrievalResult(chunk_id="c3", document_id="d1", filename="f1.pdf", page=1, section="s3", text="Valve calibration test"),
        ]
        results = sparse.search_over_corpus("valve inspection", docs, top_k=2)
        assert len(results) == 2
        assert results[0].chunk_id == "c2"  # matches both "valve" and "inspection"
        assert results[0].sparse_score > results[1].sparse_score


class TestReciprocalRankFusion:
    def test_rrf_scoring_and_boosting(self):
        dense = [
            RetrievalResult(chunk_id="c1", document_id="d1", filename="f1.pdf", page=1, section="s1", text="Doc 1", dense_score=0.9),
            RetrievalResult(chunk_id="c2", document_id="d1", filename="f1.pdf", page=1, section="s2", text="Doc 2", dense_score=0.8),
        ]
        sparse = [
            RetrievalResult(chunk_id="c2", document_id="d1", filename="f1.pdf", page=1, section="s2", text="Doc 2", sparse_score=2.5),
            RetrievalResult(chunk_id="c3", document_id="d1", filename="f1.pdf", page=1, section="s3", text="Doc 3", sparse_score=1.5),
        ]

        fused = ReciprocalRankFusion.fuse(dense, sparse, k=60)
        # c2 appears at rank 1 in dense (1/62) and rank 0 in sparse (1/61), so c2 should be #1
        assert fused[0].chunk_id == "c2"
        expected_c2_score = (1.0 / (60 + 1 + 1)) + (1.0 / (60 + 0 + 1))
        assert abs(fused[0].fusion_score - expected_c2_score) < 1e-6
        assert len(fused) == 3


class TestContextAndCitations:
    def test_parent_context_expansion(self, tmp_path):
        storage_dir = str(tmp_path / "storage")
        os.makedirs(storage_dir, exist_ok=True)
        
        parent_data = {
            "p_sec_1": {"full_text": "Full parent section text with detailed instructions"}
        }
        with open(os.path.join(storage_dir, "DOC-001_parents.json"), "w", encoding="utf-8") as f:
            json.dump(parent_data, f)

        expander = ParentContextExpander(storage_dir=storage_dir)
        text = expander.get_parent_text("DOC-001", "p_sec_1")
        assert text == "Full parent section text with detailed instructions"

        # Missing parent
        assert expander.get_parent_text("DOC-001", "non_existent") is None
        assert expander.get_parent_text("NON_EXISTENT_DOC", "p_sec_1") is None

    def test_context_builder(self, tmp_path):
        expander = MagicMock()
        expander.get_parent_text.return_value = "Expanded parent section content."

        builder = ContextBuilder(expander)
        docs = [
            RetrievalResult(
                chunk_id="c1", document_id="DOC-1", parent_id="p1",
                filename="sop.pdf", page=1, section="1.0 Safety",
                text="Small chunk text"
            )
        ]

        # With expansion
        ctx = builder.build_context(docs, expand_parent=True)
        assert "--- SOURCE [1] ---" in ctx
        assert "DOCUMENT: sop.pdf" in ctx
        assert "PAGE: 1" in ctx
        assert "Expanded parent section content." in ctx

    def test_citation_builder(self):
        docs = [
            RetrievalResult(
                chunk_id="c1", document_id="DOC-1",
                filename="sop_valve.pdf", page=2, section="2.0 Maintenance",
                text="Short text"
            ),
            RetrievalResult(
                chunk_id="c2", document_id="DOC-2",
                filename="manual.pdf", page=5, section="3.0 Specs",
                text="A" * 250
            )
        ]
        citations = CitationBuilder.build_citations(docs)
        assert len(citations) == 2
        assert citations[0].citation_id == 1
        assert citations[0].document_title == "sop valve.pdf"
        assert citations[0].text_snippet == "Short text"
        assert citations[1].citation_id == 2
        assert citations[1].text_snippet.endswith("...")
