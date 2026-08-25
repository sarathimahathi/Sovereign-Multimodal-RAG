"""
Pydantic Schemas for Sessions, Workspaces & Messages.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict
from .documents import DocumentResponse


class MessageCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    role: str = Field(..., description="user, agent, tool, system")
    content: str
    model_used: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    latency_ms: Optional[float] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: str
    session_id: str
    role: str
    content: str
    model_used: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    latency_ms: Optional[float] = None
    created_at: datetime


class SessionCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    title: str = Field(..., description="Title or objective of the confidential session")
    classification: str = Field(
        default="CONFIDENTIAL - INTERNAL USE",
        description="Classification: e.g. CONFIDENTIAL - REFINERY, RESTRICTED - DEFENSE, INTERNAL"
    )
    model_preference: Optional[str] = Field(default="auto", description="Preferred model or 'auto'")
    metadata_info: Dict[str, Any] = Field(default_factory=dict)


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: str
    title: str
    classification: str
    model_preference: Optional[str] = None
    metadata_info: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class SessionDetailResponse(SessionResponse):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    documents: List[DocumentResponse] = Field(default_factory=list)
    messages: List[MessageResponse] = Field(default_factory=list)


class SessionListResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    total: int
    items: List[SessionResponse]
