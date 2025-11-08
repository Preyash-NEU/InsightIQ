"""Lightweight OpenAI client wrapper used by the query generator."""

from __future__ import annotations

from typing import Any, Optional

import json
import os
import urllib.request
from urllib import error as urllib_error

from fastapi import HTTPException, status

from app.services.llm.base import ConfigurableLLMClient


class OpenAIClient(ConfigurableLLMClient):
    """Very small wrapper around OpenAI's REST API.

    The implementation intentionally avoids importing the heavy ``openai``
    package so the backend can run in restricted environments.  The goal is not
    to mirror every option; instead we implement the subset required by the
    project.  When the environment lacks network access a clear HTTPException is
    raised so API consumers understand that the feature is unavailable.
    """

    api_base: str = "https://api.openai.com/v1"
    model: str = "gpt-3.5-turbo-instruct"

    def __init__(self, *, api_key: Optional[str], model: Optional[str] = None) -> None:
        super().__init__(api_key=api_key, model=model)

    def generate_text(self, prompt: str, **kwargs: Any) -> str:
        payload = self.build_payload(prompt, **kwargs)
        request = urllib.request.Request(
            f"{self.api_base}/completions",
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps(payload).encode("utf-8"),
        )

        try:
            with urllib.request.urlopen(request) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib_error.HTTPError as exc:
            detail = exc.read().decode("utf-8") if hasattr(exc, "read") else exc.reason
            raise HTTPException(status_code=exc.code, detail=detail)
        except Exception as exc:  # pragma: no cover - network errors
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))

        choices = data.get("choices") or []
        if not choices:
            raise HTTPException(status_code=502, detail="OpenAI response contained no choices")

        return choices[0].get("text", "").strip()


def from_environment() -> OpenAIClient:
    """Create a client using environment variables."""

    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI API key is not configured",
        )
    return OpenAIClient(api_key=api_key, model=model)
