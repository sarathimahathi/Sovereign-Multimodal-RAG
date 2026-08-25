from fastapi import FastAPI

from app.api.agent_api import router as agent_router


app = FastAPI(
    title="Sovereign Multimodal RAG - Agent Engineer",
    description="M2 Agent Engineer API",
    version="1.0.0",
)


app.include_router(agent_router)


@app.get("/")
def root():
    return {
        "message": "Sovereign Multimodal RAG Agent is running",
        "module": "M2 - Agent Engineer",
    }