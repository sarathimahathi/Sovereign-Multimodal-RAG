from app.models.state import AgentState
from app.services.retrieval_service import RetrievalService


class ToolManager:

    def __init__(self):
        self.retrieval_service = RetrievalService()

    def select_tool(self, state: AgentState) -> str:
        """
        Select a tool based on the user's query.
        """

        return self.select_tool_from_query(state.query)

    def select_tool_from_query(self, query: str) -> str:
        """
        Select a tool directly from the query.
        """

        query = query.lower().strip()

        if not query:
            return "none"

        knowledge_keywords = [
            "what",
            "who",
            "when",
            "where",
            "why",
            "how",
            "explain",
            "define",
            "describe",
            "information",
        ]

        if any(keyword in query for keyword in knowledge_keywords):
            return "knowledge_search"

        return "knowledge_search"

    def call_tool(self, tool_name: str, state: AgentState) -> AgentState:
        """
        Execute the selected tool.
        """

        documents, tool_result = self.call_tool_by_name(
            tool_name,
            state.query
        )

        state.retrieved_documents = documents
        state.tool_result = tool_result

        return state

    def call_tool_by_name(
        self,
        tool_name: str,
        query: str
    ):
        """
        Execute a tool directly using its name.
        """

        if tool_name == "knowledge_search":
            documents = self.retrieval_service.retrieve(query)

            tool_result = (
                f"Knowledge search returned {len(documents)} document(s)."
            )

            return documents, tool_result

        return [], f"Unknown tool: {tool_name}"