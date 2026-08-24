import json
from rag.pipeline.retrieval_pipeline import RAGPipeline
from rag.schemas.retrieval import RetrievalQuery

def run_evaluation():
    pipeline = RAGPipeline()
    with open("rag/evaluation/evaluation_data.json", "r") as f:
        benchmarks = json.load(f)

    hits = 0
    total = len(benchmarks)

    for item in benchmarks:
        req = RetrievalQuery(query=item["query"])
        resp = pipeline.execute(req)
        
        doc_matches = [s for s in resp.sources if item["expected_document_id"] in s.document_id or item["expected_document_id"] in s.filename]
        if doc_matches:
            hits += 1

    hit_rate = hits / total if total > 0 else 0.0
    print(f"Retrieval HitRate@K: {hit_rate * 100:.2f}% | Total Queries: {total}")

if __name__ == "__main__":
    run_evaluation()
