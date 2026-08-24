import os
from rag.ingestion.loader import BaseLoader
from rag.ingestion.pdf_loader import PDFLoader
from rag.ingestion.docx_loader import DocxLoader
from rag.ingestion.xlsx_loader import XLSXLoader
from rag.ingestion.text_loader import TextLoader, CSVLoader, JSONLoader

class LoaderRegistry:
    def __init__(self):
        self._loaders = {
            ".pdf": PDFLoader(),
            ".docx": DocxLoader(),
            ".xlsx": XLSXLoader(),
            ".txt": TextLoader(),
            ".md": TextLoader(),
            ".csv": CSVLoader(),
            ".json": JSONLoader()
        }

    def get_loader(self, file_path: str) -> BaseLoader:
        ext = os.path.splitext(file_path)[1].lower()
        if ext not in self._loaders:
            raise ValueError(f"Unsupported file extension: {ext}")
        return self._loaders[ext]
