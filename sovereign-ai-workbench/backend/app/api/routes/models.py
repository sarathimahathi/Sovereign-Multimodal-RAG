"""
API Route Handlers for Local Models & Dynamic Intent Routing.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...database.session import get_db
from models.engine import local_model_engine
from models.intent_router import intent_router
from security.guardrails import prompt_guardrail
from security.audit_logger import audit_ledger
from ...schemas.models import (
    ModelListResponse,
    ModelItemResponse,
    TaskRouteRequest,
    TaskRouteResponse,
    GenerateRequest,
    GenerateResponse,
)

router = APIRouter(prefix="/models", tags=["Local Models & Dynamic Router"])


@router.get(
    "",
    response_model=ModelListResponse,
    summary="List Registered Open-Weight Industrial Models",
    description="Enumerates local models (Qwen 2.5 Coder, DeepSeek R1, Llama 3.2 Vision, Llama 3.1) with VRAM specifications."
)
async def list_models() -> ModelListResponse:
    models_data = await local_model_engine.list_available_models()
    return ModelListResponse(
        total=len(models_data),
        models=[ModelItemResponse.model_validate(m) for m in models_data]
    )


@router.post(
    "/route",
    response_model=TaskRouteResponse,
    summary="Dynamic Intent Routing & Model Auto-Selection",
    description="Evaluates prompt semantics and selects the optimal specialized open-weight model with confidence score."
)
async def route_task_prompt(payload: TaskRouteRequest) -> TaskRouteResponse:
    decision = intent_router.route_task(payload.prompt, user_preference=payload.user_preference)
    return TaskRouteResponse.model_validate(decision)


@router.post(
    "/generate",
    response_model=GenerateResponse,
    summary="Execute Local Sovereign Inference",
    description="Generates completion via auto-routed or pinned local model with air-gapped security audit."
)
async def generate_completion(
    payload: GenerateRequest,
    db: AsyncSession = Depends(get_db),
) -> GenerateResponse:
    # 1. Security Scan for Prompt Injections
    security_eval = prompt_guardrail.scan_prompt(payload.prompt)
    if not security_eval["is_safe"]:
        await audit_ledger.log_event(
            session=db,
            event_type="PROMPT_INJECTION_BLOCKED_INFERENCE",
            entity_type="model_engine",
            entity_id=payload.model_preference,
            event_data={
                "threat_level": security_eval["threat_level"],
                "risk_score": security_eval["risk_score"],
                "prompt_snippet": payload.prompt[:80],
            }
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prompt rejected by Sovereign Guardrail: {security_eval['threat_level']}"
        )

    # 2. Execute Local Generation
    result = await local_model_engine.generate_response(
        prompt=payload.prompt,
        model_preference=payload.model_preference,
        system_prompt=payload.system_prompt,
        temperature=payload.temperature,
    )

    # 3. Log to Cryptographic Audit Ledger
    await audit_ledger.log_event(
        session=db,
        event_type="MODEL_INFERENCE_EXECUTION",
        entity_type="llm_model",
        entity_id=result["model_used"],
        event_data={
            "domain": result["domain"],
            "confidence": result["confidence_score"],
            "latency_ms": result["latency_ms"],
            "tokens": result["tokens_generated"],
            "prompt_length": len(payload.prompt),
        }
    )

    return GenerateResponse.model_validate(result)
