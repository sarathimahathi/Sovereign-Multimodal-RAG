"""
Dual-Mode Vector Store for Sovereign AI Workbench.
Connects to Qdrant Vector DB with automatic zero-config In-Memory Cosine Similarity Store fallback.
"""

import httpx
from typing import List, Dict, Any, Optional, Tuple
from backend.app.core.config import settings
from backend.app.core.logging import get_logger
from .embeddings import cosine_similarity, VECTOR_DIMENSION

logger = get_logger("sovereign_workbench.rag.vector_store")


class LocalCosineVectorStore:
    """
    In-memory vector store with cosine distance ranking and metadata filtering.
    Zero external dependencies, ideal for air-gapped and local dev runs.
    """
    def __init__(self):
        # collection_name -> {point_id -> (vector, payload)}
        self._collections: Dict[str, Dict[str, Tuple[List[float], Dict[str, Any]]]] = {}

    def ensure_collection(self, collection_name: str) -> None:
        if collection_name not in self._collections:
            self._collections[collection_name] = {}

    def upsert_points(
        self,
        collection_name: str,
        points: List[Dict[str, Any]]
    ) -> int:
        self.ensure_collection(collection_name)
        count = 0
        for p in points:
            p_id = str(p["id"])
            vector = p["vector"]
            payload = p.get("payload", {})
            self._collections[collection_name][p_id] = (vector, payload)
            count += 1
        return count

    def search(
        self,
        collection_name: str,
        query_vector: List[float],
        session_id: Optional[str] = None,
        top_k: int = 10,
        score_threshold: float = 0.0
    ) -> List[Dict[str, Any]]:
        self.ensure_collection(collection_name)
        points = self._collections[collection_name]
        results = []

        for p_id, (vector, payload) in points.items():
            if session_id and payload.get("session_id") not in (session_id, "global", None):
                continue

            sim = cosine_similarity(query_vector, vector)
            if sim >= score_threshold:
                results.append({
                    "id": p_id,
                    "score": round(sim, 4),
                    "payload": payload
                })

        # Sort descending by cosine similarity score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def delete_by_session(self, collection_name: str, session_id: str) -> int:
        self.ensure_collection(collection_name)
        to_delete = [
            p_id for p_id, (_, payload) in self._collections[collection_name].items()
            if payload.get("session_id") == session_id
        ]
        for p_id in to_delete:
            del self._collections[collection_name][p_id]
        return len(to_delete)

    def count_points(self, collection_name: str) -> int:
        return len(self._collections.get(collection_name, {}))

    def get_all_points(self, collection_name: str) -> List[Dict[str, Any]]:
        self.ensure_collection(collection_name)
        return [
            {"id": p_id, "payload": payload}
            for p_id, (_, payload) in self._collections[collection_name].items()
        ]


