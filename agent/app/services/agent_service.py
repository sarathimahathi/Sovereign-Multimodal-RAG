from app.models.state import AgentState
from app.agent.agent_core import Agent


class AgentService:

    def __init__(self):
        self.agent = Agent()

    def process(self, state: AgentState) -> AgentState:
        """
        Send the request to the core agent.
        """

        return self.agent.run(state)