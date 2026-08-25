"""
Async Client for Local Ollama Daemon.
Interfaces with local open-weight models on http://127.0.0.1:11434 without cloud egress.
"""

import httpx
from typing import Dict, Any, List, Optional
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.ollama")

DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434"


class OllamaClient:
    """
    Async client for local Ollama server running on the workstation GPU/CPU.
    """
    def __init__(self, base_url: str = DEFAULT_OLLAMA_URL):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=90.0)

    async def is_available(self) -> bool:
        """
        Check if the local Ollama daemon is running and reachable.
        """
        try:
            res = await self.client.get("/api/tags", timeout=1.5)
            return res.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[Dict[str, Any]]:
        """
        List all locally pulled models in Ollama storage.
        """
        try:
            res = await self.client.get("/api/tags", timeout=2.0)
            if res.status_code == 200:
                data = res.json()
                return data.get("models", [])
            return []
        except Exception as e:
            logger.debug(f"Ollama list_models unavailable: {e}")
            return []

    async def generate(
        self,
        model: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        """
        Execute completion with local Ollama engine.
        """
        payload: Dict[str, Any] = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        res = await self.client.post("/api/generate", json=payload)
        res.raise_for_status()
        return res.json()


ollama_client = OllamaClient()
