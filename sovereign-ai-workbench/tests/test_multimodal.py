"""
Automated Integration & Unit Test Suite for Phase 7: Multimodal Processing.
Tests Document Layout Parsing, OCR Extraction, Table Processing, and Direct RAG Indexing.
"""

import base64
import pytest
from httpx import AsyncClient
from multimodal.layout_parser import layout_parser, extract_engineering_tags
from multimodal.table_extractor import table_extractor
from multimodal.ocr_engine import ocr_engine
from multimodal.engine import multimodal_processor


def test_document_layout_parser_and_tag_extraction():
    """
    Verify document layout parser classifies headers, tables, key-values, and detects industrial tags.
    """
    sample_doc = (
        "# Crude Stabilizer Unit (CDU-4) Technical Data Sheet\n\n"
        "The stabilizer overhead column operates at 8.5 bar gauge under steady reflux.\n\n"
        "Tag: PV-401A\n"
        "Service: Reflux Drum Overpressure Relief\n"
        "Design Standard: API 520 / ASME Section VIII\n\n"
        "| Tag | Equipment | MAWP | Design Temp |\n"
        "| :--- | :--- | :--- | :--- |\n"
        "| V-401 | Reflux Vessel | 165 psig | 220 C |\n"
        "| V-402 | Stabilizer Column | 12.5 bar g | 250 C |\n"
    )

    layout = layout_parser.parse_text_layout(sample_doc, filename="cdu4_datasheet.md")
    assert layout.total_pages >= 1
    assert len(layout.segments) >= 3
    assert layout.tables_count >= 1

    # Verify segment types
    seg_types = [s.segment_type for s in layout.segments]
    assert "HEADER" in seg_types
    assert "TABLE" in seg_types
    assert "KEY_VALUE_PAIR" in seg_types or "PARAGRAPH" in seg_types

    # Verify engineering tags
    assert "PV-401A" in layout.tags_detected or any("PV-401A" in t for t in layout.tags_detected)
    assert any("520" in t for t in layout.tags_detected)


def test_table_extractor_json_and_csv():
    """
    Verify TableExtractor converts Markdown table into structured JSON records and CSV.
    """
    table_text = (
        "| Equipment | Tag | Set Pressure | Standard |\n"
        "| :--- | :--- | :--- | :--- |\n"
        "| Safety Valve | PV-401A | 150 | API 520 |\n"
        "| Blowdown Valve | BDV-102 | 300 | ASME B31.3 |\n"
    )

    tables = table_extractor.extract_tables(table_text)
    assert len(tables) == 1
    table = tables[0]
    assert table.headers == ["Equipment", "Tag", "Set Pressure", "Standard"]
    assert table.row_count == 2
    assert table.column_count == 4

    # Verify JSON records
    assert len(table.json_records) == 2
    assert table.json_records[0]["Tag"] == "PV-401A"
    assert table.json_records[0]["Set Pressure"] == 150

    # Verify CSV format
    assert "Safety Valve,PV-401A,150,API 520" in table.csv_content


@pytest.mark.asyncio
async def test_ocr_engine_rasterizer():
    """
    Verify OCR Engine extracts text and equipment tags from raster image bytes.
    """
    dummy_image_bytes = b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
    ocr_res = await ocr_engine.ocr_image(
        image_bytes=dummy_image_bytes,
        filename="scanned_pid_drawing.png"
    )

    assert len(ocr_res.text) > 0
    assert ocr_res.confidence >= 0.90
    assert len(ocr_res.tags_found) >= 1
    assert ocr_res.is_air_gapped is True


@pytest.mark.asyncio
async def test_multimodal_api_endpoints(async_client: AsyncClient):
    """
    Verify /api/multimodal/parse, /api/multimodal/extract-tables, and /api/multimodal/status endpoints.
    """
    sample_text = (
        "# Unit 4 Piping & Instrumentation Diagram\n\n"
        "Centrifugal pump TAG #P-401A operates with suction pressure 45 psig.\n\n"
        "| Tag | Equipment | Suction | Discharge |\n"
        "| :--- | :--- | :--- | :--- |\n"
        "| P-401A | Main Feed Pump | 45 psig | 380 psig |\n"
    )

    # 1. Parse Endpoint
    parse_res = await async_client.post(
        "/api/multimodal/parse",
        json={
            "text_content": sample_text,
            "filename": "P_AND_ID_01.md",
            "mime_type": "text/markdown",
            "auto_index_to_rag": True,
            "session_id": "test_multimodal_sess"
        }
    )
    assert parse_res.status_code == 200
    parse_data = parse_res.json()
    assert parse_data["filename"] == "P_AND_ID_01.md"
    assert parse_data["total_segments"] >= 2
    assert parse_data["tables_count"] == 1
    assert "P-401A" in parse_data["tags_detected"] or any("P-401A" in t for t in parse_data["tags_detected"])
    assert parse_data["rag_ingestion"] is not None

    # 2. Extract Tables Endpoint
    tables_res = await async_client.post(
        "/api/multimodal/extract-tables",
        json={"text": sample_text}
    )
    assert tables_res.status_code == 200
    tables_data = tables_res.json()
    assert tables_data["tables_count"] == 1
    assert tables_data["tables"][0]["headers"] == ["Tag", "Equipment", "Suction", "Discharge"]

    # 3. Status Endpoint
    status_res = await async_client.get("/api/multimodal/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "operational"
    assert status_data["features"]["table_to_json_csv"] is True
    assert status_data["features"]["p_and_id_tag_detection"] is True
