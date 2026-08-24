from abc import ABC, abstractmethod
from typing import List, Dict, Any
from rag.schemas.document import PageContent

class BaseLoader(ABC):
    @abstractmethod
    def load(self, file_path: str) -> List[PageContent]:
        pass
