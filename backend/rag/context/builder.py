from typing import List
from rag.schemas.retrieval import RetrievalResult
from rag.context.parent_context import ParentContextExpander

class ContextBuilder:
    def __init__(self, expander: ParentContextExpander):
        self.expander = expander

    def build_context(self, retrieved_docs: List[RetrievalResult], expand_parent: bool = True) -> str:
        seen_texts = set()
        context_blocks = []

        for idx, doc in enumerate(retrieved_docs):
            content_to_use = doc.text
            if expand_parent and doc.parent_id:
                parent_text = self.expander.get_parent_text(doc.document_id, doc.parent_id)
                if parent_text:
                    content_to_use = parent_text
                    doc.expanded_context = parent_text

            if content_to_use in seen_texts:
                continue
            seen_texts.add(content_to_use)

            block = (
                f"--- SOURCE [{idx + 1}] ---\n"
                f"DOCUMENT: {doc.filename}\n"
                f"PAGE: {doc.page}\n"
                f"SECTION: {doc.section}\n"
                f"CONTENT:\n{content_to_use}\n"
            )
            context_blocks.append(block)

        return "\n".join(context_blocks)
