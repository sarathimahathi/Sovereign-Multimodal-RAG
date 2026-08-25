"""
Document Layout Parser for Sovereign AI Workbench.
Extracts hierarchical layout blocks, bounding coordinates, Markdown tables, key-value pairs, and equipment tags.
"""

import re
import uuid
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field, asdict
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.multimodal.layout")


@dataclass
class VisualSegment:
    """
    A segmented structural block in a document layout.
    """
    id: str
    segment_type: str # "HEADER", "PARAGRAPH", "TABLE", "KEY_VALUE_PAIR", "EQUIPMENT_TAG", "CODE_BLOCK", "LIST_ITEM"
    text: str
    page_number: int = 1
    bounding_box: Dict[str, float] = field(default_factory=lambda: {"x0": 0.0, "y0": 0.0, "x1": 1.0, "y1": 0.1})
    confidence: float = 0.98
    section_title: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DocumentLayout:
    """
    Complete structural representation of a parsed multimodal document.
    """
    document_id: str
    filename: str
    total_pages: int
    segments: List[VisualSegment]
    tables_count: int
    tags_detected: List[str]
    raw_markdown: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        res["segments"] = [s.to_dict() if isinstance(s, VisualSegment) else s for s in self.segments]
        return res


def extract_engineering_tags(text: str) -> List[str]:
    """
    Identifies industrial equipment tags, valve identifiers, and engineering standards.
    """
    patterns = [
        r"(?:TAG\s*#?|VALVE\s*#?|PUMP\s*#?|VESSEL\s*#?|DRUM\s*#?)\s*#?([A-Z0-9\-]+)",
        r"\b(?:ISO|API|ASME|ASTM|IEC|IEEE|OSHA|TEMA)\s*[-#]?\s*\d+[A-Z0-9\-]*\b",
        r"\b[A-Z]{1,5}-\d{2,5}[A-Z0-9\-]*\b", # e.g. P-401A, PV-401A, TIC-204, ESD-401, C-101
    ]
    ignored = {"TAG", "PUMP", "VALVE", "VESSEL", "DRUM", "THE", "AND", "TABLE", "FOR", "WITH"}
    tags = set()
    for pat in patterns:
        matches = re.findall(pat, text, re.IGNORECASE)
        for m in matches:
            clean_m = m.strip().upper()
            if clean_m not in ignored and len(clean_m) >= 2:
                tags.add(clean_m)
    return sorted(list(tags))


class DocumentLayoutParser:
    """
    Rule-based and heuristic document layout parser for industrial engineering documents.
    """
    def parse_text_layout(
        self,
        content: str,
        filename: str = "document.pdf",
        doc_id: Optional[str] = None
    ) -> DocumentLayout:
        """
        Parses text and Markdown layout into structured visual segments and bounding boxes.
        """
        document_id = doc_id or str(uuid.uuid4())
        segments: List[VisualSegment] = []
        all_tags = set()
        tables_count = 0

        # Split content into logical blocks
        blocks = re.split(r"\n\s*\n", content.strip())
        current_section = "General"
        y_cursor = 0.05 # Virtual page coordinate cursor
        page_num = 1

        for block_idx, block in enumerate(blocks):
            block = block.strip()
            if not block:
                continue

            # Check for page breaks
            if "--- PAGE BREAK ---" in block or "\f" in block:
                page_num += 1
                y_cursor = 0.05
                block = block.replace("--- PAGE BREAK ---", "").replace("\f", "").strip()
                if not block:
                    continue

            seg_id = str(uuid.uuid4())
            tags_in_block = extract_engineering_tags(block)
            all_tags.update(tags_in_block)

            # Detect Segment Type
            # 1. Header Block
            if block.startswith("#") or (len(block) < 80 and (block.isupper() or block.endswith(":")) and not "|" in block):
                current_section = block.lstrip("#").strip().rstrip(":")
                seg_type = "HEADER"
                height = 0.04
            # 2. Table Block
            elif block.startswith("|") or ("\n|" in block and "-|-" in block):
                seg_type = "TABLE"
                tables_count += 1
                height = min(0.35, 0.05 * len(block.splitlines()))
            # 3. Code Block
            elif block.startswith("```"):
                seg_type = "CODE_BLOCK"
                height = min(0.30, 0.04 * len(block.splitlines()))
            # 4. Key-Value Pair Block (e.g. "Tag: PV-401A\nPressure: 150 psig")
            elif any(":" in line and len(line.split(":")[0].split()) <= 4 for line in block.splitlines() if line.strip()):
                seg_type = "KEY_VALUE_PAIR"
                height = min(0.20, 0.035 * len(block.splitlines()))
            # 5. List Items
            elif block.startswith(("- ", "* ", "• ", "1. ", "2. ")):
                seg_type = "LIST_ITEM"
                height = min(0.25, 0.035 * len(block.splitlines()))
            # 6. Standard Paragraph
            else:
                seg_type = "PARAGRAPH"
                height = min(0.25, 0.03 * (len(block) / 100.0 + 1))

            # Approximate Bounding Box on virtual 1.0x1.0 page canvas
            bbox = {
                "x0": 0.08,
                "y0": round(y_cursor, 3),
                "x1": 0.92,
                "y1": round(min(0.95, y_cursor + height), 3)
            }
            y_cursor += height + 0.02
            if y_cursor > 0.90:
                page_num += 1
                y_cursor = 0.05

            segment = VisualSegment(
                id=seg_id,
                segment_type=seg_type,
                text=block,
                page_number=page_num,
                bounding_box=bbox,
                confidence=0.98 if seg_type in ("HEADER", "TABLE") else 0.95,
                section_title=current_section,
                tags=tags_in_block,
                metadata={"block_index": block_idx, "character_count": len(block)}
            )
            segments.append(segment)

        return DocumentLayout(
            document_id=document_id,
            filename=filename,
            total_pages=max(1, page_num),
            segments=segments,
            tables_count=tables_count,
            tags_detected=sorted(list(all_tags)),
            raw_markdown=content,
            metadata={"segment_count": len(segments), "parsed_blocks": len(blocks)}
        )


layout_parser = DocumentLayoutParser()
