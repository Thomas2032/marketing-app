"""
LLM Factory - Unified interface for multiple LLM providers.

Config uses four unified keys:
  LLM_PROVIDER  - openai | anthropic | gemini
  LLM_API_KEY   - your API key
  LLM_MODEL     - model name
  LLM_API_BASE  - base URL of the provider or proxy (no trailing slash, no /v1)
                  e.g. https://www.deeprouter.top
                       https://api.openai.com
                       https://api.anthropic.com

Path appending rules (so you never have to remember):
  openai    → {base}/v1            passed to ChatOpenAI(base_url=...)
  anthropic → {base}               passed to ChatAnthropic(base_url=...)
              Anthropic SDK appends /v1/messages automatically
  gemini    → uses google_api_key, base_url not applicable
"""

from langchain_core.language_models import BaseChatModel

from app.config import get_settings


def _openai_base_url(raw: str | None) -> str | None:
    """Ensure OpenAI-compatible base URL ends with /v1."""
    if not raw:
        return None
    url = raw.rstrip("/")
    if not url.endswith("/v1"):
        url = url + "/v1"
    return url


def _anthropic_base_url(raw: str | None) -> str | None:
    """Anthropic SDK expects bare base URL without path suffix."""
    if not raw:
        return None
    return raw.rstrip("/")


def get_llm_client(temperature: float = 0.7) -> BaseChatModel:
    """
    Create an LLM client based on the configured provider.

    Raises:
        ValueError: If the configured provider is not supported.
        ImportError: If the required provider package is not installed.
    """
    settings = get_settings()
    provider = settings.llm_provider.lower()

    if provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.llm_api_key,
            base_url=_openai_base_url(settings.llm_api_base),
            temperature=temperature,
        )

    elif provider == "anthropic":
        try:
            from langchain_anthropic import ChatAnthropic
        except ImportError:
            raise ImportError(
                "langchain-anthropic is required for the anthropic provider. "
                "Run: pip install langchain-anthropic"
            )

        return ChatAnthropic(
            model=settings.llm_model,
            anthropic_api_key=settings.llm_api_key,
            anthropic_api_url=_anthropic_base_url(settings.llm_api_base),
            temperature=temperature,
        )

    elif provider == "gemini":
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
        except ImportError:
            raise ImportError(
                "langchain-google-genai is required for the gemini provider. "
                "Run: pip install langchain-google-genai"
            )

        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.llm_api_key,
            temperature=temperature,
        )

    else:
        raise ValueError(
            f"Unsupported LLM provider: '{provider}'. "
            "Supported: openai | anthropic | gemini"
        )


def get_image_client():
    """
    Create an OpenAI-compatible image generation client.
    Base URL is normalized to include /v1.
    """
    from openai import AsyncOpenAI

    settings = get_settings()

    return AsyncOpenAI(
        api_key=settings.llm_api_key,
        base_url=_openai_base_url(settings.llm_api_base),
    )
