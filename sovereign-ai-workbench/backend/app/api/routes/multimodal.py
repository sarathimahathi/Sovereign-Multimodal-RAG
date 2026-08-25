"""
Multimodal Document Intelligence API Routes for Sovereign AI Workbench.
Endpoints for Document Layout Analysis, OCR Extraction, Table Processing, and RAG Ingestion.
"""

from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field
from multimodal.engine import multimodal_processor
from multimodal.table_extractor import table_extractor
from multimodal.ocr_engine import ocr_engine
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.api.multimodal")

router = APIRouter(prefix="/multimodal", tags=["Multimodal Intelligence"])


# ============================================================================
# Request / Response Schemas
# ============================================================================

class ParseDocumentRequest(BaseModel):
    text_content: Optional[str] = Field(None, description="Raw text or Markdown document content")
    image_base64: Optional[str] = Field(None, description="Base64 encoded scanned drawing or PDF image")
    filename: Optional[str] = Field("document.pdf", description="Document filename")
    mime_type: Optional[str] = Field("application/pdf", description="MIME type")
    auto_index_to_rag: Optional[bool] = Field(False, description="Automatically ingest extracted content into Hybrid RAG")
    session_id: Optional[str] = Field(None, description="Optional workspace session ID")


class ExtractTablesRequest(BaseModel):
    text: str = Field(..., min_length=5, description="Text containing Markdown or grid tables")


class OCRImageRequest(BaseModel):
    image_base64: str = Field(..., min_length=10, description="Base64 encoded image string")
    filename: Optional[str] = Field("drawing.png", description="Image filename")
    prompt: Optional[str] = Field(None, description="Optional extraction prompt")


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("/parse", summary="Parse Document Layout, Extract Tables & Run OCR")
async def parse_document(req: ParseDocumentRequest):
    """
    Parses complex document into hierarchical visual segments, structured tables, and detected tags.
    """
    if not req.text_content and not req.image_base64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either text_content or image_base64."
        )

    result = await multimodal_processor.process_document(
        text_content=req.text_content,
        image_base64=req.image_base64,
        filename=req.filename or "document.pdf",
        mime_type=req.mime_type or "application/pdf",
        auto_index_to_rag=req.auto_index_to_rag or False,
        session_id=req.session_id
    )

    return result


@router.post("/upload-and-parse", summary="Upload File for Multimodal Layout & OCR Extraction")
async def upload_and_parse(
    file: UploadFile = File(...),
    auto_index_to_rag: bool = Form(False),
    session_id: Optional[str] = Form(None)
):
    """
    Uploads a binary document (PDF, PNG, JPG, DOCX, TXT) and processes its multimodal layout.
    """
    file_bytes = await file.read()
    filename = file.filename or "uploaded_doc.pdf"
    mime_type = file.content_type or "application/octet-stream"

    # If text format, decode text
    text_content = None
    if "text" in mime_type or filename.endswith((".txt", ".md", ".csv")):
        try:
            text_content = file_bytes.decode("utf-8")
        except Exception:
            text_content = file_bytes.decode("latin-1", errors="ignore")

    result = await multimodal_processor.process_document(
        text_content=text_content,
        file_bytes=file_bytes if text_content is None else None,
        filename=filename,
        mime_type=mime_type,
        auto_index_to_rag=auto_index_to_rag,
        session_id=session_id
    )

    return result


@router.post("/ocr-image", summary="Execute OCR on Scanned Drawing or Photo")
async def ocr_image_endpoint(req: OCRImageRequest):
    """
    Runs optical character recognition on input image and extracts engineering tags.
    """
    result = await ocr_engine.ocr_image(
        image_base64=req.image_base64,
        filename=req.filename or "drawing.png",
        prompt=req.prompt
    )
    return result.to_dict()


@router.post("/extract-tables", summary="Extract Structured Tables into JSON & CSV")
async def extract_tables_endpoint(req: ExtractTablesRequest):
    """
    Extracts tabular data structures and returns JSON rows and downloadable CSV.
    """
    tables = table_extractor.extract_tables(req.text)
    return {
        "tables_count": len(tables),
        "tables": [t.to_dict() for t in tables]
    }


@router.get("/status", summary="Get Multimodal Pipeline Health & Parsers")
async def get_multimodal_status():
    """
    Returns status of OCR engines, supported file formats, and layout segmenters.
    """
    return multimodal_processor.get_status()
