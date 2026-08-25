"""
Automated tests for Document Upload, SHA-256 Hashing, and Storage.
"""

import io
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_document_upload_and_deduplication(async_client: AsyncClient):
    """
    Test uploading an industrial document, checking SHA-256 hash, and verifying duplicate detection.
    """
    file_content = b"CRITICAL REFINERY VALVE SPECIFICATION - TAG #PV-401A\nMaterial: Duplex 2205"
    files = {"file": ("refinery_valve_spec.txt", io.BytesIO(file_content), "text/plain")}
    data = {"classification": "CONFIDENTIAL - REFINERY OPERATIONS"}

    # 1. First upload
    response = await async_client.post("/api/documents/upload", files=files, data=data)
    assert response.status_code == 201
    doc1 = response.json()
    assert doc1["original_filename"] == "refinery_valve_spec.txt"
    assert doc1["file_type"] == "code" or doc1["file_type"] == "document"
    assert "sha256_hash" in doc1
    assert len(doc1["sha256_hash"]) == 64
    assert doc1["file_size_bytes"] == len(file_content)

    # 2. Duplicate upload test with identical content
    files_dup = {"file": ("refinery_valve_spec_copy.txt", io.BytesIO(file_content), "text/plain")}
    response_dup = await async_client.post("/api/documents/upload", files=files_dup, data=data)
    assert response_dup.status_code == 201
    doc2 = response_dup.json()
    # Must return identical record ID and hash
    assert doc2["id"] == doc1["id"]
    assert doc2["sha256_hash"] == doc1["sha256_hash"]

    # 3. List documents
    list_res = await async_client.get("/api/documents")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1

    # 4. Download file
    download_res = await async_client.get(f"/api/documents/{doc1['id']}/download")
    assert download_res.status_code == 200
    assert download_res.content == file_content

    # 5. Delete document
    del_res = await async_client.delete(f"/api/documents/{doc1['id']}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"
