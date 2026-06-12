from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from app.agents.state import CampaignGraphState
from app.services.llm_factory import get_llm_client
from app.services.campaign_state_helper import db_start_tool_call, db_complete_tool_call, db_fail_tool_call


WRITER_SYSTEM = """You are an expert marketing copywriter. Write compelling campaign copy based on the extracted brief.
Include a headline, body copy, and call-to-action. Match the brand voice and target audience."""


async def writer_node(state: CampaignGraphState) -> dict:
    campaign_id = state["campaign_id"]
    tool_run_id = await db_start_tool_call(campaign_id, "write_copy")

    try:
        llm = get_llm_client(temperature=0.7)

        extracted = state.get("extracted", {})
        prompt = f"""Brand voice: {state.get("brand_voice", "professional")}
Target audience: {state.get("target_audience", "general")}

Extracted brief:
{extracted}

Original brief:
{state["brief"]}
"""

        messages = [
            SystemMessage(content=WRITER_SYSTEM),
            HumanMessage(content=prompt),
        ]
        if state.get("messages"):
            messages.extend(state["messages"])

        response = await llm.ainvoke(messages)

        content = response.content
        if isinstance(content, list):
            content = "".join(str(part) for part in content)

        copy_draft = str(content)

        await db_complete_tool_call(
            campaign_id=campaign_id,
            tool_run_id=tool_run_id,
            tool_name="write_copy",
            output_type="copy",
            content=copy_draft
        )

        return {
            "copy_draft": copy_draft,
            "messages": [AIMessage(content=copy_draft)]
        }
    except Exception:
        await db_fail_tool_call(campaign_id, tool_run_id, "write_copy")
        raise
