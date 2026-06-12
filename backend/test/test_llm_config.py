#!/usr/bin/env python3
"""
Test script to verify LLM provider configuration.

Usage:
    python test_llm_config.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.config import get_settings
from app.services.llm_factory import get_llm_client


async def test_llm_connection():
    settings = get_settings()

    # Derive display base URL
    provider = settings.llm_provider.lower()
    if provider == "openai":
        base_display = (settings.llm_api_base or "(default: https://api.openai.com") + "/v1"
    elif provider == "anthropic":
        base_display = settings.llm_api_base or "(default: https://api.anthropic.com)"
    else:
        base_display = settings.llm_api_base or "(Google default)"

    key_preview = (settings.llm_api_key[:20] + "...") if settings.llm_api_key else "(not set)"

    print("=" * 70)
    print("LLM Provider Configuration Test")
    print("=" * 70)
    print(f"\n  Provider : {settings.llm_provider}")
    print(f"  Model    : {settings.llm_model}")
    print(f"  API Key  : {key_preview}")
    print(f"  Base URL : {base_display}")
    print(f"\n🔄 Testing connection...")

    try:
        llm = get_llm_client(temperature=0.3)

        from langchain_core.messages import HumanMessage
        response = await llm.ainvoke([
            HumanMessage(content="Reply with exactly 3 words: 'Connection test successful'")
        ])

        content = response.content
        if isinstance(content, list):
            content = "".join(str(part) for part in content)

        print(f"✅ Success!")
        print(f"\n  Prompt  : Reply with exactly 3 words: 'Connection test successful'")
        print(f"  Response: {content.strip()}")
        print(f"\n✨ LLM provider is configured correctly!")
        print("=" * 70)
        return True

    except ImportError as e:
        print(f"❌ Import Error: {e}")
        if "anthropic" in str(e):
            print("   Run: pip install langchain-anthropic")
        elif "google" in str(e):
            print("   Run: pip install langchain-google-genai")
        else:
            print("   Run: pip install -r requirements.txt")
        print("=" * 70)
        return False

    except Exception as e:
        print(f"❌ Connection Failed: {type(e).__name__}: {e}")
        print("\n  Troubleshooting:")
        print("  1. Check LLM_API_KEY in .env")
        print("  2. LLM_API_BASE should NOT include /v1 (factory appends it for openai)")
        print("  3. Verify the model name matches the provider")
        print("=" * 70)
        return False


if __name__ == "__main__":
    success = asyncio.run(test_llm_connection())
    sys.exit(0 if success else 1)
