from typing import List, Dict
from rag.schemas.retrieval import RetrievalResult

class ReciprocalRankFusion:
    @staticmethod
    def fuse(dense_results: List[RetrievalResult], sparse_results: List[RetrievalResult], k: int = 60) -> List[RetrievalResult]:
        rrf_scores: Dict[str, float] = {}
        items_map: Dict[str, RetrievalResult] = {}

        for rank, doc in enumerate(dense_results):
            cid = doc.chunk_id
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (k + rank + 1))
            items_map[cid] = doc

        for rank, doc in enumerate(sparse_results):
            cid = doc.chunk_id
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (k + rank + 1))
            if cid not in items_map:
                items_map[cid] = doc

        sorted_cids = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        fused = []
        for cid, score in sorted_cids:
            res = items_map[cid]
            res.fusion_score = score
            fused.append(res)
        return fused
