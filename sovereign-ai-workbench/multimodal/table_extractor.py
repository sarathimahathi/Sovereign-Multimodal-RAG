"""
Table Extractor & Tabular Data Converter for Sovereign AI Workbench.
Converts Markdown tables, grid text, and CSVs into structured JSON objects and downloadable CSV feeds.
"""

import re
import csv
import io
import uuid
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.multimodal.tables")


@dataclass
class ExtractedTable:
    """
    Structured representation of an extracted document table.
    """
    table_id: str
    title: Optional[str]
    headers: List[str]
    rows: List[List[str]]
    raw_markdown: str
    json_records: List[Dict[str, Any]]
    csv_content: str
    row_count: int
    column_count: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TableExtractor:
    """
    High-precision table parser converting unstructured text tables to structured data formats.
    """
    def extract_tables(self, content: str) -> List[ExtractedTable]:
        """
        Scan text content for markdown and pipe-delimited tables.
        """
        if not content or not content.strip():
            return []

        # Find Markdown table blocks
        table_pattern = r"(?:\|[^\n]+\|\n)+\|(?:[\s\-:|]+\|)+\n(?:\|[^\n]+\|\n*)+"
        matches = re.finditer(table_pattern, content)
        extracted: List[ExtractedTable] = []

        for match_idx, match in enumerate(matches):
            raw_table_str = match.group(0).strip()
            table_obj = self.parse_markdown_table(raw_table_str, index=match_idx)
            if table_obj:
                extracted.append(table_obj)

        return extracted

    def parse_markdown_table(self, table_str: str, index: int = 0, title: Optional[str] = None) -> Optional[ExtractedTable]:
        """
        Parse a single Markdown table string into headers, rows, JSON records, and CSV.
        """
        lines = [line.strip() for line in table_str.strip().splitlines() if line.strip()]
        if len(lines) < 3:
            return None

        # Line 1: Headers
        header_line = lines[0]
        headers = [c.strip() for c in header_line.split("|")[1:-1] if c.strip() != ""]
        if not headers:
            headers = [c.strip() for c in header_line.split("|") if c.strip() != ""]

        # Line 2: Separator line (e.g. |:---|:---|) - skipped

        # Lines 3+: Data Rows
        rows: List[List[str]] = []
        json_records: List[Dict[str, Any]] = []

        for row_line in lines[2:]:
            cells = [c.strip() for c in row_line.split("|")[1:-1]]
            # If cells count does not match, pad or trim
            if len(cells) < len(headers):
                cells += [""] * (len(headers) - len(cells))
            elif len(cells) > len(headers):
                cells = cells[:len(headers)]

            rows.append(cells)

            # Build record dict
            record = {}
            for h, val in zip(headers, cells):
                # Try numeric casting if possible
                try:
                    if "." in val:
                        record[h] = float(val)
                    else:
                        record[h] = int(val)
                except ValueError:
                    record[h] = val
            json_records.append(record)

        # Generate CSV representation
        csv_output = io.StringIO()
        writer = csv.writer(csv_output)
        writer.writerow(headers)
        for r in rows:
            writer.writerow(r)
        csv_str = csv_output.getvalue()

        table_id = str(uuid.uuid4())

        return ExtractedTable(
            table_id=table_id,
            title=title or f"Table {index + 1}",
            headers=headers,
            rows=rows,
            raw_markdown=table_str,
            json_records=json_records,
            csv_content=csv_str,
            row_count=len(rows),
            column_count=len(headers)
        )


table_extractor = TableExtractor()
