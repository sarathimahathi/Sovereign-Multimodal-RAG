import uuid
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from rag.config import config
from rag.schemas.chunk import Chunk
from rag.schemas.document import DocumentMetadata

class QdrantStore:
    def __init__(self, host: str = config.QDRANT_HOST, port: int = config.QDRANT_PORT):
        self.client = QdrantClient(host=host, port=port)
        self.collection_name = config.QDRANT_COLLECTION
        self.ensure_collection()

    def ensure_collection(self):
        collections = [c.name for c in self.client.get_collections().collections]
        if self.collection_name not in collections:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(
                    size=config.EMBEDDING_DIM,
                    distance=qmodels.Distance.COSINE
                )
            )

    def delete_document(self, document_id: str):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=qmodels.FilterSelector(
                filter=qmodels.Filter(
                    must=[qmodels.FieldCondition(key="document_id", match=qmodels.MatchValue(value=document_id))]
                )
            )
        )

    def check_document_hash_exists(self, sha256_hash: str) -> bool:
        res = self.client.scroll(
            collection_name=self.collection_name,
            scroll_filter=qmodels.Filter(
                must=[qmodels.FieldCondition(key="sha256_hash", match=qmodels.MatchValue(value=sha256_hash))]
            ),
            limit=1
        )
        return len(res[0]) > 0

    def upsert_chunks(self, chunks: List[Chunk], embeddings: List[List[float]], metadata: DocumentMetadata):
        points = []
        for idx, chunk in enumerate(chunks):
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk.chunk_id))
            payload = {
                "chunk_id": chunk.chunk_id,
                "document_id": chunk.document_id,
                "parent_id": chunk.parent_id,
                "filename": metadata.filename,
                "document_type": metadata.document_type,
                "title": metadata.title,
                "revision": metadata.revision,
                "equipment_type": metadata.equipment_type,
                "equipment_id": metadata.equipment_id,
                "department": metadata.department,
                "page": chunk.page,
                "section": chunk.section,
                "text": chunk.text,
                "equipment_tags": chunk.equipment_tags,
                "sha256_hash": metadata.sha256_hash,
                "metadata": chunk.metadata
            }
            points.append(qmodels.PointStruct(id=point_id, vector=embeddings[idx], payload=payload))

        self.client.upsert(collection_name=self.collection_name, points=points)
