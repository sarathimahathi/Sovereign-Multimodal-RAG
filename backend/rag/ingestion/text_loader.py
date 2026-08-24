import json
import csv
from typing import List
from rag.ingestion.loader import BaseLoader
from rag.schemas.document import PageContent

class TextLoader(BaseLoader):
    def load(self, file_path: str) -> List[PageContent]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        return [PageContent(page_number=1, text=content)]

class CSVLoader(BaseLoader):
    def load(self, file_path: str) -> List[PageContent]:
        rows = []
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f)
            for row in reader:
                rows.append(" | ".join(row))
        return [PageContent(page_number=1, text="\n".join(rows), metadata={"rows": len(rows)})]

class JSONLoader(BaseLoader):
    def load(self, file_path: str) -> List[PageContent]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            data = json.load(f)
        formatted = json.dumps(data, indent=2)
        return [PageContent(page_number=1, text=formatted)]
