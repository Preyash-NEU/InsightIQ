"""Factory for constructing LLM clients based on configuration."""

from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status

from app.core.config import settings
from app.services.llm.anthropic import AnthropicClient
from app.services.llm.base import DummyLLMClient, LLMClient
from app.services.llm.openai import OpenAIClient


def get_llm_client(provider: Optional[str] = None) -> LLMClient:
    provider_name = (provider or settings.AI_PROVIDER or "").lower()

    if provider_name == "openai":
        try:
            return OpenAIClient(api_key=settings.OPENAI_API_KEY, model=None)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))

    if provider_name == "anthropic":
        try:
            return AnthropicClient(api_key=settings.ANTHROPIC_API_KEY, model=None)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))

    # Fallback to a deterministic dummy client so API consumers receive a
    # helpful response instead of a 500 error when no provider is configured.
    return DummyLLMClient(name=provider_name or "dummy")
