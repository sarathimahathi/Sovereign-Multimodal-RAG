from app.models.state import AgentState


class Planner:

    def create_plan(self, state: AgentState) -> AgentState:
        """
        Create an execution plan for the user's query.
        """

        state.plan = self.create_plan_from_query(state.query)

        return state

    def create_plan_from_query(self, query: str) -> list[str]:
        """
        Create a simple execution plan from a query.
        """

        query = query.strip()

        if not query:
            return []

        return [
            "Understand the user query",
            "Retrieve relevant information",
            "Evaluate the retrieved information",
            "Generate the final response",
        ]