#!/usr/bin/env python3
"""
Test script to verify LLM provider configuration.
Usage: python test_llm_config.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.config import get_settings
from app.services.llm_factory import get_llm_client


async def test_llm_connection():
    settings = get_settings()

    print("=" * 70)
    print("LLM Provider Configuration Test")
    print("=" * 70)
    print(f"\n📋 Configuration:")
    print(f"   Provider : {settings.llm_provider}")
    print(f"   Model    : {settings.llm_model}")
    print(f"   API Key  : {settings.llm_api_key[:20]}..." if settings.llm_api_key else "   API Key  : (not set)")
    print(f"   Base URL : {settings.llm_api_base or '(provider default)'}")
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
        print(f"\n📥 Response: {content}")
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
        print("=" * 70)
        return False


if __name__ == "__main__":
    success = asyncio.run(test_llm_connection())
    sys.exit(0 if success else 1)
