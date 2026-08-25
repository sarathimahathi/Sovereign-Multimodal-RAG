"""
SQLAlchemy Declarative Models for Sovereign AI Workbench.
Structured for Confidential Industrial Operations & Auditability.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import (
    String,
    Text,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)


class Base(DeclarativeBase):
    """Base declarative class for all database models."""
    pass


def generate_uuid() -> str:
    """Generate random UUID string."""
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    """Get timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


class SessionModel(Base):
    """
    User Workbench Session / Workspace.
    Groups documents, conversations, and generated deliverables under a confidentiality level.
    """
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    classification: Mapped[str] = mapped_column(
        String(100), 
        default="CONFIDENTIAL - INTERNAL USE", 
        nullable=False,
        comment="Confidentiality classification: e.g. CONFIDENTIAL - REFINERY, RESTRICTED - DEFENSE"
    )
    model_preference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    metadata_info: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    documents: Mapped[List["DocumentModel"]] = relationship(
        "DocumentModel", back_populates="session", cascade="all, delete-orphan", lazy="selectin"
    )
    messages: Mapped[List["MessageModel"]] = relationship(
        "MessageModel", back_populates="session", cascade="all, delete-orphan", lazy="selectin"
    )
    deliverables: Mapped[List["DeliverableModel"]] = relationship(
        "DeliverableModel", back_populates="session", cascade="all, delete-orphan", lazy="selectin"
    )


class DocumentModel(Base):
    """
    Confidential Industrial Document Record (P&ID Drawings, Inspection Reports, SOPs, Word Notes).
    """
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="SET NULL"), nullable=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="pdf, png, docx, xlsx, pid, code")
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True, comment="Cryptographic integrity hash")
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="uploaded", comment="uploaded, processing, indexed, error")
    metadata_info: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    # Relationships
    session: Mapped[Optional["SessionModel"]] = relationship("SessionModel", back_populates="documents")
    deliverables: Mapped[List["DeliverableModel"]] = relationship("DeliverableModel", back_populates="document")


class MessageModel(Base):
    """
    Session Conversation History & Multi-Step Agent Reasoning Logs.
    """
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, comment="user, agent, tool, system")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tool_calls: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    latency_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    # Relationships
    session: Mapped["SessionModel"] = relationship("SessionModel", back_populates="messages")


class DeliverableModel(Base):
    """
    Generated Deliverables (Word .docx Approval Notes, PPT Decks, Excel Sheets, PDFs).
    """
    __tablename__ = "deliverables"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="SET NULL"), nullable=True)
    document_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False, comment="docx, pptx, xlsx, pdf, py")
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    # Relationships
    session: Mapped[Optional["SessionModel"]] = relationship("SessionModel", back_populates="deliverables")
    document: Mapped[Optional["DocumentModel"]] = relationship("DocumentModel", back_populates="deliverables")


class AuditLogModel(Base):
    """
    Tamper-Evident Hash-Chained Audit Log for PSU & Defense Compliance.
    """
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    block_index: Mapped[int] = mapped_column(Integer, default=0, index=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, comment="file_upload, session_create, model_query, tool_exec")
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False)
    previous_hash: Mapped[str] = mapped_column(String(64), nullable=False, default="0"*64)
    sha256_checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    event_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
