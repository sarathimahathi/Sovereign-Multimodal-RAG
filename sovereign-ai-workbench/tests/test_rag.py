"""
Automated Integration & Unit Test Suite for Phase 5: Hybrid RAG Engine.
Tests Chunking, Dual-Mode Embeddings, BM25 Indexing, Qdrant Vector Store, Reciprocal Rank Fusion, and Grounded Citations.
"""

import pytest
from httpx import AsyncClient
from rag.chunking import semantic_chunker, industrial_chunker, extract_industrial_tags
from rag.embeddings import embedding_engine, cosine_similarity, VECTOR_DIMENSION
from rag.bm25 import bm25_index
from rag.vector_store import vector_store
from rag.hybrid_retriever import hybrid_retriever
from rag.engine import rag_engine


def test_industrial_tag_extraction_and_chunking():
    """
    Verify industrial equipment tag extraction (e.g. PV-401A, API 520, ISO-9001) and Markdown table preservation.
    """
    raw_doc = (
        "# Crude Distillation Unit Operating Manual\n\n"
        "Pressure safety valve TAG #PV-401A is rated for 150 psig in accordance with standard API 520.\n"
        "Temperature controller TIC-204 maintains top tower temperature at 165 C.\n\n"
        "| Component | Tag | Design Pressure | Standard |\n"
        "| :--- | :--- | :--- | :--- |\n"
        "| Tower Column | C-101 | 250 psig | ASME Section VIII |\n"
        "| Reboiler | E-102 | 180 psig | TEMA Class R |\n"
    )

    tags = extract_industrial_tags(raw_doc)
    assert "PV-401A" in tags or any("PV-401A" in t for t in tags)
    assert any("520" in t for t in tags)

    chunks = industrial_chunker.chunk_text(raw_doc, filename="unit_manual.md")
    assert len(chunks) >= 2
    # Ensure markdown table was captured as a structured block
    table_chunks = [c for c in chunks if "|" in c.text]
    assert len(table_chunks) >= 1
    assert table_chunks[0].section_title == "Structured Table / Code"


@pytest.mark.asyncio
async def test_embedding_engine_and_deterministic_fallback():
    """
    Verify 384-dimensional dense embedding generation and in-memory LRU caching.
    """
    text = "Heavy naphtha stabilization column reflux ratio calculation."
    vec1 = await embedding_engine.get_embedding(text)
    assert len(vec1) == VECTOR_DIMENSION
    assert any(v != 0.0 for v in vec1)

    # Test LRU cache hit
    vec2 = await embedding_engine.get_embedding(text)
    assert vec1 == vec2

    # Test cosine similarity
    similar_text = "Naphtha stabilization reflux column calculations."
    vec_sim = await embedding_engine.get_embedding(similar_text)
    sim_score = cosine_similarity(vec1, vec_sim)
    assert sim_score > 0.30

    different_text = "Quarterly financial invoice for legal consultation fees."
    vec_diff = await embedding_engine.get_embedding(different_text)
    diff_score = cosine_similarity(vec1, vec_diff)
    assert sim_score > diff_score


def test_bm25_sparse_keyword_indexing():
    """
    Verify BM25 sparse keyword ranking and exact tag matching.
    """
    bm25_index.add_document(
        doc_id="doc_alpha",
        text="Relief valve PV-401A set point is 150 psig in Crude Unit.",
        session_id="test_sess"
    )
    bm25_index.add_document(
        doc_id="doc_beta",
        text="Centrifugal pump P-101B mechanical seal inspection checklist.",
        session_id="test_sess"
    )

    # Query targeting PV-401A
    results = bm25_index.search("PV-401A set pressure", session_id="test_sess", top_k=5)
    assert len(results) >= 1
    top_doc_id, top_score, _ = results[0]
    assert top_doc_id == "doc_alpha"
    assert top_score > 0.0


