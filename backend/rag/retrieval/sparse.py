from typing import List
from rank_bm25 import BM25Okapi
from rag.schemas.retrieval import RetrievalResult

class SparseRetriever:
    def __init__(self):
        pass

    def search_over_corpus(self, query: str, candidates: List[RetrievalResult], top_k: int) -> List[RetrievalResult]:
        if not candidates:
            return []
        tokenized_corpus = [doc.text.lower().split() for doc in candidates]
        bm25 = BM25Okapi(tokenized_corpus)
        scores = bm25.get_scores(query.lower().split())

        ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        results = []
        for idx in ranked_indices[:top_k]:
            item = candidates[idx].copy()
            item.sparse_score = float(scores[idx])
            results.append(item)
        return results
