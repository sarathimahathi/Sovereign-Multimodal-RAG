"""
Sparse BM25 Keyword Search Engine for Sovereign AI Workbench.
Implements Okapi BM25 with custom tokenization for industrial engineering tags, standards, and equipment codes.
"""

import math
import re
from typing import List, Dict, Any, Tuple, Optional
from collections import Counter, defaultdict
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.rag.bm25")

# Standard English stopwords
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
}


def tokenize_industrial(text: str) -> List[str]:
    """
    Tokenizer tailored for industrial specifications, preserving alphanumeric codes (e.g. PV-401A, ISO-9001, API-520, P&ID).
    """
    if not text:
        return []

    # Preserve tags with hyphens, underscores, dots, or ampersands
    raw_tokens = re.findall(r"[A-Za-z0-9]+(?:[-_./&][A-Za-z0-9]+)*", text)
    tokens: List[str] = []

    for t in raw_tokens:
        clean_token = t.lower().strip(".-_")
        if not clean_token:
            continue
        # Only discard stop words if not looking like an equipment tag or code
        if clean_token in STOPWORDS and not re.search(r"\d", clean_token) and len(clean_token) <= 3:
            continue
        tokens.append(clean_token)

    return tokens


class BM25Index:
    """
    In-memory BM25Okapi inverted index supporting multi-session namespaces.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_term_freqs: Dict[str, Dict[str, int]] = {} # doc_id -> {term -> tf}
        self.doc_lengths: Dict[str, int] = {} # doc_id -> length
        self.doc_metadata: Dict[str, Dict[str, Any]] = {} # doc_id -> metadata
        self.doc_session_map: Dict[str, str] = {} # doc_id -> session_id
        self.term_doc_freqs: Dict[str, int] = defaultdict(int) # term -> count of docs containing term
        self.total_docs: int = 0
        self.avg_doc_length: float = 0.0

    def add_document(
        self,
        doc_id: str,
        text: str,
        session_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Add or update a document in the BM25 index.
        """
        # If doc already exists, remove it first
        if doc_id in self.doc_term_freqs:
            self.remove_document(doc_id)

        tokens = tokenize_industrial(text)
        length = len(tokens)
        if length == 0:
            return

        tf = Counter(tokens)
        self.doc_term_freqs[doc_id] = dict(tf)
        self.doc_lengths[doc_id] = length
        self.doc_metadata[doc_id] = metadata or {}
        self.doc_session_map[doc_id] = session_id or "global"

        for term in tf.keys():
            self.term_doc_freqs[term] += 1

        self.total_docs += 1
        self._recalculate_avgdl()

    def remove_document(self, doc_id: str) -> None:
        """
        Remove a document from the index.
        """
        if doc_id not in self.doc_term_freqs:
            return

        tf = self.doc_term_freqs.pop(doc_id)
        self.doc_lengths.pop(doc_id, None)
        self.doc_metadata.pop(doc_id, None)
        self.doc_session_map.pop(doc_id, None)

        for term in tf.keys():
            self.term_doc_freqs[term] -= 1
            if self.term_doc_freqs[term] <= 0:
                del self.term_doc_freqs[term]

        self.total_docs = max(0, self.total_docs - 1)
        self._recalculate_avgdl()

    def clear_session(self, session_id: str) -> int:
        """
        Remove all documents associated with a given session.
        """
        docs_to_remove = [
            doc_id for doc_id, s_id in self.doc_session_map.items() if s_id == session_id
        ]
        for doc_id in docs_to_remove:
            self.remove_document(doc_id)
        return len(docs_to_remove)

    def _recalculate_avgdl(self) -> None:
        if self.total_docs == 0:
            self.avg_doc_length = 0.0
        else:
            self.avg_doc_length = sum(self.doc_lengths.values()) / float(self.total_docs)

    def _idf(self, term: str) -> float:
        """
        Calculate Inverse Document Frequency with smoothing.
        """
        df = self.term_doc_freqs.get(term, 0)
        if df == 0:
            return 0.0
        return math.log(1.0 + (self.total_docs - df + 0.5) / (df + 0.5))

    def search(
        self,
        query: str,
        session_id: Optional[str] = None,
        top_k: int = 10
    ) -> List[Tuple[str, float, Dict[str, Any]]]:
        """
        Perform BM25 score ranking against indexed documents.
        Returns list of (doc_id, score, metadata) sorted descending by score.
        """
        if self.total_docs == 0 or not query:
            return []

        query_tokens = tokenize_industrial(query)
        if not query_tokens:
            return []

        scores: Dict[str, float] = defaultdict(float)

        for term in query_tokens:
            if term not in self.term_doc_freqs:
                continue

            idf = self._idf(term)
            for doc_id, tfs in self.doc_term_freqs.items():
                if session_id and self.doc_session_map.get(doc_id) not in (session_id, "global"):
                    continue

                tf = tfs.get(term, 0)
                if tf == 0:
                    continue

                doc_len = self.doc_lengths.get(doc_id, 1)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / (self.avg_doc_length or 1.0)))
                score = idf * ((tf * (self.k1 + 1.0)) / denominator)
                scores[doc_id] += score

        # Sort by score descending
        sorted_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
        return [
            (doc_id, round(score, 4), self.doc_metadata.get(doc_id, {}))
            for doc_id, score in sorted_results
        ]

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_documents": self.total_docs,
            "vocabulary_size": len(self.term_doc_freqs),
            "average_doc_length": round(self.avg_doc_length, 2),
            "k1": self.k1,
            "b": self.b,
        }


bm25_index = BM25Index()
