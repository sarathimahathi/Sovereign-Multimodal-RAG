import docx
from typing import List
from rag.ingestion.loader import BaseLoader
from rag.schemas.document import PageContent

class DocxLoader(BaseLoader):
    def load(self, file_path: str) -> List[PageContent]:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text.strip())
        
        # Docx doesn't have a physical page index; synthesize logical pages by grouping
        return [PageContent(
            page_number=1,
            text="\n\n".join(full_text),
            metadata={"paragraph_count": len(full_text)}
        )]
