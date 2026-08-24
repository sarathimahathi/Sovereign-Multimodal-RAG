import re
from typing import List, Tuple
from rag.schemas.document import PageContent
from rag.schemas.chunk import Chunk, ParentSection
from rag.processing.cleaner import TextCleaner
from rag.config import config

class HierarchicalChunker:
    def __init__(self, chunk_size: int = config.CHUNK_SIZE, overlap: int = config.CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, document_id: str, pages: List[PageContent]) -> Tuple[List[Chunk], List[ParentSection]]:
        chunks: List[Chunk] = []
        parents: List[ParentSection] = []
        global_chunk_idx = 0

        for page in pages:
            cleaned_text = TextCleaner.clean(page.text)
            if not cleaned_text:
                continue

            # Identify major sections via headers (e.g., "1.0 Procedure", "SECTION 4:")
            section_splits = re.split(r'(?=\n(?:[0-9]+\.[0-9]*\s+[A-Z]|SECTION\s+[0-9A-Z]+|[A-Z\s]{4,30}\n))', cleaned_text)
            
            for sec_idx, raw_sec in enumerate(section_splits):
                sec_text = raw_sec.strip()
                if not sec_text:
                    continue

                lines = sec_text.split('\n')
                section_title = lines[0].strip() if len(lines[0]) < 60 else "General"
                
                parent_id = f"{document_id}_p{page.page_number}_s{sec_idx}"
                parent_child_ids = []
                
                # Split section into child tokens/words
                words = sec_text.split()
                if not words:
                    continue

                for i in range(0, len(words), max(1, self.chunk_size - self.overlap)):
                    chunk_words = words[i:i + self.chunk_size]
                    chunk_body = " ".join(chunk_words)
                    
                    # Extract equipment tags in chunk
                    equip_tags = list(set(re.findall(r'\b[A-Z]{1,3}-\d{2,4}[A-Z]?\b', chunk_body)))
                    chunk_id = f"{document_id}_c{global_chunk_idx}"
                    
                    chunk_obj = Chunk(
                        chunk_id=chunk_id,
                        document_id=document_id,
                        parent_id=parent_id,
                        page=page.page_number,
                        section=section_title,
                        chunk_index=global_chunk_idx,
                        text=chunk_body,
                        token_count=len(chunk_words),
                        equipment_tags=equip_tags,
                        metadata={
                            "multimodal_objects": [obj.dict() for obj in page.multimodal_objects]
                        }
                    )
                    chunks.append(chunk_obj)
                    parent_child_ids.append(chunk_id)
                    global_chunk_idx += 1

                parents.append(ParentSection(
                    parent_id=parent_id,
                    document_id=document_id,
                    page=page.page_number,
                    section=section_title,
                    full_text=sec_text,
                    child_chunk_ids=parent_child_ids
                ))

        return chunks, parents
