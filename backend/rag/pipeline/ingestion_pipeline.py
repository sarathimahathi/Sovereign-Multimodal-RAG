import os
import json
from typing import Dict, Any, Optional
from rag.ingestion.registry import LoaderRegistry
from rag.processing.metadata import MetadataExtractor
from rag.processing.chunker import HierarchicalChunker
from rag.embeddings.embedder import LocalEmbeddingService
from rag.vectorstore.qdrant_client import QdrantStore
from rag.schemas.document import Document
from rag.config import config

class IngestionPipeline:
    def __init__(self):
        self.registry = LoaderRegistry()
        self.chunker = HierarchicalChunker()
        self.embedder = LocalEmbeddingService.get_instance()
        self.store = QdrantStore()
        os.makedirs(config.STORAGE_DIR, exist_ok=True)

    def ingest_file(self, file_path: str, override_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        filename = os.path.basename(file_path)
        meta = MetadataExtractor.extract_metadata(file_path, filename, override_metadata)

        # Duplicate hash detection
        if self.store.check_document_hash_exists(meta.sha256_hash):
            return {
                "status": "SKIPPED",
                "reason": "Duplicate content detected via SHA-256 hash match.",
                "document_id": meta.document_id
            }

        # Clear existing revisions of this document ID if it changed
        self.store.delete_document(meta.document_id)

        loader = self.registry.get_loader(file_path)
        pages = loader.load(file_path)

        chunks, parents = self.chunker.chunk(meta.document_id, pages)

        # Cache parent chunks locally for context expansion
        parent_map = {p.parent_id: p.dict() for p in parents}
        with open(os.path.join(config.STORAGE_DIR, f"{meta.document_id}_parents.json"), "w", encoding="utf-8") as f:
            json.dump(parent_map, f)

        # Generate embeddings in batch and upsert to Qdrant
        if chunks:
            chunk_texts = [c.text for c in chunks]
            embeddings = self.embedder.embed_batch(chunk_texts)
            self.store.upsert_chunks(chunks, embeddings, meta)

        return {
            "status": "SUCCESS",
            "document_id": meta.document_id,
            "filename": meta.filename,
            "total_pages": len(pages),
            "chunks_indexed": len(chunks)
        }
