"""Common interface for Large Language Model providers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class LLMClient(ABC):
    """Minimal synchronous interface shared by provider specific clients."""

    @abstractmethod
    def generate_text(self, prompt: str, **kwargs: Any) -> str:
        """Return a text completion for *prompt*."""


class DummyLLMClient(LLMClient):
    """Fallback client that returns a deterministic placeholder response."""

    def __init__(self, name: str = "dummy") -> None:
        self.name = name

    def generate_text(self, prompt: str, **kwargs: Any) -> str:  # pragma: no cover - trivial
        preview = prompt.strip().splitlines()[0][:120] if prompt else ""
        return (
            f"[{self.name}] LLM integration is not configured. Prompt preview: {preview!r}."
        )


class ConfigurableLLMClient(LLMClient):
    """Base class providing helper utilities for API based clients."""

    model: str

    def __init__(self, *, api_key: Optional[str], model: Optional[str] = None) -> None:
        if not api_key:
            raise ValueError("An API key is required for this LLM client")
        if model:
            self.model = model
        self.api_key = api_key

    def build_payload(self, prompt: str, **kwargs: Any) -> Dict[str, Any]:
        payload = {"model": getattr(self, "model", None), "prompt": prompt}
        payload.update(kwargs)
        return payload
