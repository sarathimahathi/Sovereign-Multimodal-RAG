from typing import List
from rag.schemas.retrieval import RetrievalResult
from rag.schemas.response import Citation

class CitationBuilder:
    @staticmethod
    def build_citations(results: List[RetrievalResult]) -> List[Citation]:
        citations = []
        for idx, r in enumerate(results):
            citations.append(Citation(
                citation_id=idx + 1,
                document_id=r.document_id,
                document_title=r.filename.replace("_", " "),
                filename=r.filename,
                page=r.page,
                section=r.section,
                chunk_id=r.chunk_id,
                text_snippet=r.text[:180] + ("..." if len(r.text) > 180 else "")
            ))
        return citations
