import json

from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.state import CampaignGraphState, ExtractedBrief
from app.services.llm_factory import get_llm_client
from app.services.campaign_state_helper import db_start_tool_call, db_complete_tool_call, db_fail_tool_call


EXTRACTOR_SYSTEM = """You are a marketing brief extractor. Parse the user's campaign brief into structured fields.
Return valid JSON only with keys: product, audience, tone, key_messages (array), constraints (array)."""


async def extractor_node(state: CampaignGraphState) -> dict:
    campaign_id = state["campaign_id"]
    tool_run_id = await db_start_tool_call(campaign_id, "extract_brief")

    try:
        llm = get_llm_client(temperature=0.2)

        response = await llm.ainvoke(
            [
                SystemMessage(content=EXTRACTOR_SYSTEM),
                HumanMessage(content=state["brief"]),
            ]
        )

        content = response.content
        if isinstance(content, list):
            content = "".join(str(part) for part in content)

        try:
            parsed: ExtractedBrief = json.loads(str(content))
        except json.JSONDecodeError:
            parsed = {
                "product": state["brief"][:200],
                "audience": state.get("target_audience", "general"),
                "tone": state.get("brand_voice", "professional"),
                "key_messages": [],
                "constraints": [],
            }

        await db_complete_tool_call(
            campaign_id=campaign_id,
            tool_run_id=tool_run_id,
            tool_name="extract_brief",
            output_type="extracted",
            content=None,
            metadata_=parsed
        )
        return {"extracted": parsed}
    except Exception:
        await db_fail_tool_call(campaign_id, tool_run_id, "extract_brief")
        raise
