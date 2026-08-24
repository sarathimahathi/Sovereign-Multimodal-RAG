import pytest
from rag.processing.cleaner import TextCleaner
from rag.processing.chunker import HierarchicalChunker
from rag.schemas.document import PageContent, ExtractedObject

class TestTextCleaner:
    def test_clean_empty_or_none(self):
        assert TextCleaner.clean("") == ""
        assert TextCleaner.clean(None) == ""

    def test_clean_whitespace_and_tabs(self):
        raw = "  Line with   multiple \t\t spaces   "
        cleaned = TextCleaner.clean(raw)
        assert cleaned == "Line with multiple spaces"

    def test_clean_zero_width_and_null_bytes(self):
        raw = "Hello\x00World\u200b!"
        cleaned = TextCleaner.clean(raw)
        assert cleaned == "HelloWorld!"

    def test_clean_excessive_newlines(self):
        raw = "Header\n\n\n\n\nParagraph 1\n\n\nParagraph 2"
        cleaned = TextCleaner.clean(raw)
        assert cleaned == "Header\n\nParagraph 1\n\nParagraph 2"


class TestHierarchicalChunker:
    def test_empty_pages_produce_no_chunks(self):
        chunker = HierarchicalChunker(chunk_size=100, overlap=20)
        pages = [PageContent(page_number=1, text="   ")]
        chunks, parents = chunker.chunk("DOC-001", pages)
        assert chunks == []
        assert parents == []

    def test_single_section_chunking(self):
        chunker = HierarchicalChunker(chunk_size=10, overlap=2)
        text = "Word " * 25
        pages = [PageContent(page_number=1, text=text)]
        chunks, parents = chunker.chunk("DOC-001", pages)

        assert len(chunks) > 1
        assert len(parents) == 1
        assert parents[0].document_id == "DOC-001"
        assert parents[0].page == 1
        assert len(parents[0].child_chunk_ids) == len(chunks)
        assert all(c.chunk_id in parents[0].child_chunk_ids for c in chunks)

    def test_equipment_tag_extraction(self):
        chunker = HierarchicalChunker(chunk_size=50, overlap=10)
        text = "1.0 Procedure\nCheck valve V-204 and pump P-101 for pressure leaks in tank TK-01."
        pages = [PageContent(page_number=1, text=text)]
        chunks, parents = chunker.chunk("DOC-001", pages)

        assert len(chunks) == 1
        tags = set(chunks[0].equipment_tags)
        assert "V-204" in tags
        assert "P-101" in tags
        assert "TK-01" in tags

    def test_section_splitting(self):
        chunker = HierarchicalChunker(chunk_size=100, overlap=10)
        text = (
            "1.0 Inspection Procedure\nInspect the main flange.\n"
            "2.0 Replacement Procedure\nReplace the gasket.\n"
            "SECTION 3: SAFETY WARNINGS\nWear proper PPE at all times."
        )
        pages = [PageContent(page_number=1, text=text)]
        chunks, parents = chunker.chunk("SOP-100", pages)

        assert len(parents) >= 3
        section_titles = [p.section for p in parents]
        assert any("1.0" in s for s in section_titles)
        assert any("2.0" in s for s in section_titles)
        assert any("SECTION 3" in s for s in section_titles)

    def test_multimodal_object_metadata_preservation(self):
        chunker = HierarchicalChunker(chunk_size=50, overlap=10)
        obj = ExtractedObject(label="P&ID Diagram", type="diagram", bounding_box=[10.0, 20.0, 100.0, 200.0])
        pages = [PageContent(page_number=1, text="1.0 System Schematic\nSee diagram below.", multimodal_objects=[obj])]
        chunks, parents = chunker.chunk("DOC-002", pages)

        assert len(chunks) == 1
        mm_objs = chunks[0].metadata.get("multimodal_objects", [])
        assert len(mm_objs) == 1
        assert mm_objs[0]["label"] == "P&ID Diagram"
        assert mm_objs[0]["type"] == "diagram"