@pytest.mark.asyncio
async def test_vector_store_operations_and_fallback():
    """
    Verify dense vector insertion and search in Vector Store.
    """
    test_collection = "test_sovereign_rag"
    v1 = await embedding_engine.get_embedding("Emergency shutdown protocol for cooling water failure.")
    v2 = await embedding_engine.get_embedding("Standard operating procedure for daily boiler blowdown.")

    points = [
        {"id": "pt_1", "vector": v1, "payload": {"text": "Cooling water ESD protocol", "session_id": "s_1"}},
        {"id": "pt_2", "vector": v2, "payload": {"text": "Boiler blowdown SOP", "session_id": "s_1"}},
    ]

    upserted = await vector_store.upsert_points(points, collection_name=test_collection)
    assert upserted == 2

    query_v = await embedding_engine.get_embedding("What is the emergency shutdown procedure for cooling system?")
    hits = await vector_store.search(query_v, session_id="s_1", top_k=2, collection_name=test_collection)
    assert len(hits) >= 1
    assert hits[0]["id"] == "pt_1"
    assert hits[0]["score"] > 0.40


@pytest.mark.asyncio
async def test_rag_api_endpoints_ingest_and_query(async_client: AsyncClient):
    """
    Verify /api/rag/ingest and /api/rag/query API endpoints with Hybrid RRF and Citations.
    """
    # 1. Ingest document
    spec_text = (
        "Refinery Unit 4 Technical Specification:\n"
        "Main flare header size is 36 inches schedule 40 carbon steel (ASTM A106 Grade B).\n"
        "Maximum allowable working pressure (MAWP) for vessel V-402 is 12.5 bar gauge at 200 C.\n"
        "Safety interlock I-401 triggers immediate shutdown if column bottom pressure exceeds 14.0 bar."
    )

    ingest_res = await async_client.post(
        "/api/rag/ingest",
        json={
            "text": spec_text,
            "filename": "Unit4_Piping_Spec.docx",
            "session_id": "session_rag_demo",
            "chunk_size": 300,
            "chunk_overlap": 50
        }
    )
    assert ingest_res.status_code == 200
    ingest_data = ingest_res.json()
    assert ingest_data["status"] == "success"
    assert ingest_data["chunks_ingested"] >= 1
    assert ingest_data["vector_points_upserted"] >= 1

    # 2. Query in Hybrid Mode
    query_res = await async_client.post(
        "/api/rag/query",
        json={
            "query": "What is the MAWP for vessel V-402?",
            "session_id": "session_rag_demo",
            "mode": "hybrid",
            "top_k": 3,
            "dense_weight": 0.6,
            "sparse_weight": 0.4
        }
    )
    assert query_res.status_code == 200
    query_data = query_res.json()
    assert query_data["mode"] == "hybrid"
    assert len(query_data["results"]) >= 1
    top_hit = query_data["results"][0]
    assert "V-402" in top_hit["text"] or "MAWP" in top_hit["text"]
    assert top_hit["relevance_score"] > 0.0
    assert len(query_data["citations"]) >= 1

    # 3. Query with Grounded Answer Synthesis
    synthesis_res = await async_client.post(
        "/api/rag/query",
        json={
            "query": "Specify the maximum allowable pressure for vessel V-402.",
            "session_id": "session_rag_demo",
            "synthesize_answer": True,
            "top_k": 2
        }
    )
    assert synthesis_res.status_code == 200
    synth_data = synthesis_res.json()
    assert "answer" in synth_data
    assert len(synth_data["answer"]) > 0
    assert synth_data["is_air_gapped"] is True

    # 4. Status Check Endpoint
    status_res = await async_client.get("/api/rag/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "operational"
    assert "vector_store" in status_data
    assert "bm25_index" in status_data

    # 5. List chunks endpoint
    chunks_res = await async_client.get("/api/rag/chunks?session_id=session_rag_demo")
    assert chunks_res.status_code == 200
    chunks_data = chunks_res.json()
    assert chunks_data["total"] >= 1
