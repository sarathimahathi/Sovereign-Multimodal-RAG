from fastapi import APIRouter

from app.models.state import AgentState
from app.models.response import AgentResponse
from app.services.agent_service import AgentService


router = APIRouter(
    prefix="/agent",
    tags=["Agent"],
)

agent_service = AgentService()


@router.post("/process", response_model=AgentResponse)
def process_query(state: AgentState):
    return agent_service.process(state)