from typing import TypedDict, List, Optional

from langgraph.graph import StateGraph, START, END

from app.agent.planner import Planner
from app.agent.tool_manager import ToolManager


class GraphState(TypedDict):
    query: str
    plan: List[str]
    selected_tool: Optional[str]
    tool_result: Optional[str]
    retrieved_documents: List[str]
    agent_decision: Optional[str]
    final_answer: Optional[str]
    status: str


class AgentGraph:

    def __init__(self):
        self.planner = Planner()
        self.tool_manager = ToolManager()

        workflow = StateGraph(GraphState)

        workflow.add_node("plan", self.plan_node)
        workflow.add_node("select_tool", self.select_tool_node)
        workflow.add_node("call_tool", self.call_tool_node)
        workflow.add_node("generate_response", self.generate_response_node)

        workflow.add_edge(START, "plan")
        workflow.add_edge("plan", "select_tool")
        workflow.add_edge("select_tool", "call_tool")
        workflow.add_edge("call_tool", "generate_response")
        workflow.add_edge("generate_response", END)

        self.graph = workflow.compile()

    def plan_node(self, state: GraphState):
        plan = self.planner.create_plan_from_query(state["query"])

        return {
            "plan": plan,
            "status": "planning"
        }

    def select_tool_node(self, state: GraphState):
        selected_tool = self.tool_manager.select_tool_from_query(
            state["query"]
        )

        return {
            "selected_tool": selected_tool,
            "status": "tool_selected"
        }

    def call_tool_node(self, state: GraphState):
        documents, tool_result = self.tool_manager.call_tool_by_name(
            state["selected_tool"],
            state["query"]
        )

        return {
            "retrieved_documents": documents,
            "tool_result": tool_result,
            "agent_decision": (
                f"Plan created and {state['selected_tool']} tool executed"
            ),
            "status": "tool_executed"
        }

    def generate_response_node(self, state: GraphState):
        final_answer = (
            f"Query processed successfully. "
            f"Execution plan contains {len(state['plan'])} steps. "
            f"Selected tool: {state['selected_tool']}. "
            f"Tool result: {state['tool_result']}"
        )

        return {
            "final_answer": final_answer,
            "status": "completed"
        }

    def run(self, query: str):
        initial_state: GraphState = {
            "query": query,
            "plan": [],
            "selected_tool": None,
            "tool_result": None,
            "retrieved_documents": [],
            "agent_decision": None,
            "final_answer": None,
            "status": "received"
        }

        return self.graph.invoke(initial_state)