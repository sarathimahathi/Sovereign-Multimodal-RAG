# Industrial RAG Pipeline

An air-gapped-capable Retrieval-Augmented Generation service for industrial
technical documents (SOPs, manuals, inspection reports). Supports PDF, DOCX,
XLSX, TXT, CSV, and JSON ingestion; hierarchical chunking with parent-context
expansion; hybrid dense + BM25 retrieval with reciprocal rank fusion; local
cross-encoder reranking; and citation-grounded responses with an abstention
gate for low-confidence queries.

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

The API will be available at `http://localhost:8000`.

- `POST /rag/ingest` — upload a document for ingestion
- `POST /rag/query` — run a retrieval query
- `GET /rag/health` — health check

## Local development

```bash
pip install -r requirements.txt
pytest rag/tests
python -m rag.evaluation.evaluate
```

## Configuration

See `config.py` / `.env.example` for all environment variables (Qdrant
connection, local model paths, chunking, and retrieval thresholds).
