"""
Unified Multimodal Processing Pipeline for Sovereign AI Workbench.
Coordinates OCR, Layout Parsing, Table Extraction, and Direct Indexing into Hybrid RAG.
"""

import time
from typing import Dict, Any, Optional, List
from .layout_parser import layout_parser, DocumentLayoutParser, DocumentLayout
from .table_extractor import table_extractor, TableExtractor, ExtractedTable
from .ocr_engine import ocr_engine, OCREngine, OCRResult
from rag.engine import rag_engine
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.multimodal.pipeline")


class MultimodalProcessor:
    """
    Unified multimodal document analyzer.
    """
    def __init__(self):
        self.layout_parser = layout_parser
        self.table_extractor = table_extractor
        self.ocr_engine = ocr_engine

    async def process_document(
        self,
        text_content: Optional[str] = None,
        file_bytes: Optional[bytes] = None,
        image_base64: Optional[str] = None,
        filename: str = "document.pdf",
        mime_type: str = "application/pdf",
        auto_index_to_rag: bool = False,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes document or image into structured visual segments, tables, and OCR text.
        """
        start_time = time.perf_counter()
        ocr_result: Optional[OCRResult] = None
        extracted_text = text_content or ""

        is_image = (
            "image" in mime_type.lower() or
            filename.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp")) or
            image_base64 is not None
        )

        # 1. Run OCR if input is an image
        if is_image:
            ocr_result = await self.ocr_engine.ocr_image(
                image_bytes=file_bytes,
                image_base64=image_base64,
                filename=filename
            )
            extracted_text = ocr_result.text

        # If text content is still empty, provide placeholder
        if not extracted_text:
            extracted_text = f"# Document: {filename}\nNo textual content detected."

        # 2. Parse Document Layout (Headers, Paragraphs, Bounding Boxes)
        layout: DocumentLayout = self.layout_parser.parse_text_layout(
            content=extracted_text,
            filename=filename
        )

        # 3. Extract Structured Tables (Markdown, JSON records, CSV)
        tables: List[ExtractedTable] = self.table_extractor.extract_tables(extracted_text)

        # 4. Optional: Index into Phase 5 Hybrid RAG Knowledge Base
        rag_result = None
        if auto_index_to_rag:
            try:
                rag_result = await rag_engine.ingest_text(
                    text=extracted_text,
                    filename=filename,
                    session_id=session_id,
                    classification="CONFIDENTIAL - INDUSTRIAL DRAWING"
                )
            except Exception as e:
                logger.warning(f"Failed to auto-index into RAG: {e}")

        total_latency = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "filename": filename,
            "mime_type": mime_type,
            "total_pages": layout.total_pages,
            "total_segments": len(layout.segments),
            "tables_count": len(tables),
            "tags_detected": layout.tags_detected,
            "layout": layout.to_dict(),
            "tables": [t.to_dict() for t in tables],
            "ocr_telemetry": ocr_result.to_dict() if ocr_result else None,
            "rag_ingestion": rag_result,
            "raw_text_length": len(extracted_text),
            "processing_time_ms": total_latency,
            "is_air_gapped": True
        }

    def get_status(self) -> Dict[str, Any]:
        return {
            "status": "operational",
            "ocr_engine": "dual_mode_vlm_and_rasterizer",
            "layout_parser": "rule_based_visual_segmenter",
            "table_extractor": "pipe_grid_to_json_csv_converter",
            "supported_formats": [
                "PDF (.pdf)",
                "PNG (.png)",
                "JPEG (.jpg, .jpeg)",
                "Word Document (.docx)",
                "Markdown (.md)",
                "Text (.txt)",
                "CSV / Excel (.csv, .xlsx)"
            ],
            "features": {
                "visual_segment_bounding_boxes": True,
                "table_to_json_csv": True,
                "p_and_id_tag_detection": True,
                "one_click_rag_indexing": True,
            }
        }


multimodal_processor = MultimodalProcessor()
