import os
import fitz
import pytest
from rag.schemas.retrieval import RetrievalQuery, RetrievalFilters

def create_sample_pdf(filepath: str):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "VALVE INSPECTION PROCEDURE SOP-042", fontsize=14)
    page.insert_text((50, 110), "Equipment: Valve V-204\n1.0 Inspection Procedure\nInspect the seal seat for cavitation and pressure drop every 90 operating days.", fontsize=11)
    doc.save(filepath)
    doc.close()

def test_full_pipeline_workflow(isolated_pipeline, tmp_path):
    ingestion_engine, rag_engine = isolated_pipeline
    pdf_path = str(tmp_path / "sample_valve_inspection.pdf")
    create_sample_pdf(pdf_path)

    # 1. Test Ingestion
    ingest_res = ingestion_engine.ingest_file(
        pdf_path,
        {"document_id": "SOP-042", "document_type": "SOP", "equipment_id": "V-204", "revision": "v3"}
    )
    assert ingest_res["status"] == "SUCCESS"
    assert ingest_res["document_id"] == "SOP-042"
    assert ingest_res["chunks_indexed"] > 0

    # 2. Test Duplicate Ingestion Hash Gate
    dup_res = ingestion_engine.ingest_file(pdf_path)
    assert dup_res["status"] == "SKIPPED"
    assert "Duplicate" in dup_res["reason"]

    # 3. Test Hybrid Retrieval + Cross-Encoder Rerank
    query = RetrievalQuery(
        query="What is the inspection procedure for valve V-204?",
        filters=RetrievalFilters(equipment_id="V-204")
    )
    resp = rag_engine.execute(query)

    assert resp.grounded is True
    assert len(resp.sources) > 0
    assert resp.sources[0].filename == "sample_valve_inspection.pdf"
    assert "V-204" in resp.context_used
    assert resp.confidence > 0.5

def test_abstention_behavior(isolated_pipeline):
    _, rag_engine = isolated_pipeline
    query = RetrievalQuery(
        query="Unrelated query regarding alien propulsion systems on Mars."
    )
    resp = rag_engine.execute(query)
    assert resp.grounded is False
    assert resp.confidence == 0.0
    assert "sufficient evidence" in resp.answer.lower()
