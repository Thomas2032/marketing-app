from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.state import CampaignGraphState
from app.services.llm_factory import get_llm_client
from app.services.storage import upload_generated_image
from app.services.campaign_state_helper import db_start_tool_call, db_complete_tool_call, db_fail_tool_call


IMAGE_SYSTEM = """You create concise image generation prompts for marketing visuals.
Return only the prompt text, no explanation. Style: professional, on-brand, suitable for social ads."""


async def image_node(state: CampaignGraphState) -> dict:
    campaign_id = state["campaign_id"]
    tool_run_id = await db_start_tool_call(campaign_id, "generate_visual")

    try:
        llm = get_llm_client(temperature=0.5)

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
                    campaign_id=campaign_id,
                    prompt=image_prompt,
                )
            except Exception:
                image_url = ""

        await db_complete_tool_call(
            campaign_id=campaign_id,
            tool_run_id=tool_run_id,
            tool_name="generate_visual",
            output_type="image",
            content=image_prompt,
            asset_url=image_url or None
        )

        return {"image_prompt": image_prompt, "image_url": image_url}
    except Exception:
        await db_fail_tool_call(campaign_id, tool_run_id, "generate_visual")
        raise
