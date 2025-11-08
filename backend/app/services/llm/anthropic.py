"""Simplified Anthropic Claude API wrapper."""

from __future__ import annotations

import json
import os
import urllib.request
from urllib import error as urllib_error
from typing import Any, Optional

from fastapi import HTTPException, status

from app.services.llm.base import ConfigurableLLMClient


class AnthropicClient(ConfigurableLLMClient):
    api_base: str = "https://api.anthropic.com/v1"
    model: str = "claude-3-haiku-20240307"

    def __init__(self, *, api_key: Optional[str], model: Optional[str] = None) -> None:
        super().__init__(api_key=api_key, model=model)

    def generate_text(self, prompt: str, **kwargs: Any) -> str:
        payload = {
            "model": getattr(self, "model", None),
            "max_tokens": kwargs.get("max_tokens", 512),
            "messages": [
                {"role": "user", "content": prompt},
            ],
        }

        request = urllib.request.Request(
            f"{self.api_base}/messages",
            method="POST",
            headers={
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
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

        content = data.get("content") or []
        if not content:
            raise HTTPException(status_code=502, detail="Anthropic response contained no content")

        return content[0].get("text", "").strip()


def from_environment() -> AnthropicClient:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    model = os.getenv("ANTHROPIC_MODEL")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Anthropic API key is not configured",
        )
    return AnthropicClient(api_key=api_key, model=model)
