"""
API Route Handlers for Confidential Industrial Documents.
"""

import os
from pathlib import Path
from typing import Optional
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ...database.session import get_db
from ...services.document_service import document_service
from ...schemas.documents import (
    DocumentResponse,
    DocumentListResponse,
)

router = APIRouter(prefix="/documents", tags=["Industrial Documents"])


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Confidential Industrial Document",
    description="Uploads a confidential document (PDF, P&ID drawing, DOCX, XLSX), computes SHA-256 hash, and registers it."
)
async def upload_document(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    classification: str = Form("CONFIDENTIAL - INTERNAL USE"),
    db: AsyncSession = Depends(get_db),
) -> DocumentResponse:
    try:
        doc = await document_service.upload_document(
            db_session=db,
            file=file,
            session_id=session_id,
            classification=classification,
        )
        return DocumentResponse.model_validate(doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document upload: {str(e)}",
        )


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List Uploaded Industrial Documents",
    description="Retrieves a list of all confidential documents stored on-premises."
)
async def list_documents(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
) -> DocumentListResponse:
    total, items = await document_service.list_documents(db, skip=skip, limit=limit)
    return DocumentListResponse(
        total=total,
        items=[DocumentResponse.model_validate(item) for item in items]
    )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get Document Metadata",
    description="Fetch document details including SHA-256 checksum and processing status."
)
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
) -> DocumentResponse:
    doc = await document_service.get_document(db, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return DocumentResponse.model_validate(doc)


@router.get(
    "/{document_id}/download",
    summary="Download Local File",
    description="Stream the confidential document from the local encrypted file storage."
)
async def download_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
):
    doc = await document_service.get_document(db, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    
    file_path = Path(doc.storage_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File content missing from local storage.",
        )

    return FileResponse(
        path=str(file_path),
        filename=doc.original_filename,
        media_type=doc.mime_type,
    )


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Document",
    description="Permanently delete a confidential document record and its local file."
)
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
):
    success = await document_service.delete_document(db, document_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return {"status": "deleted", "id": document_id}