class QdrantVectorStore:
    """
    Unified Vector Store manager. Tries Qdrant REST API, gracefully falls back to LocalCosineVectorStore.
    """
    DEFAULT_COLLECTION = "sovereign_knowledge_base"

    def __init__(self, qdrant_url: str = settings.QDRANT_URL):
        self.qdrant_url = qdrant_url.rstrip("/")
        self.local_fallback = LocalCosineVectorStore()
        self._is_qdrant_online = False
        self._last_checked_time = 0

    async def check_qdrant_connection(self) -> bool:
        """
        Ping Qdrant REST health endpoint.
        """
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.qdrant_url}/healthz")
                self._is_qdrant_online = (res.status_code == 200)
                return self._is_qdrant_online
        except Exception:
            self._is_qdrant_online = False
            return False

    async def ensure_collection(self, collection_name: str = DEFAULT_COLLECTION) -> None:
        """
        Create collection in Qdrant or initialize local fallback.
        """
        self.local_fallback.ensure_collection(collection_name)
        is_online = await self.check_qdrant_connection()
        if not is_online:
            return

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                # Check if collection exists
                res = await client.get(f"{self.qdrant_url}/collections/{collection_name}")
                if res.status_code != 200:
                    # Create collection
                    payload = {
                        "vectors": {
                            "size": VECTOR_DIMENSION,
                            "distance": "Cosine"
                        }
                    }
                    await client.put(f"{self.qdrant_url}/collections/{collection_name}", json=payload)
                    logger.info(f"Qdrant collection '{collection_name}' created.")
        except Exception as e:
            logger.warning(f"Failed to ensure Qdrant collection: {e}. Utilizing local fallback.")

    async def upsert_points(
        self,
        points: List[Dict[str, Any]],
        collection_name: str = DEFAULT_COLLECTION
    ) -> int:
        """
        Upsert vector points with payload into Qdrant and local fallback.
        Each point format: {"id": str, "vector": List[float], "payload": dict}
        """
        # Always maintain in local fallback
        fallback_count = self.local_fallback.upsert_points(collection_name, points)

        is_online = await self.check_qdrant_connection()
        if not is_online or not points:
            return fallback_count

        try:
            # Prepare batch for Qdrant API
            qdrant_payload = {
                "points": [
                    {
                        "id": p["id"],
                        "vector": p["vector"],
                        "payload": p.get("payload", {})
                    }
                    for p in points
                ]
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.put(
                    f"{self.qdrant_url}/collections/{collection_name}/points?wait=true",
                    json=qdrant_payload
                )
                if res.status_code == 200:
                    return len(points)
        except Exception as e:
            logger.warning(f"Qdrant upsert failed: {e}. Saved in local fallback.")

        return fallback_count

    async def search(
        self,
        query_vector: List[float],
        session_id: Optional[str] = None,
        top_k: int = 10,
        score_threshold: float = 0.0,
        collection_name: str = DEFAULT_COLLECTION
    ) -> List[Dict[str, Any]]:
        """
        Execute dense vector search against Qdrant, falling back to local cosine store.
        """
        is_online = await self.check_qdrant_connection()
        if not is_online:
            return self.local_fallback.search(
                collection_name=collection_name,
                query_vector=query_vector,
                session_id=session_id,
                top_k=top_k,
                score_threshold=score_threshold
            )

        try:
            filter_payload = None
            if session_id:
                filter_payload = {
                    "must": [
                        {
                            "key": "session_id",
                            "match": {"value": session_id}
                        }
                    ]
                }

            search_body: Dict[str, Any] = {
                "vector": query_vector,
                "limit": top_k,
                "with_payload": True,
            }
            if filter_payload:
                search_body["filter"] = filter_payload
            if score_threshold > 0.0:
                search_body["score_threshold"] = score_threshold

            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{self.qdrant_url}/collections/{collection_name}/points/search",
                    json=search_body
                )
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for hit in data.get("result", []):
                        results.append({
                            "id": hit.get("id"),
                            "score": round(hit.get("score", 0.0), 4),
                            "payload": hit.get("payload", {})
                        })
                    return results
        except Exception as e:
            logger.warning(f"Qdrant search failed: {e}. Executing local fallback search.")

        return self.local_fallback.search(
            collection_name=collection_name,
            query_vector=query_vector,
            session_id=session_id,
            top_k=top_k,
            score_threshold=score_threshold
        )

    async def delete_by_session(
        self,
        session_id: str,
        collection_name: str = DEFAULT_COLLECTION
    ) -> int:
        """
        Delete all points belonging to a session.
        """
        count = self.local_fallback.delete_by_session(collection_name, session_id)
        is_online = await self.check_qdrant_connection()
        if is_online:
            try:
                delete_body = {
                    "filter": {
                        "must": [
                            {"key": "session_id", "match": {"value": session_id}}
                        ]
                    }
                }
                async with httpx.AsyncClient(timeout=4.0) as client:
                    await client.post(
                        f"{self.qdrant_url}/collections/{collection_name}/points/delete",
                        json=delete_body
                    )
            except Exception as e:
                logger.warning(f"Qdrant session delete failed: {e}")
        return count

    async def get_status(self, collection_name: str = DEFAULT_COLLECTION) -> Dict[str, Any]:
        """
        Get vector store telemetry and health metrics.
        """
        is_online = await self.check_qdrant_connection()
        total_points = self.local_fallback.count_points(collection_name)
        return {
            "mode": "qdrant_cluster" if is_online else "local_fallback_cosine",
            "qdrant_connected": is_online,
            "qdrant_url": self.qdrant_url,
            "active_collection": collection_name,
            "indexed_vectors_count": total_points,
            "vector_dimension": VECTOR_DIMENSION,
        }


vector_store = QdrantVectorStore()
