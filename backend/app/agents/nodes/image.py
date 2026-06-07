from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.agents.state import CampaignGraphState
from app.config import get_settings
from app.services.storage import upload_generated_image


IMAGE_SYSTEM = """You create concise image generation prompts for marketing visuals.
Return only the prompt text, no explanation. Style: professional, on-brand, suitable for social ads."""


async def image_node(state: CampaignGraphState) -> dict:
    settings = get_settings()
    llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.5)

    prompt_context = f"""Campaign copy:
{state.get("copy_draft", "")}

Extracted brief:
{state.get("extracted", {})}
"""

    response = await llm.ainvoke(
        [
            SystemMessage(content=IMAGE_SYSTEM),
            HumanMessage(content=prompt_context),
        ]
    )

    content = response.content
    if isinstance(content, list):
        content = "".join(str(part) for part in content)

    image_prompt = str(content).strip()

    # Placeholder: wire DALL-E / external image API here; upload result to object storage
    image_url = ""
    if settings.openai_api_key and settings.storage_access_key:
        try:
            image_url = await upload_generated_image(
                campaign_id=state["campaign_id"],
                prompt=image_prompt,
            )
        except Exception:
            image_url = ""

    return {"image_prompt": image_prompt, "image_url": image_url}
