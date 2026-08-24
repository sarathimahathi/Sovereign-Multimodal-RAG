from typing import List, Dict, Any
from rag.schemas.document import PageContent, ExtractedObject

class MultimodalIngestAdapter:
    """Accepts structured output from Module 4: OCR & Vision."""
    @staticmethod
    def adapt_multimodal_page(page_data: Dict[str, Any]) -> PageContent:
        objs = [
            ExtractedObject(
                label=o.get("label", "unknown"),
                type=o.get("type", "object"),
                bounding_box=o.get("bounding_box"),
                confidence=o.get("confidence", 1.0)
            )
            for o in page_data.get("objects", [])
        ]
        return PageContent(
            page_number=page_data.get("page", 1),
            text=page_data.get("text", ""),
            multimodal_objects=objs,
            metadata={"content_type": page_data.get("content_type", "image")}
        )
