from rag.pipeline.retrieval_pipeline import RAGPipeline
from rag.schemas.retrieval import RetrievalQuery, RetrievalFilters
from rag.schemas.response import RAGResponse

class RAGTool:
    """Standardized tool interface for Module 2: Agent Engine."""
    def __init__(self):
        self.pipeline = RAGPipeline()

    def search(self, query: str, filters: dict | None = None, top_k: int = 5) -> RAGResponse:
        f_obj = RetrievalFilters(**filters) if filters else None
        req = RetrievalQuery(query=query, rerank_top_k=top_k, filters=f_obj)
        return self.pipeline.execute(req)
