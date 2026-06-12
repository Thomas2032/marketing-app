# LLM Provider Configuration Examples

This document provides configuration examples for different LLM providers supported by the Marketing App backend.

---

## Table of Contents
- [OpenAI (Official)](#openai-official)
- [DeepRouter (Multi-Provider Router)](#deeprouter-multi-provider-router)
- [Anthropic Claude (Official)](#anthropic-claude-official)
- [Azure OpenAI](#azure-openai)
- [Ollama (Local)](#ollama-local)
- [Testing Your Configuration](#testing-your-configuration)

---

## OpenAI (Official)

**Use case:** Official OpenAI API with latest models like GPT-4o, GPT-4o-mini, o1.

**Configuration:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_BASE=
```

**Notes:**
- Leave `OPENAI_API_BASE` empty to use the default endpoint
- Get your API key from: https://platform.openai.com/api-keys
- Available models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

---

## DeepRouter (Multi-Provider Router)

**Use case:** Route requests across multiple LLM providers with automatic failover and load balancing.

**Configuration:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-dQRXgZZdK59MceEG6C9imza59AeneStx4TxwPzOANctdX8fJ
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_BASE=https://www.deeprouter.top/v1
```

**Notes:**
- DeepRouter provides OpenAI-compatible API endpoints
- The base URL **must include** `/v1` suffix
- DeepRouter supports multiple providers: OpenAI, Anthropic, Google, etc.
- Get your API key from: https://www.deeprouter.top/

---

## Anthropic Claude (Official)

**Use case:** Use Anthropic's Claude models (Opus, Sonnet, Haiku) for advanced reasoning.

**Configuration:**
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_BASE=
```

**Notes:**
- Leave `ANTHROPIC_API_BASE` empty to use the default endpoint
- Get your API key from: https://console.anthropic.com/
- Available models:
  - `claude-3-5-sonnet-20241022` (Best overall)
  - `claude-3-opus-20240229` (Most capable)
  - `claude-3-haiku-20240307` (Fastest, cheapest)

**Requirements:**
```bash
pip install langchain-anthropic
```

---

## Azure OpenAI

**Use case:** Use OpenAI models deployed in your Azure subscription with enterprise compliance.

**Configuration:**
```env
LLM_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=xxxxxxxxxxxxxxxxxxxxx
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Notes:**
- `AZURE_OPENAI_ENDPOINT` is your Azure resource endpoint
- `AZURE_OPENAI_DEPLOYMENT` is the name you gave to your model deployment (not the model name)
- Get your credentials from Azure Portal → Azure OpenAI Service
- API versions: https://learn.microsoft.com/en-us/azure/ai-services/openai/reference

---

## Ollama (Local)

**Use case:** Run LLMs locally on your machine for development or privacy-sensitive use cases.

**Configuration:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=ollama
OPENAI_MODEL=llama3.1:8b
OPENAI_API_BASE=http://localhost:11434/v1
```

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.1:8b

# Start Ollama server (it usually starts automatically)
ollama serve
```

**Notes:**
- Ollama provides an OpenAI-compatible API endpoint
- The base URL **must include** `/v1` suffix
- Available models: `llama3.1`, `mistral`, `codellama`, `phi3`, etc.
- List models: `ollama list`
- Ollama runs on port `11434` by default

---

## Testing Your Configuration

After setting up your `.env` file, test the configuration:

### 1. Start the backend
```bash
cd backend
source .venv/bin/activate  # or: .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Create a test campaign
```bash
curl -X POST http://localhost:8000/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "title": "Test Campaign",
    "brief": "Create a social media post for a new coffee shop opening",
    "brand_voice": "friendly and casual",
    "target_audience": "coffee enthusiasts"
  }'
```

### 3. Run the campaign
```bash
# Replace {campaign_id} with the ID from step 2
curl -X POST http://localhost:8000/api/v1/campaigns/{campaign_id}/run
```

### 4. Check the results
```bash
curl http://localhost:8000/api/v1/campaigns/{campaign_id}
```

If the campaign completes successfully, your LLM provider is configured correctly!

---

## Troubleshooting

### Error: "Invalid API key"
- Double-check your API key in `.env`
- Ensure the key matches the provider (OpenAI keys start with `sk-`, Anthropic keys start with `sk-ant-`)

### Error: "Connection refused" or "Network error"
- Check `OPENAI_API_BASE` / `ANTHROPIC_API_BASE` URL format
- Ensure the URL includes `/v1` if required by the provider
- For local Ollama, ensure it's running: `ollama serve`

### Error: "Model not found"
- Verify the model name matches your provider's available models
- For Azure, use your deployment name, not the model name

### Error: "No module named 'langchain_anthropic'"
- Install the required package: `pip install langchain-anthropic`

### Error: "No module named 'greenlet'"
- Install greenlet: `pip install greenlet>=3.0.0`
- Or reinstall all dependencies: `pip install -r requirements.txt`

---

## Cost Comparison

| Provider | Model | Cost (Input/Output per 1M tokens) | Speed |
|----------|-------|-----------------------------------|-------|
| **OpenAI** | gpt-4o-mini | $0.15 / $0.60 | Fast |
| **OpenAI** | gpt-4o | $2.50 / $10.00 | Medium |
| **Anthropic** | claude-3-haiku | $0.25 / $1.25 | Very Fast |
| **Anthropic** | claude-3-5-sonnet | $3.00 / $15.00 | Medium |
| **DeepRouter** | (varies by model) | ~20-30% cheaper | Fast |
| **Ollama** | llama3.1:8b | Free (local) | Fast (GPU) / Slow (CPU) |

**Recommendation for development:** Use `gpt-4o-mini` or local Ollama  
**Recommendation for production:** Use `gpt-4o` or `claude-3-5-sonnet`

---

## Need Help?

- **OpenAI Docs:** https://platform.openai.com/docs
- **Anthropic Docs:** https://docs.anthropic.com/
- **Azure OpenAI Docs:** https://learn.microsoft.com/azure/ai-services/openai/
- **Ollama Docs:** https://github.com/ollama/ollama
