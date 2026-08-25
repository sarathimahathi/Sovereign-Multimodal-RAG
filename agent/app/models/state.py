from pydantic import BaseModel, Field
from typing import List, Optional


class AgentState(BaseModel):
    query: str

    retrieved_documents: List[str] = Field(default_factory=list)

    plan: List[str] = Field(default_factory=list)

    selected_tool: Optional[str] = None

    tool_result: Optional[str] = None

    agent_decision: Optional[str] = None

    final_answer: Optional[str] = None

    status: str = "received"