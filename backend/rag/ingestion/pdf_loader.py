import fitz
from typing import List
from rag.ingestion.loader import BaseLoader
from rag.schemas.document import PageContent

class PDFLoader(BaseLoader):
    def load(self, file_path: str) -> List[PageContent]:
        pages = []
        doc = fitz.open(file_path)
        for idx, page in enumerate(doc):
            text = page.get_text("text")
            # Extract basic tabulations if present
            tables = []
            tab_finder = page.find_tables()
            if tab_finder and tab_finder.tables:
                for tab in tab_finder.tables:
                    tables.append({"data": tab.extract()})
            
            pages.append(PageContent(
                page_number=idx + 1,
                text=text,
                tables=tables,
                metadata={"dimensions": [page.rect.width, page.rect.height]}
            ))
        doc.close()
        return pages
