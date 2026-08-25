from app.models.state import AgentState
from app.agent.agent_graph import AgentGraph


class Agent:

    def __init__(self):
        self.agent_graph = AgentGraph()

    def run(self, state: AgentState) -> AgentState:
        """
        Run the agent using the LangGraph workflow.
        """

        query = state.query.strip()

        if not query:
            state.status = "error"
            state.agent_decision = "Invalid query"
            state.final_answer = "Please provide a valid query."
            return state

        # Run the LangGraph workflow
        result = self.agent_graph.run(query)

        # Copy LangGraph results into AgentState
        state.plan = result.get("plan", [])
        state.selected_tool = result.get("selected_tool")
        state.tool_result = result.get("tool_result")
        state.retrieved_documents = result.get(
            "retrieved_documents",
            []
        )
        state.agent_decision = result.get("agent_decision")
        state.final_answer = result.get("final_answer")
        state.status = result.get("status", "completed")

        return state