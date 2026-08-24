import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from rag.pipeline.ingestion_pipeline import IngestionPipeline
from rag.pipeline.retrieval_pipeline import RAGPipeline
from rag.schemas.retrieval import RetrievalQuery
from rag.schemas.response import RAGResponse
from rag.config import config

router = APIRouter(prefix="/rag", tags=["RAG"])
ingestor = IngestionPipeline()
retriever = RAGPipeline()

@router.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    document_type: str = Form("TECHNICAL_DOCUMENT"),
    equipment_id: str = Form(None),
    revision: str = Form("v1")
):
    temp_dir = os.path.join(config.STORAGE_DIR, "uploads")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    override = {
        "document_type": document_type,
        "equipment_id": equipment_id,
        "revision": revision
    }
    result = ingestor.ingest_file(temp_path, override)
    return result

@router.post("/query", response_model=RAGResponse)
def execute_query(query: RetrievalQuery):
    return retriever.execute(query)

@router.get("/health")
def health():
    return {"status": "HEALTHY", "air_gapped": config.AIR_GAPPED}
