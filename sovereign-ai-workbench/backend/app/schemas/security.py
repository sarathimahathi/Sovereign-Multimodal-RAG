"""
Pydantic Schemas for Security, Air-Gap Network Status, and Audit Ledgers.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class PromptScanRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    prompt: str = Field(..., description="Prompt text to evaluate for adversarial injection or exfiltration")


class PromptThreatItem(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    threat_type: str
    score: float
    description: str


class PromptScanResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    is_safe: bool
    threat_level: str
    risk_score: float
    detected_threats: List[PromptThreatItem]
    character_count: int
    action_taken: str


class TextSanitizeRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    text: str = Field(..., description="Raw text to sanitize for PII and confidential credentials")


class TextSanitizeResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    original_length: int
    sanitized_text: str
    redacted_count: int
    redacted_types: List[str]


class SocketConnectionItem(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    pid: int
    process_name: str
    local_address: str
    remote_address: str
    status: str
    protocol: str
    verdict: str
    is_safe: bool


class NetworkPolicyInfo(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    allowed_subnets: List[str]
    cloud_api_egress_blocked: bool
    telemetry_egress_blocked: bool
    firewall_enforcement: str


class NetworkStatusResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    air_gap_status: str
    is_air_gapped: bool
    external_egress_count: int
    outbound_internet_bytes: int
    total_local_bytes_sent: int
    total_local_bytes_recv: int
    active_sockets_count: int
    connections: List[SocketConnectionItem]
    policy: NetworkPolicyInfo


class AuditLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: str
    event_type: str
    entity_type: str
    entity_id: str
    sha256_checksum: str
    event_data: Dict[str, Any]
    timestamp: datetime


class AuditLogListResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    total: int
    items: List[AuditLogItem]


class AuditChainVerifyResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    chain_valid: bool
    total_blocks: int
    genesis_hash: str
    latest_hash: str
    broken_block_id: Optional[str] = None
    verification_status: str
    verification_timestamp: str
