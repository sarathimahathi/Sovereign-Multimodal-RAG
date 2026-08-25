# RAG Module (Retrieval-Augmented Generation)

## Purpose
Implements hybrid retrieval combining dense vector search, sparse BM25 keyword matching, Reciprocal Rank Fusion (RRF), and cross-encoder re-ranking.

## Phase Milestone
Targeted for **Phase 5: Hybrid RAG Engine**.

## Subcomponents to be implemented:
- `vector_store/`: Qdrant connector and index management.
- `chunking/`: Semantic and hierarchical chunking strategies.
- `embeddings/`: Local embedding generators.
- `retriever/`: Hybrid fusion retriever and cross-encoder re-ranker.
