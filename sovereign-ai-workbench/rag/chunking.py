"""
Semantic and Industrial Chunking Engine for Sovereign AI Workbench.
Handles semantic sliding windows, Markdown structure, P&ID sensor tags, and metadata tagging.
"""

import re
import uuid
import hashlib
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field, asdict


@dataclass
class Chunk:
    """
    Structured document chunk with rich provenance metadata.
    """
    id: str
    text: str
    doc_id: Optional[str] = None
    session_id: Optional[str] = None
    filename: Optional[str] = None
    chunk_index: int = 0
    token_count: int = 0
    char_count: int = 0
    section_title: Optional[str] = None
    classification: str = "CONFIDENTIAL - INTERNAL USE"
    tags: List[str] = field(default_factory=list)
    sha256_hash: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def estimate_token_count(text: str) -> int:
    """
    Accurate token estimation (~4 characters per token average).
    """
    if not text:
        return 0
    # Approximate words and subwords
    words = len(re.findall(r"\w+|[^\w\s]", text, re.UNICODE))
    chars = len(text)
    return max(1, int((words * 0.75) + (chars / 5.0) / 2))


def extract_industrial_tags(text: str) -> List[str]:
    """
    Extract engineering asset tags, standards, and identifiers (e.g. TAG #PV-401A, ISO 9001, API 520).
    """
    patterns = [
        r"(?:TAG\s*#?|VALVE\s*#?|PUMP\s*#?|VESSEL\s*#?)\s*#?([A-Z0-9\-]+)",
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


class SemanticChunker:
    """
    Semantic chunker respecting paragraph boundaries, sentences, and sliding window overlap.
    """
    def __init__(self, target_chunk_size: int = 400, chunk_overlap: int = 80):
        self.target_chunk_size = target_chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(
        self,
        text: str,
        filename: Optional[str] = None,
        doc_id: Optional[str] = None,
        session_id: Optional[str] = None,
        classification: str = "CONFIDENTIAL - INTERNAL USE",
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Chunk]:
        if not text or not text.strip():
            return []

        metadata = metadata or {}
        # 1. Normalize linebreaks and split into logical paragraphs
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        if not paragraphs:
            paragraphs = [text.strip()]

        chunks: List[Chunk] = []
        current_sentences: List[str] = []
        current_token_count = 0
        chunk_idx = 0
        current_section = "General"

        for para in paragraphs:
            # Check for section headers (Markdown # or Industrial section headers)
            if para.startswith("#") or (len(para) < 80 and para.isupper()):
                current_section = para.lstrip("#").strip()

            # Split paragraph into sentences
            sentences = re.split(r"(?<=[.!?])\s+", para)
            for sent in sentences:
                sent = sent.strip()
                if not sent:
                    continue

                sent_tokens = estimate_token_count(sent)

                # If single sentence exceeds target size, split by character window
                if sent_tokens > self.target_chunk_size:
                    words = sent.split()
                    temp_words = []
                    temp_tokens = 0
                    for word in words:
                        w_tok = max(1, len(word) // 4)
                        if temp_tokens + w_tok > self.target_chunk_size and temp_words:
                            sub_text = " ".join(temp_words)
                            chunk_obj = self._create_chunk(
                                text=sub_text,
                                chunk_idx=chunk_idx,
                                filename=filename,
                                doc_id=doc_id,
                                session_id=session_id,
                                section_title=current_section,
                                classification=classification,
                                metadata=metadata
                            )
                            chunks.append(chunk_obj)
                            chunk_idx += 1
                            # Retain overlap words
                            overlap_word_count = max(1, int(len(temp_words) * (self.chunk_overlap / self.target_chunk_size)))
                            temp_words = temp_words[-overlap_word_count:]
                            temp_tokens = sum(max(1, len(w) // 4) for w in temp_words)

                        temp_words.append(word)
                        temp_tokens += w_tok

                    if temp_words:
                        current_sentences = [" ".join(temp_words)]
                        current_token_count = temp_tokens
                    continue

                if current_token_count + sent_tokens > self.target_chunk_size and current_sentences:
                    chunk_text = " ".join(current_sentences)
                    chunk_obj = self._create_chunk(
                        text=chunk_text,
                        chunk_idx=chunk_idx,
                        filename=filename,
                        doc_id=doc_id,
                        session_id=session_id,
                        section_title=current_section,
                        classification=classification,
                        metadata=metadata
                    )
                    chunks.append(chunk_obj)
                    chunk_idx += 1

                    # Compute overlap sentences
                    overlap_sentences: List[str] = []
                    overlap_count = 0
                    for s in reversed(current_sentences):
                        s_tok = estimate_token_count(s)
                        if overlap_count + s_tok <= self.chunk_overlap:
                            overlap_sentences.insert(0, s)
                            overlap_count += s_tok
                        else:
                            break

                    current_sentences = overlap_sentences + [sent]
                    current_token_count = sum(estimate_token_count(s) for s in current_sentences)
                else:
                    current_sentences.append(sent)
                    current_token_count += sent_tokens

        # Flush remaining sentences
        if current_sentences:
            chunk_text = " ".join(current_sentences)
            chunk_obj = self._create_chunk(
                text=chunk_text,
                chunk_idx=chunk_idx,
                filename=filename,
                doc_id=doc_id,
                session_id=session_id,
                section_title=current_section,
                classification=classification,
                metadata=metadata
            )
            chunks.append(chunk_obj)

        return chunks

    def _create_chunk(
        self,
        text: str,
        chunk_idx: int,
        filename: Optional[str],
        doc_id: Optional[str],
        session_id: Optional[str],
        section_title: str,
        classification: str,
        metadata: Dict[str, Any]
    ) -> Chunk:
        text = text.strip()
        tags = extract_industrial_tags(text)
        token_count = estimate_token_count(text)
        sha = hashlib.sha256(text.encode("utf-8")).hexdigest()
        chunk_id = str(uuid.uuid4())

        return Chunk(
            id=chunk_id,
            text=text,
            doc_id=doc_id,
            session_id=session_id,
            filename=filename or "raw_text",
            chunk_index=chunk_idx,
            token_count=token_count,
            char_count=len(text),
            section_title=section_title,
            classification=classification,
            tags=tags,
            sha256_hash=sha,
            metadata=metadata or {}
        )


class IndustrialMarkdownChunker(SemanticChunker):
    """
    Markdown & Industrial Specification Chunker preserving table structures and code blocks.
    """
    def chunk_text(
        self,
        text: str,
        filename: Optional[str] = None,
        doc_id: Optional[str] = None,
        session_id: Optional[str] = None,
        classification: str = "CONFIDENTIAL - INTERNAL USE",
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Chunk]:
        # Preserve Markdown tables and code fences as atomic units
        table_and_code_blocks = re.split(r"(```[\s\S]*?```|\|(?:[^\n]*\|)+\n\|(?:[\s\-:|]*\|)+\n(?:\|[^\n]*\|\n*)+)", text)
        
        all_chunks: List[Chunk] = []
        chunk_idx = 0

        for block in table_and_code_blocks:
            if not block.strip():
                continue
            # If block is a markdown code block or table, keep intact
            if block.startswith("```") or (block.startswith("|") and "\n|" in block):
                tags = extract_industrial_tags(block)
                tok_count = estimate_token_count(block)
                sha = hashlib.sha256(block.encode("utf-8")).hexdigest()
                chunk_obj = Chunk(
                    id=str(uuid.uuid4()),
                    text=block.strip(),
                    doc_id=doc_id,
                    session_id=session_id,
                    filename=filename or "markdown_table",
                    chunk_index=chunk_idx,
                    token_count=tok_count,
                    char_count=len(block),
                    section_title="Structured Table / Code",
                    classification=classification,
                    tags=tags,
                    sha256_hash=sha,
                    metadata=metadata or {}
                )
                all_chunks.append(chunk_obj)
                chunk_idx += 1
            else:
                # Use semantic chunker for regular text
                sub_chunks = super().chunk_text(
                    text=block,
                    filename=filename,
                    doc_id=doc_id,
                    session_id=session_id,
                    classification=classification,
                    metadata=metadata
                )
                for sc in sub_chunks:
                    sc.chunk_index = chunk_idx
                    all_chunks.append(sc)
                    chunk_idx += 1

        return all_chunks


semantic_chunker = SemanticChunker()
industrial_chunker = IndustrialMarkdownChunker()
