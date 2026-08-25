"""
API Route Handlers for Security, Air-Gap Verification, Guardrails, and Audit Trails.
"""

from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ...database.session import get_db
from ...database.models import AuditLogModel
from security.network_guard import network_guard
from security.guardrails import prompt_guardrail
from security.pii_redactor import pii_redactor
from security.audit_logger import audit_ledger
from ...schemas.security import (
    NetworkStatusResponse,
    PromptScanRequest,
    PromptScanResponse,
    TextSanitizeRequest,
    TextSanitizeResponse,
    AuditLogItem,
    AuditLogListResponse,
    AuditChainVerifyResponse,
)

router = APIRouter(prefix="/security", tags=["Security & Air-Gap"])


@router.get(
    "/network-status",
    response_model=NetworkStatusResponse,
    summary="Get Zero-Egress Network Audit & Telemetry",
    description="Inspects active sockets and verifies 100% loopback/LAN air-gapped isolation with 0 internet packets."
)
async def get_network_status() -> NetworkStatusResponse:
    telemetry = network_guard.get_network_telemetry()
    return NetworkStatusResponse.model_validate(telemetry)


@router.post(
    "/scan-prompt",
    response_model=PromptScanResponse,
    summary="Scan Prompt for Adversarial Injections & Jailbreaks",
    description="Evaluates user instructions for system prompt exfiltration, instruction overrides, or malicious commands."
)
async def scan_prompt(
    payload: PromptScanRequest,
    db: AsyncSession = Depends(get_db),
) -> PromptScanResponse:
    scan_result = prompt_guardrail.scan_prompt(payload.prompt)
    
    # Log suspicious/blocked scans to cryptographic audit ledger
    if not scan_result["is_safe"]:
        await audit_ledger.log_event(
            session=db,
            event_type="PROMPT_INJECTION_BLOCKED",
            entity_type="security_guardrail",
            entity_id="prompt_scanner",
            event_data={
                "threat_level": scan_result["threat_level"],
                "risk_score": scan_result["risk_score"],
                "threats": scan_result["detected_threats"],
                "prompt_snippet": payload.prompt[:80],
            }
        )

    return PromptScanResponse.model_validate(scan_result)


@router.post(
    "/sanitize-text",
    response_model=TextSanitizeResponse,
    summary="Sanitize Text for PII & Confidential Credentials",
    description="Redacts employee emails, phone numbers, secret keys, and industrial hardware asset tags."
)
async def sanitize_text(
    payload: TextSanitizeRequest,
) -> TextSanitizeResponse:
    redaction_result = pii_redactor.redact(payload.text)
    return TextSanitizeResponse.model_validate(redaction_result)


@router.get(
    "/audit-logs",
    response_model=AuditLogListResponse,
    summary="List Cryptographic Audit Events",
    description="Retrieves the tamper-evident immutable audit trail of system events."
)
async def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> AuditLogListResponse:
    count_query = select(func.count(AuditLogModel.id))
    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = select(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).offset(skip).limit(limit)
    res = await db.execute(query)
    items = list(res.scalars().all())

    return AuditLogListResponse(
        total=total,
        items=[AuditLogItem.model_validate(item) for item in items]
    )


@router.get(
    "/verify-audit-chain",
    response_model=AuditChainVerifyResponse,
    summary="Verify Cryptographic Hash-Chain Integrity",
    description="Recalculates SHA-256 block hashes from genesis to head, mathematically validating no log records were tampered or deleted."
)
async def verify_audit_chain(
    db: AsyncSession = Depends(get_db),
) -> AuditChainVerifyResponse:
    result = await audit_ledger.verify_chain_integrity(db)
    return AuditChainVerifyResponse.model_validate(result)
