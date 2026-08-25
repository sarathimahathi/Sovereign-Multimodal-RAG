"""
Pydantic Schemas for Local Model Management & Dynamic Intent Routing.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ModelItemResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_id: str
    name: str
    domain: str
    param_size: str
    quantization: str
    vram_estimate_gb: float
    context_window: str
    description: str
    status: str
    is_air_gapped: bool


class ModelListResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    total: int
    models: List[ModelItemResponse]


class TaskRouteRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    prompt: str = Field(..., description="Prompt or task text to evaluate for model auto-selection")
    user_preference: str = Field("auto", description="User override model id or 'auto'")


class TaskRouteResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    domain: str
    selected_model_id: str
    model_name: str
    specialization: str
    context_window: str
    confidence_score: float
    decision_rationale: str
    matched_keywords: List[str]


class GenerateRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    prompt: str = Field(..., description="Prompt to generate response for")
    model_preference: str = Field("auto", description="Auto route or specific model id")
    system_prompt: Optional[str] = Field(None, description="Optional system instructions")
    temperature: float = Field(0.2, ge=0.0, le=1.0)


class GenerateResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_used: str
    model_name: str
    engine: str
    domain: str
    decision_rationale: str
    confidence_score: float
    matched_keywords: List[str]
    content: str
    latency_ms: float
    tokens_generated: int
    tokens_per_sec: float
    is_air_gapped: bool
